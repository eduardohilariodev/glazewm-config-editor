<script lang="ts">
  import Toggle from "$shared/ui/Toggle.svelte";
  import { settings } from "$shared/store/settings.svelte";
  import { i18n, locales } from "$shared/i18n/index.svelte";
  import type { LocaleId } from "$shared/i18n/index.svelte";
</script>

<section class="flex flex-col gap-2 p-4 min-w-0 max-w-full box-border">
  <h2 class="mt-2 mb-0 text-base text-[#ccc]">{i18n.t.app.language}</h2>
  <select
    class="w-fit px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
    value={i18n.current}
    onchange={(e) => i18n.setLocale((e.currentTarget as HTMLSelectElement).value as LocaleId)}
  >
    {#each Object.entries(locales) as [id, { name }] (id)}
      <option value={id}>{name}</option>
    {/each}
  </select>

  <h2 class="mt-4 mb-0 text-base text-[#ccc]">{i18n.t.settings.editorBehavior}</h2>

  <Toggle
    checked={settings.autoSortTags}
    label={i18n.t.settings.autoSortTags}
    onChange={(v) => (settings.autoSortTags = v)}
  />
  <p class="m-0 mb-3 text-[#888] text-[0.8rem]">{i18n.t.settings.autoSortTagsHint}</p>

  <Toggle
    checked={settings.autoSortRawAlternatives}
    label={i18n.t.settings.autoSortRaw}
    onChange={(v) => (settings.autoSortRawAlternatives = v)}
  />
  <p class="m-0 mb-3 text-[#888] text-[0.8rem]">
    {i18n.t.settings.autoSortRawHintBefore} <code class="bg-[#2a2a2a] px-1 rounded-[3px] font-mono">|</code>{i18n.t.settings.autoSortRawHintAfter}
  </p>
</section>
