<script lang="ts">
  interface Props {
    checked: boolean;
    label?: string;
    onChange: (value: boolean) => void;
  }
  let { checked, label, onChange }: Props = $props();
</script>

<label class="inline-flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    class="w-4 h-4 cursor-pointer"
    {checked}
    onchange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
  />
  {#if label}<span>{label}</span>{/if}
</label>
