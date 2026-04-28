/**
 * Helpers for the regex / tag-style match input.
 *
 * GlazeWM uses Rust's `regex` crate, so:
 *   - No lookahead/lookbehind, no backreferences.
 *   - Patterns are NOT anchored — `is_match` finds any substring match.
 *
 * In "tag mode" the user types literal strings (e.g. "Some App.exe"),
 * and we serialize the tags as `tag1|tag2|tag3`, with each tag fully escaped.
 */

const META_CHARS = ".*+?^${}()|[]\\";
const REGEX_META_REPLACE = /[.*+?^${}()|[\]\\]/g;

/** Escape a literal string so it matches itself in a regex. */
export function escapeLiteral(s: string): string {
  return s.replace(REGEX_META_REPLACE, "\\$&");
}

/**
 * Split a regex pattern at top-level `|` characters (i.e. `|`s that aren't
 * inside `[...]` character classes or `(...)` groups, and aren't escaped).
 */
export function splitTopLevelAlternatives(pattern: string): string[] {
  const parts: string[] = [];
  let depthParen = 0;
  let depthBracket = 0;
  let escaped = false;
  let buf = "";
  for (const ch of pattern) {
    if (escaped) {
      buf += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      buf += ch;
      escaped = true;
      continue;
    }
    if (ch === "[") depthBracket++;
    else if (ch === "]" && depthBracket > 0) depthBracket--;
    else if (ch === "(" && depthBracket === 0) depthParen++;
    else if (ch === ")" && depthBracket === 0 && depthParen > 0) depthParen--;

    if (ch === "|" && depthParen === 0 && depthBracket === 0) {
      parts.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  parts.push(buf);
  return parts;
}

export interface DecodeError {
  reason: string;
  /** 0-based char index inside the alternative where the problem starts. */
  index: number;
  /** Short excerpt for display. */
  excerpt: string;
}

export type DecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: DecodeError };

/**
 * Reverse of escapeLiteral: best-effort decode of a fully-escaped literal
 * back to its plain-text form. Returns a structured error when the
 * alternative still contains regex metacharacters that can't be cleanly
 * inverted (e.g. `.*`, `[abc]`, `\d`).
 */
export function decodeLiteral(alt: string): DecodeResult {
  let out = "";
  let i = 0;
  while (i < alt.length) {
    const ch = alt[i];
    if (ch === "\\") {
      const next = alt[i + 1];
      if (next === undefined) {
        return {
          ok: false,
          error: {
            reason: "trailing backslash with nothing to escape",
            index: i,
            excerpt: "\\",
          },
        };
      }
      if (META_CHARS.includes(next)) {
        out += next;
        i += 2;
        continue;
      }
      // \d \w \s . letter classes etc. → real regex.
      return {
        ok: false,
        error: {
          reason: `regex escape \`\\${next}\` (character class) — can't be a literal tag`,
          index: i,
          excerpt: `\\${next}`,
        },
      };
    }
    if (ch === ".") {
      return {
        ok: false,
        error: {
          reason: "bare `.` (matches any char) — escape it as `\\.` if you mean a literal dot",
          index: i,
          excerpt: ".",
        },
      };
    }
    if ("*+?^${}()|[]".includes(ch)) {
      return {
        ok: false,
        error: {
          reason: `bare regex metacharacter \`${ch}\` — escape it or use raw mode`,
          index: i,
          excerpt: ch,
        },
      };
    }
    out += ch;
    i++;
  }
  return { ok: true, value: out };
}

export interface TagDecodeOk {
  ok: true;
  tags: string[];
}
export interface TagDecodeFail {
  ok: false;
  error: DecodeError;
  /** Which top-level alternative caused the failure. */
  alternativeIndex: number;
  alternative: string;
}
export type TagDecodeResult = TagDecodeOk | TagDecodeFail;

/**
 * Try to view a regex pattern as a list of literal tags. Returns a failure
 * with a structured error when the pattern contains real regex syntax that
 * can't be safely round-tripped.
 */
export function patternToTags(pattern: string): TagDecodeResult {
  if (pattern === "") return { ok: true, tags: [] };
  let alternatives = splitTopLevelAlternatives(pattern);

  // Self-healing for a common bug: a single alternative containing `\|`
  // (escaped pipes) almost always means the user intended each `\|` as a
  // separator. Treat it that way — when re-serialized via tagsToPattern
  // the canonical `tag1|tag2` form is restored.
  if (alternatives.length === 1 && containsEscapedPipe(alternatives[0])) {
    alternatives = splitOnEscapedPipe(alternatives[0]);
  }

  const tags: string[] = [];
  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    if (alt === "") {
      return {
        ok: false,
        alternativeIndex: i,
        alternative: alt,
        error: {
          reason: "empty alternative (consecutive `|` or trailing `|`)",
          index: 0,
          excerpt: "",
        },
      };
    }
    const decoded = decodeLiteral(alt);
    if (!decoded.ok) {
      return {
        ok: false,
        alternativeIndex: i,
        alternative: alt,
        error: decoded.error,
      };
    }
    tags.push(decoded.value);
  }
  return { ok: true, tags: dedupTags(tags) };
}

function containsEscapedPipe(s: string): boolean {
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") return true;
    if (s[i] === "\\") i++; // skip escaped char
  }
  return false;
}

function splitOnEscapedPipe(s: string): string[] {
  const parts: string[] = [];
  let buf = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "|") {
      parts.push(buf);
      buf = "";
      i += 2;
    } else if (s[i] === "\\" && i + 1 < s.length) {
      buf += s[i] + s[i + 1];
      i += 2;
    } else {
      buf += s[i];
      i++;
    }
  }
  parts.push(buf);
  return parts;
}

/** Sort tags case-insensitively, ascending, deduplicated. */
export function sortTags(tags: string[]): string[] {
  return dedupTags(tags).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/** Order-preserving deduplication + trim. */
export function dedupTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const trimmed = t.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

/** Encode a list of literal tags as a single regex alternation. */
export function tagsToPattern(tags: string[], opts: { sort?: boolean } = {}): string {
  const sort = opts.sort !== false;
  const ordered = sort ? sortTags(tags) : dedupTags(tags);
  return ordered.map(escapeLiteral).join("|");
}

/**
 * Sort top-level `|` alternatives of a raw regex case-insensitively.
 * Alternation order is semantically irrelevant for `Regex::is_match`
 * (which is what GlazeWM uses), so this is a safe canonicalization.
 * Returns the input unchanged when there are fewer than 2 alternatives
 * (e.g. a regex with no top-level `|`).
 */
export function sortRawAlternatives(pattern: string): string {
  const alts = splitTopLevelAlternatives(pattern);
  if (alts.length < 2) return pattern;
  const sorted = [...alts].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  // Preserve original order if sort produced no change — avoids spurious dirty flags.
  if (sorted.every((v, i) => v === alts[i])) return pattern;
  return sorted.join("|");
}

/**
 * Format a decode failure for end-user display, including the alternative
 * the error was found in and a positional caret.
 */
export function formatDecodeFailure(result: TagDecodeFail): string {
  const { alternative, alternativeIndex, error } = result;
  const before = alternative.slice(Math.max(0, error.index - 20), error.index);
  const after = alternative.slice(error.index, error.index + 20);
  const excerpt = `${before}«${after}»`;
  return [
    `Can't display as tags: ${error.reason}.`,
    `In alternative #${alternativeIndex + 1}: ${excerpt}`,
  ].join("\n");
}
