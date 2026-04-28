<script lang="ts">
  interface Props {
    value: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "number";
    onChange: (value: string) => void;
  }
  let { value, label, placeholder, type = "text", onChange }: Props = $props();
</script>

<label class="flex flex-col gap-1">
  {#if label}<span class="text-[0.85rem] text-[#888]">{label}</span>{/if}
  <input
    {type}
    {value}
    {placeholder}
    class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
    oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
  />
</label>
