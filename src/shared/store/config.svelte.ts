import type { GlazeWMConfig } from "$shared/types/config";

export interface HistoryEntry {
  label: string;
  at: number;
}

const MAX_HISTORY = 100;

class ConfigStore {
  config = $state<GlazeWMConfig | null>(null);
  configPath = $state<string>("");
  isDirty = $state<boolean>(false);

  // Undo/redo: snapshots taken BEFORE each patch. `past[i]` corresponds to `pastLabels[i]`.
  past = $state<GlazeWMConfig[]>([]);
  future = $state<GlazeWMConfig[]>([]);
  pastLabels = $state<HistoryEntry[]>([]);
  futureLabels = $state<HistoryEntry[]>([]);

  canUndo = $derived(this.past.length > 0);
  canRedo = $derived(this.future.length > 0);

  setConfig(path: string, data: GlazeWMConfig) {
    this.config = data;
    this.configPath = path;
    this.isDirty = false;
    this.past = [];
    this.future = [];
    this.pastLabels = [];
    this.futureLabels = [];
  }

  patchConfig(updater: (c: GlazeWMConfig) => void, label = "Edit") {
    if (!this.config) return;
    const before = $state.snapshot(this.config) as GlazeWMConfig;
    updater(this.config);
    // Only record if something actually changed.
    const after = $state.snapshot(this.config) as GlazeWMConfig;
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    this.past.push(before);
    this.pastLabels.push({ label, at: Date.now() });
    if (this.past.length > MAX_HISTORY) {
      this.past.shift();
      this.pastLabels.shift();
    }
    this.future = [];
    this.futureLabels = [];
    this.isDirty = true;
  }

  undo() {
    if (!this.config || this.past.length === 0) return;
    const prev = this.past.pop()!;
    const label = this.pastLabels.pop()!;
    const cur = $state.snapshot(this.config) as GlazeWMConfig;
    this.future.push(cur);
    this.futureLabels.push(label);
    this.config = prev;
    this.isDirty = true;
  }

  redo() {
    if (!this.config || this.future.length === 0) return;
    const next = this.future.pop()!;
    const label = this.futureLabels.pop()!;
    const cur = $state.snapshot(this.config) as GlazeWMConfig;
    this.past.push(cur);
    this.pastLabels.push(label);
    this.config = next;
    this.isDirty = true;
  }

  /** Jump back N steps (N >= 1). Used by history list. */
  undoTo(targetPastIndex: number) {
    while (this.past.length > targetPastIndex) this.undo();
  }

  /** Jump forward N steps. */
  redoTo(targetFutureIndex: number) {
    while (this.future.length > targetFutureIndex) this.redo();
  }

  markClean() {
    this.isDirty = false;
  }
}

export const store = new ConfigStore();
