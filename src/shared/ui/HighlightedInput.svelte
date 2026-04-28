<script lang="ts">
  /**
   * Text input that visually highlights occurrences of a filter query
   * inside its current value. Uses a mirror <div> behind a transparent
   * <input>: caret/selection still come from the real input, but the
   * rendered text comes from the mirror, which can contain <mark>s.
   *
   * The query is read from Svelte context key "filter:q" (a getter so it
   * stays reactive). When the query is empty the mirror is hidden and the
   * input renders normally.
   */
  import { getContext } from "svelte";

  interface Props {
    value: string;
    placeholder?: string;
    onInput?: (v: string) => void;
    onChange?: (v: string) => void;
    onBlur?: (e: FocusEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    /** Extra classes applied to BOTH the mirror and the input.
     *  Use this for shared font/padding/border-radius/text-size. */
    sharedClass?: string;
    /** Background colour for the mirror. Defaults to the panel bg. */
    mirrorBg?: string;
    /** When true, no border/padding/bg is applied — for chip-style fields. */
    chip?: boolean;
    type?: "text" | "search";
    spellcheck?: boolean;
    /** Optional size attribute for inline (chip) inputs. */
    size?: number;
    title?: string;
    ariaLabel?: string;
  }

  let {
    value,
    placeholder = "",
    onInput,
    onChange,
    onBlur,
    onKeyDown,
    sharedClass = "",
    mirrorBg = "#1e1e1e",
    chip = false,
    type = "text",
    spellcheck = false,
    size,
    title,
    ariaLabel,
  }: Props = $props();

  const getQ = getContext<() => string>("filter:q");
  let q = $derived(getQ ? getQ() : "");
  let active = $derived(!!q && value.toLowerCase().includes(q));

  let inputEl: HTMLInputElement | undefined = $state();
  let mirrorEl: HTMLDivElement | undefined = $state();

  function syncScroll() {
    if (mirrorEl && inputEl) mirrorEl.scrollLeft = inputEl.scrollLeft;
  }

  function segments(text: string, query: string): Array<{ t: string; mark: boolean }> {
    if (!query) return [{ t: text, mark: false }];
    const out: Array<{ t: string; mark: boolean }> = [];
    const lower = text.toLowerCase();
    let i = 0;
    while (i < text.length) {
      const idx = lower.indexOf(query, i);
      if (idx === -1) {
        out.push({ t: text.slice(i), mark: false });
        break;
      }
      if (idx > i) out.push({ t: text.slice(i, idx), mark: false });
      out.push({ t: text.slice(idx, idx + query.length), mark: true });
      i = idx + query.length;
    }
    return out;
  }

  let segs = $derived(segments(value, q));

  // Base classes: chip vs full input. `chip` comes from $props(), so we
  // must use $derived (not const) to react to changes.
  let baseShared = $derived(
    chip
      ? "box-border bg-transparent border-0 p-0 font-[inherit] text-[inherit]"
      : "box-border w-full px-[0.6rem] py-[0.4rem] border rounded",
  );
</script>

<div class="relative {chip ? 'inline-block' : 'w-full'} min-w-0">
  {#if active}
    <div
      bind:this={mirrorEl}
      aria-hidden="true"
      class="{baseShared} {sharedClass} absolute inset-0 pointer-events-none whitespace-pre overflow-hidden border-transparent text-[#e8e8e8]"
      style:background={chip ? mirrorBg : mirrorBg}
    >
      {#each segs as s, i (i)}{#if s.mark}<mark
            class="bg-[#ffd97a] text-black rounded-[2px] px-[1px]">{s.t}</mark
          >{:else}<span>{s.t}</span>{/if}{/each}
    </div>
  {/if}
  <input
    bind:this={inputEl}
    {type}
    {value}
    {placeholder}
    {size}
    {title}
    aria-label={ariaLabel}
    spellcheck={spellcheck ? "true" : "false"}
    class="relative {baseShared} {sharedClass} {chip
      ? ''
      : active
        ? 'bg-transparent border-[#444]'
        : 'bg-[#1e1e1e] border-[#444]'} {active
      ? 'text-transparent caret-[#e8e8e8]'
      : 'text-inherit'}"
    oninput={(e) => {
      onInput?.((e.currentTarget as HTMLInputElement).value);
      syncScroll();
    }}
    onchange={(e) => onChange?.((e.currentTarget as HTMLInputElement).value)}
    onblur={onBlur}
    onkeydown={onKeyDown}
    onscroll={syncScroll}
  />
</div>

<style>
  /* Selection is still visible even with text-transparent. */
  input::selection { color: #fff; background: #015f74; }
</style>
