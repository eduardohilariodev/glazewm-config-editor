import type { KeybindingConfig } from "$shared/types/config";

/** Command pattern used by GlazeWM to focus a workspace by name. */
export function focusCommand(workspaceName: string): string {
  return `focus --workspace ${workspaceName}`;
}

/**
 * Find the index of the keybinding whose `commands` is exactly the single
 * `focus --workspace <name>` command. We deliberately match only single-command
 * entries to avoid touching compound bindings like `move --workspace X, focus --workspace X`.
 */
export function findWorkspaceBindingIndex(
  keybindings: KeybindingConfig[],
  workspaceName: string
): number {
  const target = focusCommand(workspaceName);
  return keybindings.findIndex(
    (kb) => kb.commands.length === 1 && kb.commands[0] === target
  );
}

/** True if any binding (single- or multi-command) references this workspace. */
export function hasAnyWorkspaceBinding(
  keybindings: KeybindingConfig[],
  workspaceName: string
): boolean {
  const target = focusCommand(workspaceName);
  return keybindings.some((kb) => kb.commands.includes(target));
}

/**
 * Mutate the keybindings list in place: ensure a single-command focus binding
 * for this workspace exists with the given bindings array. If `bindings` is
 * empty, the keybinding entry is removed entirely.
 */
export function setWorkspaceBindings(
  keybindings: KeybindingConfig[],
  workspaceName: string,
  bindings: string[]
): void {
  const idx = findWorkspaceBindingIndex(keybindings, workspaceName);
  const cleaned = bindings.map((b) => b.trim()).filter(Boolean);

  if (cleaned.length === 0) {
    if (idx >= 0) keybindings.splice(idx, 1);
    return;
  }

  if (idx >= 0) {
    keybindings[idx].bindings = cleaned;
  } else {
    keybindings.push({
      commands: [focusCommand(workspaceName)],
      bindings: cleaned,
    });
  }
}

/** Rename a workspace inside any keybinding command that references it. */
export function renameWorkspaceInBindings(
  keybindings: KeybindingConfig[],
  oldName: string,
  newName: string
): void {
  if (oldName === newName) return;
  const oldFocus = focusCommand(oldName);
  const newFocus = focusCommand(newName);
  const oldMove = `move --workspace ${oldName}`;
  const newMove = `move --workspace ${newName}`;
  for (const kb of keybindings) {
    kb.commands = kb.commands.map((c) => {
      if (c === oldFocus) return newFocus;
      if (c === oldMove) return newMove;
      return c;
    });
  }
}
