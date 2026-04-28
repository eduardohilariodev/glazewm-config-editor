/**
 * Schema-driven GlazeWM command builder.
 *
 * Each `Verb` is a top-level command (focus, move, resize, ...).
 * Each verb has zero or more `Option`s (--flag), each option declares a
 * value shape that the UI uses to pick a third dropdown / input.
 */

export type ValueKind =
  | "none"          // no value
  | "workspace"     // workspace name (picked from config)
  | "direction"     // left|right|up|down
  | "amount"        // numeric + optional unit (e.g. "10%", "100px")
  | "tilingDir"     // horizontal|vertical|toggle
  | "text"          // free text (binding mode name, etc.)
  | "shellRest";    // everything after `shell-exec`, freeform

export interface CommandOption {
  /** Flag form, e.g. "--workspace". `null` means the value follows the verb directly. */
  flag: string | null;
  label: string;
  value: ValueKind;
}

export interface CommandVerb {
  name: string;
  description?: string;
  /** First option is the default when the verb is freshly selected. */
  options: CommandOption[];
}

export const VERBS: CommandVerb[] = [
  {
    name: "focus",
    options: [
      { flag: "--workspace", label: "--workspace <name>", value: "workspace" },
      { flag: "--direction", label: "--direction <dir>", value: "direction" },
      { flag: "--next-workspace", label: "--next-workspace", value: "none" },
      { flag: "--prev-workspace", label: "--prev-workspace", value: "none" },
      { flag: "--recent-workspace", label: "--recent-workspace", value: "none" },
      { flag: "--next-active-workspace", label: "--next-active-workspace", value: "none" },
      { flag: "--prev-active-workspace", label: "--prev-active-workspace", value: "none" },
    ],
  },
  {
    name: "move",
    options: [
      { flag: "--workspace", label: "--workspace <name>", value: "workspace" },
      { flag: "--direction", label: "--direction <dir>", value: "direction" },
    ],
  },
  {
    name: "resize",
    options: [
      { flag: "--width", label: "--width <amount>", value: "amount" },
      { flag: "--height", label: "--height <amount>", value: "amount" },
    ],
  },
  {
    name: "tiling-direction",
    options: [{ flag: null, label: "<horizontal|vertical|toggle>", value: "tilingDir" }],
  },
  { name: "toggle-tiling-direction", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "toggle-floating",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--centered", label: "--centered", value: "none" },
    ],
  },
  {
    name: "toggle-fullscreen",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--maximized", label: "--maximized", value: "none" },
    ],
  },
  { name: "toggle-minimized", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "toggle-tiling", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "set-floating",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--centered", label: "--centered", value: "none" },
    ],
  },
  {
    name: "set-fullscreen",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--maximized", label: "--maximized", value: "none" },
    ],
  },
  { name: "set-minimized", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "set-tiling", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "close", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-cycle-focus", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-reload-config", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-redraw", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-exit", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-toggle-pause", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "wm-enable-binding-mode",
    options: [{ flag: "--name", label: "--name <mode>", value: "text" }],
  },
  {
    name: "wm-disable-binding-mode",
    options: [{ flag: "--name", label: "--name <mode>", value: "text" }],
  },
  { name: "shell-exec", options: [{ flag: null, label: "<command...>", value: "shellRest" }] },
  { name: "ignore", options: [{ flag: null, label: "(no args)", value: "none" }] },
];

export const DIRECTIONS = ["left", "right", "up", "down"] as const;
export const TILING_DIRS = ["horizontal", "vertical", "toggle"] as const;

export interface ParsedCommand {
  ok: boolean;
  verbIdx: number;
  optionIdx: number;
  value: string;
}

/** Parse a command string into the (verb, option, value) triple. */
export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };

  // shell-exec captures the entire rest verbatim — special case.
  if (trimmed.startsWith("shell-exec")) {
    const verbIdx = VERBS.findIndex((v) => v.name === "shell-exec");
    return { ok: true, verbIdx, optionIdx: 0, value: trimmed.slice("shell-exec".length).trim() };
  }

  const parts = trimmed.split(/\s+/);
  const verbName = parts[0];
  const verbIdx = VERBS.findIndex((v) => v.name === verbName);
  if (verbIdx < 0) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };

  const verb = VERBS[verbIdx];
  const rest = parts.slice(1);

  // Try to match a flag.
  if (rest.length > 0 && rest[0].startsWith("--")) {
    const flag = rest[0];
    const optionIdx = verb.options.findIndex((o) => o.flag === flag);
    if (optionIdx < 0) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };
    const opt = verb.options[optionIdx];
    if (opt.value === "none") {
      // Pure flag (e.g. --centered). Reject if extra junk follows.
      if (rest.length !== 1) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };
      return { ok: true, verbIdx, optionIdx, value: "" };
    }
    return { ok: true, verbIdx, optionIdx, value: rest.slice(1).join(" ") };
  }

  // No flag — option is the first one whose flag is null.
  const optionIdx = verb.options.findIndex((o) => o.flag === null);
  if (optionIdx < 0) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };
  const opt = verb.options[optionIdx];
  if (opt.value === "none") {
    if (rest.length !== 0) return { ok: false, verbIdx: 0, optionIdx: 0, value: "" };
    return { ok: true, verbIdx, optionIdx, value: "" };
  }
  return { ok: true, verbIdx, optionIdx, value: rest.join(" ") };
}

/** Build a command string from (verb, option, value). */
export function buildCommand(verbIdx: number, optionIdx: number, value: string): string {
  const verb = VERBS[verbIdx];
  if (!verb) return "";
  const opt = verb.options[optionIdx];
  if (!opt) return verb.name;
  const tokens: string[] = [verb.name];
  if (opt.flag) tokens.push(opt.flag);
  if (opt.value !== "none" && value.trim()) tokens.push(value.trim());
  return tokens.join(" ");
}
