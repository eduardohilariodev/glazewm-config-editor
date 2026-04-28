<script lang="ts">
  import {
    VERBS,
    DIRECTIONS,
    TILING_DIRS,
    parseCommand,
    buildCommand,
    type CommandOption,
  } from "$shared/utils/commands";
  import type { WorkspaceConfig } from "$shared/types/config";
  import { applyMask, lengthMask, identifierMask } from "$shared/utils/masks";
  import HighlightedInput from "$shared/ui/HighlightedInput.svelte";
  import { PuzzlePiece, PencilSimple, X } from "phosphor-svelte";

  interface Props {
    value: string;
    workspaces: WorkspaceConfig[];
    onChange: (next: string) => void;
    onRemove?: () => void;
  }
  let { value, workspaces, onChange, onRemove }: Props = $props();

  // Parse the incoming command. If parse fails, raw mode is forced.
  let parsed = $derived(parseCommand(value));
  let canBuild = $derived(parsed.ok);

  let manualMode = $state<"auto" | "raw" | "build">("auto");
  let mode = $derived.by<"raw" | "build">(() => {
    if (manualMode === "raw") return "raw";
    if (manualMode === "build") return canBuild ? "build" : "raw";
    return canBuild ? "build" : "raw";
  });

  let verb = $derived(VERBS[parsed.verbIdx]);
  let option = $derived<CommandOption | undefined>(verb?.options[parsed.optionIdx]);

  function setVerb(name: string) {
    const verbIdx = VERBS.findIndex((v) => v.name === name);
    if (verbIdx < 0) return;
    onChange(buildCommand(verbIdx, 0, ""));
  }
  function setOption(idx: number) {
    onChange(buildCommand(parsed.verbIdx, idx, ""));
  }
  function setValue(v: string) {
    onChange(buildCommand(parsed.verbIdx, parsed.optionIdx, v));
  }

  function selectBuild() {
    if (canBuild) manualMode = "build";
  }
  function selectRaw() {
    manualMode = "raw";
  }
</script>

