/**
 * Persistent editor preferences. Backed by `localStorage` so they survive
 * across sessions. New options should default to `true` per project policy.
 */

const STORAGE_KEY = "glazewm-editor-settings";

class SettingsStore {
  /** Sort tag chips alphabetically (also reorders saved alternation). */
  autoSortTags = $state(true);
  /** Sort top-level alternatives in raw regex mode on blur. */
  autoSortRawAlternatives = $state(true);
  /** Show raw command/option names instead of human-readable labels. */
  advancedMode = $state(false);
  /** Auto-save and reload GlazeWM whenever an input field loses focus. */
  liveMode = $state(false);

  toJSON() {
    return {
      autoSortTags: this.autoSortTags,
      autoSortRawAlternatives: this.autoSortRawAlternatives,
      advancedMode: this.advancedMode,
      liveMode: this.liveMode,
    };
  }

  applyJSON(o: unknown) {
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    if (typeof r.autoSortTags === "boolean") this.autoSortTags = r.autoSortTags;
    if (typeof r.autoSortRawAlternatives === "boolean")
      this.autoSortRawAlternatives = r.autoSortRawAlternatives;
    if (typeof r.advancedMode === "boolean") this.advancedMode = r.advancedMode;
    if (typeof r.liveMode === "boolean") this.liveMode = r.liveMode;
  }
}

export const settings = new SettingsStore();

if (typeof localStorage !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) settings.applyJSON(JSON.parse(raw));
  } catch {
    /* ignore corrupted storage */
  }

  // Persist on every change.
  $effect.root(() => {
    $effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.toJSON()));
      } catch {
        /* quota exceeded / unavailable */
      }
    });
  });
}
