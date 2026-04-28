/**
 * Input masks/validators for GlazeWM-accepted values.
 *
 *   `allow`  filters keystrokes char-by-char; only characters that match are
 *            kept. Use it for live masking as the user types.
 *   `regex`  validates the whole final string (drives the red error border).
 *   `hint`   short example shown as placeholder/title.
 */
export interface Mask {
  allow: RegExp;
  regex: RegExp;
  hint: string;
  /** Concrete example shown as the input placeholder. */
  example: string;
}

/** A length value: optional sign, integer or float, optional `px` or `%` unit. */
export const lengthMask: Mask = {
  allow: /[0-9+\-.px%]/i,
  regex: /^[+-]?(\d+(\.\d+)?|\.\d+)(px|%)?$/,
  hint: "10, 10px, 5%",
  example: "e.g. 10px or 5%",
};

/** A non-negative length value. */
export const positiveLengthMask: Mask = {
  allow: /[0-9.px%]/i,
  regex: /^(\d+(\.\d+)?|\.\d+)(px|%)?$/,
  hint: "10, 10px, 5%",
  example: "e.g. 10px or 5%",
};

/** A non-negative integer. */
export const positiveIntegerMask: Mask = {
  allow: /[0-9]/,
  regex: /^\d+$/,
  hint: "whole number",
  example: "e.g. 0",
};

/** Hex color: #rgb, #rrggbb, or #rrggbbaa. */
export const colorMask: Mask = {
  allow: /[#0-9a-fA-F]/,
  regex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  hint: "#rrggbb or #rrggbbaa",
  example: "e.g. #1e1e1eff",
};

/** GlazeWM identifier: letters, digits, underscore, dash. */
export const identifierMask: Mask = {
  allow: /[A-Za-z0-9_-]/,
  regex: /^[A-Za-z0-9_-]+$/,
  hint: "letters, digits, _ or -",
  example: "e.g. my_workspace",
};

/** Workspace name: identifier-ish but allow more characters in practice. */
export const workspaceNameMask: Mask = {
  allow: /[^\s|]/,
  regex: /^[^\s|]+$/,
  hint: "no spaces or `|`",
  example: "e.g. 1 or primary",
};

/** Apply a mask's `allow` filter to a raw input string. */
export function applyMask(raw: string, mask: Mask): string {
  let out = "";
  for (const ch of raw) {
    if (mask.allow.test(ch)) out += ch;
  }
  return out;
}

/** Returns true when `value` is empty or fully matches the mask regex. */
export function isMaskValid(value: string, mask: Mask): boolean {
  if (value === "") return true;
  return mask.regex.test(value);
}
