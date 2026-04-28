<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    index: number;
    total: number;
    children?: Snippet;
  }
  let { index, total, children }: Props = $props();
</script>

{#if total > 1}
  <div class="flex items-stretch gap-3">
    <div class="flex flex-col items-center flex-shrink-0">
      <div
        class="w-6 h-6 rounded-full bg-[#015f74] text-white text-xs font-mono flex items-center justify-center"
      >{index + 1}</div>
      {#if index < total - 1}
        <div class="w-px flex-1 bg-[#0289a3] my-1"></div>
      {/if}
    </div>
    <div class="flex-1 min-w-0">
      {@render children?.()}
    </div>
  </div>
{:else}
  {@render children?.()}
{/if}
