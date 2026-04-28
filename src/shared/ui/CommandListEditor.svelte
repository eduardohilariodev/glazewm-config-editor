<script lang="ts">
  import Stepper from "$shared/ui/Stepper.svelte";
  import CommandBuilder from "$shared/ui/CommandBuilder.svelte";
  import type { WorkspaceConfig } from "$shared/types/config";
  import { Plus } from "phosphor-svelte";

  interface Props {
    items: string[];
    workspaces?: WorkspaceConfig[];
    label?: string;
    onChange: (items: string[]) => void;
  }
  let { items, workspaces = [], label, onChange }: Props = $props();

  function add() {
    onChange([...items, ""]);
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
      <CommandBuilder
        value={item}
        {workspaces}
        onChange={(v) => update(i, v)}
        onRemove={() => remove(i)}
      />
    </Stepper>
  {/each}
  <button
    type="button"
    class="inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a] self-start"
    onclick={add}
  ><Plus size={14} weight="bold" />Add</button>
</div>
