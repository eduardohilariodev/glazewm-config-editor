<script lang="ts">
  import Stepper from "$shared/ui/Stepper.svelte";
  import { Plus, X } from "phosphor-svelte";

  interface Props {
    items: string[];
    label?: string;
    placeholder?: string;
    onChange: (items: string[]) => void;
  }
  let { items, label, placeholder = "e.g. shell-exec zebar", onChange }: Props = $props();
  let draft = $state("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    draft = "";
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function update(i: number, v: string) {
    onChange(items.map((it, idx) => (idx === i ? v : it)));
  }
</script>

<div class="flex flex-col gap-[0.4rem]">
  {#if label}<span class="text-[0.85rem] text-[#888]">{label}</span>{/if}
  {#each items as item, i (i)}
    <Stepper index={i} total={items.length}>
      <div class="flex gap-[0.4rem]">
        <input
          type="text"
          class="flex-1 px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono"
          value={item}
          {placeholder}
          oninput={(e) => update(i, (e.currentTarget as HTMLInputElement).value)}
        />
        <button
          type="button"
          class="inline-flex items-center justify-center px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
          onclick={() => remove(i)}
          aria-label="Remove"
        ><X size={12} weight="bold" /></button>
      </div>
    </Stepper>
  {/each}
  <div class="flex gap-[0.4rem]">
    <input
      type="text"
      class="flex-1 px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-mono"
      bind:value={draft}
      {placeholder}
      onkeydown={(e) => e.key === "Enter" && add()}
    />
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
      onclick={add}
    ><Plus size={14} weight="bold" />Add</button>
  </div>
</div>
