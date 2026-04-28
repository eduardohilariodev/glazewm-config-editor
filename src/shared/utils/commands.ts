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
  /** Raw label shown in advanced mode (flag syntax or placeholder). */
  label: string;
  /** Human-readable label shown in simple mode. Falls back to `label` if absent. */
  friendlyLabel?: string;
  value: ValueKind;
}

export interface CommandVerb {
  name: string;
  /** Human-readable label shown in simple mode. Falls back to `name` if absent. */
  label?: string;
  description?: string;
  /** First option is the default when the verb is freshly selected. */
  options: CommandOption[];
}

export const VERBS: CommandVerb[] = [
  {
    name: "focus",
    label: "Focus",
    options: [
      { flag: "--workspace", label: "--workspace <name>", friendlyLabel: "Workspace", value: "workspace" },
      { flag: "--direction", label: "--direction <dir>", friendlyLabel: "Direction", value: "direction" },
      { flag: "--next-workspace", label: "--next-workspace", friendlyLabel: "Next Workspace", value: "none" },
      { flag: "--prev-workspace", label: "--prev-workspace", friendlyLabel: "Prev Workspace", value: "none" },
      { flag: "--recent-workspace", label: "--recent-workspace", friendlyLabel: "Recent Workspace", value: "none" },
      { flag: "--next-active-workspace", label: "--next-active-workspace", friendlyLabel: "Next Active Workspace", value: "none" },
      { flag: "--prev-active-workspace", label: "--prev-active-workspace", friendlyLabel: "Prev Active Workspace", value: "none" },
    ],
  },
  {
    name: "move",
    label: "Move Window",
    options: [
      { flag: "--workspace", label: "--workspace <name>", friendlyLabel: "To Workspace", value: "workspace" },
      { flag: "--direction", label: "--direction <dir>", friendlyLabel: "Direction", value: "direction" },
    ],
  },
  {
    name: "resize",
    label: "Resize Window",
    options: [
      { flag: "--width", label: "--width <amount>", friendlyLabel: "Width", value: "amount" },
      { flag: "--height", label: "--height <amount>", friendlyLabel: "Height", value: "amount" },
    ],
  },
  {
    name: "tiling-direction",
    label: "Set Tiling Direction",
    options: [{ flag: null, label: "<horizontal|vertical|toggle>", friendlyLabel: "Direction", value: "tilingDir" }],
  },
  { name: "toggle-tiling-direction", label: "Toggle Tiling Direction", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "toggle-floating",
    label: "Toggle Floating",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--centered", label: "--centered", value: "none" },
    ],
  },
  {
    name: "toggle-fullscreen",
    label: "Toggle Fullscreen",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--maximized", label: "--maximized", value: "none" },
    ],
  },
  { name: "toggle-minimized", label: "Toggle Minimized", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "toggle-tiling", label: "Toggle Tiling", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "set-floating",
    label: "Set Floating",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--centered", label: "--centered", value: "none" },
    ],
  },
  {
    name: "set-fullscreen",
    label: "Set Fullscreen",
    options: [
      { flag: null, label: "(no args)", value: "none" },
      { flag: "--maximized", label: "--maximized", value: "none" },
    ],
  },
  { name: "set-minimized", label: "Set Minimized", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "set-tiling", label: "Set Tiling", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "close", label: "Close Window", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-cycle-focus", label: "Cycle Focus", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-reload-config", label: "Reload Config", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-redraw", label: "Redraw Windows", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-exit", label: "Exit WM", options: [{ flag: null, label: "(no args)", value: "none" }] },
  { name: "wm-toggle-pause", label: "Toggle Pause", options: [{ flag: null, label: "(no args)", value: "none" }] },
  {
    name: "wm-enable-binding-mode",
    label: "Enable Binding Mode",
    options: [{ flag: "--name", label: "--name <mode>", friendlyLabel: "Mode Name", value: "text" }],
  },
  {
    name: "wm-disable-binding-mode",
    label: "Disable Binding Mode",
    options: [{ flag: "--name", label: "--name <mode>", friendlyLabel: "Mode Name", value: "text" }],
  },
  { name: "shell-exec", label: "Run Shell Command", options: [{ flag: null, label: "<command...>", friendlyLabel: "Command", value: "shellRest" }] },
  { name: "ignore", label: "Ignore Window", options: [{ flag: null, label: "(no args)", value: "none" }] },
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
