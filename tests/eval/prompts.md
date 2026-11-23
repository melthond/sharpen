# Sharpen eval set

The prompts that every method change gets checked against (see [CONTRIBUTING](../../CONTRIBUTING.md#method-changes-need-an-eval)). Run each one with `tests/eval/run.sh` inside a real project. Round 1 used the sargo repo.

- Each run starts with no conversation history, so the fill-in tier has to be checked by hand in a live session.
- Headless mode has no `AskUserQuestion`, so the options show up as a numbered list.
- A run costs about $0.40 per prompt.

**Pass rules:**
- **Clear:** starts with `Sharpened prompt (clear):`, keeps the request intact (context added only), and waits for the review card.
- **Ambiguous:** `Which did you mean?` with 2–3 options, each a different action naming real files, plus `Run as typed`, and no "Something else". A `Tools:` line appears only when a listed skill, agent or MCP tool fits.
- **Fill-in:** starts with `Sharpened prompt (fill-in):`. Values only the user knows are `[ASK: …]` blanks, never guesses.
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

**Not yet checked live:** the fill-in tier (`Sharpened prompt (fill-in):`) on a prompt that only the conversation resolves needs a real session with history, and `AskUserQuestion` buttons and previews need an interactive session.

**Older rounds:** round 1 used the one-line verdicts, the `Use:` line and 2–4 options that came before the review card (v1.6.0), so its results are kept in that wording.

## Round 2 (v1.7.0): the prompt-engineering pass

Same 3 prompts on the `sharpen-demo` project, before and after the change, with the same model and run.sh:

| Prompt | Before (v1.6.2) | After (v1.7.0) |
|---|---|---|
| `fix the failing tests` | fill-in: files, Decided, Tools, Hooks, check | adds starting/target state, ordered steps, scope lock, "don't weaken assertions", stop-and-ask on the security-sensitive limit, before/after evidence |
| `make the cart better` | ambiguous: 3 options | ambiguous: 2 options, each with starting/target state and a scope lock |
| `add oat milk` | fill-in, but **invented** a 60¢ price | fill-in with `[ASK: …]` blanks for the price and the drinks, flagged above the card |

No regressions: the same verdicts, real files, Tools and Hooks lines. Cost per prompt unchanged (~$0.40).
