# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From the first tagged release onward, this file is maintained automatically by
[Release Please](https://github.com/googleapis/release-please) based on
[Conventional Commits](https://www.conventionalcommits.org/). Manual edits should be
limited to fixing mistakes Release Please cannot.

## [0.1.2](https://github.com/eduardohilariodev/glazewm-config-editor/compare/v0.1.1...v0.1.2) (2026-04-30)


### Features

* add AboutModal component ([da00ceb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/da00ceb7a9d389115fbb429fb5f2856662a702a1))
* add describeCommand for natural-language command summaries ([f13ee23](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f13ee2373540739859de1c2bc3fc5df750aac334))
* add drag-to-reorder rows in WorkspacesTab ([72f1bdc](https://github.com/eduardohilariodev/glazewm-config-editor/commit/72f1bdc3a01f1c40bce599d889fd4eae50bfb145))
* add friendly labels to command builder with advanced mode ([a989f8d](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a989f8d370f6f170fb2ca137b8c42a7f3dede25f))
* add GapInput component with stepper and unit toggle ([a0df748](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a0df748cf1938eca201ff1949cd8a2cadf65b1b2))
* add Help menu to MenuBar with About dialog ([a7898fb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a7898fb2871b54aeadde70ea6b35896dc1907243))
* add icons to toolbar buttons and show filename in title ([7e3e6b1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/7e3e6b103e32d628806605d11d1631fd6cf0d1cb))
* add in-app updater via tauri-plugin-updater ([ac7f2cb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ac7f2cbcb7056df5783a6502f151ee24530db4ea))
* add InfoIcon tooltip hints to section headings ([4d8936a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/4d8936a6211a70b563b8104dabb44004dc673dfd))
* add LayoutTab combining gaps and window effects ([747e582](https://github.com/eduardohilariodev/glazewm-config-editor/commit/747e5828157f1fcd6da31f0c37714feadf62d83a))
* add liveMode i18n keys to Dictionary and all locales ([0021233](https://github.com/eduardohilariodev/glazewm-config-editor/commit/0021233e0d7923f59abda49f0456bfa142215921))
* add per-field window picker with replace/append actions ([ef18bc0](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ef18bc0d6a0f2fcd0999af9b9558407b7dd3e1c8))
* add RawYamlTab with CodeMirror YAML editor ([39caf0f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/39caf0f3a25a7a881cc3d463536001b3dd4111f1))
* add read/edit mode to GeneralTab command sections ([d0e5910](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d0e5910cc6128928b097df2a57f1e70a0138c22c))
* add read/edit mode toggle to KeybindingsTab ([9cc2481](https://github.com/eduardohilariodev/glazewm-config-editor/commit/9cc24814713686f06af5c848272c6cfa245b82b5))
* add read/edit mode toggle to WindowRulesTab ([71bc549](https://github.com/eduardohilariodev/glazewm-config-editor/commit/71bc549132611e7a6fdb22f671709a7d2e7a3cc9))
* add real-time hover overlay to window picker ([47c13ce](https://github.com/eduardohilariodev/glazewm-config-editor/commit/47c13ce93556c83f13406169ec16b1f4209697ee))
* add Rust commands to open files and reveal in Explorer ([aab00da](https://github.com/eduardohilariodev/glazewm-config-editor/commit/aab00da47bc74310a083cc98b00bc0012963eb4a))
* add semanticLabel utility for command display ([543c85e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/543c85e2c54f2b9dc782f674f0706c246c862ec4))
* add toggleable command sections to GeneralTab ([cd9ec57](https://github.com/eduardohilariodev/glazewm-config-editor/commit/cd9ec57d8ff7d09f84104ac855f5a0bf6207e085))
* add window picker command for window rule authoring ([a4290ef](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a4290ef18e6cf4464b1342c4726d55f7d8ec2de4))
* add YamlEditor component backed by CodeMirror ([7867e3b](https://github.com/eduardohilariodev/glazewm-config-editor/commit/7867e3bdc465ae43c2c0b576e413dc4ce849694f))
* expose shell and app-version Tauri bindings ([ef6d23c](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ef6d23c8d789f3b9c553cd2d80e37af7399b3fea))
* implement live mode to auto-save and reload on field blur ([ac0fbdf](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ac0fbdfc88e12f22664cdde71bdf1a0eec0194a0))
* improve read-mode summary in WindowRulesTab ([b534026](https://github.com/eduardohilariodev/glazewm-config-editor/commit/b534026e7a55333e3eed344a3816c05e68d7db73))
* integrate Layout tab and improve App shell ([c2e8df5](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c2e8df5a974412eca44370a3ad8985306f962cd6))
* redesign Toggle as animated pill switch ([c7a516e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c7a516ee945376464e895fdbbfebef2001438795))
* replace header toolbar with native-style menu bar ([e1c6df1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/e1c6df1997e9f41a209410cb752db3b9b96b6155))
* show country flag emoji next to locale name in settings ([d85d6f1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d85d6f14c4b4a88bb7b8dd545d09e0248a2ad3dd))
* wire i18n translations across all components and add language setting ([d2f1fa1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d2f1fa12d3a3b0d8a49d21ba91eb370a108ba0cc))


### Bug Fixes

* add core:window:allow-set-title Tauri capability ([dc6de3e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/dc6de3edd523d4b226cbb18220d36d9ae2c40eb6))
* correct workspace remove and reorder index tracking ([df73f1a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/df73f1a54e855470ea31743042ac5ce1fffe9221))
* **deps:** remove duplicated scope from Dependabot commit prefix ([33a4a68](https://github.com/eduardohilariodev/glazewm-config-editor/commit/33a4a689660f5feef344c6d21c6476f5b25e7b7f))
* omit empty command arrays from serialized YAML ([6849105](https://github.com/eduardohilariodev/glazewm-config-editor/commit/68491058200dd11577e5e159e279eed7dea8b2f4))
* remove inset shadow from search match highlight ([332f64f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/332f64f9d22e9c988817ab68d503e941b2140b01))
* replace mangled ellipsis characters in locale strings ([f3f684f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f3f684f309b392b948794b5ce9c89b6fbff5bdcd))
* reposition InfoIcon tooltip with fixed layout ([d104794](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d104794bea15a9ba85167d25ed9c562fb7a0bf43))
* use @sveltejs/kit binary and add import map for svelte config ([e4719d5](https://github.com/eduardohilariodev/glazewm-config-editor/commit/e4719d543cf7abb93a780848890c30ae658453f3))
* use CSS primary variable for Toggle active color ([d5d5f88](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d5d5f88fa8c8c2d789aff0a7f1c6e668a3c4d977))
* use IconWeight type in TabBar icon prop ([26efca6](https://github.com/eduardohilariodev/glazewm-config-editor/commit/26efca6784783c3fc44ea4a86145abd6f33a9d4a))
* use trailing slash for picker overlay route URL ([3c26117](https://github.com/eduardohilariodev/glazewm-config-editor/commit/3c26117b84fcd8894d3cbd5876a3d796d8df3e7d))


### Documentation

* add app icon to README header ([d6d6f05](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d6d6f05b574dee64dae7a6aa8a16005f9e541afd))
* add CHANGELOG, CONTRIBUTING, and SECURITY community files ([1cfce35](https://github.com/eduardohilariodev/glazewm-config-editor/commit/1cfce35ad0b91bc99f42506bd1669b0b864832d4))
* add emojis to README section headings ([8d69d2b](https://github.com/eduardohilariodev/glazewm-config-editor/commit/8d69d2b81e830878b5e9ac746a335330ed64438b))
* expand README with full project documentation ([f276140](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f276140e83c132df689d7edff39916268399b141))
* rewrite README with project overview and dev guide ([f600156](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f600156d3ec982ef73c9a3d68449884497b05a5d))


### Code Refactoring

* migrate to feature-sliced architecture ([479b77a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/479b77a74fb958b0481d45d9fefe3f3a7a6ade55))
* redesign CommandBuilder as cascading verb picker ([3757f52](https://github.com/eduardohilariodev/glazewm-config-editor/commit/3757f52ce8ec7383779d2256e729e4b92f2bca8f))
* replace MaskedInput with GapInput in GapsTab ([aadcb68](https://github.com/eduardohilariodev/glazewm-config-editor/commit/aadcb687b964feea6204bf54bf7befe1386dadad))
* simplify GeneralTab toggles to UI-only visibility ([35bd434](https://github.com/eduardohilariodev/glazewm-config-editor/commit/35bd434015050758c410ff128bd82c1188d740ba))
* use CommandBuilder in CommandListEditor ([c0db89a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c0db89a496ab589a73239a07b06bc3f8f915f496))

## [0.1.1](https://github.com/eduardohilariodev/glazewm-config-editor/compare/v0.1.0...v0.1.1) (2026-04-30)


### Features

* add AboutModal component ([da00ceb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/da00ceb7a9d389115fbb429fb5f2856662a702a1))
* add describeCommand for natural-language command summaries ([f13ee23](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f13ee2373540739859de1c2bc3fc5df750aac334))
* add drag-to-reorder rows in WorkspacesTab ([72f1bdc](https://github.com/eduardohilariodev/glazewm-config-editor/commit/72f1bdc3a01f1c40bce599d889fd4eae50bfb145))
* add friendly labels to command builder with advanced mode ([a989f8d](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a989f8d370f6f170fb2ca137b8c42a7f3dede25f))
* add GapInput component with stepper and unit toggle ([a0df748](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a0df748cf1938eca201ff1949cd8a2cadf65b1b2))
* add Help menu to MenuBar with About dialog ([a7898fb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a7898fb2871b54aeadde70ea6b35896dc1907243))
* add icons to toolbar buttons and show filename in title ([7e3e6b1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/7e3e6b103e32d628806605d11d1631fd6cf0d1cb))
* add in-app updater via tauri-plugin-updater ([ac7f2cb](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ac7f2cbcb7056df5783a6502f151ee24530db4ea))
* add InfoIcon tooltip hints to section headings ([4d8936a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/4d8936a6211a70b563b8104dabb44004dc673dfd))
* add LayoutTab combining gaps and window effects ([747e582](https://github.com/eduardohilariodev/glazewm-config-editor/commit/747e5828157f1fcd6da31f0c37714feadf62d83a))
* add liveMode i18n keys to Dictionary and all locales ([0021233](https://github.com/eduardohilariodev/glazewm-config-editor/commit/0021233e0d7923f59abda49f0456bfa142215921))
* add per-field window picker with replace/append actions ([ef18bc0](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ef18bc0d6a0f2fcd0999af9b9558407b7dd3e1c8))
* add RawYamlTab with CodeMirror YAML editor ([39caf0f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/39caf0f3a25a7a881cc3d463536001b3dd4111f1))
* add read/edit mode to GeneralTab command sections ([d0e5910](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d0e5910cc6128928b097df2a57f1e70a0138c22c))
* add read/edit mode toggle to KeybindingsTab ([9cc2481](https://github.com/eduardohilariodev/glazewm-config-editor/commit/9cc24814713686f06af5c848272c6cfa245b82b5))
* add read/edit mode toggle to WindowRulesTab ([71bc549](https://github.com/eduardohilariodev/glazewm-config-editor/commit/71bc549132611e7a6fdb22f671709a7d2e7a3cc9))
* add real-time hover overlay to window picker ([47c13ce](https://github.com/eduardohilariodev/glazewm-config-editor/commit/47c13ce93556c83f13406169ec16b1f4209697ee))
* add Rust commands to open files and reveal in Explorer ([aab00da](https://github.com/eduardohilariodev/glazewm-config-editor/commit/aab00da47bc74310a083cc98b00bc0012963eb4a))
* add semanticLabel utility for command display ([543c85e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/543c85e2c54f2b9dc782f674f0706c246c862ec4))
* add toggleable command sections to GeneralTab ([cd9ec57](https://github.com/eduardohilariodev/glazewm-config-editor/commit/cd9ec57d8ff7d09f84104ac855f5a0bf6207e085))
* add window picker command for window rule authoring ([a4290ef](https://github.com/eduardohilariodev/glazewm-config-editor/commit/a4290ef18e6cf4464b1342c4726d55f7d8ec2de4))
* add YamlEditor component backed by CodeMirror ([7867e3b](https://github.com/eduardohilariodev/glazewm-config-editor/commit/7867e3bdc465ae43c2c0b576e413dc4ce849694f))
* expose shell and app-version Tauri bindings ([ef6d23c](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ef6d23c8d789f3b9c553cd2d80e37af7399b3fea))
* implement live mode to auto-save and reload on field blur ([ac0fbdf](https://github.com/eduardohilariodev/glazewm-config-editor/commit/ac0fbdfc88e12f22664cdde71bdf1a0eec0194a0))
* improve read-mode summary in WindowRulesTab ([b534026](https://github.com/eduardohilariodev/glazewm-config-editor/commit/b534026e7a55333e3eed344a3816c05e68d7db73))
* integrate Layout tab and improve App shell ([c2e8df5](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c2e8df5a974412eca44370a3ad8985306f962cd6))
* redesign Toggle as animated pill switch ([c7a516e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c7a516ee945376464e895fdbbfebef2001438795))
* replace header toolbar with native-style menu bar ([e1c6df1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/e1c6df1997e9f41a209410cb752db3b9b96b6155))
* show country flag emoji next to locale name in settings ([d85d6f1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d85d6f14c4b4a88bb7b8dd545d09e0248a2ad3dd))
* wire i18n translations across all components and add language setting ([d2f1fa1](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d2f1fa12d3a3b0d8a49d21ba91eb370a108ba0cc))


### Bug Fixes

* add core:window:allow-set-title Tauri capability ([dc6de3e](https://github.com/eduardohilariodev/glazewm-config-editor/commit/dc6de3edd523d4b226cbb18220d36d9ae2c40eb6))
* correct workspace remove and reorder index tracking ([df73f1a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/df73f1a54e855470ea31743042ac5ce1fffe9221))
* **deps:** remove duplicated scope from Dependabot commit prefix ([33a4a68](https://github.com/eduardohilariodev/glazewm-config-editor/commit/33a4a689660f5feef344c6d21c6476f5b25e7b7f))
* omit empty command arrays from serialized YAML ([6849105](https://github.com/eduardohilariodev/glazewm-config-editor/commit/68491058200dd11577e5e159e279eed7dea8b2f4))
* remove inset shadow from search match highlight ([332f64f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/332f64f9d22e9c988817ab68d503e941b2140b01))
* replace mangled ellipsis characters in locale strings ([f3f684f](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f3f684f309b392b948794b5ce9c89b6fbff5bdcd))
* reposition InfoIcon tooltip with fixed layout ([d104794](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d104794bea15a9ba85167d25ed9c562fb7a0bf43))
* use @sveltejs/kit binary and add import map for svelte config ([e4719d5](https://github.com/eduardohilariodev/glazewm-config-editor/commit/e4719d543cf7abb93a780848890c30ae658453f3))
* use CSS primary variable for Toggle active color ([d5d5f88](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d5d5f88fa8c8c2d789aff0a7f1c6e668a3c4d977))
* use IconWeight type in TabBar icon prop ([26efca6](https://github.com/eduardohilariodev/glazewm-config-editor/commit/26efca6784783c3fc44ea4a86145abd6f33a9d4a))
* use trailing slash for picker overlay route URL ([3c26117](https://github.com/eduardohilariodev/glazewm-config-editor/commit/3c26117b84fcd8894d3cbd5876a3d796d8df3e7d))


### Documentation

* add app icon to README header ([d6d6f05](https://github.com/eduardohilariodev/glazewm-config-editor/commit/d6d6f05b574dee64dae7a6aa8a16005f9e541afd))
* add CHANGELOG, CONTRIBUTING, and SECURITY community files ([1cfce35](https://github.com/eduardohilariodev/glazewm-config-editor/commit/1cfce35ad0b91bc99f42506bd1669b0b864832d4))
* add emojis to README section headings ([8d69d2b](https://github.com/eduardohilariodev/glazewm-config-editor/commit/8d69d2b81e830878b5e9ac746a335330ed64438b))
* expand README with full project documentation ([f276140](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f276140e83c132df689d7edff39916268399b141))
* rewrite README with project overview and dev guide ([f600156](https://github.com/eduardohilariodev/glazewm-config-editor/commit/f600156d3ec982ef73c9a3d68449884497b05a5d))


### Code Refactoring

* migrate to feature-sliced architecture ([479b77a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/479b77a74fb958b0481d45d9fefe3f3a7a6ade55))
* redesign CommandBuilder as cascading verb picker ([3757f52](https://github.com/eduardohilariodev/glazewm-config-editor/commit/3757f52ce8ec7383779d2256e729e4b92f2bca8f))
* replace MaskedInput with GapInput in GapsTab ([aadcb68](https://github.com/eduardohilariodev/glazewm-config-editor/commit/aadcb687b964feea6204bf54bf7befe1386dadad))
* simplify GeneralTab toggles to UI-only visibility ([35bd434](https://github.com/eduardohilariodev/glazewm-config-editor/commit/35bd434015050758c410ff128bd82c1188d740ba))
* use CommandBuilder in CommandListEditor ([c0db89a](https://github.com/eduardohilariodev/glazewm-config-editor/commit/c0db89a496ab589a73239a07b06bc3f8f915f496))

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
