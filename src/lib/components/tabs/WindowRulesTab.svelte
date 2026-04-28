<script lang="ts">
  import type {
    WindowRuleConfig,
    WindowMatchConfig,
    MatchOp,
    MatchType,
    WorkspaceConfig,
  } from "$lib/types/config";
  import { MATCH_OPS } from "$lib/types/config";
  import RegexTagInput from "$lib/components/ui/RegexTagInput.svelte";
  import CommandBuilder from "$lib/components/ui/CommandBuilder.svelte";
  import Stepper from "$lib/components/ui/Stepper.svelte";
  import HighlightedInput from "$lib/components/ui/HighlightedInput.svelte";
  import { setContext } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { Crosshair } from "phosphor-svelte";

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
  const FIELD_LABEL: Record<FieldKey, string> = {
    window_process: "Process",
    window_class: "Class",
    window_title: "Title",
  };
  const OP_LABEL: Record<MatchOp, string> = {
    equals: "equals",
    includes: "contains",
    regex: "regex",
    not_equals: "≠ equals",
    not_regex: "≠ regex",
  };

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
  type PickedWindow = {
    process: string;
    class_name: string;
    title: string;
    cancelled: boolean;
  };

  let pickingAt = $state<{ i: number; j: number } | null>(null);

  function applyPicked(m: WindowMatchConfig, key: FieldKey, value: string) {
    if (!value) return;
    const op = getOp(m, key);
    m[key] = makeMatch(op === "regex" || op === "not_regex" ? "equals" : op, value);
  }

  async function pickWindow(i: number, j: number) {
    if (pickingAt) return;
    pickingAt = { i, j };
    const win = getCurrentWindow();
    let unlisten: UnlistenFn | null = null;
    const cleanup = async () => {
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
      try {
        await win.unminimize();
        await win.setFocus();
      } catch {
        // ignore
      }
      pickingAt = null;
    };
    unlisten = await listen<PickedWindow>("window-picked", async ({ payload }) => {
      await cleanup();
      if (payload.cancelled) return;
      onPatch((rs) => {
        const m = rs[i].match[j];
        applyPicked(m, "window_process", payload.process);
        applyPicked(m, "window_class", payload.class_name);
        applyPicked(m, "window_title", payload.title);
      });
    });
    try {
      await win.minimize();
      await invoke("start_window_pick");
    } catch (e) {
      console.error("window picker failed:", e);
      await cleanup();
    }
  }
</script>

<section class="flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <div class="sticky top-0 z-10 -mx-4 -mt-4 px-4 py-3 bg-[#181818]/95 backdrop-blur border-b border-[#333] flex items-center gap-2">
    <input
      type="search"
      placeholder="Filter rules (matches process / class / title / command text)…"
      bind:value={filter}
      class="flex-1 min-w-0 box-border px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit] focus:border-[#3a6aa0] focus:outline-none placeholder:text-[#666]"
    />
    {#if filter}
      <button
        type="button"
        class="px-[0.6rem] py-[0.35rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit hover:bg-[#3a3a3a]"
        onclick={() => (filter = "")}
      >Clear</button>
    {/if}
  </div>

  {#each rules as rule, i (i)}
    {@const visible = matches(rule)}
    <fieldset
      class="border rounded-md p-4 flex flex-col gap-3 {q && visible ? 'border-[#ffd97a]' : 'border-[#333]'}"
      class:hidden={!visible}
    >
      <legend class="px-2 text-[#ccc]">Rule #{i + 1}</legend>
      <div class="flex flex-col gap-[0.4rem]">
        <span class="text-[0.85rem] text-[#888]">Commands</span>
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
          class="self-start px-[0.6rem] py-[0.25rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
          onclick={() => addCommand(i)}
        >+ Add command</button>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-[0.85rem] text-[#888]">Match conditions</span>
        {#each rule.match as m, j (j)}
          <div class="border border-dashed border-[#333] rounded p-[0.6rem] flex flex-col gap-[0.6rem]">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[0.75rem] uppercase tracking-wide text-[#888]">Condition #{j + 1}</span>
              <button
                type="button"
                title="Pick a window with the mouse to fill process, class, and title. Right-click to cancel."
                class="inline-flex items-center gap-[0.4rem] px-[0.6rem] py-[0.3rem] text-[0.85rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pickingAt !== null}
                onclick={() => pickWindow(i, j)}
              >
                <Crosshair size={14} weight="bold" />
                {pickingAt && pickingAt.i === i && pickingAt.j === j ? "Click target window…" : "Pick window"}
              </button>
            </div>
            {#each FIELDS as key (key)}
              {@const op = getOp(m, key)}
              {@const value = getValue(m, key)}
              <div class="grid grid-cols-[6rem_8rem_1fr] gap-[0.6rem] items-start">
                <span class="text-[#aaa] text-[0.85rem] pt-[0.4rem]">{FIELD_LABEL[key]}</span>
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
                      placeholder={key === "window_process"
                        ? "e.g. firefox.exe"
                        : key === "window_class"
                          ? "e.g. Chrome_WidgetWin_1"
                          : "e.g. Picture in Picture"}
                      onChange={(v) => setField(i, j, key, op, v)}
                    />
                  {:else}
                    <HighlightedInput
                      {value}
                      placeholder={key === "window_process"
                        ? "e.g. firefox.exe"
                        : key === "window_class"
                          ? "e.g. Chrome_WidgetWin_1"
                          : "e.g. Picture in Picture"}
                      sharedClass="font-[inherit] text-inherit text-[1rem]"
                      onInput={(v) => setField(i, j, key, op, v)}
                    />
                  {/if}
                </div>
              </div>
            {/each}
            {#if rule.match.length > 1}
              <button
                type="button"
                class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-[#f88] cursor-pointer hover:bg-[#3a3a3a]"
                onclick={() => removeMatch(i, j)}
              >
                Remove condition group
              </button>
            {/if}
          </div>
        {/each}
        <button
          type="button"
          class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
          onclick={() => addMatch(i)}
        >+ Add condition group (OR)</button>
      </div>

      <button
        type="button"
        class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-[#f88] cursor-pointer hover:bg-[#3a3a3a]"
        onclick={() => removeRule(i)}
      >Remove rule</button>
    </fieldset>
  {/each}
  <button
    type="button"
    class="self-start px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
    onclick={addRule}
  >+ Add window rule</button>
</section>
