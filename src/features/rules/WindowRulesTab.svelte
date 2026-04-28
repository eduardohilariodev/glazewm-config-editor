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
  import { Crosshair, Plus, X } from "phosphor-svelte";
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

  function addRule() {
    onPatch((rs) => rs.push({ commands: [], match: [{}] }));
  }
  function removeRule(i: number) {
    onPatch((rs) => rs.splice(i, 1));
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
    <input
      type="search"
      placeholder={i18n.t.rules.filterPlaceholder}
      bind:value={filter}
      class="flex-1 min-w-0 box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit] focus:border-[#0289a3] focus:outline-none placeholder:text-[#666]"
    />
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
    <fieldset
      class="border rounded-md p-4 flex flex-col gap-3 {q && visible ? 'border-[#ffd97a]' : 'border-[#333]'}"
      class:hidden={!visible}
    >
      <legend class="px-2 text-[#ccc] w-full flex items-center">
        <span>{i18n.t.rules.ruleTitle(i + 1)}</span>
        <button
          type="button"
          class="ml-auto inline-flex items-center gap-1 px-[0.4rem] py-[0.15rem] text-[0.75rem] border border-[#444] rounded bg-[#2a2a2a] text-[#f88] cursor-pointer hover:bg-[#3a3a3a]"
          onclick={() => removeRule(i)}
        ><X size={11} weight="bold" />{i18n.t.rules.removeRule}</button>
      </legend>
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
            <span class="text-[0.75rem] uppercase tracking-wide text-[#888]">{i18n.t.rules.conditionTitle(j + 1)}</span>
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
            {#if rule.match.length > 1}
              <button
                type="button"
                class="self-end inline-flex items-center justify-center p-[0.35rem] border border-[#444] rounded bg-[#2a2a2a] text-[#f88] cursor-pointer hover:bg-[#3a3a3a] hover:border-[#f88]"
                onclick={() => removeMatch(i, j)}
                title={i18n.t.rules.removeCondition}
                aria-label={i18n.t.rules.removeCondition}
              ><X size={14} weight="bold" /></button>
            {/if}
          </div>
        {/each}
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 px-[0.6rem] py-[0.4rem] text-[0.85rem] border border-dashed border-[#444] rounded bg-[#222] text-[#bbb] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#666] hover:text-inherit"
          onclick={() => addMatch(i)}
        ><Plus size={14} weight="bold" />{i18n.t.rules.addCondition}</button>
      </div>
    </fieldset>
  {/each}
  <button
    type="button"
    class="self-start inline-flex items-center gap-1.5 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
    onclick={addRule}
  ><Plus size={14} weight="bold" />{i18n.t.rules.addRule}</button>
</section>
