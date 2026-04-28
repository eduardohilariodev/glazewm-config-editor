<script lang="ts">
  import type { GapsConfig } from "$shared/types/config";
  import Toggle from "$shared/ui/Toggle.svelte";
  import GapInput from "$shared/ui/GapInput.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { i18n } from "$shared/i18n/index.svelte";

  interface Props {
    gaps: GapsConfig;
    onPatch: (updater: (g: GapsConfig) => void) => void;
  }
  let { gaps, onPatch }: Props = $props();
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <div class="flex items-center gap-1.5">
    <Toggle
      checked={gaps.scale_with_dpi}
      label={i18n.t.gaps.scaleWithDpi}
      onChange={(v) => onPatch((g) => (g.scale_with_dpi = v))}
    />
    <InfoIcon text="Scales all gap values proportionally based on the monitor's DPI setting." />
  </div>

  <h2 class="mt-2 mb-0 text-base text-[#ccc] inline-flex items-center gap-1.5">
    {i18n.t.gaps.heading}
    <InfoIcon text="Gap between adjacent windows (inner) and between windows and screen edges (outer)." />
  </h2>
  <p class="m-0 text-[#888] text-[0.85rem]">{i18n.t.gaps.description}</p>

  <div class="relative mx-auto my-2 w-full max-w-[560px]">
    <!-- Top outer gap -->
    <div class="flex justify-center pb-2">
      <div class="w-[120px]">
        <GapInput
          label={i18n.t.gaps.top}
          value={gaps.outer_gap.top}
          title={i18n.t.gaps.outerTopTitle}
          onChange={(v) => onPatch((g) => (g.outer_gap.top = v))}
        />
      </div>
    </div>

    <!-- Middle row: left · screen · right -->
    <div class="flex items-center gap-3">
      <div class="w-[120px] flex-shrink-0">
        <GapInput
          label={i18n.t.gaps.left}
          value={gaps.outer_gap.left}
          title={i18n.t.gaps.outerLeftTitle}
          onChange={(v) => onPatch((g) => (g.outer_gap.left = v))}
        />
      </div>

      <!-- Screen frame with two window tiles -->
      <div
        class="flex-1 relative border-2 border-dashed border-[#0289a3]/60 rounded-md bg-[#181818] p-3 h-[200px]"
        aria-label={i18n.t.gaps.screenAria}
      >
        <span class="absolute -top-[0.7rem] left-2 px-1 text-[0.7rem] uppercase tracking-wider text-[#0289a3] bg-[#181818]">
          {i18n.t.gaps.screen}
        </span>
        <div class="flex h-full gap-4">
          <div class="flex-1 border border-[#444] rounded bg-[#2a2a2a]" aria-hidden="true"></div>
          <div class="flex-1 border border-[#444] rounded bg-[#2a2a2a]" aria-hidden="true"></div>
        </div>
        <!-- Inner gap input centered over the gap between the two tiles -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] z-10">
          <GapInput
            label={i18n.t.gaps.inner}
            value={gaps.inner_gap}
            title={i18n.t.gaps.innerTitle}
            onChange={(v) => onPatch((g) => (g.inner_gap = v))}
          />
        </div>
      </div>

      <div class="w-[120px] flex-shrink-0">
        <GapInput
          label={i18n.t.gaps.right}
          value={gaps.outer_gap.right}
          title={i18n.t.gaps.outerRightTitle}
          onChange={(v) => onPatch((g) => (g.outer_gap.right = v))}
        />
      </div>
    </div>

    <!-- Bottom outer gap -->
    <div class="flex justify-center pt-2">
      <div class="w-[120px]">
        <GapInput
          label={i18n.t.gaps.bottom}
          value={gaps.outer_gap.bottom}
          title={i18n.t.gaps.outerBottomTitle}
          onChange={(v) => onPatch((g) => (g.outer_gap.bottom = v))}
        />
      </div>
    </div>
  </div>
</section>
