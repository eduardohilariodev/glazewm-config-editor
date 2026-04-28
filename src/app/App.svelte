<script lang="ts">
  import { store } from "$shared/store/config.svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { emptyConfig } from "$shared/types/config";
  import { parseConfig, serializeConfig } from "$shared/yaml";
  import {
    openConfigDialog,
    saveConfigDialog,
    readConfig,
    writeConfig,
    defaultConfigPath,
    pathExists,
    reloadGlazeWM,
    setWindowTitle,
    getMtime,
  } from "$shared/tauri";
  import TabBar from "$shared/ui/TabBar.svelte";
  import KbdSequence from "$shared/ui/KbdSequence.svelte";
  import GeneralTab from "$features/general";
  import GapsTab from "$features/gaps";
  import WindowEffectsTab from "$features/effects";
  import WorkspacesTab from "$features/workspaces";
  import KeybindingsTab from "$features/keybindings";
  import WindowRulesTab from "$features/rules";
  import SettingsTab from "$features/settings";
  import {
    Gear,
    FrameCorners,
    Palette,
    SquaresFour,
    Keyboard,
    Funnel,
    SlidersHorizontal,
    ArrowUUpLeft,
    ArrowUUpRight,
    ClockCounterClockwise,
    FolderOpen,
    FloppyDisk,
    FloppyDiskBack,
    ArrowsClockwise,
    Warning,
    Circle,
  } from "phosphor-svelte";

  const tabs = $derived([
    { id: "general", label: i18n.t.tabs.general, icon: Gear },
    { id: "gaps", label: i18n.t.tabs.gaps, icon: FrameCorners },
    { id: "effects", label: i18n.t.tabs.effects, icon: Palette },
    { id: "workspaces", label: i18n.t.tabs.workspaces, icon: SquaresFour },
    { id: "keybindings", label: i18n.t.tabs.keybindings, icon: Keyboard },
    { id: "rules", label: i18n.t.tabs.rules, icon: Funnel },
  ]);

  let active = $state("general");
  let status = $state<string>("");
  let historyOpen = $state(false);

  // External-change detection: poll the file's mtime every 2s and surface a
  // banner when the on-disk file is newer than what we loaded/saved.
  let knownMtime = $state<number>(0);
  let externalChanged = $state(false);
  let externalMtime = $state<number>(0);

  async function reloadFromDisk() {
    if (!store.configPath) return;
    try {
      const raw = await readConfig(store.configPath);
      store.setConfig(store.configPath, parseConfig(raw));
      knownMtime = await getMtime(store.configPath);
      externalChanged = false;
      status = i18n.t.status.reloaded(store.configPath);
    } catch (e) {
      status = i18n.t.status.reloadFailed(String(e));
    }
  }

  function dismissExternalChange() {
    // User chose to keep their in-app version: remember the disk mtime so
    // we don't re-prompt until the file changes again.
    knownMtime = externalMtime;
    externalChanged = false;
  }

  function fmtTime(ms: number) {
    const d = new Date(ms);
    return d.toLocaleTimeString();
  }

  function onKeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) { e.preventDefault(); store.undo(); }
    else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); store.redo(); }
    else if (k === "o" && !e.shiftKey) { e.preventDefault(); openFile(); }
    else if (k === "s" && !e.shiftKey) { e.preventDefault(); saveFile(); }
    else if (k === "s" && e.shiftKey) { e.preventDefault(); saveAs(); }
    else if (k === "r" && !e.shiftKey) { e.preventDefault(); saveAndReload(); }
  }

  async function tryLoadDefault() {
    try {
      const path = await defaultConfigPath();
      if (await pathExists(path)) {
        const raw = await readConfig(path);
        store.setConfig(path, parseConfig(raw));
        knownMtime = await getMtime(path);
        status = i18n.t.status.loaded(path);
      } else {
        store.setConfig(path, emptyConfig());
        knownMtime = 0;
        status = i18n.t.status.newConfig(path);
      }
    } catch (e) {
      status = i18n.t.status.error(String(e));
    }
  }

  async function openFile() {
    try {
      const path = await openConfigDialog();
      if (!path) return;
      const raw = await readConfig(path);
      store.setConfig(path, parseConfig(raw));
      knownMtime = await getMtime(path);
      externalChanged = false;
      status = i18n.t.status.loaded(path);
    } catch (e) {
      status = i18n.t.status.error(String(e));
    }
  }

  async function saveFile() {
    if (!store.config) return;
    try {
      await writeConfig(store.configPath, serializeConfig(store.config));
      store.markClean();
      knownMtime = await getMtime(store.configPath);
      externalChanged = false;
      status = i18n.t.status.saved(store.configPath);
    } catch (e) {
      status = i18n.t.status.error(String(e));
    }
  }

  async function saveAs() {
    if (!store.config) return;
    try {
      const path = await saveConfigDialog(store.configPath);
      if (!path) return;
      await writeConfig(path, serializeConfig(store.config));
      store.configPath = path;
      store.markClean();
      knownMtime = await getMtime(path);
      externalChanged = false;
      status = i18n.t.status.saved(path);
    } catch (e) {
      status = i18n.t.status.error(String(e));
    }
  }

  async function saveAndReload() {
    if (!store.config) return;
    try {
      await writeConfig(store.configPath, serializeConfig(store.config));
      store.markClean();
      knownMtime = await getMtime(store.configPath);
      externalChanged = false;
      status = i18n.t.status.savedReloading(store.configPath);
      const out = await reloadGlazeWM();
      status = i18n.t.status.savedAndReloaded(out ?? "");
    } catch (e) {
      status = i18n.t.status.saveReloadFailed(String(e));
    }
  }

  // Try loading on mount
  $effect(() => {
    if (!store.config) tryLoadDefault();
  });

  // Reflect the currently-loaded config path in the window title.
  $effect(() => {
    const base = "GlazeWM Config Editor";
    const path = store.configPath;
    const dirty = store.isDirty ? " ●" : "";
    setWindowTitle(path ? `${base} — ${path}${dirty}` : base);
  });

  // Poll for external file changes every 2s while a config is loaded.
  $effect(() => {
    const path = store.configPath;
    if (!path) return;
    const id = setInterval(async () => {
      try {
        const m = await getMtime(path);
        if (m && knownMtime && m > knownMtime) {
          externalMtime = m;
          externalChanged = true;
        }
      } catch {
        // ignore — file may have been temporarily moved
      }
    }, 2000);
    return () => clearInterval(id);
  });
