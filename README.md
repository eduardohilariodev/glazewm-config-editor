# GlazeWM Config Editor

A desktop GUI for editing [GlazeWM](https://github.com/glzr-io/glazewm) YAML configuration files on Windows.

[![GitHub release](https://img.shields.io/github/v/release/eduardohilariodev/glazewm-config-editor?display_name=tag&sort=semver)](https://github.com/eduardohilariodev/glazewm-config-editor/releases)
[![CI](https://github.com/eduardohilariodev/glazewm-config-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/eduardohilariodev/glazewm-config-editor/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Scoop bucket](https://img.shields.io/badge/scoop-bucket-orange)](https://github.com/eduardohilariodev/scoop-bucket)

![Screenshot](docs/screenshot.png)

## Features

- Visual editor for GlazeWM `general` settings, gaps, and behaviour flags.
- Keybinding editor with conflict detection.
- Workspace and monitor configuration UI.
- Window rule builder with match-process / match-title helpers.
- Live YAML preview synchronised with the form state.
- Schema-aware validation surfaced inline next to fields.
- Automatic backups of the active config file before each save.
- Dark/light themes that follow the system preference.

## Installation

### Scoop (recommended)

```powershell
scoop bucket add eduardohilariodev https://github.com/eduardohilariodev/scoop-bucket
scoop install glazewm-config-editor
```

### Winget

```powershell
# Coming soon
winget install eduardohilariodev.GlazeWMConfigEditor
```

### Manual

Download the latest `.msi` or `.exe` installer from the
[Releases page](https://github.com/eduardohilariodev/glazewm-config-editor/releases)
and run it.

## Usage

1. Launch **GlazeWM Config Editor** from the Start menu.
2. Open your config file — by default `~/.glzr/glazewm/config.yaml`
   (resolved to `%UserProfile%\.glzr\glazewm\config.yaml`).
3. Edit settings through the UI; review the YAML preview as you go.
4. Save. The previous file is backed up alongside the config.

GlazeWM picks up the changes the next time it reloads its config.

## Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Deno](https://deno.com/) v2 or newer
- Node.js 20+ (optional, only needed for tooling that does not run under Deno)
- [Tauri 2 prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)

### Setup

```powershell
deno install --allow-scripts=npm:husky
```

The `--allow-scripts` flag lets Husky run its `prepare` script and register the project's git hooks (you only need it on the first install, or after Husky is upgraded).

### Common tasks

```powershell
deno task tauri dev      # run the desktop app in dev mode
deno task tauri build    # produce a release bundle
deno task check          # type-check + lint the frontend
```

## Project structure

```
.
├── src/             # SvelteKit frontend (TypeScript, Tailwind v4)
├── src-tauri/       # Rust backend (Tauri 2)
├── static/          # Static assets served by SvelteKit
├── scripts/         # Repo automation
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
