<script lang="ts">
  import type { Mask } from "$shared/utils/masks";
  import { applyMask, isMaskValid } from "$shared/utils/masks";
  import { Warning } from "phosphor-svelte";

  interface Props {
    value: string;
    mask: Mask;
    label?: string;
    placeholder?: string;
    title?: string;
    onChange: (value: string) => void;
  }
  let { value, mask, label, placeholder, title, onChange }: Props = $props();

  let valid = $derived(isMaskValid(value, mask));

  function handleInput(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const raw = el.value;
    const filtered = applyMask(raw, mask);
    if (filtered !== raw) {
      // Restore filtered value into the DOM input so the user sees disallowed
      // characters being rejected immediately.
      el.value = filtered;
    }
    onChange(filtered);
  }
</script>

<label class="flex flex-col gap-1">
  {#if label}<span class="text-[0.85rem] text-[#888]">{label}</span>{/if}
  <input
    type="text"
    {value}
    placeholder={placeholder ?? mask.example}
    title={title ?? (valid ? mask.hint : `Expected: ${mask.hint}`)}
    class="px-[0.6rem] py-[0.4rem] border rounded bg-[#1e1e1e] text-inherit font-mono {valid ? 'border-[#444]' : 'border-[#d83a3a]'}"
    oninput={handleInput}
    spellcheck="false"
  />
  {#if !valid}
    <span class="inline-flex items-center gap-1 text-[#f88] text-xs font-mono"><Warning size={11} weight="bold" /> Expected: {mask.hint}</span>
  {/if}
</label>
