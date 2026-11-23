# Design docs

These are dated records of how Sharpen was designed. They show what was decided at the time, not how Sharpen works now. Records are kept as written; when one is replaced, it's marked here instead. For how Sharpen works today, see the [README](../README.md), the [docs page](https://sharpen-site.vercel.app/docs/) and the method itself, [`skills/sharpen/SKILL.md`](../skills/sharpen/SKILL.md).

| Date | Record | Status |
|---|---|---|
| 2026-11-19 | [Design spec](superpowers/specs/2026-11-19-sharpen-design.md): intent, scope and architecture | Partly superseded: see below |
| 2026-11-19 | [Phase 1 plan](superpowers/plans/2026-11-19-sharpen-phase1.md): the build plan for the Claude Code plugin | Done (v1.0.0) |
| 2026-11-19 | [Prompt architecture research](research/2026-11-19-prompt-architecture.md): the evidence behind the three-tier gate | Current |

**What changed since the spec:**
- Options went from 2–4 to 2–3 plus *Run as typed* (v1.0.0 eval).
- Inline options became the review card (v1.6.0).
- Modes were dropped (v1.5.0).

Details are in the [changelog](../CHANGELOG.md).
