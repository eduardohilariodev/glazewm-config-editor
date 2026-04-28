<script lang="ts">
  import type { GeneralConfig } from "$shared/types/config";
  import Toggle from "$shared/ui/Toggle.svelte";
  import CommandListEditor from "$shared/ui/CommandListEditor.svelte";
  import { i18n } from "$shared/i18n/index.svelte";

  interface Props {
    general: GeneralConfig;
    onPatch: (updater: (g: GeneralConfig) => void) => void;
  }
  let { general, onPatch }: Props = $props();
</script>

<section class="tab flex flex-col gap-4 p-4 min-w-0 max-w-full box-border">
  <h2 class="mt-2 mb-0 text-base text-[#ccc]">{i18n.t.general.startupCommands}</h2>
  <CommandListEditor
    items={general.startup_commands}
    placeholder={i18n.t.general.placeholderStartup}
    onChange={(items) => onPatch((g) => (g.startup_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">{i18n.t.general.shutdownCommands}</h2>
  <CommandListEditor
    items={general.shutdown_commands}
    placeholder={i18n.t.general.placeholderShutdown}
    onChange={(items) => onPatch((g) => (g.shutdown_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">{i18n.t.general.configReloadCommands}</h2>
  <CommandListEditor
    items={general.config_reload_commands}
    placeholder={i18n.t.general.placeholderReload}
    onChange={(items) => onPatch((g) => (g.config_reload_commands = items))}
  />

  <h2 class="mt-2 mb-0 text-base text-[#ccc]">{i18n.t.general.behavior}</h2>
  <div class="grid grid-cols-2 gap-y-3 gap-x-6">
    <Toggle
      checked={general.focus_follows_cursor}
      label={i18n.t.general.focusFollowsCursor}
      onChange={(v) => onPatch((g) => (g.focus_follows_cursor = v))}
    />
    <Toggle
      checked={general.toggle_workspace_on_refocus}
      label={i18n.t.general.toggleWorkspaceOnRefocus}
      onChange={(v) => onPatch((g) => (g.toggle_workspace_on_refocus = v))}
    />
    <Toggle
      checked={general.cursor_jump.enabled}
      label={i18n.t.general.cursorJumpEnabled}
      onChange={(v) => onPatch((g) => (g.cursor_jump.enabled = v))}
    />
    <Toggle
      checked={general.show_all_in_taskbar}
      label={i18n.t.general.showAllInTaskbar}
      onChange={(v) => onPatch((g) => (g.show_all_in_taskbar = v))}
    />
  </div>

  <div class="grid grid-cols-2 gap-y-3 gap-x-6">
    <label class="flex flex-col gap-1">
      <span class="text-[0.85rem] text-[#888]">{i18n.t.general.cursorJumpTrigger}</span>
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
      <span class="text-[0.85rem] text-[#888]">{i18n.t.general.hideMethod}</span>
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
