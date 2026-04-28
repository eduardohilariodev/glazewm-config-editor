<script lang="ts">
  import { validateRegex } from "$shared/tauri";
  import {
    escapeLiteral,
    patternToTags,
    sortTags,
    tagsToPattern,
    sortRawAlternatives,
    formatDecodeFailure,
  } from "$shared/utils/regex";
  import { settings } from "$shared/store/settings.svelte";
  import HighlightedInput from "$shared/ui/HighlightedInput.svelte";
  import { getContext, untrack } from "svelte";
  import { Tag, Asterisk, Warning, X } from "phosphor-svelte";

  const getQ = getContext<() => string>("filter:q");
  let outerQ = $derived(getQ ? getQ() : "");

  interface Props {
    /** Current regex pattern (raw, as it will be saved to YAML). */
    value: string;
    placeholder?: string;
    onChange: (next: string) => void;
  }
  let { value, placeholder = "e.g. firefox.exe", onChange }: Props = $props();

  // ── Mode handling ─────────────────────────────────────────────────────────
  // "tags" mode is preferred when the pattern is a clean alternation of
  // literals; "raw" mode is for power users / patterns we can't round-trip.
  let manualMode = $state<"auto" | "raw" | "tags">("auto");

  let decoded = $derived(patternToTags(value));
  let canBeTags = $derived(decoded.ok);
  let decodeFailureMsg = $derived(decoded.ok ? "" : formatDecodeFailure(decoded));

  let mode = $derived.by<"raw" | "tags">(() => {
    if (manualMode === "raw") return "raw";
    if (manualMode === "tags") return canBeTags ? "tags" : "raw";
    return canBeTags ? "tags" : "raw";
  });

  function selectTags() {
    if (canBeTags) {
      manualMode = "tags";
      return;
    }
    if (
      value &&
      confirm(
        "This pattern can't be split into tags. Convert it to a single literal tag (the meta-characters will be escaped)?",
      )
    ) {
      commitTags([value]);
      manualMode = "tags";
    }
  }

  function selectRaw() {
    manualMode = "raw";
  }

  // ── Validation ────────────────────────────────────────────────────────────
  let error = $state<string>("");
  let validationToken = 0;

  async function revalidate(pattern: string) {
    const myToken = ++validationToken;
    if (pattern === "") {
      error = "";
      return;
    }
    try {
      await validateRegex(pattern);
      if (myToken === validationToken) error = "";
    } catch (e) {
      if (myToken === validationToken) error = String(e);
    }
  }

  $effect(() => {
    revalidate(value);
  });

  // ── Tag-mode editor ───────────────────────────────────────────────────────
  let draft = $state("");
  let filter = $state("");
  let decodedTags = $derived(decoded.ok ? decoded.tags : []);
  let tags = $derived(
    settings.autoSortTags ? sortTags(decodedTags) : decodedTags,
  );
  let visibleTags = $derived(
    filter.trim()
      ? tags.filter((t) => t.toLowerCase().includes(filter.trim().toLowerCase()))
      : tags,
  );

  // ── New-tag highlight ─────────────────────────────────────────────────────
  // Tags added in the last 5s pulse a green→primary background to draw
  // attention (e.g. when added via the window picker). Tracked by literal
  // tag value; an entry is removed by a setTimeout 5s after it was added.
  let recentlyAdded = $state<Set<string>>(new Set());
  let knownTags: Set<string> | null = null;
  function flashTags(values: string[]) {
    if (values.length === 0) return;
    const next = new Set(recentlyAdded);
    for (const v of values) next.add(v);
    recentlyAdded = next;
    setTimeout(() => {
      const after = new Set(recentlyAdded);
      for (const v of values) after.delete(v);
      recentlyAdded = after;
    }, 5000);
  }

  // Detect tags appearing via external mutation (e.g. WindowRulesTab's
  // "Append to list" picker action). Skips the very first pass so tags
  // present on initial load are NOT flashed.
  $effect(() => {
    const current = decodedTags;
    untrack(() => {
      if (knownTags === null) {
        knownTags = new Set(current);
        return;
      }
      const news: string[] = [];
      for (const t of current) {
        if (!knownTags.has(t)) news.push(t);
      }
      if (news.length > 0) flashTags(news);
      knownTags = new Set(current);
    });
  });

  function commitTags(next: string[]) {
    onChange(tagsToPattern(next, { sort: settings.autoSortTags }));
  }

  function addTag() {
    const v = draft.trim();
    if (!v) return;
    commitTags([...tags, v]);
    draft = "";
  }

  function removeTag(t: string) {
    commitTags(tags.filter((x) => x !== t));
  }

  function editTag(oldVal: string, newVal: string) {
    const trimmed = newVal.trim();
    if (!trimmed) {
      removeTag(oldVal);
      return;
    }
    commitTags(tags.map((t) => (t === oldVal ? trimmed : t)));
  }

  // ── Raw editor ────────────────────────────────────────────────────────────
  function rawBlur() {
    if (!settings.autoSortRawAlternatives) return;
    const sorted = sortRawAlternatives(value);
    if (sorted !== value) onChange(sorted);
  }

</script>

