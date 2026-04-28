import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function openConfigDialog(defaultPath?: string): Promise<string | null> {
  const result = await open({
    title: "Open GlazeWM config.yaml",
    filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
    defaultPath,
    multiple: false,
    directory: false,
  });
  return typeof result === "string" ? result : null;
}

export async function saveConfigDialog(currentPath: string): Promise<string | null> {
  return await save({
    title: "Save config as...",
    defaultPath: currentPath,
    filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
  });
}

export async function readConfig(path: string): Promise<string> {
  return await invoke<string>("read_config", { path });
}

export async function writeConfig(path: string, content: string): Promise<void> {
  return await invoke<void>("write_config", { path, content });
}

export async function defaultConfigPath(): Promise<string> {
  return await invoke<string>("default_config_path");
}

export async function pathExists(path: string): Promise<boolean> {
  return await invoke<boolean>("path_exists", { path });
}

export async function reloadGlazeWM(): Promise<string> {
  return await invoke<string>("reload_glazewm");
}

/** Compile a regex with Rust's `regex` crate; throws on failure. */
export async function validateRegex(pattern: string): Promise<void> {
  await invoke<void>("validate_regex", { pattern });
}

/** Last-modified time (ms since Unix epoch) of the file at `path`. 0 if missing. */
export async function getMtime(path: string): Promise<number> {
  const v = await invoke<number>("get_mtime", { path });
  return Number(v);
}

/** Update the OS window title (e.g. show the currently-loaded config path). */
export async function setWindowTitle(title: string): Promise<void> {
  try {
    await getCurrentWindow().setTitle(title);
  } catch {
    // No-op outside of a Tauri runtime (SSR/tests).
  }
}
