# Changelog

Notable changes in each release, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). To update, see [Updating](README.md#updating).

## [Unreleased]

### Changed
- Website: redesigned "How it works" and "What it adds", put the ten skills in one grid, and tightened the copy.
- Docs: rewrote the README, CONTRIBUTING and website docs, and added this changelog, SECURITY.md and a docs index.

## [2.2.3] - 2026-11-22

### Changed
- Polite and non-English pushback ("that's not quite it") now counts as a correction.
- Moved to the `melthond` GitHub account. The website now lives in `apps/web`, at [sharpen-site.vercel.app](https://sharpen-site.vercel.app).

### Fixed
- Tests run on Node 18, 22 and newer, through a small custom runner.

## [2.2.2] - 2026-11-20

### Fixed
- Hooks wait for their output to flush before they exit, so output is no longer lost on macOS pipes.

## [2.2.1] - 2026-11-20

### Changed
- Tightened `sharpen-plan`. [CREDITS.md](CREDITS.md) now lists every source.

## [2.2.0] - 2026-11-20

### Added
- Prompt phases (`phases.md`) and the `/sharpen:sharpen-plan` skill.

## [2.1.0] - 2026-11-20

### Added
- Local counts of review cards shown and of follow-ups that pushed back, shown by `/sharpen`.

## [2.0.0] - 2026-11-20

### Added
- Researched fixes for common prompting problems: a requirements sweep, session checks, and confirmation of risky verbs.

## [1.9.0] - 2026-11-20

### Added
- Context-engineering, tool-design and dated model notes in the references.
- VS Code extension screenshots, and a link to the website.

## [1.8.0] - 2026-11-19

### Added
- `techniques.md`, `llm-features.md`, 52 anti-patterns, new brief shapes and model-family targets.

## [1.7.0] - 2026-11-19

### Added
- Full agentic briefs, `[ASK: …]` blanks, an anti-pattern scan, reference files, and `/sharpen:sharpen-decompile`.
- CI on Linux, Windows and macOS.

## [1.6.2] - 2026-11-19

### Added
- The logo, the plugin icon and the "Sharpen in action" screenshots.

## [1.6.1] - 2026-11-19

### Changed
- Hand-drawn README diagrams in the xkcd font.

## [1.6.0] - 2026-11-19

### Added
- **The review card:** Send it, Run my original, or your own changes, with the prompt copied to the clipboard.
- Prompts built from your setup, with `Tools:`, `Hooks:` and `Decided:` lines.

## [1.5.0] - 2026-11-19

### Changed
- One behaviour when Sharpen is on: every prompt shows its engineered version. Modes are gone.

## [1.4.0] - 2026-11-19

### Added
- Full mode, which shows the engineered prompt before every reply. Lite mode keeps one-line verdicts.

## [1.3.0] - 2026-11-19

### Added
- The handoff, split, save and interview skills. The badge shows the verdict for each prompt.

## [1.2.0] - 2026-11-19

### Added
- The prompt, review, audit and help skills.

## [1.1.0] - 2026-11-19

### Added
- A red status badge that sets itself up when Sharpen turns on.
- CONTRIBUTING and the MIT license.

## [1.0.0] - 2026-11-19

### Added
- First release: the `/sharpen` toggle, the three-way gate, and engineered options for vague prompts.

[Unreleased]: https://github.com/melthond/sharpen/compare/v2.2.3...HEAD
[2.2.3]: https://github.com/melthond/sharpen/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/melthond/sharpen/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/melthond/sharpen/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/melthond/sharpen/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/melthond/sharpen/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/melthond/sharpen/compare/v1.9.0...v2.0.0
[1.9.0]: https://github.com/melthond/sharpen/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/melthond/sharpen/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/melthond/sharpen/compare/v1.6.2...v1.7.0
[1.6.2]: https://github.com/melthond/sharpen/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/melthond/sharpen/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/melthond/sharpen/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/melthond/sharpen/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/melthond/sharpen/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/melthond/sharpen/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/melthond/sharpen/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/melthond/sharpen/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/melthond/sharpen/releases/tag/v1.0.0
