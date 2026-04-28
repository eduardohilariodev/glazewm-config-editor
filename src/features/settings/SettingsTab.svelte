<script lang="ts">
  import Toggle from "$shared/ui/Toggle.svelte";
  import { settings } from "$shared/store/settings.svelte";
</script>

<section class="flex flex-col gap-2 p-4 min-w-0 max-w-full box-border">
  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Editor behavior</h2>

  <Toggle
    checked={settings.autoSortTags}
    label="Auto-sort tags alphabetically"
    onChange={(v) => (settings.autoSortTags = v)}
  />
  <p class="m-0 mb-3 text-[#888] text-[0.8rem]">
    When enabled, tag chips and the saved alternation are kept sorted A→Z
    case-insensitively. Disable to preserve the order you typed.
  </p>

  <Toggle
    checked={settings.autoSortRawAlternatives}
    label="Auto-sort raw regex alternatives"
    onChange={(v) => (settings.autoSortRawAlternatives = v)}
  />
  <p class="m-0 mb-3 text-[#888] text-[0.8rem]">
    When enabled, top-level <code class="bg-[#2a2a2a] px-1 rounded-[3px] font-mono">|</code>-separated alternatives in raw regex
    mode are sorted on blur. Order doesn't affect matching in Rust's regex
    engine, so this is purely cosmetic.
  </p>
</section>
