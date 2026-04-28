<script lang="ts">
  import type { WindowEffectsConfig, WindowEffectTarget } from "$shared/types/config";
  import Toggle from "$shared/ui/Toggle.svelte";
  import ColorPicker from "$shared/ui/ColorPicker.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { settings } from "$shared/store/settings.svelte";

  interface Props {
    effects: WindowEffectsConfig;
    onPatch: (updater: (e: WindowEffectsConfig) => void) => void;
  }
  let { effects, onPatch }: Props = $props();
</script>

{#snippet targetSection(label: string, target: WindowEffectTarget, key: "focused_window" | "other_windows")}
  <fieldset class="border border-[#333] rounded-md p-4 flex flex-col gap-3">
    <legend class="px-2 text-[#ccc]">{label}</legend>
    <div class="grid grid-cols-2 gap-4 items-end">
      <div class="flex items-center gap-1.5">
        <Toggle
          checked={target.border.enabled}
          label={i18n.t.effects.borderEnabled}
          onChange={(v) => onPatch((e) => (e[key].border.enabled = v))}
        />
        <InfoIcon text="Draws a colored border around the window frame. Only supported on Windows 11." />
      </div>
      <ColorPicker
        label={i18n.t.effects.borderColor}
        value={target.border.color}
        onChange={(v) => onPatch((e) => (e[key].border.color = v))}
      />
    </div>
    <div class="flex items-center gap-1.5">
      <Toggle
        checked={target.hide_title_bar.enabled}
        label={i18n.t.effects.hideTitleBar}
        onChange={(v) => onPatch((e) => (e[key].hide_title_bar.enabled = v))}
      />
      <InfoIcon text="Removes the native title bar from the window. May cause rendering issues in some apps." />
    </div>
    <div class="grid grid-cols-2 gap-4 items-end">
      <div class="flex items-center gap-1.5">
        <Toggle
          checked={target.corner_style.enabled}
          label={i18n.t.effects.cornerStyleEnabled}
          onChange={(v) => onPatch((e) => (e[key].corner_style.enabled = v))}
        />
        <InfoIcon text="Rounds or squares the corners of the window frame. Only supported on Windows 11." />
      </div>
      <label class="flex flex-col gap-1">
        <span class="text-[0.85rem] text-[#888]">{i18n.t.effects.cornerStyle}</span>
        <select
          class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
          value={target.corner_style.style}
          onchange={(ev) =>
            onPatch(
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

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  {@render targetSection(i18n.t.effects.focusedWindow, effects.focused_window, "focused_window")}
  {@render targetSection(i18n.t.effects.otherWindows, effects.other_windows, "other_windows")}
</section>