</script>

<svelte:window onkeydown={onKeydown} />

<main class="grid grid-rows-[auto_auto_1fr_auto] h-screen w-full overflow-hidden min-w-0">
  <header class="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-[#333] gap-4">
    <div class="flex gap-[0.4rem] items-center">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={openFile}
      ><FolderOpen size={16} />{i18n.t.app.open} <KbdSequence value="Ctrl+O" size="sm" /></button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={saveFile}
        disabled={!store.config}
      >
        <FloppyDisk size={16} />{i18n.t.app.save}{store.isDirty ? " *" : ""} <KbdSequence value="Ctrl+S" size="sm" />
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={saveAs}
        disabled={!store.config}
      ><FloppyDiskBack size={16} />{i18n.t.app.saveAs} <KbdSequence value="Ctrl+Shift+S" size="sm" /></button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-[0.8rem] py-[0.4rem] border border-[#0289a3] rounded bg-[#015f74] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#0289a3] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={saveAndReload}
        disabled={!store.config}
      >
        <ArrowsClockwise size={16} />{i18n.t.app.saveAndReload} <KbdSequence value="Ctrl+R" size="sm" />
      </button>
    </div>
    <div class="relative flex gap-[0.4rem] items-center">
      <div class="inline-flex border border-[#444] rounded overflow-visible" role="group" aria-label="History">
        <button
          type="button"
          class="inline-flex items-center justify-center px-2 py-[0.35rem] border-0 border-r border-[#444] rounded-none bg-[#2a2a2a] text-inherit cursor-pointer leading-none enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={() => store.undo()}
          disabled={!store.canUndo}
          title={i18n.t.app.undoTitle}
          aria-label={i18n.t.app.undoAria}
        ><ArrowUUpLeft size={18} /></button>
        <button
          type="button"
          class="inline-flex items-center justify-center px-2 py-[0.35rem] border-0 border-r border-[#444] rounded-none bg-[#2a2a2a] text-inherit cursor-pointer leading-none enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={() => store.redo()}
          disabled={!store.canRedo}
          title={i18n.t.app.redoTitle}
          aria-label={i18n.t.app.redoAria}
        ><ArrowUUpRight size={18} /></button>
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center justify-center px-2 py-[0.35rem] border-0 rounded-none bg-[#2a2a2a] text-inherit cursor-pointer leading-none enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
            onclick={() => (historyOpen = !historyOpen)}
            disabled={!store.canUndo && !store.canRedo}
            title={i18n.t.app.historyTitle(store.past.length)}
            aria-label={i18n.t.app.historyAria}
          ><ClockCounterClockwise size={18} /></button>
          {#if historyOpen}
            <div
              class="absolute top-[calc(100%+4px)] right-0 z-50 min-w-[240px] max-h-[60vh] overflow-auto bg-[#1e1e1e] border border-[#444] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.5)] p-[0.3rem] flex flex-col gap-[2px]"
              role="menu"
            >
              {#if store.future.length > 0}
                <div class="text-[0.7rem] uppercase tracking-[0.05em] text-[#777] px-2 pt-[0.4rem] pb-[0.2rem]">{i18n.t.history.redoStack}</div>
                {#each [...store.futureLabels].reverse() as h, idx (idx + "f")}
                  {@const targetFutureIdx = store.future.length - 1 - idx}
                  <button
                    type="button"
                    class="text-left px-2 py-[0.4rem] border-0 rounded-[3px] bg-transparent text-[#ddd] text-[0.85rem] flex justify-between gap-2 items-center cursor-pointer hover:bg-[#2a2a2a]"
                    onclick={() => { store.redoTo(targetFutureIdx); historyOpen = false; }}
                  ><span class="inline-flex items-center gap-1.5"><ArrowUUpRight size={12} weight="bold" />{h.label}</span><span class="text-[#777] text-xs font-mono">{fmtTime(h.at)}</span></button>
                {/each}
              {/if}
              <div class="text-[0.7rem] uppercase tracking-[0.05em] text-[#777] px-2 pt-[0.4rem] pb-[0.2rem]">{i18n.t.history.current}</div>
              <div class="text-left px-2 py-[0.4rem] rounded-[3px] bg-transparent text-[#6cc070] text-[0.85rem] flex justify-between gap-2 items-center cursor-default"><span class="inline-flex items-center gap-1.5"><Circle size={10} weight="fill" />{store.isDirty ? i18n.t.history.unsaved : i18n.t.history.saved}</span></div>
              {#if store.past.length > 0}
                <div class="text-[0.7rem] uppercase tracking-[0.05em] text-[#777] px-2 pt-[0.4rem] pb-[0.2rem]">{i18n.t.history.undoStack}</div>
                {#each [...store.pastLabels].reverse() as h, idx (idx + "p")}
                  {@const targetPastIdx = store.past.length - 1 - idx}
                  <button
                    type="button"
                    class="text-left px-2 py-[0.4rem] border-0 rounded-[3px] bg-transparent text-[#ddd] text-[0.85rem] flex justify-between gap-2 items-center cursor-pointer hover:bg-[#2a2a2a]"
                    onclick={() => { store.undoTo(targetPastIdx); historyOpen = false; }}
                  ><span class="inline-flex items-center gap-1.5"><ArrowUUpLeft size={12} weight="bold" />{h.label}</span><span class="text-[#777] text-xs font-mono">{fmtTime(h.at)}</span></button>
                {/each}
                <button
                  type="button"
                  class="text-left px-2 py-[0.4rem] border-0 rounded-[3px] bg-transparent text-[#ddd] text-[0.85rem] flex justify-between gap-2 items-center cursor-pointer hover:bg-[#2a2a2a]"
                  onclick={() => { store.undoTo(0); historyOpen = false; }}
                ><span class="inline-flex items-center gap-1.5"><ArrowUUpLeft size={12} weight="bold" />{i18n.t.history.initialState}</span></button>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center px-2 py-[0.35rem] border rounded text-inherit cursor-pointer leading-none enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed {active === 'settings' ? 'bg-[#015f74] border-[#0289a3] text-white' : 'bg-[#2a2a2a] border-[#444]'}"
        onclick={() => (active = "settings")}
        title={i18n.t.app.settingsTitle}
        aria-label={i18n.t.app.settings}
      ><SlidersHorizontal size={18} /></button>
    </div>
  </header>

  {#if externalChanged}
    <div
      class="flex items-center justify-between gap-4 px-3 py-2 bg-[#4a3a1a] border-b border-[#6a5a2a] text-[#ffd97a] text-[0.9rem]"
      role="alert"
    >
      <span class="inline-flex items-center gap-1.5">
        <Warning size={14} weight="fill" /> {store.isDirty ? i18n.t.app.externalChangedUnsaved : i18n.t.app.externalChanged}
      </span>
      <div class="flex gap-[0.4rem]">
        <button
          type="button"
          class="px-[0.8rem] py-[0.4rem] border border-[#0289a3] rounded bg-[#015f74] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#0289a3]"
          onclick={reloadFromDisk}
        >{i18n.t.app.reloadFromDisk}</button>
        <button
          type="button"
          class="px-[0.8rem] py-[0.4rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer font-[inherit] enabled:hover:bg-[#3a3a3a]"
          onclick={dismissExternalChange}
        >{i18n.t.app.keepMine}</button>
      </div>
    </div>
  {/if}

  {#if store.config}
    <TabBar {tabs} {active} onSelect={(id) => (active = id)} />

    <div class="overflow-y-auto overflow-x-hidden min-w-0">
      {#if active === "general"}
        <GeneralTab
          general={store.config.general}
          onPatch={(u) => store.patchConfig((c) => u(c.general), i18n.t.history.editGeneral)}
        />
      {:else if active === "gaps"}
        <GapsTab
          gaps={store.config.gaps}
          onPatch={(u) => store.patchConfig((c) => u(c.gaps), i18n.t.history.editGaps)}
        />
      {:else if active === "effects"}
        <WindowEffectsTab
          effects={store.config.window_effects}
          onPatch={(u) => store.patchConfig((c) => u(c.window_effects), i18n.t.history.editEffects)}
        />
      {:else if active === "workspaces"}
        <WorkspacesTab
          workspaces={store.config.workspaces}
          keybindings={store.config.keybindings}
          onPatchWorkspaces={(u) => store.patchConfig((c) => u(c.workspaces), i18n.t.history.editWorkspaces)}
          onPatchKeybindings={(u) => store.patchConfig((c) => u(c.keybindings), i18n.t.history.editKeybindings)}
        />
      {:else if active === "keybindings"}
        <KeybindingsTab
          keybindings={store.config.keybindings}
          workspaces={store.config.workspaces}
          onPatch={(u) => store.patchConfig((c) => u(c.keybindings), i18n.t.history.editKeybindings)}
        />
      {:else if active === "rules"}
        <WindowRulesTab
          rules={store.config.window_rules}
          workspaces={store.config.workspaces}
          onPatch={(u) => store.patchConfig((c) => u(c.window_rules), i18n.t.history.editRules)}
        />
      {:else if active === "settings"}
        <SettingsTab />
      {/if}
    </div>
  {:else}
    <div class="p-8 text-center text-[#888]">{i18n.t.app.loadingConfig}</div>
  {/if}

  <footer class="px-3 py-[0.4rem] bg-[#1e1e1e] border-t border-[#333] text-[#aaa] text-[0.85rem] font-mono whitespace-nowrap overflow-hidden text-ellipsis">{status}</footer>
</main>
