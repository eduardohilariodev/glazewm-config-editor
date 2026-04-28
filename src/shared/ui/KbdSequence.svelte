<script lang="ts">
  import { Plus } from "phosphor-svelte";

  interface Props {
    value: string;
    /** Visual size scale for the kbd elements. */
    size?: "sm" | "md";
    placeholder?: string;
  }
  let { value, size = "md", placeholder = "" }: Props = $props();

  const tokens = $derived(
    value
      .split("+")
      .map((t) => t.trim())
      .filter((t) => t.length > 0),
  );

  const kbdClass = $derived(
    size === "sm"
      ? "px-[0.35rem] py-[0.05rem] text-[0.75rem]"
      : "px-[0.45rem] py-[0.1rem] text-[0.85rem]",
  );
  const iconSize = $derived(size === "sm" ? 10 : 12);
</script>

<span class="inline-flex items-center gap-1 flex-wrap">
  {#if tokens.length === 0}
    <span class="text-[#666] italic">{placeholder}</span>
  {:else}
    {#each tokens as t, i (i)}
      {#if i > 0}
        <Plus size={iconSize} weight="bold" class="text-[#888] shrink-0" />
      {/if}
      <kbd
        class="inline-flex items-center rounded border border-[#555] bg-[#2a2a2a] text-[#e8e8e8] font-mono leading-none shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)] {kbdClass}"
      >{t}</kbd>
    {/each}
  {/if}
</span>
