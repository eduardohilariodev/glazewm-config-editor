import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
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

export interface WindowPickResult {
  process: string;
  class_name: string;
  title: string;
}

// Module-level guard — prevents concurrent picks from cross-resolving on the
// same global "window-picked" event (the backend also enforces this, but a
// frontend guard means a second click is silently a no-op instead of an error).
let _pickInFlight = false;

/**
 * Installs a low-level mouse hook via Rust and waits for the user to click a
 * target window. The app window stays visible — the Rust hook filters out
 * clicks on our own process, so the user can still see the picker UI state.
 * Returns the window's info, or null if cancelled (right-click) or errored.
 */
export async function startWindowPick(): Promise<WindowPickResult | null> {
  if (_pickInFlight) return null;
  _pickInFlight = true;
  // Object ref avoids TS narrowing `unlisten` to `null` since assignment
  // happens inside a Promise callback.
  const ref: { unlisten: (() => void) | null } = { unlisten: null };
  try {
    return await new Promise<WindowPickResult | null>((resolve) => {
      let settled = false;
      const finish = (v: WindowPickResult | null) => {
        if (settled) return;
        settled = true;
        resolve(v);
      };
      listen<WindowPickResult & { cancelled: boolean }>(
        "window-picked",
        ({ payload }) => {
          finish(
            payload.cancelled
              ? null
              : {
                  process: payload.process,
                  class_name: payload.class_name,
                  title: payload.title,
                },
          );
        },
      )
        .then((u) => {
          ref.unlisten = u;
          return invoke<void>("start_window_pick");
        })
        .catch((e) => {
          console.error("window picker failed:", e);
          finish(null);
        });
    });
  } finally {
    ref.unlisten?.();
    _pickInFlight = false;
  }
}
