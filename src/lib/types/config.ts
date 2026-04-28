export interface GlazeWMConfig {
  general: GeneralConfig;
  gaps: GapsConfig;
  window_effects: WindowEffectsConfig;
  window_behavior: WindowBehaviorConfig;
  workspaces: WorkspaceConfig[];
  window_rules: WindowRuleConfig[];
  keybindings: KeybindingConfig[];
  binding_modes: BindingModeConfig[];
}

export interface GeneralConfig {
  startup_commands: string[];
  shutdown_commands: string[];
  config_reload_commands: string[];
  focus_follows_cursor: boolean;
  toggle_workspace_on_refocus: boolean;
  cursor_jump: { enabled: boolean; trigger: string };
  hide_method: string;
  show_all_in_taskbar: boolean;
}

export interface GapsConfig {
  scale_with_dpi: boolean;
  inner_gap: string;
  outer_gap: { top: string; right: string; bottom: string; left: string };
}

export interface WindowEffectsConfig {
  focused_window: WindowEffectTarget;
  other_windows: WindowEffectTarget;
}

export interface WindowEffectTarget {
  border: { enabled: boolean; color: string };
  hide_title_bar: { enabled: boolean };
  corner_style: { enabled: boolean; style: string };
}

export interface WindowBehaviorConfig {
  initial_state: string;
  state_defaults: {
    floating: { centered: boolean; shown_on_top: boolean };
    fullscreen: { maximized: boolean; shown_on_top: boolean };
  };
}

export interface WorkspaceConfig {
  name: string;
  display_name: string;
  bind_to_monitor?: number;
  keep_alive?: boolean;
}

export interface WindowRuleConfig {
  commands: string[];
  match: WindowMatchConfig[];
}

export interface WindowMatchConfig {
  window_process?: MatchType;
  window_class?: MatchType;
  window_title?: MatchType;
}

/**
 * GlazeWM's match operators — must mirror `MatchType` in
 * packages/wm-common/src/parsed_config.rs. Untagged enum, only one key
 * is set per match.
 */
export type MatchType =
  | { equals: string }
  | { includes: string }
  | { regex: string }
  | { not_equals: string }
  | { not_regex: string };

export type MatchOp = "equals" | "includes" | "regex" | "not_equals" | "not_regex";

export const MATCH_OPS: MatchOp[] = [
  "equals",
  "includes",
  "regex",
  "not_equals",
  "not_regex",
];

export interface KeybindingConfig {
  commands: string[];
  bindings: string[];
}

export interface BindingModeConfig {
  name: string;
  keybindings: KeybindingConfig[];
}

export function emptyConfig(): GlazeWMConfig {
  return {
    general: {
      startup_commands: [],
      shutdown_commands: [],
      config_reload_commands: [],
      focus_follows_cursor: false,
      toggle_workspace_on_refocus: true,
      cursor_jump: { enabled: true, trigger: "monitor_focus" },
      hide_method: "cloak",
      show_all_in_taskbar: false,
    },
    gaps: {
      scale_with_dpi: true,
      inner_gap: "20px",
      outer_gap: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    },
    window_effects: {
      focused_window: {
        border: { enabled: true, color: "#8eb8ed" },
        hide_title_bar: { enabled: false },
        corner_style: { enabled: false, style: "square" },
      },
      other_windows: {
        border: { enabled: false, color: "#a1a1a1" },
        hide_title_bar: { enabled: false },
        corner_style: { enabled: false, style: "square" },
      },
    },
    window_behavior: {
      initial_state: "tiling",
      state_defaults: {
        floating: { centered: true, shown_on_top: false },
        fullscreen: { maximized: true, shown_on_top: false },
      },
    },
    workspaces: [],
    window_rules: [],
    keybindings: [],
    binding_modes: [],
  };
}