<div class="flex flex-col gap-[0.4rem]">
  <div class="flex items-center gap-2">
    <div class="inline-flex border border-[#444] rounded overflow-hidden" role="group" aria-label="View mode">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-[0.6rem] py-[0.2rem] border-0 border-r border-[#444] last:border-r-0 cursor-pointer text-[0.8rem] disabled:opacity-40 disabled:cursor-not-allowed {mode === 'build' ? 'bg-[#015f74] text-white' : 'bg-[#2a2a2a] text-[#ccc] enabled:hover:bg-[#3a3a3a]'}"
        disabled={!canBuild}
        onmousedown={(e) => { e.preventDefault(); selectBuild(); }}
        title={canBuild ? "Edit with dropdowns" : "Pattern can't be built — raw only"}
      ><PuzzlePiece size={12} weight="bold" />Build</button>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-[0.6rem] py-[0.2rem] border-0 cursor-pointer text-[0.8rem] {mode === 'raw' ? 'bg-[#015f74] text-white' : 'bg-[#2a2a2a] text-[#ccc] hover:bg-[#3a3a3a]'}"
        onmousedown={(e) => { e.preventDefault(); selectRaw(); }}
        title="Edit raw command"
      ><PencilSimple size={12} weight="bold" />Raw</button>
    </div>
    {#if !canBuild && manualMode === "build"}
      <span class="text-[#d8a657] text-[0.8rem]">unrecognized command — showing raw</span>
    {/if}
    {#if onRemove}
      <button
        type="button"
        class="ml-auto inline-flex items-center justify-center border border-[#444] bg-[#2a2a2a] text-[#f88] px-[0.4rem] py-[0.25rem] rounded cursor-pointer hover:bg-[#3a3a3a]"
        onclick={onRemove}
        aria-label="Remove"
      ><X size={12} weight="bold" /></button>
    {/if}
  </div>

  {#if mode === "build" && verb && option}
    <div class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1.4fr)] gap-[0.4rem]">
      <select
        class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono text-[0.9rem]"
        value={verb.name}
        onchange={(e) => setVerb((e.currentTarget as HTMLSelectElement).value)}
      >
        {#each VERBS as v (v.name)}
          <option value={v.name}>{v.name}</option>
        {/each}
      </select>

      {#if verb.options.length > 1 || verb.options[0].value !== "none"}
        <select
          class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono text-[0.9rem]"
          value={String(parsed.optionIdx)}
          onchange={(e) => setOption(Number((e.currentTarget as HTMLSelectElement).value))}
        >
          {#each verb.options as o, i (i)}
            <option value={String(i)}>{o.label}</option>
          {/each}
        </select>
      {:else}
        <div class="flex items-center justify-center text-[#555] font-mono border border-dashed border-[#333] rounded">—</div>
      {/if}

      {#if option.value === "workspace"}
        <select
          class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono text-[0.9rem]"
          value={parsed.value}
          onchange={(e) => setValue((e.currentTarget as HTMLSelectElement).value)}
        >
          {#if !workspaces.find((w) => w.name === parsed.value)}
            <option value={parsed.value}>{parsed.value || "(pick…)"}</option>
          {/if}
          {#each workspaces as ws (ws.name)}
            <option value={ws.name}>
              {ws.name}{ws.display_name ? ` — ${ws.display_name}` : ""}
            </option>
          {/each}
        </select>
      {:else if option.value === "direction"}
        <select
          class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono text-[0.9rem]"
          value={parsed.value}
          onchange={(e) => setValue((e.currentTarget as HTMLSelectElement).value)}
        >
          {#if !DIRECTIONS.includes(parsed.value as (typeof DIRECTIONS)[number])}
            <option value={parsed.value}>{parsed.value || "(pick…)"}</option>
          {/if}
          {#each DIRECTIONS as d (d)}
            <option value={d}>{d}</option>
          {/each}
        </select>
      {:else if option.value === "tilingDir"}
        <select
          class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono text-[0.9rem]"
          value={parsed.value}
          onchange={(e) => setValue((e.currentTarget as HTMLSelectElement).value)}
        >
          {#if !TILING_DIRS.includes(parsed.value as (typeof TILING_DIRS)[number])}
            <option value={parsed.value}>{parsed.value || "(pick…)"}</option>
          {/if}
          {#each TILING_DIRS as d (d)}
            <option value={d}>{d}</option>
          {/each}
        </select>
      {:else if option.value === "amount"}
        <HighlightedInput
          sharedClass="font-mono text-[0.9rem]"
          value={parsed.value}
          placeholder="e.g. 10% or 100px"
          title="Length: integer or float, optional unit `px` or `%`. Sign allowed."
          onInput={(v) => setValue(applyMask(v, lengthMask))}
        />
      {:else if option.value === "text"}
        <HighlightedInput
          sharedClass="font-mono text-[0.9rem]"
          value={parsed.value}
          placeholder="e.g. workspace_1"
          title="Identifier: letters, digits, _, -"
          onInput={(v) => setValue(applyMask(v, identifierMask))}
        />
      {:else if option.value === "shellRest"}
        <HighlightedInput
          sharedClass="font-mono text-[0.9rem]"
          value={parsed.value}
          placeholder="e.g. notepad.exe"
          onInput={(v) => setValue(v)}
        />
      {:else}
        <div class="flex items-center justify-center text-[#555] font-mono border border-dashed border-[#333] rounded">—</div>
      {/if}
    </div>
  {:else}
    <HighlightedInput
      sharedClass="font-mono text-[0.9rem]"
      {value}
      placeholder="e.g. focus --workspace 1"
      onInput={(v) => onChange(v)}
      spellcheck={false}
    />
  {/if}
</div>
