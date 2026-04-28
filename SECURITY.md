# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `0.x` (latest release) | ✅ |
| Older `0.x` releases   | ❌ |

While the project is in `0.x` only the latest published release receives security fixes.
Once a `1.0.0` line is published this table will be updated.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report vulnerabilities through GitHub private security advisories:

<https://github.com/eduardohilariodev/glazewm-config-editor/security/advisories/new>

Include as much of the following as possible:

- A description of the issue and its impact.
- Reproduction steps or a proof of concept.
- Affected versions.
- Any suggested mitigation.

## Response SLA

- **Acknowledgement:** within **72 hours** of the report.
- **Triage and severity assessment:** within 7 days.
- **Fix target by severity:**
  - Critical: patch released within 14 days.
  - High: patch released within 30 days.
  - Medium / Low: addressed in the next regular release.

We will coordinate disclosure with the reporter and credit them in the advisory unless
they request otherwise.

## Scope

In scope:

- The GlazeWM Config Editor desktop application (Tauri shell, Rust backend, SvelteKit
  frontend) shipped from this repository.
- The build and release pipeline (GitHub Actions workflows, signing, packaging) defined
  in this repository.

Out of scope:

- [GlazeWM](https://github.com/glzr-io/glazewm) itself — please report upstream.
- Vulnerabilities in third-party dependencies — report to the respective project. We will
  pull in fixed versions once available.
- Issues that require attacker-controlled local administrator access already on the
  victim's machine.
