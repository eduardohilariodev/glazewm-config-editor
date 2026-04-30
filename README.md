# GlazeWM Config Editor

A desktop GUI for editing [GlazeWM](https://github.com/glzr-io/glazewm) YAML configuration files — no more hand-crafting YAML.

[![GitHub release](https://img.shields.io/github/v/release/eduardohilariodev/glazewm-config-editor?display_name=tag&sort=semver&style=flat-square)](https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/eduardohilariodev/glazewm-config-editor/total?style=flat-square)](https://github.com/eduardohilariodev/glazewm-config-editor/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/eduardohilariodev/glazewm-config-editor/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/eduardohilariodev/glazewm-config-editor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey?style=flat-square)](#installation)

---

## ⬇️ Download

[![Download for Windows](https://img.shields.io/badge/Windows-Download%20.exe%20installer-0078D4?style=for-the-badge&logo=windows)](https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest)
[![Download for macOS](https://img.shields.io/badge/macOS-Download%20.dmg-000000?style=for-the-badge&logo=apple)](https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest)

> **macOS note:** Builds are currently unsigned (no Apple Developer certificate). On first launch, right-click the app → **Open** to bypass Gatekeeper, or run `xattr -d com.apple.quarantine /Applications/GlazeWM\ Editor.app`.

---

## Features

- Visual editor for GlazeWM `general` settings, gaps, and behaviour flags.
- Keybinding editor with conflict detection.
- Workspace and monitor configuration UI.
- Window rule builder with match-process / match-title helpers and live search highlighting.
- Live YAML preview synchronised with the form state.
- Schema-aware validation surfaced inline next to fields.
- Automatic backups of the active config file before each save.
- In-app updater — get notified and install new versions without leaving the app.
- Dark theme following the system preference.

## Installation

### Scoop (recommended)

```powershell
scoop bucket add glazewm-config-editor https://github.com/eduardohilariodev/scoop-glazewm-config-editor
scoop install glazewm-config-editor
```

### Winget

```powershell
# Coming soon
winget install eduardohilariodev.GlazeWMConfigEditor
```

### Manual

Download the latest `.exe` (Windows) or `.dmg` (macOS) from the
[Releases page](https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest)
and run the installer.

## Usage

1. Launch **GlazeWM Config Editor** from the Start menu or Applications folder.
2. Open your config file — by default `~/.glzr/glazewm/config.yaml`
   (Windows: `%UserProfile%\.glzr\glazewm\config.yaml`).
3. Edit settings through the UI; review the YAML preview as you go.
4. Save. The previous file is backed up automatically alongside the config.

GlazeWM picks up changes the next time it reloads its config.

## Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Deno](https://deno.com/) v2 or newer
- [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) (platform-specific)

### Setup

```powershell
deno install --allow-scripts=npm:husky
```

### Common tasks

```powershell
deno task tauri dev      # run the desktop app in dev mode
deno task tauri build    # produce a release bundle
deno task check          # type-check + lint the frontend
```

Or via VS Code: **Terminal → Run Task** (`dev` / `build`), or **Ctrl+Shift+B** for build.

## Project structure

```
.
├── src/             # SvelteKit frontend (TypeScript, Tailwind v4)
├── src-tauri/       # Rust backend (Tauri 2)
├── static/          # Static assets served by SvelteKit
├── scripts/         # Helper scripts (dev.ps1, build.ps1)
├── deno.json        # Deno tasks and config
└── package.json     # Node-side dependencies
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

To report a vulnerability, follow the process in [SECURITY.md](SECURITY.md).

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

- [GlazeWM](https://github.com/glzr-io/glazewm) — the tiling window manager this editor targets.
- [Tauri](https://tauri.app/) — the desktop application framework.
- [SvelteKit](https://kit.svelte.dev/) — the frontend framework.
