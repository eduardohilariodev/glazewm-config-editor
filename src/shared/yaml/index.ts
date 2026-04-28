import yaml from "js-yaml";
import type { GlazeWMConfig } from "$shared/types/config";

export function parseConfig(raw: string): GlazeWMConfig {
  const c = yaml.load(raw) as GlazeWMConfig;
  // Restore fields that are omitted from YAML when empty/disabled.
  const g = (c.general ?? {}) as GlazeWMConfig["general"];
  g.startup_commands ??= [];
  g.shutdown_commands ??= [];
  g.config_reload_commands ??= [];
  c.general = g;
  return c;
}

export function serializeConfig(config: GlazeWMConfig): string {
  // Deep-clone so we don't mutate the live store.
  const c = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const g = (c.general ?? {}) as Record<string, unknown>;
  // Omit empty command arrays — they will be restored to [] on next load.
  if (Array.isArray(g.startup_commands) && g.startup_commands.length === 0)
    delete g.startup_commands;
  if (Array.isArray(g.shutdown_commands) && g.shutdown_commands.length === 0)
    delete g.shutdown_commands;
  if (Array.isArray(g.config_reload_commands) && g.config_reload_commands.length === 0)
    delete g.config_reload_commands;

  return yaml.dump(c, {
    indent: 2,
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  });
}
