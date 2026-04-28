<script lang="ts">
  import { GithubLogo, X } from "phosphor-svelte";
  import { i18n } from "$shared/i18n/index.svelte";
  import { openWithDefault } from "$shared/tauri";

  interface Props {
    version: string;
    onClose: () => void;
  }
  const { version, onClose }: Props = $props();

  function open(url: string) {
    openWithDefault(url);
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  role="presentation"
  class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
  onclick={onBackdropClick}
>
  <div
    class="relative w-[340px] bg-[#1e1e1e] border border-[#444] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] p-6 flex flex-col gap-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="about-title"
  >
    <button
      type="button"
      class="absolute top-3 right-3 p-1 rounded text-[#777] hover:text-[#ccc] hover:bg-[#2a2a2a] border-0 bg-transparent cursor-pointer"
      onclick={onClose}
      aria-label="Close"
    ><X size={16} /></button>

    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h2 id="about-title" class="m-0 text-base font-semibold text-white">
        GlazeWM Config Editor
      </h2>
      <p class="m-0 text-xs text-[#888] font-mono">{i18n.t.help.version(version)}</p>
    </div>

    <hr class="border-t border-[#333] my-0" />

    <!-- Links -->
    <div class="flex flex-col gap-2">
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-[#aaa] hover:text-primary cursor-pointer border-0 bg-transparent p-0 text-left"
        onclick={() => open("https://github.com/eduardohilariodev/glazewm-config-editor")}
      >
        <GithubLogo size={16} />
        {i18n.t.help.editorGitHub}
      </button>
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-[#aaa] hover:text-primary cursor-pointer border-0 bg-transparent p-0 text-left"
        onclick={() => open("https://github.com/glzr-io/glazewm")}
      >
        <GithubLogo size={16} />
        {i18n.t.help.glazewmGitHub}
      </button>
    </div>

    <hr class="border-t border-[#333] my-0" />

    <!-- Credits -->
    <div class="flex flex-col gap-1">
      <p class="m-0 text-xs text-[#666]">
        {i18n.t.help.madeBy}
        <button
          type="button"
          class="text-[#aaa] hover:text-primary border-0 bg-transparent p-0 cursor-pointer text-xs"
          onclick={() => open("https://github.com/eduardohilariodev")}
        >Eduardo Hilário</button>
        from 🇧🇷
      </p>
      <p class="m-0 text-xs text-[#666]">{i18n.t.help.license}</p>
    </div>
  </div>
</div>
