<script lang="ts">
  import type { WindowEffectsConfig, WindowEffectTarget } from "$lib/types/config";
  import Toggle from "$lib/components/ui/Toggle.svelte";
  import ColorPicker from "$lib/components/ui/ColorPicker.svelte";

  interface Props {
    effects: WindowEffectsConfig;
    onPatch: (updater: (e: WindowEffectsConfig) => void) => void;
  }
  let { effects, onPatch }: Props = $props();

  function renderTarget(
    label: string,
    target: WindowEffectTarget,
    select: (e: WindowEffectsConfig) => WindowEffectTarget
  ) {
    return { label, target, select };
  }
</script>

{#snippet targetSection(label: string, target: WindowEffectTarget, key: "focused_window" | "other_windows")}
  <fieldset class="border border-[#333] rounded-md p-4 flex flex-col gap-3">
    <legend class="px-2 text-[#ccc]">{label}</legend>
    <div class="grid grid-cols-2 gap-4 items-end">
      <Toggle
        checked={target.border.enabled}
        label="Border enabled"
        onChange={(v) => onPatch((e) => (e[key].border.enabled = v))}
      />
      <ColorPicker
        label="Border color"
        value={target.border.color}
        onChange={(v) => onPatch((e) => (e[key].border.color = v))}
      />
    </div>
    <Toggle
      checked={target.hide_title_bar.enabled}
      label="Hide title bar"
      onChange={(v) => onPatch((e) => (e[key].hide_title_bar.enabled = v))}
    />
    <div class="grid grid-cols-2 gap-4 items-end">
      <Toggle
        checked={target.corner_style.enabled}
        label="Corner style enabled"
        onChange={(v) => onPatch((e) => (e[key].corner_style.enabled = v))}
      />
      <label class="flex flex-col gap-1">
        <span class="text-[0.85rem] text-[#888]">Corner style</span>
        <select
          class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
          value={target.corner_style.style}
          onchange={(ev) =>
            onPatch(
              (e) =>
                (e[key].corner_style.style = (ev.currentTarget as HTMLSelectElement).value)
            )}
        >
          <option value="square">square</option>
          <option value="rounded">rounded</option>
          <option value="small_rounded">small_rounded</option>
        </select>
      </label>
    </div>
  </fieldset>
{/snippet}

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  {@render targetSection("Focused window", effects.focused_window, "focused_window")}
  {@render targetSection("Other windows", effects.other_windows, "other_windows")}
</section>