<div class="flex flex-col gap-[0.35rem] min-w-0" class:has-error={error}>
  <div class="flex items-center gap-2">
    <div class="inline-flex border border-[#444] rounded overflow-hidden" role="group" aria-label="View mode">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-[0.6rem] py-[0.2rem] border-0 border-r border-[#444] last:border-r-0 cursor-pointer text-[0.8rem] hover:bg-[#3a3a3a] {mode === 'tags' ? 'bg-[#015f74] text-white' : 'bg-[#2a2a2a] text-[#ccc]'}"
        aria-pressed={mode === "tags"}
        onmousedown={(e) => { e.preventDefault(); selectTags(); }}
        title={canBeTags ? "Edit as tag list" : "Convert pattern to a single literal tag"}
      ><Tag size={12} weight="bold" />Tags</button>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-[0.6rem] py-[0.2rem] border-0 cursor-pointer text-[0.8rem] hover:bg-[#3a3a3a] {mode === 'raw' ? 'bg-[#015f74] text-white' : 'bg-[#2a2a2a] text-[#ccc]'}"
        aria-pressed={mode === "raw"}
        onmousedown={(e) => { e.preventDefault(); selectRaw(); }}
        title="Edit as raw regex"
      ><Asterisk size={12} weight="bold" />Regex</button>
    </div>
    {#if !canBeTags}
      <span
        class="inline-flex items-center gap-1 text-[#d8a657] text-[0.8rem] cursor-help border-b border-dotted border-[#d8a657]"
        title={decodeFailureMsg}
      >
        <Warning size={12} weight="bold" /> can't be tagged — hover for details
      </span>
    {/if}
    {#if mode === "tags" && tags.length > 0}
      <input
        class="filter ml-auto px-2 py-[0.2rem] border border-[#444] rounded bg-[#1e1e1e] text-[#e8e8e8] font-[inherit] text-[0.8rem] min-w-[8rem] max-w-[14rem] outline-none focus:border-[#0289a3] transition-colors duration-[120ms] placeholder:text-[#777]"
        type="search"
        bind:value={filter}
        placeholder="Filter tags…"
        aria-label="Filter tags"
      />
    {/if}
  </div>

  {#if mode === "tags"}
    <div class="chips flex flex-wrap gap-[0.35rem] items-center border rounded p-[0.3rem] bg-[#1e1e1e] min-h-[2rem] {error ? 'border-[#d83a3a]' : 'border-[#444]'}">
      {#each visibleTags as t (t)}
        {@const tagMatches = !!outerQ && t.toLowerCase().includes(outerQ)}
        {@const isFlash = recentlyAdded.has(t)}
        <span class="inline-flex items-center gap-1 px-[0.35rem] py-[0.1rem] rounded-[3px] bg-[#015f74] text-[#e8f0ff] font-mono text-[0.85rem] {tagMatches ? 'ring-1 ring-[#ffd97a]' : ''} {isFlash ? 'tag-flash' : ''}">
          <HighlightedInput
            chip
            sharedClass="font-mono text-[0.85rem] min-w-[4ch]"
            mirrorBg="#015f74"
            value={t}
            size={Math.max(t.length, 4)}
            onChange={(v) => editTag(t, v)}
          />
          <button
            type="button"
            class="inline-flex items-center justify-center border-0 bg-transparent text-inherit cursor-pointer p-0 leading-none hover:text-white"
            aria-label="Remove"
            onclick={() => removeTag(t)}
          ><X size={11} weight="bold" /></button>
        </span>
      {/each}
      {#if filter.trim() && visibleTags.length === 0}
        <span class="text-[#777] text-[0.85rem] px-[0.4rem] py-[0.2rem]">No tags match "{filter}"</span>
      {/if}
      <input
        class="flex-1 min-w-[8rem] px-[0.4rem] py-[0.2rem] border-0 bg-transparent text-inherit font-[inherit] focus:outline-none"
        type="text"
        bind:value={draft}
        {placeholder}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
      />
    </div>
    <p class="m-0 text-[#777] text-xs">
      {#if filter.trim()}
        Showing {visibleTags.length} of {tags.length} tags.
      {:else if settings.autoSortTags}
        Spaces, dots and other meta characters are escaped automatically. Tags
        are sorted alphabetically and de-duplicated.
      {:else}
        Spaces, dots and other meta characters are escaped automatically. Tags
        are de-duplicated (sorting disabled in Settings).
      {/if}
    </p>
  {:else}
    <HighlightedInput
      sharedClass="font-mono overflow-x-auto {error ? 'border-[#d83a3a]' : 'border-[#444]'}"
      {value}
      {placeholder}
      onInput={(v) => onChange(v)}
      onBlur={rawBlur}
      spellcheck={false}
    />
  {/if}

  {#if error}
    <p class="m-0 inline-flex items-center gap-1 text-[#f88] text-[0.8rem] font-mono"><Warning size={12} weight="bold" /> {error}</p>
  {/if}
</div>

<style>
  /* :-webkit-autofill has no Tailwind utility — keep inline */
  .filter:-webkit-autofill {
    -webkit-text-fill-color: #e8e8e8;
    -webkit-box-shadow: 0 0 0 1000px #1e1e1e inset;
    caret-color: #e8e8e8;
  }
</style>
