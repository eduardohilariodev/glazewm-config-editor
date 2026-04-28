import yaml from "js-yaml";
import type { GlazeWMConfig } from "$lib/types/config";

export function parseConfig(raw: string): GlazeWMConfig {
  return yaml.load(raw) as GlazeWMConfig;
}

export function serializeConfig(config: GlazeWMConfig): string {
  return yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  });
}
