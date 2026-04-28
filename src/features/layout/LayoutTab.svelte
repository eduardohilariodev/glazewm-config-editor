<script lang="ts">
  import type { GapsConfig, WindowEffectsConfig, WindowEffectTarget } from "$shared/types/config";
  import Toggle from "$shared/ui/Toggle.svelte";
  import GapInput from "$shared/ui/GapInput.svelte";
  import ColorPicker from "$shared/ui/ColorPicker.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { settings } from "$shared/store/settings.svelte";

  interface Props {
    gaps: GapsConfig;
    effects: WindowEffectsConfig;
    onPatchGaps: (updater: (g: GapsConfig) => void) => void;
    onPatchEffects: (updater: (e: WindowEffectsConfig) => void) => void;
  }
  let { gaps, effects, onPatchGaps, onPatchEffects }: Props = $props();
</script>

{#snippet targetSection(label: string, target: WindowEffectTarget, key: "focused_window" | "other_windows")}
  <fieldset class="border border-[#333] rounded-md p-4 flex flex-col gap-3">
    <legend class="px-2 text-[#ccc]">{label}</legend>
    <div class="grid grid-cols-2 gap-4 items-end">
      <div class="flex items-center gap-1.5">
        <Toggle
          checked={target.border.enabled}
          label={i18n.t.effects.borderEnabled}
          onChange={(v) => onPatchEffects((e) => (e[key].border.enabled = v))}
        />
        <InfoIcon text="Draws a colored border around the window frame. Only supported on Windows 11." />
      </div>
      <ColorPicker
        label={i18n.t.effects.borderColor}
        value={target.border.color}
        onChange={(v) => onPatchEffects((e) => (e[key].border.color = v))}
      />
    </div>
    <div class="flex items-center gap-1.5">
      <Toggle
        checked={target.hide_title_bar.enabled}
        label={i18n.t.effects.hideTitleBar}
        onChange={(v) => onPatchEffects((e) => (e[key].hide_title_bar.enabled = v))}
      />
      <InfoIcon text="Removes the native title bar from the window. May cause rendering issues in some apps." />
    </div>
    <div class="grid grid-cols-2 gap-4 items-end">
      <div class="flex items-center gap-1.5">
        <Toggle
          checked={target.corner_style.enabled}
          label={i18n.t.effects.cornerStyleEnabled}
          onChange={(v) => onPatchEffects((e) => (e[key].corner_style.enabled = v))}
        />
        <InfoIcon text="Rounds or squares the corners of the window frame. Only supported on Windows 11." />
      </div>
      <label class="flex flex-col gap-1">
        <span class="text-[0.85rem] text-[#888]">{i18n.t.effects.cornerStyle}</span>
        <select
          class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
          value={target.corner_style.style}
          onchange={(ev) =>
            onPatchEffects(
              (e) =>
                (e[key].corner_style.style = (ev.currentTarget as HTMLSelectElement).value)
            )}
        >
          <option value="square">{settings.advancedMode ? 'square' : 'Square'}</option>
          <option value="rounded">{settings.advancedMode ? 'rounded' : 'Rounded'}</option>
          <option value="small_rounded">{settings.advancedMode ? 'small_rounded' : 'Small Rounded'}</option>
        </select>
      </label>
    </div>
  </fieldset>
{/snippet}

<div class="min-w-0 max-w-full box-border">
  <!-- gaps section -->
  <section class="flex flex-col gap-4 p-4">
    <h2 class="m-0 text-base font-semibold text-[#ccc] flex items-center gap-1.5">
      {i18n.t.tabs.gaps}
      <InfoIcon text="Gap between adjacent windows (inner) and between windows and screen edges (outer)." />
    </h2>

    <div class="flex items-center gap-1.5">
      <Toggle
        checked={gaps.scale_with_dpi}
        label={i18n.t.gaps.scaleWithDpi}
        onChange={(v) => onPatchGaps((g) => (g.scale_with_dpi = v))}
      />
      <InfoIcon text="Scales all gap values proportionally based on the monitor's DPI setting." />
    </div>

    <div class="relative mx-auto my-2 w-full max-w-[560px]">
      <div class="flex justify-center pb-2">
        <div class="w-[120px]">
          <GapInput
            label={i18n.t.gaps.top}
            value={gaps.outer_gap.top}
            title={i18n.t.gaps.outerTopTitle}
            onChange={(v) => onPatchGaps((g) => (g.outer_gap.top = v))}
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="w-[120px] flex-shrink-0">
          <GapInput
            label={i18n.t.gaps.left}
            value={gaps.outer_gap.left}
            title={i18n.t.gaps.outerLeftTitle}
            onChange={(v) => onPatchGaps((g) => (g.outer_gap.left = v))}
          />
        </div>

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
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] z-10">
            <GapInput
              label={i18n.t.gaps.inner}
              value={gaps.inner_gap}
              title={i18n.t.gaps.innerTitle}
              onChange={(v) => onPatchGaps((g) => (g.inner_gap = v))}
            />
          </div>
        </div>

        <div class="w-[120px] flex-shrink-0">
          <GapInput
            label={i18n.t.gaps.right}
            value={gaps.outer_gap.right}
            title={i18n.t.gaps.outerRightTitle}
            onChange={(v) => onPatchGaps((g) => (g.outer_gap.right = v))}
          />
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <div class="w-[120px]">
          <GapInput
            label={i18n.t.gaps.bottom}
            value={gaps.outer_gap.bottom}
            title={i18n.t.gaps.outerBottomTitle}
            onChange={(v) => onPatchGaps((g) => (g.outer_gap.bottom = v))}
          />
        </div>
      </div>
    </div>
  </section>

  <hr class="border-[#2a2a2a] mx-4" />

  <!-- window_effects section -->
  <section class="flex flex-col gap-4 p-4">
    <h2 class="m-0 text-base font-semibold text-[#ccc]">{i18n.t.tabs.effects}</h2>
    {@render targetSection(i18n.t.effects.focusedWindow, effects.focused_window, "focused_window")}
    {@render targetSection(i18n.t.effects.otherWindows, effects.other_windows, "other_windows")}
  </section>
</div>
