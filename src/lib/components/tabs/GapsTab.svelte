<script lang="ts">
  import type { GapsConfig } from "$lib/types/config";
  import Toggle from "$lib/components/ui/Toggle.svelte";
  import MaskedInput from "$lib/components/ui/MaskedInput.svelte";
  import { positiveLengthMask } from "$lib/utils/masks";

  interface Props {
    gaps: GapsConfig;
    onPatch: (updater: (g: GapsConfig) => void) => void;
  }
  let { gaps, onPatch }: Props = $props();
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <Toggle
    checked={gaps.scale_with_dpi}
    label="Scale with DPI"
    onChange={(v) => onPatch((g) => (g.scale_with_dpi = v))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Gaps</h2>
  <p class="m-0 text-[#888] text-[0.85rem]">
    Each input sits on the side it controls. Outer gaps are the empty space
    around the screen edges; inner gap is the space between adjacent windows.
  </p>

  <div class="relative mx-auto my-2 w-full max-w-[560px]">
    <!-- Top outer gap -->
    <div class="flex justify-center pb-2">
      <div class="w-[120px]">
        <MaskedInput
          label="top"
          value={gaps.outer_gap.top}
          mask={positiveLengthMask}
          title="Outer gap — top"
          onChange={(v) => onPatch((g) => (g.outer_gap.top = v))}
        />
      </div>
    </div>

    <!-- Middle row: left · screen · right -->
    <div class="flex items-center gap-3">
      <div class="w-[120px] flex-shrink-0">
        <MaskedInput
          label="left"
          value={gaps.outer_gap.left}
          mask={positiveLengthMask}
          title="Outer gap — left"
          onChange={(v) => onPatch((g) => (g.outer_gap.left = v))}
        />
      </div>

      <!-- Screen frame with two window tiles -->
      <div
        class="flex-1 relative border-2 border-dashed border-[#3a6aa0]/60 rounded-md bg-[#181818] p-3 h-[200px]"
        aria-label="Screen preview"
      >
        <span class="absolute -top-[0.7rem] left-2 px-1 text-[0.7rem] uppercase tracking-wider text-[#3a6aa0] bg-[#181818]">
          screen
        </span>
        <div class="flex h-full gap-4">
          <div class="flex-1 border border-[#444] rounded bg-[#2a2a2a]" aria-hidden="true"></div>
          <div class="flex-1 border border-[#444] rounded bg-[#2a2a2a]" aria-hidden="true"></div>
        </div>
        <!-- Inner gap input centered over the gap between the two tiles -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] z-10">
          <MaskedInput
            label="inner"
            value={gaps.inner_gap}
            mask={positiveLengthMask}
            title="Inner gap (between adjacent windows)"
            onChange={(v) => onPatch((g) => (g.inner_gap = v))}
          />
        </div>
      </div>

      <div class="w-[120px] flex-shrink-0">
        <MaskedInput
          label="right"
          value={gaps.outer_gap.right}
          mask={positiveLengthMask}
          title="Outer gap — right"
          onChange={(v) => onPatch((g) => (g.outer_gap.right = v))}
        />
      </div>
    </div>

    <!-- Bottom outer gap -->
    <div class="flex justify-center pt-2">
      <div class="w-[120px]">
        <MaskedInput
          label="bottom"
          value={gaps.outer_gap.bottom}
          mask={positiveLengthMask}
          title="Outer gap — bottom"
          onChange={(v) => onPatch((g) => (g.outer_gap.bottom = v))}
        />
      </div>
    </div>
  </div>
</section>
