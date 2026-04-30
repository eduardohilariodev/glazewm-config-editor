<p align="center">
  <img src="public/icon.png" alt="GlazeWM Config Editor icon" width="120" />
</p>

<h1 align="center">GlazeWM Config Editor</h1>

<p align="center">
  A desktop GUI for editing <a href="https://github.com/glzr-io/glazewm">GlazeWM</a>
  YAML configuration files — no more hand-crafting YAML.
</p>

<p align="center">
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest">
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/eduardohilariodev/glazewm-config-editor?display_name=tag&sort=semver&style=flat-square" />
  </a>
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/releases">
    <img alt="Downloads" src="https://img.shields.io/github/downloads/eduardohilariodev/glazewm-config-editor/total?style=flat-square" />
  </a>
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/eduardohilariodev/glazewm-config-editor/ci.yml?branch=main&style=flat-square&label=CI" />
  </a>
  <a href="LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
  </a>
  <a href="#installation">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey?style=flat-square" />
  </a>
</p>

<p align="center">
  <a href="#contributing">
    <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" />
  </a>
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/eduardohilariodev/glazewm-config-editor?style=flat-square" />
  </a>
</p>

---

## Table of Contents

- [Why this editor?](#why-this-editor)
- [Download](#️-download)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Why this editor?

GlazeWM is configured entirely through a YAML file. That's powerful — but it
also means you need to know the exact key names, allowed values, and nesting
rules before you can change anything. One typo silently breaks your window
manager.

**GlazeWM Config Editor** puts a form-based GUI in front of that file so you
can tweak gaps, keybindings, workspace assignments, and window rules without
ever touching raw YAML. It validates your changes inline, previews the
resulting YAML in real time, and backs up your current config before every
save.

> Available since **v0.1.0** · Built with Tauri 2 + SvelteKit + Rust.

---

## ⬇️ Download

<p align="center">
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest">
    <img alt="Download for Windows" src="https://img.shields.io/badge/Windows-Download%20.exe%20installer-0078D4?style=for-the-badge&logo=windows" />
  </a>
  &nbsp;
  <a href="https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest">
    <img alt="Download for macOS" src="https://img.shields.io/badge/macOS-Download%20.dmg-000000?style=for-the-badge&logo=apple" />
  </a>
</p>

> **macOS note:** Builds are currently unsigned (no Apple Developer
> certificate). On first launch, right-click the app → **Open** to bypass
> Gatekeeper, or run:
> ```bash
> xattr -d com.apple.quarantine /Applications/GlazeWM\ Editor.app
> ```

---

## Features

| Feature | Details |
|---------|---------|
| **General settings editor** | Visual controls for `general`, `gaps`, and behaviour flags |
| **Window effects editor** | Configure border colours, opacity, and focus effects for tiled and floating windows |
| **Layout settings** | Adjust tiling layout and window sizing behaviour |
| **Keybinding editor** | Full keybinding UI with real-time conflict detection |
| **Workspace & monitor config** | Assign workspaces to monitors, set display names and keep-alive; drag-to-reorder rows |
| **Window rule builder** | Match by process, title, or class; live window picker overlay (click any open window to capture its properties); live search highlighting |
| **Raw YAML editor** | Full CodeMirror editor with one-dark theme for direct YAML editing |
| **Live YAML preview** | Preview pane stays in sync with every form change |
| **Live mode** | Auto-saves and reloads the GlazeWM config on every field blur |
| **Read / edit mode toggle** | Clean review mode on all major sections |
| **In-app updater** | Notified of new releases; installs without leaving the app (passive install on Windows) |
| **Automatic backups** | Previous config is backed up alongside the file on every save |
| **i18n support** | UI available in English, Portuguese (BR), German, Spanish, French, Italian, and Chinese |
| **Native menu bar** | File, Edit, View, and Help menus with an About dialog showing the app version |

---

## Screenshots

> No screenshots have been captured yet.
> To contribute: run `deno task tauri dev`, resize the window to 1280 × 800 px,
> and capture each panel listed below. Place images in `docs/screenshots/` and
> open a pull request.

<details>
<summary>General settings & gaps panel</summary>

<!-- Add: docs/screenshots/general-panel.png -->

</details>

<details>
<summary>Keybinding editor with conflict detection</summary>

<!-- Add: docs/screenshots/keybindings-panel.png -->

</details>

<details>
<summary>Window rule builder</summary>

<!-- Add: docs/screenshots/window-rules-panel.png -->

</details>

<details>
<summary>Raw YAML editor</summary>

<!-- Add: docs/screenshots/yaml-editor.png -->

</details>

---

## Installation

### Scoop (recommended for Windows)

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

Download the latest installer from the
[Releases page](https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest)
and run it. Windows ships both an **NSIS `.exe` installer** and an **MSI package**;
use whichever fits your deployment. macOS ships as a `.dmg` disk image.

---

## Usage

1. **Launch** GlazeWM Config Editor from the Start menu or Applications folder.
2. **Open your config file** — the default path is:
   - **Windows:** `%UserProfile%\.glzr\glazewm\config.yaml`
3. **Edit** settings through the UI; watch the YAML preview update as you go.
4. **Save.** The previous file is backed up automatically next to the config.

GlazeWM picks up changes the next time it reloads its configuration.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | [SvelteKit](https://kit.svelte.dev/) 2 · Svelte 5 · TypeScript 6 · Tailwind CSS v4 |
| **Desktop runtime** | [Tauri 2](https://tauri.app/) |
| **Backend / native** | [Rust](https://www.rust-lang.org/) (stable) |
| **Runtime / tasks** | [Deno](https://deno.com/) v2+ |
| **Package management** | Deno + npm interop |
| **CI** | GitHub Actions |

---

## Development

### Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Rust (stable) | `rustup show` | [rustup.rs](https://rustup.rs) |
| Deno | v2.0 | [deno.com](https://deno.com) |
| Tauri v2 prerequisites | — | [v2.tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/) |

> **Windows:** You also need the
> [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
> and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
> (pre-installed on Windows 10/11).

### Setup

```powershell
# Install dependencies (including git hooks via Husky)
deno install --allow-scripts=npm:husky
```

### Common tasks

```powershell
deno task tauri dev      # Run the desktop app in watch/dev mode
deno task tauri build    # Produce a release bundle
deno task check          # Type-check + lint the frontend
deno fmt                 # Format all source files
deno lint                # Lint TypeScript/Svelte sources
```

Before pushing, also run the Rust checks:

```powershell
cargo fmt --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Or via VS Code: **Terminal → Run Task** (`dev` / `build`), or
**Ctrl+Shift+B** for build.

### Running tests

No automated test suite exists yet. Contributions that add tests are welcome.

- **Frontend:** add `*.test.ts` / `*.spec.ts` files alongside components and run with `deno task test` (Vitest, once configured).
- **Rust:** add `#[test]` blocks inside `src-tauri/src/` and run with
  `cargo test --manifest-path src-tauri/Cargo.toml`.

---

## Project Structure

```
.
├── src/                        # SvelteKit frontend (TypeScript, Tailwind v4)
│   ├── app/
│   │   └── App.svelte          # Root application component
│   ├── features/               # Feature panels (one directory per tab)
│   │   ├── effects/            # Window effects editor
│   │   ├── gaps/               # Gap settings editor
│   │   ├── general/            # General settings editor
│   │   ├── keybindings/        # Keybinding editor with conflict detection
│   │   ├── layout/             # Layout settings editor
│   │   ├── raw-yaml/           # CodeMirror YAML editor
│   │   ├── rules/              # Window rule builder
│   │   ├── settings/           # App settings (language, live mode, …)
│   │   └── workspaces/         # Workspace & monitor config
│   ├── routes/
│   │   ├── +layout.svelte      # Shell with menu bar and tab nav
│   │   ├── +page.svelte        # Main editor page
│   │   └── picker/             # Transparent window-picker overlay
│   └── shared/                 # Cross-cutting utilities
│       ├── i18n/               # Internationalisation (en, pt-BR, de, es, fr, it, zh)
│       ├── store/              # Svelte stores (config state, UI state)
│       ├── tauri/              # Typed wrappers around Tauri commands
│       ├── types/              # Shared TypeScript types
│       ├── ui/                 # Reusable UI components
│       ├── utils/              # Helper functions
│       └── yaml/               # YAML serialisation / deserialisation
├── src-tauri/                  # Rust backend (Tauri 2)
│   └── src/
│       ├── commands/
│       │   ├── config.rs       # read_config, write_config, default_config_path,
│       │   │                   # path_exists, validate_regex, reload_glazewm, get_mtime
│       │   ├── shell.rs        # open_with_default, reveal_in_explorer
│       │   └── window_picker.rs# start_window_pick
│       ├── services/           # Business logic (config I/O, process, validation)
│       ├── error.rs            # Unified AppError type
│       └── lib.rs              # Tauri builder & command registration
├── static/                     # Static assets served by SvelteKit
├── scripts/                    # Helper scripts
├── deno.json                   # Deno tasks and compiler config
└── package.json                # Node-side dependencies
```

---

## Roadmap

- [ ] Winget publish (`winget install eduardohilariodev.GlazeWMConfigEditor`)
- [ ] Linux support (once GlazeWM supports Linux)
- [ ] Config diff viewer (before/after on save)
- [ ] Multiple config profile support
- [ ] Automated test suite (Vitest + Rust unit tests)

> Have a feature request? [Open an issue](https://github.com/eduardohilariodev/glazewm-config-editor/issues/new?template=feature_request.md).

---

## FAQ

**Q: Does this modify GlazeWM itself?**  
No. The editor only reads and writes your `config.yaml`. GlazeWM must be
installed and running separately.

**Q: Where is my config backed up?**  
A timestamped copy (e.g. `config.yaml.2024-06-01T12-00-00.bak`) is placed
in the same directory as your config file before every save.

**Q: The app says my config is invalid — what do I do?**  
Open the file in a text editor and compare it against the
[GlazeWM config documentation](https://github.com/glzr-io/glazewm#config-documentation).
The inline validation messages in the editor indicate the exact field and
the expected value type.

**Q: Why is macOS unsigned?**  
Code-signing for macOS requires an Apple Developer account ($99/yr). The
`.dmg` is safe to run; follow the Gatekeeper bypass instructions in the
[Download](#️-download) section.

**Q: Which GlazeWM versions are supported?**  
GlazeWM **v3.x** is fully supported. Older versions may work but are not
actively tested.

**Q: Is there a portable (no-install) version?**  
Portable builds are not currently offered. Use Scoop for a no-UAC
install experience.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md)
before opening a pull request.

Key points:

- **Bugs** → [open an issue](https://github.com/eduardohilariodev/glazewm-config-editor/issues) with reproduction steps.
- **Features** → open an issue first to discuss before writing code.
- **PRs** → create a branch from `main` (`git checkout -b feat/short-description`); keep commits focused and follow [Conventional Commits](https://www.conventionalcommits.org/) style (`feat:`, `fix:`, `docs:`, etc.).
- No CLA is required.

---

## Security

To report a vulnerability, follow the process in [SECURITY.md](SECURITY.md).

---

## License

Released under the [MIT License](LICENSE).

---

## Acknowledgements

- [GlazeWM](https://github.com/glzr-io/glazewm) — the tiling window manager this editor targets.
- [Tauri](https://tauri.app/) — the desktop application framework.
- [SvelteKit](https://kit.svelte.dev/) — the frontend framework.
- [Deno](https://deno.com/) — runtime and task runner.
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML parsing and serialisation.
- [CodeMirror 6](https://codemirror.net/) — raw YAML editor with one-dark theme.
- [Phosphor Icons](https://phosphoricons.com/) (`phosphor-svelte`) — icon set used throughout the UI.
- [country-flag-icons](https://github.com/catamphetamine/country-flag-icons) — flag emoji in the language picker.
