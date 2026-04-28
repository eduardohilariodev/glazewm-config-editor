<script lang="ts">
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { onMount } from "svelte";

  type HoverPayload = {
    x: number;
    y: number;
    process: string;
    class_name: string;
    title: string;
    is_uwp_host: boolean;
    focus: string;
  };

  let x = $state(0);
  let y = $state(0);
  let process = $state("");
  let title = $state("");
  let className = $state("");
  let isUwpHost = $state(false);
  let focus = $state("");
  let visible = $state(false);

  type Field = { key: "process" | "class" | "title"; label: string; value: string };
  const allFields = $derived<Field[]>([
    { key: "process", label: "process", value: process },
    { key: "class", label: "class", value: className },
    { key: "title", label: "title", value: title },
  ]);
  const focusedField = $derived(
    allFields.find((f) => f.key === focus) ?? null,
  );
  const otherFields = $derived(
    focusedField ? allFields.filter((f) => f.key !== focusedField.key) : allFields,
  );

  // Tooltip placement: offset so the cursor tip stays uncovered, and flip to
  // the other side near screen edges so the box never clips off-screen.
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 96;
  const OFFSET = 16;

  let tipLeft = $derived.by(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1920;
    return x + OFFSET + TOOLTIP_W > w ? Math.max(0, x - OFFSET - TOOLTIP_W) : x + OFFSET;
  });
  let tipTop = $derived.by(() => {
    const h = typeof window !== "undefined" ? window.innerHeight : 1080;
    return y + OFFSET + TOOLTIP_H > h ? Math.max(0, y - OFFSET - TOOLTIP_H) : y + OFFSET;
  });

  onMount(() => {
    let unHover: UnlistenFn | null = null;
    let unHide: UnlistenFn | null = null;
    (async () => {
      unHover = await listen<HoverPayload>("picker-hover", ({ payload }) => {
        x = payload.x;
        y = payload.y;
        process = payload.process;
        title = payload.title;
        className = payload.class_name;
        isUwpHost = payload.is_uwp_host;
        focus = payload.focus ?? "";
        visible = true;
      });
      unHide = await listen("picker-hide", () => {
        visible = false;
      });
    })();
    return () => {
      unHover?.();
      unHide?.();
    };
  });
</script>

<svelte:head>
  <style>
    /* Critical: every layer must be transparent so the desktop is visible
       through the overlay window. Click-through is enforced at the OS level
       via set_ignore_cursor_events on the Rust side. */
    html, body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }
  </style>
</svelte:head>

<div class="fixed inset-0 pointer-events-none">
  {#if visible}
    <div
      class="absolute rounded-md border border-[#444] bg-black/85 text-white text-[12px] leading-tight px-3 py-2 shadow-2xl backdrop-blur-sm"
      style="left: {tipLeft}px; top: {tipTop}px; width: {TOOLTIP_W}px;"
    >
      <div class="flex flex-col gap-1">
        {#if focusedField}
          <div class="flex gap-2">
            <span class="text-white/60 w-[3.5rem] shrink-0">{focusedField.label}</span>
            <span class="font-mono truncate text-white">{focusedField.value || "—"}</span>
          </div>
          <div class="mt-1 pt-1 border-t border-white/10">
            <div class="text-[10px] uppercase tracking-wide text-white/30 mb-0.5">other</div>
            {#each otherFields as f (f.key)}
              <div class="flex gap-2 text-white/50">
                <span class="text-white/30 w-[3.5rem] shrink-0">{f.label}</span>
                <span class="font-mono truncate">{f.value || "—"}</span>
              </div>
            {/each}
          </div>
        {:else}
          {#each allFields as f (f.key)}
            <div class="flex gap-2">
              <span class="text-white/40 w-[3.5rem] shrink-0">{f.label}</span>
              <span class="font-mono truncate">{f.value || "—"}</span>
            </div>
          {/each}
        {/if}
      </div>
      <div class="mt-1 pt-1 border-t border-white/10 text-[10px] text-white/50">
        {#if isUwpHost}
          <span class="text-amber-400">UWP app — match by class or title, not process</span>
        {:else}
          Click to pick · Right-click to cancel
        {/if}
      </div>
    </div>
  {/if}
</div>
