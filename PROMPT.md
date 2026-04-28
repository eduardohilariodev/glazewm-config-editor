# GlazeWM Config Editor — Tauri v2 + Svelte + Deno

> Stack: Tauri v2 · Svelte 5 (runes) · TypeScript · Vite · js-yaml · Deno 2
> Package management: Scoop (primary) · winget (fallback for VS Build Tools)
> Target: Windows only

***

## 0. Prerequisites (run once, system-wide)

```powershell
# ── Scoop: Deno and Rust ─────────────────────────────────────────────────────

scoop install deno
scoop install rustup
rustup default stable

# ── winget: VS Build Tools (not available in Scoop) ─────────────────────────
# Installs only the C++ workload — no full IDE download

winget install Microsoft.VisualStudio.2022.BuildTools `
  --force `
  --override "--wait --passive --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.22621"

# ── WebView2 is pre-installed on Windows 10/11 — no action needed ────────────
```

***

## 1. Scaffold the project

```powershell
deno run -A npm:create-tauri-app@latest glazewm-editor `
  --manager deno --template svelte-ts --identifier com.glazewm.editor `
  --tauri-version 2 -y -f
```

The Deno + svelte-ts template produces a SvelteKit (adapter-static) app.

***

## 2. deno.json

```json
{
  "nodeModulesDir": "auto",
  "tasks": {
    "tauri": "deno run -A --node-modules-dir npm:@tauri-apps/cli",
    "dev": "deno run -A --node-modules-dir npm:vite dev",
    "build": "deno run -A --node-modules-dir npm:vite build",
    "check": "deno run -A --node-modules-dir npm:svelte-kit sync && deno run -A --node-modules-dir npm:svelte-check --tsconfig ./tsconfig.json"
  },
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "moduleDetection": "force",
    "strict": true
  }
}
```

***

## 3. Architecture rules

1. Tab components are presentational — receive a config slice as prop, emit `onPatch`, never import the store directly.
2. `invoke()` is only called in `$lib/utils/tauri.ts`.
3. `yaml.dump/load` only runs in `$lib/utils/yaml.ts`.
4. State mutations go through `patchConfig()` from the rune store.
5. Rust `commands/` is the only place with file I/O.
6. `$lib/types/config.ts` is the single contract between YAML, store, and components.

***

## 4. Run, build, icon

```powershell
# From a fresh shell after install, use the helper that loads MSVC + cargo:
.\dev.ps1                # equivalent to: deno task tauri dev
.\dev.ps1 build          # equivalent to: deno task tauri build

# Or, if your shell already has cargo + MSVC on PATH:
deno task tauri dev
deno task tauri build

# Generate icons from a 1024×1024 PNG
deno run -A npm:@tauri-apps/cli icon ./icon.png
```
