<script lang="ts">
  import type { WorkspaceConfig, KeybindingConfig } from "$lib/types/config";
  import {
    findWorkspaceBindingIndex,
    setWorkspaceBindings,
    renameWorkspaceInBindings,
  } from "$lib/utils/workspaceBindings";
  import {
    applyMask,
    workspaceNameMask,
    positiveIntegerMask,
  } from "$lib/utils/masks";

  interface Props {
    workspaces: WorkspaceConfig[];
    keybindings: KeybindingConfig[];
    onPatchWorkspaces: (updater: (w: WorkspaceConfig[]) => void) => void;
    onPatchKeybindings: (updater: (k: KeybindingConfig[]) => void) => void;
  }
  let {
    workspaces,
    keybindings,
    onPatchWorkspaces,
    onPatchKeybindings,
  }: Props = $props();

  let expanded = $state<Set<number>>(new Set());

  function toggleExpand(i: number) {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    expanded = next;
  }

  function updateName(i: number, newName: string) {
    const oldName = workspaces[i].name;
    onPatchWorkspaces((ws) => {
      ws[i].name = newName;
    });
    onPatchKeybindings((kb) => renameWorkspaceInBindings(kb, oldName, newName));
  }

  function updateField(i: number, key: "display_name", value: string) {
    onPatchWorkspaces((ws) => {
      ws[i][key] = value;
    });
  }

  function updateMonitor(i: number, raw: string) {
    onPatchWorkspaces((ws) => {
      if (raw === "") delete ws[i].bind_to_monitor;
      else ws[i].bind_to_monitor = Number(raw);
    });
  }

  function removeWorkspace(i: number) {
    const removed = workspaces[i];
    onPatchWorkspaces((ws) => ws.splice(i, 1));
    // Drop any single-command focus binding for the removed workspace.
    onPatchKeybindings((kb) => setWorkspaceBindings(kb, removed.name, []));
    const next = new Set(expanded);
    next.delete(i);
    expanded = next;
  }

  function addWorkspace() {
    onPatchWorkspaces((ws) =>
      ws.push({ name: `${ws.length + 1}`, display_name: `${ws.length + 1}` })
    );
  }

  function getBindingsFor(name: string): string[] {
    const idx = findWorkspaceBindingIndex(keybindings, name);
    return idx >= 0 ? keybindings[idx].bindings : [];
  }

  function setBindingsFor(name: string, bindings: string[]) {
    onPatchKeybindings((kb) => setWorkspaceBindings(kb, name, bindings));
  }

  let drafts = $state<Record<number, string>>({});

  function addBinding(i: number, name: string) {
    const draft = (drafts[i] ?? "").trim();
    if (!draft) return;
    const current = getBindingsFor(name);
    if (current.includes(draft)) {
      drafts[i] = "";
      return;
    }
    setBindingsFor(name, [...current, draft]);
    drafts[i] = "";
  }

  function removeBinding(name: string, binding: string) {
    setBindingsFor(
      name,
      getBindingsFor(name).filter((b) => b !== binding)
    );
  }
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">Name</th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">Display name</th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">Bind to monitor</th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">Keybinding</th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]"></th>
      </tr>
    </thead>
    <tbody>
      {#each workspaces as ws, i (i)}
        {@const bindings = getBindingsFor(ws.name)}
        {@const isExpanded = expanded.has(i)}
        <tr>
          <td class="p-[0.4rem] align-middle">
            <input
              type="text"
              class="w-full px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
              value={ws.name}
              placeholder="e.g. 1 or primary"
              title="Workspace name (no spaces or `|`)"
              oninput={(e) => {
                const el = e.currentTarget as HTMLInputElement;
                const filtered = applyMask(el.value, workspaceNameMask);
                if (filtered !== el.value) el.value = filtered;
                updateName(i, filtered);
              }}
            />
          </td>
          <td class="p-[0.4rem] align-middle">
            <input
              type="text"
              class="w-full px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
              value={ws.display_name}
              placeholder="e.g. 1 · Web"
              oninput={(e) =>
                updateField(i, "display_name", (e.currentTarget as HTMLInputElement).value)}
            />
          </td>
          <td class="p-[0.4rem] align-middle">
            <input
              type="text"
              inputmode="numeric"
              class="w-full px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
              value={ws.bind_to_monitor ?? ""}
              placeholder="e.g. 0 (any)"
              title="Monitor index (whole number)"
              oninput={(e) => {
                const el = e.currentTarget as HTMLInputElement;
                const filtered = applyMask(el.value, positiveIntegerMask);
                if (filtered !== el.value) el.value = filtered;
                updateMonitor(i, filtered);
              }}
            />
          </td>
          <td class="p-[0.4rem] align-middle">
            <button
              type="button"
              class="w-full text-left flex justify-between items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] cursor-pointer hover:bg-[#3a3a3a] {bindings.length === 0 ? 'text-[#8eb8ed] italic font-[inherit]' : 'text-inherit font-mono text-[0.85rem]'}"
              aria-expanded={isExpanded}
              onclick={() => toggleExpand(i)}
            >
              {#if bindings.length === 0}
                + Add key binding
              {:else}
                {bindings.join(", ")}
                <span class="text-[#888]">{isExpanded ? "▴" : "▾"}</span>
              {/if}
            </button>
          </td>
          <td class="p-[0.4rem] align-middle">
            <button
              type="button"
              class="px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
              onclick={() => removeWorkspace(i)}
              aria-label="Remove"
            >✕</button>
          </td>
        </tr>
        {#if isExpanded}
          <tr>
            <td colspan="5" class="bg-[#1a1a1a] p-0">
              <div class="px-4 py-3 border-l-[3px] border-[#8eb8ed] flex flex-col gap-2">
                <span class="text-[#aaa] text-[0.85rem]">
                  Command: <code class="text-[#ddd]">focus --workspace {ws.name}</code>
                </span>
                <div class="flex flex-wrap gap-[0.4rem] items-center">
                  {#each bindings as b (b)}
                    <span class="inline-flex items-center gap-[0.4rem] px-2 py-1 rounded bg-[#2d4f7a] text-[#e8f0ff] font-mono text-[0.85rem]">
                      {b}
                      <button
                        type="button"
                        class="p-0 bg-transparent border-0 text-inherit leading-none cursor-pointer hover:text-white"
                        aria-label="Remove binding"
                        onclick={() => removeBinding(ws.name, b)}
                      >✕</button>
                    </span>
                  {/each}
                  <input
                    type="text"
                    class="w-auto min-w-[8rem] flex-none px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
                    placeholder="e.g. alt+1"
                    value={drafts[i] ?? ""}
                    oninput={(e) => (drafts[i] = (e.currentTarget as HTMLInputElement).value)}
                    onkeydown={(e) => e.key === "Enter" && addBinding(i, ws.name)}
                  />
                  <button
                    type="button"
                    class="px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
                    onclick={() => addBinding(i, ws.name)}
                  >Add</button>
                </div>
                <p class="m-0 text-[#777] text-[0.8rem]">
                  Synced with the Keybindings tab. Compound bindings (e.g. <code class="text-[#aaa]"
                    >move --workspace {ws.name}, focus --workspace {ws.name}</code
                  >) are left untouched and stay editable in the Keybindings tab.
                </p>
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
  <button
    type="button"
    class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
    onclick={addWorkspace}
  >+ Add workspace</button>
</section>
