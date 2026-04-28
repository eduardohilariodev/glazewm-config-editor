<script lang="ts">
  import type { GeneralConfig } from "$shared/types/config";
  import Toggle from "$shared/ui/Toggle.svelte";
  import CommandListEditor from "$shared/ui/CommandListEditor.svelte";

  interface Props {
    general: GeneralConfig;
    onPatch: (updater: (g: GeneralConfig) => void) => void;
  }
  let { general, onPatch }: Props = $props();
</script>

<section class="tab flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Startup commands</h2>
  <CommandListEditor
    items={general.startup_commands}
    placeholder="e.g. shell-exec zebar"
    onChange={(items) => onPatch((g) => (g.startup_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Shutdown commands</h2>
  <CommandListEditor
    items={general.shutdown_commands}
    placeholder='e.g. shell-exec taskkill /im zebar.exe'
    onChange={(items) => onPatch((g) => (g.shutdown_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Config reload commands</h2>
  <CommandListEditor
    items={general.config_reload_commands}
    placeholder='e.g. shell-exec notify "Config reloaded"'
    onChange={(items) => onPatch((g) => (g.config_reload_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">Behavior</h2>
  <div class="grid grid-cols-2 gap-y-3 gap-x-6">
    <Toggle
      checked={general.focus_follows_cursor}
      label="Focus follows cursor"
      onChange={(v) => onPatch((g) => (g.focus_follows_cursor = v))}
    />
    <Toggle
      checked={general.toggle_workspace_on_refocus}
      label="Toggle workspace on refocus"
      onChange={(v) => onPatch((g) => (g.toggle_workspace_on_refocus = v))}
    />
    <Toggle
      checked={general.cursor_jump.enabled}
      label="Cursor jump enabled"
      onChange={(v) => onPatch((g) => (g.cursor_jump.enabled = v))}
    />
    <Toggle
      checked={general.show_all_in_taskbar}
      label="Show all in taskbar"
      onChange={(v) => onPatch((g) => (g.show_all_in_taskbar = v))}
    />
  </div>

  <div class="grid grid-cols-2 gap-y-3 gap-x-6">
    <label class="flex flex-col gap-1">
      <span class="text-[0.85rem] text-[#888]">Cursor jump trigger</span>
      <select
        class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
        value={general.cursor_jump.trigger}
        onchange={(e) =>
          onPatch((g) => (g.cursor_jump.trigger = (e.currentTarget as HTMLSelectElement).value))}
      >
        <option value="monitor_focus">monitor_focus</option>
        <option value="window_focus">window_focus</option>
      </select>
    </label>

    <label class="flex flex-col gap-1">
      <span class="text-[0.85rem] text-[#888]">Hide method</span>
      <select
        class="px-[0.6rem] py-[0.4rem] border border-[#444] rounded bg-[#1e1e1e] text-inherit font-[inherit]"
        value={general.hide_method}
        onchange={(e) =>
          onPatch((g) => (g.hide_method = (e.currentTarget as HTMLSelectElement).value))}
      >
        <option value="cloak">cloak</option>
        <option value="hide">hide</option>
      </select>
    </label>
  </div>
</section>
