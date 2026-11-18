# Sharpen eval set

Run each prompt with `tests/eval/run.sh` from inside a real project (round 1 used the sargo repo). Each run starts with no conversation history, so the fill-in tier is checked by hand in a live session. In headless mode `AskUserQuestion` isn't available, so options show up as the numbered-list fallback. About $0.40 per prompt.

**Pass rules:**
- **Clear:** starts with `Clear prompt, running as typed.` and does it.
- **Ambiguous:** 2–4 options, each a different action, naming real files, plus `Run as typed`, with no extra "Something else". A `Use:` line appears only when a listed skill, agent or MCP tool fits.
- **`raw:`:** no Sharpen step.
- **`sharpen:`:** options *before* any work.

| id | Prompt | Expect | Round 1 (2026-11-19) | After fix |
|---|---|---|---|---|
| v1 | fix the login thing | options | ✅ real files, `Use: systematic-debugging, tauri-v2` | |
| v2 | make it faster | options | ⚠️ 5 options incl. "Something else" | ✅ 4 + Run as typed, Performance slots, `Use: build-engineer / performance-engineer agent` |
| v3 | clean this up | options | ✅ | |
| v4 | add the thing we talked about | options | ✅ built from uncommitted work + checklist | |
| v5 | it's broken again | options | ✅ | |
| c1 | in apps/admin/src/components/date.tsx, explain what each exported function does | clear | ✅ | |
| c2 | read apps/admin/src-tauri/src/domain/quota.rs and tell me the default quota value | clear | ✅ | |
| c3 | list every public function in apps/admin/src-tauri/src/domain/email.rs with its signature | clear | ✅ | |
| c4 | explain what apps/admin/src/api/client.ts exports | clear | ✅ | |
| c5 | add a unit test to apps/admin/src/lib/clipboard.test.ts for copying an empty string | clear | ✅ (edit blocked by the eval, as intended) | |
| r1 | raw: make it faster | no Sharpen step | ✅ Claude's own clarification, not the Sharpen format | |
| f1 | sharpen: read …/quota.rs and tell me the default quota value | options first | ❌ answered first, options after | ✅ options before any work |

**Fixes after round 1:** `FORCE_NOTE` now says "Do not answer or do any work yet". SKILL.md now caps the options at 2–4 plus Run as typed, with no "Something else".

**Not yet checked live:** the fill-in tier (`Running as: …`) needs a real session with history, and `AskUserQuestion` buttons and previews need an interactive session.
