<script lang="ts">
  import { Info } from "phosphor-svelte";

  interface Props {
    text: string;
    class?: string;
  }
  const { text, class: cls }: Props = $props();
</script>

<span class="relative inline-flex group {cls ?? ''}">
  <span class="text-[#555] hover:text-[#888] cursor-help inline-flex">
    <Info size={13} weight="fill" />
  </span>
  <span
    role="tooltip"
    class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[280px] text-wrap px-2.5 py-1.5 rounded bg-[#111] border border-[#444] text-[#ccc] text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-[100] shadow-lg"
  >{text}</span>
</span>
