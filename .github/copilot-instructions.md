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

| Path | Responsibility |
|---|---|
| `src/lib/types/config.ts` | Single source of truth for all GlazeWM YAML types |
| `src/lib/stores/config.svelte.ts` | All runtime app state via Svelte 5 `$state` runes |
| `src/lib/utils/yaml.ts` | **Only** place `yaml.load` / `yaml.dump` are called |
| `src/lib/utils/tauri.ts` | **Only** place `invoke()` and dialog APIs are called |
| `src/lib/components/tabs/` | One `.svelte` per config section — purely presentational |
| `src/lib/components/ui/` | Shared primitives: Toggle, TextInput, ColorPicker, etc. |
| `src/routes/+page.svelte` | Root: toolbar + TabBar + active tab mount |
| `src-tauri/src/commands/` | `read_config` + `write_config` Tauri commands — all file I/O lives here |
| `src-tauri/src/lib.rs` | Plugin init + `invoke_handler` registration — no logic |

Frontend lives under `src/` (SvelteKit). Static assets in `static/`. Vite output goes to `build/` (referenced by Tauri's `frontendDist`).
Tauri/Rust backend lives under `src-tauri/`. Plugins in use: `tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-updater`.

## Architecture rules

These are hard constraints. Never violate them regardless of the task.

1. **Tab components are purely presentational.** They receive a config slice via props and emit changes via an `onPatch` callback prop. They never import the store or call `invoke()` directly.
2. **`invoke()` is called only in `src/lib/utils/tauri.ts`.** Any new Tauri command must be wrapped there before being used elsewhere. Never use Node `fs` from the frontend.
3. **`yaml.load` / `yaml.dump` are called only in `src/lib/utils/yaml.ts`.** No inline YAML serialisation anywhere else.
4. **State mutations go through `patchConfig()` in the rune store.** Direct mutation of the exported `config` object outside the store is forbidden.
5. **File I/O lives only in `src-tauri/src/commands/`.** `lib.rs` only registers commands — no reads, writes, or filesystem logic.
6. **`src/lib/types/config.ts` is the single type contract.** When the GlazeWM schema changes, update types here first, then fix all downstream TypeScript errors.
7. **Default GlazeWM config path is `%UserProfile%\.glzr\glazewm\config.yaml`.** Use Tauri's path APIs to resolve it — never hardcode `C:\Users\...`.

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

- All `#[tauri::command]` functions return `Result<T, String>`.
- Never use `.unwrap()` or `.expect()` in command functions — use `map_err`.
- File writes must be atomic: write to `path.yaml.tmp`, then `fs::rename` to the target.
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
