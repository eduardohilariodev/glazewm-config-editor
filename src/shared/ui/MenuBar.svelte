<script lang="ts">
  import {
    FolderOpen,
    FloppyDisk,
    FloppyDiskBack,
    ArrowsClockwise,
    ArrowUUpLeft,
    ArrowUUpRight,
    ClockCounterClockwise,
    GithubLogo,
    Info,
  } from "phosphor-svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { openWithDefault, getAppVersion } from "$shared/tauri";
  import AboutModal from "$shared/ui/AboutModal.svelte";

  interface Props {
    configLoaded: boolean;
    canUndo: boolean;
    canRedo: boolean;
    historyOpen: boolean;
    onOpen: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onSaveAndReload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onToggleHistory: () => void;
  }

  const {
    configLoaded,
    canUndo,
    canRedo,
    historyOpen,
    onOpen,
    onSave,
    onSaveAs,
    onSaveAndReload,
    onUndo,
    onRedo,
    onToggleHistory,
  }: Props = $props();

  let openMenu = $state<string | null>(null);
  let menubarEl: HTMLDivElement | undefined;
  let aboutOpen = $state(false);
  let appVersion = $state("…");

  $effect(() => {
    if (openMenu === null) return;
    function handleOutsideClick(e: PointerEvent) {
      if (menubarEl && !menubarEl.contains(e.target as Node)) {
        openMenu = null;
      }
    }
    window.addEventListener("pointerdown", handleOutsideClick);
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  });

  function toggle(menu: string) {
    openMenu = openMenu === menu ? null : menu;
  }

  function closeAll() {
    openMenu = null;
  }

  async function openAbout() {
    closeAll();
    appVersion = await getAppVersion();
    aboutOpen = true;
  }

  function openUrl(url: string) {
    closeAll();
    openWithDefault(url);
  }

  function handleItem(action: () => void, disabled: boolean) {
    if (disabled) return;
    action();
    closeAll();
  }
</script>

<div class="flex items-center" bind:this={menubarEl}>
  <!-- File menu -->
  <div class="relative">
    <button
      type="button"
      class="px-3 py-1 rounded text-sm font-medium cursor-pointer border-0 bg-transparent {openMenu === 'file' ? 'bg-[#2a2a2a] text-white' : 'text-[#ccc] hover:bg-[#2a2a2a] hover:text-white'}"
      onclick={() => toggle("file")}
    >File</button>
    {#if openMenu === "file"}
      <div
        class="absolute top-[calc(100%+2px)] left-0 z-50 min-w-[220px] bg-[#252525] border border-[#444] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.6)] py-1 flex flex-col whitespace-nowrap"
        role="menu"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] border-0 bg-transparent w-full text-left"
          onclick={() => handleItem(onOpen, false)}
          role="menuitem"
        >
          <FolderOpen size={16} />
          Open…
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+O</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left"
          onclick={() => handleItem(onSave, !configLoaded)}
          disabled={!configLoaded}
          role="menuitem"
        >
          <FloppyDisk size={16} />
          Save
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+S</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left"
          onclick={() => handleItem(onSaveAs, !configLoaded)}
          disabled={!configLoaded}
          role="menuitem"
        >
          <FloppyDiskBack size={16} />
          Save As…
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+Shift+S</span>
        </button>
        <hr class="my-1 border-t border-[#333] mx-2" />
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left {configLoaded ? 'text-[#0289a3]' : 'text-[#ddd]'}"
          onclick={() => handleItem(onSaveAndReload, !configLoaded)}
          disabled={!configLoaded}
          role="menuitem"
        >
          <ArrowsClockwise size={16} />
          Save & Reload
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+R</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- Edit menu -->
  <div class="relative">
    <button
      type="button"
      class="px-3 py-1 rounded text-sm font-medium cursor-pointer border-0 bg-transparent {openMenu === 'edit' ? 'bg-[#2a2a2a] text-white' : 'text-[#ccc] hover:bg-[#2a2a2a] hover:text-white'}"
      onclick={() => toggle("edit")}
    >Edit</button>
    {#if openMenu === "edit"}
      <div
        class="absolute top-[calc(100%+2px)] left-0 z-50 min-w-[220px] bg-[#252525] border border-[#444] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.6)] py-1 flex flex-col whitespace-nowrap"
        role="menu"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left"
          onclick={() => handleItem(onUndo, !canUndo)}
          disabled={!canUndo}
          role="menuitem"
        >
          <ArrowUUpLeft size={16} />
          Undo
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+Z</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left"
          onclick={() => handleItem(onRedo, !canRedo)}
          disabled={!canRedo}
          role="menuitem"
        >
          <ArrowUUpRight size={16} />
          Redo
          <span class="ml-auto pl-6 text-xs text-[#666] font-mono">Ctrl+Shift+Z</span>
        </button>
        <hr class="my-1 border-t border-[#333] mx-2" />
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent w-full text-left {historyOpen ? 'bg-[#333]' : ''}"
          onclick={() => handleItem(onToggleHistory, !canUndo && !canRedo)}
          disabled={!canUndo && !canRedo}
          role="menuitem"
        >
          <ClockCounterClockwise size={16} />
          History…
        </button>
      </div>
    {/if}
  </div>

  <!-- Help menu -->
  <div class="relative">
    <button
      type="button"
      class="px-3 py-1 rounded text-sm font-medium cursor-pointer border-0 bg-transparent {openMenu === 'help' ? 'bg-[#2a2a2a] text-white' : 'text-[#ccc] hover:bg-[#2a2a2a] hover:text-white'}"
      onclick={() => toggle("help")}
    >{i18n.t.help.menu}</button>
    {#if openMenu === "help"}
      <div
        class="absolute top-[calc(100%+2px)] left-0 z-50 min-w-[220px] bg-[#252525] border border-[#444] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.6)] py-1 flex flex-col whitespace-nowrap"
        role="menu"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] border-0 bg-transparent w-full text-left"
          onclick={() => openUrl("https://github.com/glzr-io/glazewm")}
          role="menuitem"
        >
          <GithubLogo size={16} />
          {i18n.t.help.glazewmGitHub}
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] border-0 bg-transparent w-full text-left"
          onclick={() => openUrl("https://github.com/eduardohilariodev/glazewm-config-editor")}
          role="menuitem"
        >
          <GithubLogo size={16} />
          {i18n.t.help.editorGitHub}
        </button>
        <hr class="my-1 border-t border-[#333] mx-2" />
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-[0.4rem] text-sm text-[#ddd] cursor-pointer hover:bg-[#333] border-0 bg-transparent w-full text-left"
          onclick={openAbout}
          role="menuitem"
        >
          <Info size={16} />
          {i18n.t.help.about}
        </button>
      </div>
    {/if}
  </div>
</div>

{#if aboutOpen}
  <AboutModal version={appVersion} onClose={() => (aboutOpen = false)} />
{/if}
