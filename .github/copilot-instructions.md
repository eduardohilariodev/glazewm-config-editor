# Copilot instructions for `glazewm-config-editor`

These instructions are loaded by GitHub Copilot when working in this repository. Follow them in addition to the user's request.

## Project

- Native desktop GUI for editing [GlazeWM](https://github.com/glzr-io/glazewm) `config.yaml` files.
- **Primary target: Windows.** Do not add packaging targets, runner OSes, or icon formats for non-Windows platforms without explicit user request.
- Stack: **Tauri v2** · **SvelteKit 2** · **Svelte 5** · **TypeScript** · **TailwindCSS v4** · **Vite** · **Deno 2** · **Rust**.
- Rust handles file I/O only. All UI logic is TypeScript/Svelte.

## Tooling

**Deno v2** is the primary frontend runtime. Tasks are defined in `deno.json`. `package.json` exists for ecosystem compatibility.
`nodeModulesDir: "auto"` in `deno.json` generates `node_modules/` for Vite — this is intentional.

Run from repo root:

| Command | Purpose |
|---|---|
| `deno install --allow-scripts=npm:husky` | Install JS deps + register Husky git hooks (first clone / Husky upgrade only) |
| `deno task dev` | Vite dev server (backing `tauri dev`) |
| `deno task build` | Vite production build (backing `tauri build`) |
| `deno task check` | `svelte-kit sync` + `svelte-check` |
| `deno task tauri dev` | Hot-reload dev window |
| `deno task tauri build` | Production bundle → `src-tauri/target/release/bundle/` |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --all` | Format Rust |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings` | Lint Rust (must pass, zero warnings) |

Re-run `deno install` whenever `deno.json` or `deno.lock` changes.

## Folder map

The project follows **Feature-Sliced Design** (FSD). Layers form a strict
one-way dependency graph: `app → features → shared`. Nothing flows upward; no
feature imports another feature.

| Path | Layer | Responsibility |
|---|---|---|
| `src/shared/types/config.ts` | shared | Single source of truth for all GlazeWM YAML types |
| `src/shared/store/config.svelte.ts` | shared | Global config rune store + undo/redo |
| `src/shared/store/settings.svelte.ts` | shared | App-wide settings rune store |
| `src/shared/yaml/` | shared | **Only** place `yaml.load` / `yaml.dump` are called |
| `src/shared/tauri/` | shared | **Only** place `invoke()` and dialog APIs are called |
| `src/shared/i18n/` | shared | Locale store + `locales/*.ts` dictionaries |
| `src/shared/ui/` | shared | Generic UI primitives (Toggle, TextInput, ColorPicker, …) |
| `src/shared/utils/` | shared | Framework-agnostic helpers (regex, masks, command codecs) |
| `src/features/<name>/` | features | One folder per config tab. Owns its tab component, any private sub-components and feature-private utilities |
| `src/features/<name>/index.ts` | features | **Public API.** Other layers may only import from this barrel |
| `src/app/App.svelte` | app | Root composition: toolbar + TabBar + active tab mount |
| `src/routes/+page.svelte` | app | Thin SvelteKit shim — renders `<App />` only |
| `src/routes/picker/` | app | Overlay window route consumed by Tauri's window-picker feature |
| `src-tauri/src/commands/` | rust | Thin `#[tauri::command]` adapters — validate/parse args, delegate to services, map errors |
| `src-tauri/src/services/` | rust | All actual logic (filesystem, process, validation). No Tauri types here |
| `src-tauri/src/error.rs` | rust | Centralized `AppError` with `thiserror`. Commands map it to `String` at the FFI boundary |
| `src-tauri/src/lib.rs` | rust | Plugin init + `invoke_handler` registration only |

**Path aliases** (configured in `svelte.config.js`):

- `$shared/*` → `src/shared/*`
- `$features/*` → `src/features/*`
- `$lib/*` → `src/shared/*` (legacy compatibility — prefer `$shared`)

Frontend lives under `src/` (SvelteKit). Static assets in `static/`. Vite output goes to `build/` (referenced by Tauri's `frontendDist`).
Tauri/Rust backend lives under `src-tauri/`. Plugins in use: `tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-updater`.

## Architecture rules

These are hard constraints. Never violate them regardless of the task.

1. **One-way dependency graph.** `app → features → shared`. Nothing flows upward; features must not import other features.
2. **Public-API rule.** A feature's only importable entry point is its `index.ts` barrel. Importing internal files of another feature is forbidden.
3. **Tab components are purely presentational.** They receive a config slice via props and emit changes via an `onPatch` callback prop. They never import the store or call `invoke()` directly.
4. **`invoke()` is called only in `src/shared/tauri/`.** Any new Tauri command must be wrapped there before being used elsewhere. Never use Node `fs` from the frontend.
5. **`yaml.load` / `yaml.dump` are called only in `src/shared/yaml/`.** No inline YAML serialisation anywhere else.
6. **State mutations go through `patchConfig()` in the rune store.** Direct mutation of the exported `config` object outside the store is forbidden.
7. **Filesystem and process I/O live only in `src-tauri/src/services/`.** Commands are thin adapters; `lib.rs` only registers them.
8. **`src/shared/types/config.ts` is the single type contract.** When the GlazeWM schema changes, update types here first, then fix all downstream TypeScript errors.
9. **Default GlazeWM config path is `%UserProfile%\.glzr\glazewm\config.yaml`.** Use Tauri's path APIs to resolve it — never hardcode `C:\Users\...`.

## Svelte 5 rules

- Use `$state`, `$derived`, `$effect`, `$props` runes exclusively. Never use legacy `writable()`, `readable()`, or `derived()` from `svelte/store`.
- Props are declared with `const { propName } = $props()` — never `export let`.
- Prefer `$derived` over `$effect` for computed values.
- Event handlers on components use callback props, not `createEventDispatcher`.
- Store files that export rune state must be named `*.svelte.ts`.

## TypeScript & styling

- `strict` is on (`tsconfig.json` + `deno.json` `compilerOptions`). Avoid `any`. Use `import type` for type-only imports.
- **Tailwind v4**: CSS-first config (`@import "tailwindcss"` and `@theme`). Don't reintroduce `tailwind.config.js`.
- **Icons**: use `phosphor-svelte`.
- **Indentation**: 2 spaces everywhere except Rust (4 spaces) and Makefiles (tabs). LF line endings, UTF-8, final newline — see `.editorconfig`.

## Rust rules

- All `#[tauri::command]` functions return `Result<T, String>` and act as thin adapters: validate input, call into `services::*`, map `AppError` to `String`.
- Errors use the centralized `AppError` enum in `src-tauri/src/error.rs` (powered by `thiserror`). Add new variants there rather than scattering ad-hoc error strings.
- Never use `.unwrap()` or `.expect()` in command or service functions — use `?` with `AppError`'s `From` impls or `map_err`.
- File writes must be atomic: write to `path.yaml.tmp`, then `fs::rename` to the target. This lives in `services::config::write`.
- Keep `Cargo.toml` dependencies pinned to major version (e.g. `tauri = "2"`), not exact.
- Run `cargo clippy -- -D warnings` before committing. All warnings are errors.

## CI / Releases

Release chain: push to `main` → release-please PR → merge PR → GitHub Release → `build-release.yml` → `scoop-update.yml`. Do not short-circuit or reorder this chain.

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | push / PR | `deno task check`, `cargo fmt --check`, `cargo clippy -D warnings` on `windows-latest`. The `pre-push` hook mirrors these locally. |
| `release-please.yml` | push to `main` | Opens/updates the release PR |
| `release.yml` / `build-release.yml` | `v*` tag or `workflow_dispatch` | Builds via `tauri-apps/tauri-action`; generates signed updater artifacts (`latest.json` + `.sig`) |
| `scoop-bucket-update.yml` | `workflow_run` after release succeeds | Updates the [scoop bucket](https://github.com/eduardohilariodev/scoop-glazewm-config-editor). Requires secrets `SCOOP_BUCKET_REPO` + `SCOOP_BUCKET_TOKEN`. |
| `pr-title.yml` | PR open/edit | Enforces Conventional Commits on PR titles |

CI/CD rules:
- Never remove `denoland/setup-deno` or `swatinem/rust-cache` steps from any workflow.
- `scoop-update.yml` must only fire after `build-release.yml` succeeds (`workflow_run`).
- Do not hardcode version numbers in workflow files — use floating tags (`@v4`, `v2.x`).

## Version management

**Never manually bump a version number.** Versions are controlled exclusively by merging the release-please PR. Do not edit `package.json` → `"version"`, `src-tauri/tauri.conf.json` → `"version"`, or `src-tauri/Cargo.toml` → `package.version` — Release Please owns those via markers/`extra-files`.

| Commit prefix | Version effect |
|---|---|
| `fix:` | patch — `0.0.x` |
| `feat:` | minor — `0.x.0` |
| `feat!:` or `BREAKING CHANGE:` footer | major — `x.0.0` |
| `chore:` `docs:` `refactor:` `test:` `ci:` | no release |

Every commit message and PR title must be a valid Conventional Commit (GitHub squash-merges using the PR title).
Do not hand-edit `CHANGELOG.md` — Release Please generates it from commit history.

## CI-owned files — never edit manually

| File | Owner |
|---|---|
| `CHANGELOG.md` | release-please workflow |
| `package.json` → `"version"` | release-please workflow |
| `src-tauri/tauri.conf.json` → `"version"` | release-please workflow |
| `src-tauri/Cargo.toml` → `package.version` | release-please workflow |
| `scoop/glazier.json` | scoop-update workflow |
| `deno.lock` | `deno install` (auto) |

If a task requires changing one of these files, stop and explain why instead of editing.

## Documentation obligations

Update docs in the same PR — never in a follow-up.

| What changed | What to update |
|---|---|
| New tab or config field | `README.md` Features section |
| Tab renamed or removed | `README.md` Features section |
| Config schema changed (non-breaking) | `README.md` Usage section |
| Config schema changed (breaking) | `README.md` + create/update `MIGRATION.md` |
| New install method or platform | `README.md` Installation + `scoop-glazier/README.md` |
| Build step or prerequisite changed | `CONTRIBUTING.md` Development setup |
| New GitHub Actions secret required | `CONTRIBUTING.md` CI/CD section |
| New env variable | `CONTRIBUTING.md` + `.env.example` |
| Security-relevant change | `SECURITY.md` |

## Updater

- Uses `tauri-plugin-updater` with endpoint `https://github.com/eduardohilariodev/glazewm-config-editor/releases/latest/download/latest.json`.
- Public key is committed in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.
- The matching **private key** lives outside the repo (default: `%UserProfile%\.tauri\glazewm-config-editor.key`) and must be set as repo secret `TAURI_SIGNING_PRIVATE_KEY` (and optionally `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). `*.key` and `*.key.pub` are gitignored.
- **Never regenerate the keypair** without coordinating an upgrade path — installed clients will refuse updates signed by a new key.

## Pre-push checklist

The `pre-push` git hook runs CI checks locally. Before pushing, verify manually if needed:

1. `deno install` completes without errors.
2. `deno task check` passes (type-check + svelte-check).
3. `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings` passes with zero warnings.
4. If Rust was touched: `cargo test --manifest-path src-tauri/Cargo.toml` also passes.

## Style guardrails

- Don't add new linters, formatters, or test frameworks unless explicitly asked.
- Comment only non-obvious intent — never comment trivial code.
- Don't create planning/notes markdown files in the repo unless explicitly requested.
- Prefer ecosystem tools over hand-rolled scripts.
- When generating PRs, follow `.github/PULL_REQUEST_TEMPLATE.md`.

## Security

- Never commit secrets. Tauri's `csp` is currently `null`; if you change it, justify the policy.
- Vulnerability reports go through GitHub private security advisories (see `SECURITY.md`).
