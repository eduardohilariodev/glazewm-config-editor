<script lang="ts">
  import { CaretUp, CaretDown } from "phosphor-svelte";

  type Unit = "px" | "%";

  interface Props {
    value: string;
    label?: string;
    title?: string;
    onChange: (value: string) => void;
  }
  let { value, label, title, onChange }: Props = $props();

  const parsed = $derived(parseLength(value));

  function parseLength(v: string): { num: string; unit: Unit } {
    const m = v.match(/^(\d*\.?\d*)(px|%)?$/);
    return { num: m?.[1] ?? "", unit: (m?.[2] ?? "px") as Unit };
  }

  function filterNum(raw: string): string {
    let hasDot = false;
    let out = "";
    for (const ch of raw) {
      if (ch === "." && !hasDot) { hasDot = true; out += ch; }
      else if (ch >= "0" && ch <= "9") out += ch;
    }
    return out;
  }

  function emit(num: string, unit: string) {
    onChange(num ? `${num}${unit}` : "");
  }

  function step(dir: 1 | -1, large = false) {
    const delta = large ? 10 : 1;
    const cur = parseFloat(parsed.num) || 0;
    const next = Math.max(0, cur + dir * delta);
    // Preserve up to 2 decimal places, strip trailing zeros
    emit(Number(next.toFixed(2)).toString(), parsed.unit);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "ArrowUp") { e.preventDefault(); step(1, e.shiftKey); }
    else if (e.key === "ArrowDown") { e.preventDefault(); step(-1, e.shiftKey); }
  }
</script>

<div class="flex flex-col gap-1" {title}>
  {#if label}<span class="text-[0.85rem] text-[#888]">{label}</span>{/if}
  <div class="flex">
    <input
      type="text"
      value={parsed.num}
      placeholder="0"
      class="min-w-0 flex-1 px-[0.6rem] py-[0.4rem] border border-r-0 rounded-l bg-[#1e1e1e] text-inherit font-mono border-[#444] focus:outline-none focus:border-primary focus:z-10 focus:relative"
      oninput={(e) => {
        const el = e.currentTarget as HTMLInputElement;
        const filtered = filterNum(el.value);
        if (filtered !== el.value) el.value = filtered;
        emit(filtered, parsed.unit);
      }}
      onkeydown={handleKey}
      spellcheck="false"
    />
    <div class="flex flex-col shrink-0 border-t border-b border-[#444] bg-[#252525]">
      <button
        type="button"
        tabindex="-1"
        class="flex flex-1 items-center justify-center px-[0.3rem] text-[#888] hover:bg-[#3a3a3a] hover:text-inherit cursor-pointer"
        onclick={(e) => step(1, e.shiftKey)}
        title="Increment (+1, Shift +10)"
        aria-label="Increment"
      ><CaretUp size={8} weight="bold" /></button>
      <button
        type="button"
        tabindex="-1"
        class="flex flex-1 items-center justify-center px-[0.3rem] border-t border-[#3a3a3a] text-[#888] hover:bg-[#3a3a3a] hover:text-inherit cursor-pointer"
        onclick={(e) => step(-1, e.shiftKey)}
        title="Decrement (−1, Shift −10)"
        aria-label="Decrement"
      ><CaretDown size={8} weight="bold" /></button>
    </div>
    <select
      value={parsed.unit}
      class="shrink-0 px-[0.35rem] py-[0.4rem] border border-[#444] rounded-r bg-[#2a2a2a] text-inherit font-[inherit] cursor-pointer focus:outline-none focus:border-primary"
      onchange={(e) => emit(parsed.num, (e.currentTarget as HTMLSelectElement).value)}
    >
      <option value="px">px</option>
      <option value="%">%</option>
    </select>
  </div>
</div>
