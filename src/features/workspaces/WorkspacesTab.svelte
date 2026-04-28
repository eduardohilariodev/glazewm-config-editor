<script lang="ts">
  import type { WorkspaceConfig, KeybindingConfig } from "$shared/types/config";
  import {
    findWorkspaceBindingIndex,
    setWorkspaceBindings,
    renameWorkspaceInBindings,
  } from "$features/workspaces";
  import {
    applyMask,
    workspaceNameMask,
    positiveIntegerMask,
  } from "$shared/utils/masks";
  import KbdSequence from "$shared/ui/KbdSequence.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { Plus, X, CaretUp, CaretDown, DotsSixVertical } from "phosphor-svelte";

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
    const next = new Set<number>();
    for (const idx of expanded) {
      if (idx < i) next.add(idx);
      else if (idx > i) next.add(idx - 1);
    }
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

  let dragIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  function reorder(from: number, to: number) {
    if (from === to) return;
    // "Drop on row X" means insert before X; adjust for the removed slot when moving down.
    const insertAt = from < to ? to - 1 : to;
    onPatchWorkspaces((ws) => {
      const [item] = ws.splice(from, 1);
      ws.splice(insertAt, 0, item);
    });
    // Remap expanded set so the right rows stay open after reorder.
    const next = new Set<number>();
    for (const idx of expanded) {
      if (idx === from) {
        next.add(insertAt);
      } else if (from < to && idx > from && idx <= insertAt) {
        next.add(idx - 1);
      } else if (from > to && idx >= insertAt && idx < from) {
        next.add(idx + 1);
      } else {
        next.add(idx);
      }
    }
    expanded = next;
  }

  function handleDragStart(e: DragEvent, i: number) {
    dragIndex = i;
    e.dataTransfer!.effectAllowed = "move";
    const row = (e.currentTarget as HTMLElement).closest("tr");
    if (row) e.dataTransfer!.setDragImage(row, 0, 0);
  }

  function handleDragOver(e: DragEvent, i: number) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    dragOverIndex = i;
  }

  function handleDrop(e: DragEvent, i: number) {
    e.preventDefault();
    if (dragIndex !== null) reorder(dragIndex, i);
    dragIndex = null;
    dragOverIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
    dragOverIndex = null;
  }

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
        <th class="p-2 border-b border-[#333] w-6"></th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">
          <span class="inline-flex items-center gap-1">{i18n.t.workspaces.name} <InfoIcon text="Unique identifier for the workspace. Used in commands like 'focus --workspace 1'." /></span>
        </th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">
          <span class="inline-flex items-center gap-1">{i18n.t.workspaces.displayName} <InfoIcon text="Optional friendly name shown in status bars (e.g. '1 · Web')." /></span>
        </th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">
          <span class="inline-flex items-center gap-1">{i18n.t.workspaces.bindToMonitor} <InfoIcon text="Pin this workspace to a specific monitor by index (0-based). Leave blank to allow any monitor." /></span>
        </th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]">
          <span class="inline-flex items-center gap-1">{i18n.t.workspaces.keybinding} <InfoIcon text="Key binding(s) to focus this workspace." /></span>
        </th>
        <th class="text-left p-2 text-[#aaa] font-medium border-b border-[#333]"></th>
      </tr>
    </thead>
    <tbody>
      {#each workspaces as ws, i (ws)}
        {@const bindings = getBindingsFor(ws.name)}
        {@const isExpanded = expanded.has(i)}
        <tr
          ondragover={(e) => handleDragOver(e, i)}
          ondrop={(e) => handleDrop(e, i)}
          class="transition-opacity {dragIndex === i ? 'opacity-40' : ''} {dragOverIndex === i && dragIndex !== i ? 'border-t-2 border-primary' : 'border-t border-transparent'}"
        >
          <td class="p-[0.4rem] align-middle">
            <div
              role="button"
              tabindex="-1"
              aria-label="Drag to reorder"
              draggable="true"
              ondragstart={(e) => handleDragStart(e, i)}
              ondragend={handleDragEnd}
              class="flex items-center justify-center px-1 text-[#555] hover:text-[#999] cursor-grab active:cursor-grabbing"
            ><DotsSixVertical size={16} /></div>
          </td>
          <td class="p-[0.4rem] align-middle">
            <input
              type="text"
              class="w-full px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
              value={ws.name}
              placeholder={i18n.t.workspaces.namePlaceholder}
              title={i18n.t.workspaces.nameTitle}
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
              placeholder={i18n.t.workspaces.displayNamePlaceholder}
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
              placeholder={i18n.t.workspaces.bindToMonitorPlaceholder}
              title={i18n.t.workspaces.bindToMonitorTitle}
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
              class="w-full text-left flex justify-between items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] cursor-pointer hover:bg-[#3a3a3a] {bindings.length === 0 ? 'text-[#8eb8ed] italic font-[inherit]' : 'text-inherit'}"
              aria-expanded={isExpanded}
              onclick={() => toggleExpand(i)}
            >
              {#if bindings.length === 0}
                <span class="inline-flex items-center gap-1.5"><Plus size={14} weight="bold" />{i18n.t.workspaces.addKeybinding}</span>
              {:else}
                <span class="flex flex-wrap items-center gap-1">
                  {#each bindings as b, bi (bi)}
                    {#if bi > 0}<span class="text-[#666] text-[0.75rem]">,</span>{/if}
                    <KbdSequence value={b} size="sm" />
                  {/each}
                </span>
                <span class="text-[#888] inline-flex items-center">
                  {#if isExpanded}<CaretUp size={12} weight="bold" />{:else}<CaretDown size={12} weight="bold" />{/if}
                </span>
              {/if}
            </button>
          </td>
          <td class="p-[0.4rem] align-middle">
            <button
              type="button"
              class="inline-flex items-center justify-center px-[0.5rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
              onclick={() => removeWorkspace(i)}
              aria-label={i18n.t.workspaces.removeAria}
            ><X size={14} weight="bold" /></button>
          </td>
        </tr>
        {#if isExpanded}
          <tr>
            <td colspan="6" class="bg-[#1a1a1a] p-0">
              <div class="px-4 py-3 border-l-[3px] border-[#8eb8ed] flex flex-col gap-2">
                <span class="text-[#aaa] text-[0.85rem]">
                  {i18n.t.workspaces.commandLabel} <code class="text-[#ddd]">focus --workspace {ws.name}</code>
                </span>
                <div class="flex flex-wrap gap-[0.4rem] items-center">
                  {#each bindings as b (b)}
                    <span class="inline-flex items-center gap-[0.4rem] px-2 py-1 rounded bg-[#015f74] text-[#e8f0ff]">
                      <KbdSequence value={b} size="sm" />
                      <button
                        type="button"
                        class="inline-flex items-center justify-center p-0 bg-transparent border-0 text-inherit leading-none cursor-pointer hover:text-white"
                        aria-label={i18n.t.workspaces.removeBindingAria}
                        onclick={() => removeBinding(ws.name, b)}
                      ><X size={11} weight="bold" /></button>
                    </span>
                  {/each}
                  <input
                    type="text"
                    class="w-auto min-w-[8rem] flex-none px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono"
                    placeholder={i18n.t.workspaces.bindingPlaceholder}
                    value={drafts[i] ?? ""}
                    oninput={(e) => (drafts[i] = (e.currentTarget as HTMLInputElement).value)}
                    onkeydown={(e) => e.key === "Enter" && addBinding(i, ws.name)}
                  />
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
                    onclick={() => addBinding(i, ws.name)}
                  ><Plus size={14} weight="bold" />{i18n.t.workspaces.add}</button>
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
    class="self-start inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
    onclick={addWorkspace}
  ><Plus size={14} weight="bold" />{i18n.t.workspaces.addWorkspace}</button>
</section>
