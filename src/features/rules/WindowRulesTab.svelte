<script lang="ts">
  import type {
    WindowRuleConfig,
    WindowMatchConfig,
    MatchOp,
    MatchType,
    WorkspaceConfig,
  } from "$shared/types/config";
  import { MATCH_OPS } from "$shared/types/config";
  import RegexTagInput from "$shared/ui/RegexTagInput.svelte";
  import CommandBuilder from "$shared/ui/CommandBuilder.svelte";
  import Stepper from "$shared/ui/Stepper.svelte";
  import HighlightedInput from "$shared/ui/HighlightedInput.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import { setContext } from "svelte";
  import { startWindowPick, type PickerFocus } from "$shared/tauri";
  import { escapeLiteral, patternToTags, tagsToPattern } from "$shared/utils/regex";
  import { semanticLabel } from "$shared/utils/commands";
  import { Crosshair, Plus, X, MagnifyingGlass, PencilSimple, Check } from "phosphor-svelte";
  import { i18n } from "$shared/i18n/index.svelte";

  interface Props {
    rules: WindowRuleConfig[];
    workspaces: WorkspaceConfig[];
    onPatch: (updater: (r: WindowRuleConfig[]) => void) => void;
  }
  let { rules, workspaces, onPatch }: Props = $props();

  let filter = $state("");
  let q = $derived(filter.trim().toLowerCase());
  setContext("filter:q", () => q);
  function matches(rule: WindowRuleConfig): boolean {
    if (!q) return true;
    const parts: string[] = [...rule.commands];
    // Include semantic labels so "Set Floating" matches "set-floating".
    for (const cmd of rule.commands) {
      const label = semanticLabel(cmd);
      if (label.ok) {
        parts.push(label.primary);
        if (label.secondary) parts.push(label.secondary);
      }
    }
    for (const m of rule.match) {
      for (const k of FIELDS) parts.push(getValue(m, k));
    }
    return parts.join(" \u0001 ").toLowerCase().includes(q);
  }

  type FieldKey = "window_process" | "window_class" | "window_title";
  const FIELDS: FieldKey[] = ["window_process", "window_class", "window_title"];
  const FIELD_LABEL = $derived<Record<FieldKey, string>>({
    window_process: i18n.t.rules.process,
    window_class: i18n.t.rules.class,
    window_title: i18n.t.rules.title,
  });
  const OP_LABEL = $derived<Record<MatchOp, string>>({
    equals: i18n.t.rules.opEquals,
    includes: i18n.t.rules.opIncludes,
    regex: i18n.t.rules.opRegex,
    not_equals: i18n.t.rules.opNotEquals,
    not_regex: i18n.t.rules.opNotRegex,
  });
  const FIELD_PROPERTY_NAME = $derived<Record<FieldKey, string>>({
    window_process: i18n.t.rules.fieldNameProcess,
    window_class: i18n.t.rules.fieldNameClass,
    window_title: i18n.t.rules.fieldNameTitle,
  });
  const FIELD_PLACEHOLDER = $derived<Record<FieldKey, string>>({
    window_process: i18n.t.rules.placeholderProcess,
    window_class: i18n.t.rules.placeholderClass,
    window_title: i18n.t.rules.placeholderTitle,
  });

  function getOp(m: WindowMatchConfig | undefined, key: FieldKey): MatchOp {
    const v = m?.[key];
    if (!v) return "includes";
    if ("equals" in v) return "equals";
    if ("includes" in v) return "includes";
    if ("regex" in v) return "regex";
    if ("not_equals" in v) return "not_equals";
    if ("not_regex" in v) return "not_regex";
    return "includes";
  }

  function getValue(m: WindowMatchConfig | undefined, key: FieldKey): string {
    const v = m?.[key];
    if (!v) return "";
    if ("equals" in v) return v.equals;
    if ("includes" in v) return v.includes;
    if ("regex" in v) return v.regex;
    if ("not_equals" in v) return v.not_equals;
    if ("not_regex" in v) return v.not_regex;
    return "";
  }

  function makeMatch(op: MatchOp, value: string): MatchType {
    switch (op) {
      case "equals":     return { equals: value };
      case "includes":   return { includes: value };
      case "regex":      return { regex: value };
      case "not_equals": return { not_equals: value };
      case "not_regex":  return { not_regex: value };
    }
  }

  // Mutators ────────────────────────────────────────────────────────────────
  function setField(i: number, j: number, key: FieldKey, op: MatchOp, value: string) {
    onPatch((rs) => {
      const m = rs[i].match[j];
      if (!value) {
        delete m[key];
      } else {
        m[key] = makeMatch(op, value);
      }
    });
  }

  function setOp(i: number, j: number, key: FieldKey, op: MatchOp) {
    onPatch((rs) => {
      const m = rs[i].match[j];
      const cur = m[key];
      const value = cur ? Object.values(cur)[0] : "";
      // Always create the key when the op is changed so the user sees the field.
      m[key] = makeMatch(op, value as string);
    });
  }

  function setCommand(i: number, j: number, v: string) {
    onPatch((all) => (all[i].commands[j] = v));
  }
  function addCommand(i: number) {
    onPatch((all) => all[i].commands.push(""));
  }
  function removeCommand(i: number, j: number) {
    onPatch((all) => all[i].commands.splice(j, 1));
  }

  // Edit mode ───────────────────────────────────────────────────────────────
  let editModes = $state(new Set<number>());

  function isEditing(i: number): boolean {
    return editModes.has(i);
  }
  function startEdit(i: number) {
    const next = new Set(editModes);
    next.add(i);
    editModes = next;
  }
  function stopEdit(i: number) {
    const next = new Set(editModes);
    next.delete(i);
    editModes = next;
  }

  // Keep editModes in sync when rules are replaced externally (undo/redo).
  $effect(() => {
    const len = rules.length;
    const outOfBounds = [...editModes].some((idx) => idx >= len);
    if (outOfBounds) {
      editModes = new Set([...editModes].filter((idx) => idx < len));
    }
  });

  function addRule() {
    const nextIdx = rules.length;
    onPatch((rs) => rs.push({ commands: [], match: [{}] }));
    // Auto-open edit mode for the newly created rule.
    const next = new Set(editModes);
    next.add(nextIdx);
    editModes = next;
  }
  function removeRule(i: number) {
    onPatch((rs) => rs.splice(i, 1));
    // Shift all indices above the removed one down by one.
    const next = new Set<number>();
    for (const idx of editModes) {
      if (idx < i) next.add(idx);
      else if (idx > i) next.add(idx - 1);
    }
    editModes = next;
  }
  function addMatch(i: number) {
    onPatch((rs) => rs[i].match.push({}));
  }
  function removeMatch(i: number, j: number) {
    onPatch((rs) => rs[i].match.splice(j, 1));
  }

  // Window picker ──────────────────────────────────────────────────────────
  type PickAction = "replace-single" | "replace-regex" | "append-regex";
  let pickingAt = $state<{ i: number; j: number; key: FieldKey } | null>(null);
  let menuOpenAt = $state<{ i: number; j: number; key: FieldKey } | null>(null);

  const FIELD_FOCUS: Record<FieldKey, PickerFocus> = {
    window_process: "process",
    window_class: "class",
    window_title: "title",
  };

  function pickedValueFor(
    key: FieldKey,
    r: { process: string; class_name: string; title: string },
  ): string {
    if (key === "window_process") return r.process;
    if (key === "window_class") return r.class_name;
    return r.title;
  }

  function isMenuOpen(i: number, j: number, key: FieldKey): boolean {
    return menuOpenAt?.i === i && menuOpenAt?.j === j && menuOpenAt?.key === key;
  }
  function toggleMenu(i: number, j: number, key: FieldKey) {
    menuOpenAt = isMenuOpen(i, j, key) ? null : { i, j, key };
  }
  function closeMenu() {
    menuOpenAt = null;
  }

  async function pickWindow(i: number, j: number, key: FieldKey, action: PickAction) {
    if (pickingAt) return;
    closeMenu();
    pickingAt = { i, j, key };
    try {
      const result = await startWindowPick(FIELD_FOCUS[key]);
      if (!result) return;
      const picked = pickedValueFor(key, result);
      if (!picked) return;

      if (action === "replace-single") {
        // Non-regex op: just set this field's literal value.
        onPatch((rs) => {
          const m = rs[i].match[j];
          const op = getOp(m, key);
          m[key] = makeMatch(op, picked);
        });
        return;
      }

      if (action === "replace-regex") {
        // Regex op: replace pattern with a single escaped literal.
        onPatch((rs) => {
          const m = rs[i].match[j];
          const op = getOp(m, key);
          m[key] = makeMatch(op, escapeLiteral(picked));
        });
        return;
      }

      // append-regex: keep existing tags, append picked literal.
      onPatch((rs) => {
        const m = rs[i].match[j];
        const op = getOp(m, key);
        const cur = getValue(m, key);
        const decoded = patternToTags(cur);
        const tags = decoded.ok ? [...decoded.tags, picked] : [picked];
        m[key] = makeMatch(op, tagsToPattern(tags));
      });
    } finally {
      pickingAt = null;
    }
  }

  $effect(() => {
    if (!menuOpenAt) return;
    const onDocClick = () => closeMenu();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  });
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <div class="sticky top-0 z-10 -mx-4 -mt-4 px-4 py-3 bg-[#181818]/95 backdrop-blur border-b border-[#333] flex items-center gap-2">
    <div class="relative flex-1 min-w-0">
      <MagnifyingGlass size={14} class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
      <input
        type="search"
        placeholder={i18n.t.rules.filterPlaceholder}
        bind:value={filter}
        class="w-full box-border pl-7 pr-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit] focus:border-primary focus:outline-none placeholder:text-[#666]"
      />
    </div>
    {#if filter}
      <button
        type="button"
        class="px-[0.6rem] py-[0.35rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit hover:bg-[#3a3a3a]"
        onclick={() => (filter = "")}
      >{i18n.t.rules.clear}</button>
    {/if}
  </div>
  <p class="m-0 text-[#777] text-[0.8rem] inline-flex items-center gap-1">
    <InfoIcon text="Window rules automatically apply commands to windows matching the specified process, class, or title conditions." />
    Rules apply commands to matching windows automatically.
  </p>

  {#each rules as rule, i (i)}
    {@const visible = matches(rule)}
    {@const editing = isEditing(i)}
    <fieldset
      class="border rounded-md p-4 flex flex-col gap-3 {q && visible ? 'border-[#ffd97a]' : editing ? 'border-[#0289a3]' : 'border-[#333]'}"
      class:hidden={!visible}
    >
      <legend class="px-2 text-[#ccc] w-full flex items-center gap-2">
        <span>{i18n.t.rules.ruleTitle(i + 1)}</span>
        <span class="flex-1 border-t border-[#444]"></span>
        {#if editing}
          <button
            type="button"
            class="inline-flex items-center gap-1 px-[0.5rem] py-[0.15rem] text-[0.75rem] border border-[#0289a3] rounded bg-[#012e37] text-[#0289a3] cursor-pointer hover:bg-[#01404f]"
            onclick={() => stopEdit(i)}
          ><Check size={11} weight="bold" />{i18n.t.rules.done}</button>
        {:else}
          <button
            type="button"
            class="inline-flex items-center gap-1 px-[0.4rem] py-[0.15rem] text-[0.75rem] border border-[#444] rounded bg-[#2a2a2a] text-[#888] cursor-pointer hover:bg-[#3a3a3a] hover:text-inherit hover:border-[#666]"
            onclick={() => startEdit(i)}
          ><PencilSimple size={11} weight="bold" />{i18n.t.rules.edit}</button>
        {/if}
        <button
          type="button"
          class="inline-flex items-center gap-1 px-[0.4rem] py-[0.15rem] text-[0.75rem] border border-[#444] rounded bg-[#2a2a2a] text-[#888] cursor-pointer hover:bg-[#3a3a3a] hover:text-[#f88] hover:border-[#f88]"
          onclick={() => removeRule(i)}
        ><X size={11} weight="bold" />{i18n.t.rules.removeRule}</button>
      </legend>

      {#if editing}
        <!-- ── Edit mode ──────────────────────────────────────────────────── -->
        <div class="flex flex-col gap-[0.4rem]">
          <span class="text-[0.85rem] text-[#888]">{i18n.t.rules.commands}</span>
          {#each rule.commands as c, j (j)}
            <Stepper index={j} total={rule.commands.length}>
              <CommandBuilder
                value={c}
                {workspaces}
                onChange={(v) => setCommand(i, j, v)}
                onRemove={rule.commands.length > 1 ? () => removeCommand(i, j) : undefined}
              />
            </Stepper>
          {/each}
          <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-1.5 px-[0.6rem] py-[0.4rem] text-[0.85rem] border border-dashed border-[#444] rounded bg-[#222] text-[#bbb] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#666] hover:text-inherit"
            onclick={() => addCommand(i)}
          ><Plus size={14} weight="bold" />{i18n.t.rules.addCommand}</button>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-[0.85rem] text-[#888]">{i18n.t.rules.matchConditions}</span>
          {#each rule.match as m, j (j)}
            <div class="border border-dashed border-[#333] rounded p-[0.6rem] flex flex-col gap-[0.6rem]">
              <div class="flex items-center gap-2">
                <span class="text-[0.75rem] uppercase tracking-wide text-[#888]">{i18n.t.rules.conditionTitle(j + 1)}</span>
                <span class="flex-1 border-t border-[#333]"></span>
                {#if rule.match.length > 1}
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-[0.4rem] py-[0.15rem] text-[0.75rem] border border-[#444] rounded bg-[#2a2a2a] text-[#888] cursor-pointer hover:bg-[#3a3a3a] hover:text-[#f88] hover:border-[#f88]"
                    onclick={() => removeMatch(i, j)}
                    title={i18n.t.rules.removeCondition}
                    aria-label={i18n.t.rules.removeCondition}
                  ><X size={11} weight="bold" />{i18n.t.rules.removeCondition}</button>
                {/if}
              </div>
              {#each FIELDS as key (key)}
                {@const op = getOp(m, key)}
                {@const value = getValue(m, key)}
                {@const isPickingThis = pickingAt?.i === i && pickingAt?.j === j && pickingAt?.key === key}
                {@const isRegex = op === "regex" || op === "not_regex"}
                <div class="grid grid-cols-[6rem_8rem_1fr_auto] gap-[0.6rem] items-center">
                  <span class="text-[#aaa] text-[0.85rem]">{FIELD_LABEL[key]}</span>
                  <select
                    class="w-full box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
                    value={op}
                    onchange={(e) =>
                      setOp(i, j, key, (e.currentTarget as HTMLSelectElement).value as MatchOp)}
                  >
                    {#each MATCH_OPS as o (o)}
                      <option value={o}>{OP_LABEL[o]}</option>
                    {/each}
                  </select>
                  <div class="min-w-0">
                    {#if op === "regex" || op === "not_regex"}
                      <RegexTagInput
                        {value}
                        placeholder={FIELD_PLACEHOLDER[key]}
                        onChange={(v) => setField(i, j, key, op, v)}
                      />
                    {:else}
                      <HighlightedInput
                        {value}
                        placeholder={FIELD_PLACEHOLDER[key]}
                        sharedClass="font-[inherit] text-inherit text-[1rem]"
                        onInput={(v) => setField(i, j, key, op, v)}
                      />
                    {/if}
                  </div>
                  <div class="relative">
                    <button
                      type="button"
                      title={isPickingThis
                        ? i18n.t.rules.pickerPicking
                        : isRegex
                          ? i18n.t.rules.pickerRegexHint
                          : i18n.t.rules.pickerSingleHint(FIELD_PROPERTY_NAME[key])}
                      aria-label={i18n.t.rules.pickerAria}
                      aria-haspopup={isRegex ? "menu" : undefined}
                      aria-expanded={isRegex ? isMenuOpen(i, j, key) : undefined}
                      class="inline-flex items-center justify-center p-[0.35rem] border rounded bg-[#2a2a2a] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {isPickingThis ? 'border-[#ffd97a] text-[#ffd97a] animate-pulse' : isMenuOpen(i, j, key) ? 'border-[#0289a3] text-inherit' : 'border-[#444] text-inherit hover:bg-[#3a3a3a]'}"
                      disabled={pickingAt !== null}
                      onclick={(e) => {
                        e.stopPropagation();
                        if (isRegex) {
                          toggleMenu(i, j, key);
                        } else {
                          pickWindow(i, j, key, "replace-single");
                        }
                      }}
                    >
                      <Crosshair size={14} weight="bold" />
                    </button>
                    {#if isRegex && isMenuOpen(i, j, key)}
                      <div
                        role="menu"
                        tabindex="-1"
                        class="absolute right-0 top-full mt-1 z-20 min-w-[16rem] flex flex-col border border-[#444] rounded bg-[#1e1e1e] shadow-lg overflow-hidden"
                        onclick={(e) => e.stopPropagation()}
                        onkeydown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          class="text-left px-[0.7rem] py-[0.45rem] text-[0.85rem] text-inherit hover:bg-[#2a2a2a] cursor-pointer"
                          onclick={() => pickWindow(i, j, key, "replace-regex")}
                        >Replace regex with {FIELD_PROPERTY_NAME[key]}</button>
                        <button
                          type="button"
                          role="menuitem"
                          class="text-left px-[0.7rem] py-[0.45rem] text-[0.85rem] text-inherit hover:bg-[#2a2a2a] cursor-pointer border-t border-[#333]"
                          onclick={() => pickWindow(i, j, key, "append-regex")}
                        >Append {FIELD_PROPERTY_NAME[key]} to list</button>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
              </div>
          {/each}
          <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-1.5 px-[0.6rem] py-[0.4rem] text-[0.85rem] border border-dashed border-[#444] rounded bg-[#222] text-[#bbb] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#666] hover:text-inherit"
            onclick={() => addMatch(i)}
          ><Plus size={14} weight="bold" />{i18n.t.rules.addCondition}</button>
        </div>

      {:else}
        <!-- ── Read mode ───────────────────────────────────────────────────── -->
        <div class="flex flex-col gap-[0.35rem]">
          <span class="text-[0.75rem] uppercase tracking-wide text-[#666]">{i18n.t.rules.commands}</span>
          {#if rule.commands.length === 0}
            <span class="text-[#555] text-[0.85rem] italic">(none)</span>
          {:else}
            <div class="flex flex-wrap gap-1.5">
              {#each rule.commands as cmd (cmd)}
                {@const label = semanticLabel(cmd)}
                {#if label.ok}
                  <span class="inline-flex items-center gap-0 rounded overflow-hidden border border-[#335] text-[0.8rem]">
                    <span class="bg-[#1a2535] text-[#7ab3e0] px-[0.55rem] py-[0.2rem] font-medium">{label.primary}</span>
                    {#if label.secondary}
                      <span class="bg-[#12161d] text-[#ccc] px-[0.5rem] py-[0.2rem] border-l border-[#335]">{label.secondary}</span>
                    {/if}
                  </span>
                {:else}
                  <code class="rounded border border-[#444] bg-[#1e1e1e] text-[#d8a657] px-[0.55rem] py-[0.2rem] text-[0.8rem] font-mono">{label.primary}</code>
                {/if}
              {/each}
            </div>
          {/if}
        </div>

        <div class="flex flex-col gap-[0.35rem]">
          <span class="text-[0.75rem] uppercase tracking-wide text-[#666]">{i18n.t.rules.matchConditions}</span>
          {#each rule.match as m, j (j)}
            {#if j > 0}
              <div class="flex items-center gap-2 my-[0.1rem]">
                <span class="flex-1 border-t border-[#2a2a2a]"></span>
                <span class="text-[0.7rem] uppercase tracking-widest text-[#555]">or</span>
                <span class="flex-1 border-t border-[#2a2a2a]"></span>
              </div>
            {/if}
            {@const setFields = FIELDS.filter((k) => getValue(m, k))}
            {#if setFields.length === 0}
              <span class="text-[#555] text-[0.85rem] italic">{i18n.t.rules.anyWindow}</span>
            {:else}
              <div class="flex flex-wrap gap-x-4 gap-y-[0.25rem]">
                {#each setFields as key (key)}
                  <span class="text-[0.85rem]">
                    <span class="text-[#777]">{FIELD_LABEL[key]}</span>
                    <span class="text-[#555] mx-1">{OP_LABEL[getOp(m, key)]}</span>
                    <span class="text-[#ddd] font-mono text-[0.8rem]">{getValue(m, key)}</span>
                  </span>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </fieldset>
  {/each}
  <button
    type="button"
    class="self-start inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
    onclick={addRule}
  ><Plus size={14} weight="bold" />{i18n.t.rules.addRule}</button>
</section>
