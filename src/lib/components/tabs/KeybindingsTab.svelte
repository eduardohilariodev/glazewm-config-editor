<script lang="ts">
  import type { KeybindingConfig, WorkspaceConfig } from "$lib/types/config";
  import KeyCaptureInput from "$lib/components/ui/KeyCaptureInput.svelte";
  import CommandBuilder from "$lib/components/ui/CommandBuilder.svelte";
  import Stepper from "$lib/components/ui/Stepper.svelte";
  import { setContext } from "svelte";

  interface Props {
    keybindings: KeybindingConfig[];
    workspaces: WorkspaceConfig[];
    onPatch: (updater: (k: KeybindingConfig[]) => void) => void;
  }
  let { keybindings, workspaces, onPatch }: Props = $props();

  let filter = $state("");
  let q = $derived(filter.trim().toLowerCase());
  setContext("filter:q", () => q);
  function matches(kb: KeybindingConfig): boolean {
    if (!q) return true;
    const hay = [...kb.bindings, ...kb.commands].join(" \u0001 ").toLowerCase();
    return hay.includes(q);
  }

  function add() {
    onPatch((k) => k.push({ bindings: [""], commands: [""] }));
  }
  function remove(i: number) {
    onPatch((k) => k.splice(i, 1));
  }

  function setBinding(i: number, j: number, v: string) {
    onPatch((k) => (k[i].bindings[j] = v));
  }
  function addBinding(i: number) {
    onPatch((k) => k[i].bindings.push(""));
  }
  function removeBinding(i: number, j: number) {
    onPatch((k) => k[i].bindings.splice(j, 1));
  }

  function setCommand(i: number, j: number, v: string) {
    onPatch((k) => (k[i].commands[j] = v));
  }
  function addCommand(i: number) {
    onPatch((k) => k[i].commands.push(""));
  }
  function removeCommand(i: number, j: number) {
    onPatch((k) => k[i].commands.splice(j, 1));
  }
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <div class="sticky top-0 z-10 -mx-4 -mt-4 px-4 py-3 bg-[#181818]/95 backdrop-blur border-b border-[#333] flex items-center gap-2">
    <input
      type="search"
      placeholder="Filter keybindings (matches binding or command text)…"
      bind:value={filter}
      class="flex-1 min-w-0 box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit] focus:border-[#3a6aa0] focus:outline-none placeholder:text-[#666]"
    />
    {#if filter}
      <button
        type="button"
        class="px-[0.6rem] py-[0.35rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit hover:bg-[#3a3a3a]"
        onclick={() => (filter = "")}
      >Clear</button>
    {/if}
  </div>

  {#each keybindings as kb, i (i)}
    {@const visible = matches(kb)}
    <fieldset
      class="border rounded-md p-4 flex flex-col gap-[0.85rem] {q && visible ? 'border-[#ffd97a] shadow-[inset_0_0_0_1px_#ffd97a]' : 'border-[#333]'}"
      class:hidden={!visible}
    >
      <legend class="px-2 text-[#ccc]">Keybinding #{i + 1}</legend>

      <div class="flex flex-col gap-[0.4rem]">
        <span class="text-[0.85rem] text-[#888]">Bindings</span>
        {#each kb.bindings as b, j (j)}
          <KeyCaptureInput
            value={b}
            onChange={(v) => setBinding(i, j, v)}
            onRemove={kb.bindings.length > 1 ? () => removeBinding(i, j) : undefined}
          />
        {/each}
        <button
          type="button"
          class="self-start px-[0.6rem] py-[0.25rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] hover:bg-[#3a3a3a]"
          onclick={() => addBinding(i)}
        >+ Add binding</button>
      </div>

      <div class="flex flex-col gap-[0.4rem]">
        <span class="text-[0.85rem] text-[#888]">Commands</span>
        {#each kb.commands as c, j (j)}
          <Stepper index={j} total={kb.commands.length}>
            <CommandBuilder
              value={c}
              {workspaces}
              onChange={(v) => setCommand(i, j, v)}
              onRemove={kb.commands.length > 1 ? () => removeCommand(i, j) : undefined}
            />
          </Stepper>
        {/each}
        <button
          type="button"
          class="self-start px-[0.6rem] py-[0.25rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] hover:bg-[#3a3a3a]"
          onclick={() => addCommand(i)}
        >+ Add command</button>
      </div>

      <button
        type="button"
        class="self-end px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-[#f88] cursor-pointer font-[inherit] hover:bg-[#3a3a3a]"
        onclick={() => remove(i)}
      >Remove keybinding</button>
    </fieldset>
  {/each}
  <button
    type="button"
    class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] hover:bg-[#3a3a3a]"
    onclick={add}
  >+ Add keybinding</button>
</section>
