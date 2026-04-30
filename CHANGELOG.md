# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From the first tagged release onward, this file is maintained automatically by
[Release Please](https://github.com/googleapis/release-please) based on
[Conventional Commits](https://www.conventionalcommits.org/). Manual edits should be
limited to fixing mistakes Release Please cannot.

## [Unreleased]

## [0.1.0] - 2026-04-30

### Added

- Visual form editor covering all major GlazeWM config sections: general settings,
  gaps, window effects, keybindings, workspaces, and window rules.
- Window rule builder with process/title/class match helpers and a live window
  picker overlay (click any open window to capture its properties).
- Keybinding editor with conflict detection across all bound actions.
- Workspace and monitor configuration UI with drag-to-reorder rows.
- Command builder with cascading verb picker and friendly natural-language labels.
- Read/edit mode toggle on all major sections for a cleaner review experience.
- Live search with match highlighting in the Window Rules tab.
- Raw YAML editor tab backed by CodeMirror with one-dark theme.
- Live mode: auto-saves and reloads the config on every field blur.
- In-app updater via `tauri-plugin-updater` with passive install on Windows.
- Automatic backup of the active config file before each save.
- i18n framework with English and Portuguese (BR) locales; language setting
  persisted across sessions.
- Native-style menu bar with File, Edit, View, and Help menus including an
  About dialog showing the app version.
- Country flag emoji next to each locale name in the language picker.
- Tauri 2 shell, SvelteKit + TypeScript frontend, TailwindCSS v4, Deno tooling.
- CI (frontend check + Rust fmt/clippy), release, and Scoop bucket update workflows.
- Repository community files: CONTRIBUTING, SECURITY, issue templates, PR template,
  Dependabot config, CODEOWNERS.

[Unreleased]: https://github.com/eduardohilariodev/glazewm-config-editor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/eduardohilariodev/glazewm-config-editor/releases/tag/v0.1.0
