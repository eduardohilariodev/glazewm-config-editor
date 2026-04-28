<script lang="ts">
  import { Info } from "phosphor-svelte";

  interface Props {
    text: string;
    class?: string;
  }
  const { text, class: cls }: Props = $props();

  let anchor: HTMLElement | undefined = $state();
  let tooltip: HTMLElement | undefined = $state();
  let hovered = $state(false);
  let tipStyle = $state("position:fixed;left:-9999px;top:-9999px");

  $effect(() => {
    if (!hovered || !anchor || !tooltip) return;
    const a = anchor.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;

    let left = a.left + a.width / 2 - t.width / 2;
    let top = a.top - t.height - 6;

    // Clamp horizontally within viewport
    left = Math.max(margin, Math.min(left, vw - t.width - margin));

    // Flip below anchor if not enough room above
    if (top < margin) top = a.bottom + 6;

    tipStyle = `position:fixed;left:${left}px;top:${top}px`;
  });
</script>

<span bind:this={anchor} class="relative inline-flex {cls ?? ''}">
  <span
    class="text-[#555] hover:text-[#888] cursor-help inline-flex"
    tabindex="0"
    role="button"
    aria-label="Info"
    onmouseenter={() => { hovered = true; }}
    onmouseleave={() => { hovered = false; tipStyle = "position:fixed;left:-9999px;top:-9999px"; }}
    onfocus={() => { hovered = true; }}
    onblur={() => { hovered = false; tipStyle = "position:fixed;left:-9999px;top:-9999px"; }}
    onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") hovered = !hovered; }}
  >
    <Info size={13} weight="fill" />
  </span>
  {#if hovered}
    <span
      bind:this={tooltip}
      role="tooltip"
      style={tipStyle}
      class="pointer-events-none w-max max-w-[280px] text-wrap px-2.5 py-1.5 rounded bg-[#111] border border-[#444] text-[#ccc] text-xs leading-relaxed z-[100] shadow-lg"
    >{text}</span>
  {/if}
</span>
