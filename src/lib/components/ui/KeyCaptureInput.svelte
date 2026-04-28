<script lang="ts">
  import HighlightedInput from "$lib/components/ui/HighlightedInput.svelte";
  /**
   * Single-binding capture input. Click "Capture" to listen for a keystroke,
   * Esc cancels. Otherwise edit as text directly.
   */
  interface Props {
    value: string;
    placeholder?: string;
    onChange: (next: string) => void;
    onRemove?: () => void;
  }
  let { value, placeholder = "e.g. alt+shift+h", onChange, onRemove }: Props = $props();

  let capturing = $state(false);
  let preview = $state("");

  // Map a KeyboardEvent.key to GlazeWM token form.
  function normalizeKey(k: string): string {
    if (k.length === 1) return k.toLowerCase();
    const lk = k.toLowerCase();
    const map: Record<string, string> = {
      escape: "escape",
      enter: "enter",
      tab: "tab",
      " ": "space",
      space: "space",
      backspace: "backspace",
      delete: "delete",
      arrowleft: "left",
      arrowright: "right",
      arrowup: "up",
      arrowdown: "down",
      pageup: "page_up",
      pagedown: "page_down",
      home: "home",
      end: "end",
      contextmenu: "menu",
    };
    return map[lk] ?? lk;
  }

  function isModifier(k: string): boolean {
    return ["control", "shift", "alt", "meta", "altgraph"].includes(k.toLowerCase());
  }

  function onKey(e: KeyboardEvent) {
    if (!capturing) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      capturing = false;
      preview = "";
      return;
    }
    if (isModifier(e.key)) {
      // Update the live preview while user is still holding modifiers.
      const mods: string[] = [];
      if (e.ctrlKey) mods.push("ctrl");
      if (e.altKey) mods.push("alt");
      if (e.shiftKey) mods.push("shift");
      if (e.metaKey) mods.push("super");
      preview = mods.join("+") + (mods.length ? "+…" : "");
      return;
    }

    const mods: string[] = [];
    if (e.ctrlKey) mods.push("ctrl");
    if (e.altKey) mods.push("alt");
    if (e.shiftKey) mods.push("shift");
    if (e.metaKey) mods.push("super");
    const tokens = [...mods, normalizeKey(e.key)];
    const combo = tokens.join("+");
    onChange(combo);
    capturing = false;
    preview = "";
  }

  function startCapture() {
    capturing = true;
    preview = "";
  }
  function cancelCapture() {
    capturing = false;
    preview = "";
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="flex gap-[0.4rem] items-center">
  {#if capturing}
    <div class="flex-1 flex items-center gap-[0.6rem] px-[0.7rem] py-[0.4rem] border border-[#d8a657] rounded bg-[#2a2418] text-[#f5d77a] font-mono">
      <span class="dot w-[0.6rem] h-[0.6rem] rounded-full bg-[#d83a3a]"></span>
      <span class="flex-1">{preview || "Press a key combination… (Esc to cancel)"}</span>
      <button
        type="button"
        class="px-[0.7rem] py-[0.35rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
        onclick={cancelCapture}
      >Cancel</button>
    </div>
  {:else}
    <div class="flex-1 min-w-0">
      <HighlightedInput
        {value}
        {placeholder}
        sharedClass="font-mono"
        onInput={(v) => onChange(v)}
        spellcheck={false}
      />
    </div>
    <button
      type="button"
      class="px-2 py-[0.35rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
      onclick={startCapture}
      title="Capture key combo"
    >
      🎹
    </button>
    {#if onRemove}
      <button
        type="button"
        class="px-[0.7rem] py-[0.35rem] border border-[#444] rounded bg-[#2a2a2a] text-inherit cursor-pointer hover:bg-[#3a3a3a]"
        onclick={onRemove}
        aria-label="Remove"
      >✕</button>
    {/if}
  {/if}
</div>

<style>
  .dot { animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
</style>
