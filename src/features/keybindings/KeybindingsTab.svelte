<script lang="ts">
  import type { KeybindingConfig, WorkspaceConfig } from "$shared/types/config";
  import KeyCaptureInput from "$shared/ui/KeyCaptureInput.svelte";
  import CommandBuilder from "$shared/ui/CommandBuilder.svelte";
  import Stepper from "$shared/ui/Stepper.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { setContext } from "svelte";
  import { Plus, X, MagnifyingGlass } from "phosphor-svelte";
  import { i18n } from "$shared/i18n/index.svelte";

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
    <div class="relative flex-1 min-w-0">
      <MagnifyingGlass size={14} class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
      <input
        type="search"
        placeholder={i18n.t.keybindings.filterPlaceholder}
        bind:value={filter}
        class="w-full box-border pl-7 pr-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit] focus:border-primary focus:outline-none placeholder:text-[#666]"
      />
    </div>
    {#if filter}
      <button
        type="button"
        class="px-[0.6rem] py-[0.35rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit hover:bg-[#3a3a3a]"
        onclick={() => (filter = "")}
      >{i18n.t.keybindings.clear}</button>
    {/if}
  </div>
  <p class="m-0 text-[#777] text-[0.8rem] inline-flex items-center gap-1">
    <InfoIcon text="Each keybinding entry maps one or more key combos to a sequence of commands. Commands run in order when any of the bound keys are pressed." />
    Keybindings trigger commands when key combinations are pressed.
  </p>

  {#each keybindings as kb, i (i)}
    {@const visible = matches(kb)}
    <fieldset
      class="border rounded-md p-4 flex flex-col gap-[0.85rem] {q && visible ? 'border-[#ffd97a]' : 'border-[#333]'}"
      class:hidden={!visible}
    >
      <legend class="px-2 text-[#ccc] w-full flex items-center gap-2">
        <span>{i18n.t.keybindings.keybindingTitle(i + 1)}</span>
        <span class="flex-1 border-t border-[#444]"></span>
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1 px-[0.4rem] py-[0.15rem] text-[0.75rem] border border-[#444] rounded bg-[#2a2a2a] text-[#888] cursor-pointer hover:bg-[#3a3a3a] hover:text-[#f88] hover:border-[#f88]"
          onclick={() => remove(i)}
        ><X size={11} weight="bold" />{i18n.t.keybindings.removeKeybinding}</button>
      </legend>

      <div class="flex flex-col gap-[0.4rem]">
        <span class="text-[0.85rem] text-[#888]">{i18n.t.keybindings.bindings}</span>
        {#each kb.bindings as b, j (j)}
          <KeyCaptureInput
            value={b}
            onChange={(v) => setBinding(i, j, v)}
            onRemove={kb.bindings.length > 1 ? () => removeBinding(i, j) : undefined}
          />
        {/each}
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 px-[0.6rem] py-[0.4rem] text-[0.85rem] border border-dashed border-[#444] rounded bg-[#222] text-[#bbb] cursor-pointer font-[inherit] hover:bg-[#2a2a2a] hover:border-[#666] hover:text-inherit"
          onclick={() => addBinding(i)}
        ><Plus size={14} weight="bold" />{i18n.t.keybindings.addBinding}</button>
      </div>

      <div class="flex flex-col gap-[0.4rem]">
        <span class="text-[0.85rem] text-[#888]">{i18n.t.keybindings.commands}</span>
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
          class="w-full inline-flex items-center justify-center gap-1.5 px-[0.6rem] py-[0.4rem] text-[0.85rem] border border-dashed border-[#444] rounded bg-[#222] text-[#bbb] cursor-pointer font-[inherit] hover:bg-[#2a2a2a] hover:border-[#666] hover:text-inherit"
          onclick={() => addCommand(i)}
        ><Plus size={14} weight="bold" />{i18n.t.keybindings.addCommand}</button>
      </div>
    </fieldset>
  {/each}
  <button
    type="button"
    class="self-start inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] hover:bg-[#3a3a3a]"
    onclick={add}
  ><Plus size={14} weight="bold" />{i18n.t.keybindings.addKeybinding}</button>
</section>
