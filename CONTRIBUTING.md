# Contributing

Thanks for your interest in improving **GlazeWM Config Editor**. This document describes
how to file issues, set up your environment, and submit changes.

## Code of conduct

Participation in this project is governed by the
[Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
By participating you agree to uphold its terms. Report unacceptable behaviour to the
maintainers via a private security advisory or direct contact.

## Filing issues

- Search [existing issues](https://github.com/eduardohilariodev/glazewm-config-editor/issues)
  before opening a new one.
- Use the **Bug report** or **Feature request** issue forms.
- Include the app version, Windows build, and GlazeWM version where relevant.
- For security-sensitive reports, follow [SECURITY.md](SECURITY.md) instead.

## Branch and PR workflow

1. Fork the repo and create a feature branch from `main`:
   `git checkout -b feat/short-description`.
2. Make focused, atomic commits.
3. Push your branch and open a pull request against `main`.
4. Fill out the PR template, link related issues with `Closes #123`.
5. Address review feedback by pushing additional commits (do not force-push during review
   unless asked).

## Conventional Commits

This repository uses [Conventional Commits](https://www.conventionalcommits.org/) and
[Release Please](https://github.com/googleapis/release-please) to automate versioning and
changelog generation. PR titles and commit messages **must** match the spec.

| Type       | Use for                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `feat`     | A new user-facing feature.                                             |
| `fix`      | A bug fix.                                                             |
| `docs`     | Documentation-only changes.                                            |
| `style`    | Formatting, whitespace, missing semicolons — no code-behaviour change. |
| `refactor` | Code change that neither fixes a bug nor adds a feature.               |
| `perf`     | Performance improvement.                                               |
| `test`     | Adding or fixing tests.                                                |
| `build`    | Build system or external dependency changes.                           |
| `ci`       | CI configuration changes.                                              |
| `chore`    | Other changes that do not modify `src` or `test` files.                |
| `revert`   | Reverts a previous commit.                                             |

Append `!` or a `BREAKING CHANGE:` footer for breaking changes, e.g. `feat!: drop X`.

Commit signing (`git commit -S`) is appreciated but not required.

## Development setup

See the [Development section of the README](README.md#development) for prerequisites
and task commands.

## Code style

Run these locally before pushing:

```powershell
cargo fmt --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
deno fmt
deno lint
deno task check
```

CI runs the same checks; PRs will be blocked on failures.

## Testing

- Add or update tests alongside behavioural changes.
- Frontend tests run via the configured Deno/Vitest tasks.
- Rust tests run via `cargo test --manifest-path src-tauri/Cargo.toml`.

## Pull request checklist

- [ ] Title follows Conventional Commits.
- [ ] Code is formatted and linted (`deno fmt`, `deno lint`, `cargo fmt`, `cargo clippy`).
- [ ] `deno task check` passes.
- [ ] Tests added or updated where applicable.
- [ ] Documentation updated where applicable.
- [ ] Linked to the relevant issue with `Closes #...` if applicable.

`CHANGELOG.md` is maintained automatically by Release Please — do not edit it by hand.
