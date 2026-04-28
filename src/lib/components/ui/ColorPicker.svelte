<script lang="ts">
  import { applyMask, colorMask, isMaskValid } from "$lib/utils/masks";

  interface Props {
    value: string;
    label?: string;
    onChange: (value: string) => void;
  }
  let { value, label, onChange }: Props = $props();

  let valid = $derived(isMaskValid(value, colorMask));

  function onText(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    let v = applyMask(el.value, colorMask);
    // Auto-prefix `#` if user typed hex chars only
    if (v && !v.startsWith("#")) v = "#" + v.replace(/#/g, "");
    // Trim to max 9 chars (#rrggbbaa)
    if (v.length > 9) v = v.slice(0, 9);
    if (v !== el.value) el.value = v;
    onChange(v);
  }
</script>

<label class="flex flex-col gap-1">
  {#if label}<span class="text-[0.85rem] text-[#888]">{label}</span>{/if}
  <div class="flex gap-2 items-center">
    <input
      type="color"
      class="w-10 h-8 border border-[#444] bg-[#1e1e1e] cursor-pointer"
      value={valid && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
      oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
    />
    <input
      type="text"
      {value}
      placeholder="e.g. #1e1e1eff"
      title={valid ? colorMask.hint : `Expected: ${colorMask.hint}`}
      class="flex-1 px-[0.6rem] py-[0.4rem] border rounded bg-[#1e1e1e] text-inherit font-mono {valid ? 'border-[#444]' : 'border-[#d83a3a]'}"
      oninput={onText}
      spellcheck="false"
    />
  </div>
</label>
