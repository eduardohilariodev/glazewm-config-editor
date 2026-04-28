<script lang="ts">
  interface Props {
    checked: boolean;
    label?: string;
    title?: string;
    onChange: (value: boolean) => void;
  }
  let { checked, label, title, onChange }: Props = $props();
</script>

<label class="inline-flex items-center gap-2 cursor-pointer select-none" {title}>
  {#if label}<span class="text-[0.85rem] text-[#aaa]">{label}</span>{/if}
  <div class="relative shrink-0">
    <input
      type="checkbox"
      class="sr-only peer"
      {checked}
      onchange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
    />
    <div class="w-8 h-4 rounded-full bg-[#444] peer-checked:bg-primary transition-colors"></div>
    <div class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
  </div>
</label>
