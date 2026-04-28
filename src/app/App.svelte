<script lang="ts">
  import { store } from "$shared/store/config.svelte";
  import { settings } from "$shared/store/settings.svelte";
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
    openWithDefault,
    revealInExplorer,
  } from "$shared/tauri";
  import Toggle from "$shared/ui/Toggle.svelte";
  import InfoIcon from "$shared/ui/InfoIcon.svelte";
  import TabBar from "$shared/ui/TabBar.svelte";
  import MenuBar from "$shared/ui/MenuBar.svelte";
  import GeneralTab from "$features/general";
  import { LayoutTab } from "$features/layout";
  import WorkspacesTab from "$features/workspaces";
  import KeybindingsTab from "$features/keybindings";
  import WindowRulesTab from "$features/rules";
  import SettingsTab from "$features/settings";
  import {
    Gear,
    Layout,
    SquaresFour,
    Keyboard,
    Funnel,
    ArrowUUpLeft,
    ArrowUUpRight,
    Warning,
    Circle,
    ArrowSquareOut,
    FolderOpen,
  } from "phosphor-svelte";

  const tabs = $derived([
    { id: "general", label: i18n.t.tabs.general, icon: Gear },
    { id: "layout", label: i18n.t.tabs.layout, icon: Layout },
    { id: "workspaces", label: i18n.t.tabs.workspaces, icon: SquaresFour },
    { id: "keybindings", label: i18n.t.tabs.keybindings, icon: Keyboard },
    { id: "rules", label: i18n.t.tabs.rules, icon: Funnel },
  ]);

  let active = $state("general");
  let status = $state<string>("");
  let historyOpen = $state(false);
  let historyAnchorEl = $state<HTMLElement | null>(null);
  let pathDraft = $state(store.configPath);

  function onDocumentPointerDown(e: PointerEvent) {
    if (!historyOpen) return;
    if (historyAnchorEl && !historyAnchorEl.contains(e.target as Node)) {
      historyOpen = false;
    }
  }

  $effect(() => {
    pathDraft = store.configPath;
  });

  async function loadFromPath() {
    if (!pathDraft || pathDraft === store.configPath) return;
    try {
      const raw = await readConfig(pathDraft);
      store.setConfig(pathDraft, parseConfig(raw));
      knownMtime = await getMtime(pathDraft);
      externalChanged = false;
      status = i18n.t.status.loaded(pathDraft);
    } catch (e) {
      status = i18n.t.status.error(String(e));
      pathDraft = store.configPath;
    }
  }

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

  // Live mode: debounced auto-save on any config change.
  // Watches store.isDirty reactively — covers all interactions (toggles,
  // selects, number spinners, add/remove, drag-reorder, undo/redo, etc.).
  $effect(() => {
    if (!settings.liveMode || !store.isDirty || !store.config) return;
    const timer = setTimeout(() => saveAndReload(), 600);
    return () => clearTimeout(timer);
  });
</script>

<svelte:window onkeydown={onKeydown} />
<svelte:document onpointerdown={onDocumentPointerDown} />

<main class="grid grid-rows-[auto_auto_1fr_auto] h-screen w-full overflow-hidden min-w-0">
  <header class="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-[#333] gap-4">
    <div class="relative" bind:this={historyAnchorEl}>
      <MenuBar
        configLoaded={!!store.config}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        {historyOpen}
        onOpen={openFile}
        onSave={saveFile}
        onSaveAs={saveAs}
        onSaveAndReload={saveAndReload}
        onUndo={() => store.undo()}
        onRedo={() => store.redo()}
        onToggleHistory={() => (historyOpen = !historyOpen)}
      />
      {#if historyOpen}
        {@const rect = historyAnchorEl?.getBoundingClientRect()}
        {@const top = (rect?.bottom ?? 0) + 4}
        {@const rawLeft = rect?.left ?? 0}
        {@const maxLeft = window.innerWidth - 280 - 8}
        {@const left = Math.max(8, Math.min(rawLeft, maxLeft))}
        <div
          style="top:{top}px; left:{left}px; max-height:calc(100dvh - {top}px - 8px)"
          class="fixed z-50 w-[280px] overflow-auto bg-[#1e1e1e] border border-[#444] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.5)] p-[0.3rem] flex flex-col gap-[2px]"
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
    <div class="flex gap-[0.4rem] items-center">
      <span class="inline-flex items-center gap-1.5">
        <InfoIcon text={i18n.t.app.liveModeTooltip} />
        <Toggle
          checked={settings.liveMode}
          label={i18n.t.app.liveMode}
          onChange={(v) => (settings.liveMode = v)}
        />
      </span>
      <Toggle
        checked={settings.advancedMode}
        label="Advanced mode"
        title={settings.advancedMode ? 'Advanced mode on — showing raw names' : 'Advanced mode off — showing friendly labels'}
        onChange={(v) => (settings.advancedMode = v)}
      />
      <button
        type="button"
        class="inline-flex items-center justify-center px-2 py-[0.35rem] border rounded text-inherit cursor-pointer leading-none enabled:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed {active === 'settings' ? 'bg-[#015f74] border-[#0289a3] text-white' : 'bg-[#2a2a2a] border-[#444]'}"
        onclick={() => (active = "settings")}
        title={i18n.t.app.settingsTitle}
        aria-label={i18n.t.app.settings}
      ><Gear size={18} /></button>
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
      {:else if active === "layout"}
        <LayoutTab
          gaps={store.config.gaps}
          effects={store.config.window_effects}
          onPatchGaps={(u) => store.patchConfig((c) => u(c.gaps), i18n.t.history.editGaps)}
          onPatchEffects={(u) => store.patchConfig((c) => u(c.window_effects), i18n.t.history.editEffects)}
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

  <footer class="flex items-center gap-2 px-3 py-[0.4rem] bg-[#1e1e1e] border-t border-[#333] text-[#aaa] text-[0.85rem] min-w-0">
    <span class="shrink-0 font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[30%]">{status}</span>
    {#if store.configPath}
      <input
        type="text"
        class="flex-1 min-w-0 bg-transparent border border-transparent hover:border-[#444] focus:border-[#0289a3] rounded px-1 text-[#aaa] font-mono text-[0.85rem] focus:outline-none"
        value={pathDraft}
        oninput={(e) => { pathDraft = e.currentTarget.value; }}
        onkeydown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        onblur={loadFromPath}
        aria-label="Config file path"
      />
    {/if}
    <div class="flex gap-0.5 shrink-0">
      <button
        type="button"
        title="Open with default application"
        class="p-1 rounded cursor-pointer text-[#888] hover:text-[#ccc] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={() => store.configPath && openWithDefault(store.configPath)}
        disabled={!store.configPath}
      ><ArrowSquareOut size={14} /></button>
      <button
        type="button"
        title="Reveal in Explorer"
        class="p-1 rounded cursor-pointer text-[#888] hover:text-[#ccc] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed"
        onclick={() => store.configPath && revealInExplorer(store.configPath)}
        disabled={!store.configPath}
      ><FolderOpen size={14} /></button>
    </div>
  </footer>
</main>
