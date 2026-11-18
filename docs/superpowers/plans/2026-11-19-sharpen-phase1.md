# Sharpen (Phase 1: Claude Code) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Claude Code plugin, `sharpen`, that lets you toggle a mode where Claude reads each vague prompt against the conversation and the codebase, offers 2–4 engineered versions as clickable options, and then runs the one you pick.

**Architecture:** One pure decision module (`decide`) maps a prompt plus the on/off state to the context to inject and the new state. Two thin Node hook scripts wrap it: SessionStart and UserPromptSubmit. The behaviour itself lives in `skills/sharpen/SKILL.md`, and the hooks inject that file. A one-line statusline script shows the badge.

**Tech Stack:** Node ≥ 18, CommonJS, `node:test`, no dependencies.

**Spec:** `docs/superpowers/specs/2026-11-19-sharpen-design.md`

## Global Constraints

- No runtime or dev dependencies. Only Node built-ins. Tests run with `node --test`.
- No network calls and no telemetry anywhere. Hooks never print or log the prompt.
- Hooks never block a prompt, and on any error they exit 0 with no output.
- Cross-platform (Windows, macOS, Linux). No bash-only scripts.
- State file: `~/.config/sharpen/state.json` → `{ "on": boolean }`. Default off. `SHARPEN_HOME` env var overrides the directory (used by tests).
- Prefixes: `raw:` = run as typed. `sharpen:` = always offer options, even when off. Both are case-insensitive and checked after trimming.
- Clear prompts run as typed with one line: `Clear prompt, running as typed.` Fill-in prompts (one sensible reading) run without asking after one line: `Running as: …`. Only ambiguous prompts get options.
- Options: 2–4, they differ in meaning, and "Run as typed" is always included. In Claude Code they are shown with `AskUserQuestion` (label = meaning, preview = full engineered prompt).
- Name `sharpen` everywhere: plugin id, command `/sharpen`, marketplace `sharpen`, install `sharpen@sharpen`.

## Review Focus

1. **Windows stdin that never closes.** The hook must still exit within about 3 s with no output, and must not hang the prompt. → Task 3 test `exits cleanly when stdin stays open`.
2. **Missing or corrupt state file** (empty, `{`, `null`). Read as off and never crash. → Task 1 tests.
3. **Case and whitespace in commands and prefixes** (`  /SHARPEN On`, `Sharpen:`, `RAW:`). They behave the same as lowercase. → Task 2 tests.
4. **Look-alike commands** (`/sharpening`, `/sharpen-x`, `/sharpenon`) are not toggles. They are treated as other slash commands (no context). → Task 2 test.
5. **Bad hook input** (non-JSON stdin, missing `prompt`). Exit 0, no output. → Task 3 tests.

---

### Task 1: Repo scaffold + state module

**Files:**
- Create: `package.json`, `.gitignore`, `LICENSE` (MIT), `hooks/sharpen-state.js`
- Test: `tests/state.test.js`

**Interfaces:**
- Produces: `stateDir(): string`, `readState(): { on: boolean }`, `writeState(state: { on: boolean }): void`, all from `hooks/sharpen-state.js`.

- [ ] **Step 1: `git init`** in `C:\Users\Melthon\Desktop\github repos\sharpen`. Write `package.json` (`"name": "sharpen"`, `"version": "0.1.0"`, `"private": true`, `"scripts": { "test": "node --test tests/" }`, `"engines": { "node": ">=18" }`) and a `.gitignore` containing `node_modules/`.

- [ ] **Step 2: Write the failing tests.** Each test sets `process.env.SHARPEN_HOME` to a fresh `fs.mkdtempSync` dir.
  - `defaults to off when no file` → `readState()` deep-equals `{ on: false }`
  - `round-trips on` → `writeState({ on: true })`, then `readState()` deep-equals `{ on: true }`
  - `creates the directory` → set `SHARPEN_HOME` to `<tmp>/a/b`, call `writeState({ on: true })`, and `fs.existsSync('<tmp>/a/b/state.json')` is true
  - `treats corrupt file as off` → for each of `''`, `'{'`, `'null'`, `'{"on":"yes"}'`, the file is written raw and `readState()` deep-equals `{ on: false }`
  - `stateDir uses ~/.config/sharpen by default` → with `SHARPEN_HOME` deleted, equals `path.join(os.homedir(), '.config', 'sharpen')`

- [ ] **Step 3: Run** `npm test`. Expected: FAIL (module not found).

- [ ] **Step 4: Implement `hooks/sharpen-state.js`.** Read `SHARPEN_HOME` at call time, not at load time. `on` is true only when the parsed value `=== true`. `writeState` uses `mkdirSync({ recursive: true })`.

- [ ] **Step 5: Run** `npm test`. Expected: all PASS.

- [ ] **Step 6: Commit** `feat: state file for sharpen on/off`

---

### Task 2: Decision core

**Files:**
- Create: `hooks/sharpen-core.js`
- Test: `tests/core.test.js`, `tests/fixtures/skill.md`

**Interfaces:**
- Produces, from `hooks/sharpen-core.js`:
  - `loadMethod(file: string): string`: the file's text with a leading YAML front-matter block (`---` … `---`, LF or CRLF) removed, then trimmed.
  - `decide(prompt: string, state: { on: boolean }, method: string): { context: string | null, newState: { on: boolean } | null }`
  - Exported string constants: `NUDGE`, `RAW_NOTE`, `FORCE_NOTE`, `ON_NOTE`, `OFF_NOTE`, `STATUS_ON`, `STATUS_OFF`, `USAGE`.

Exact copy (in the constants):
- `NUDGE` = `"SHARPEN is on. Before acting on this prompt, run the Sharpen step (clear check first; offer options only if the prompt is unclear)."`
- `RAW_NOTE` = `"SHARPEN: the user prefixed this prompt with raw:. Ignore the prefix and run the rest exactly as typed. Do not run the Sharpen step."`
- `FORCE_NOTE` = `"SHARPEN: the user prefixed this prompt with sharpen:. Ignore the prefix, skip the clear check, and always offer options for the rest of the prompt using the method below."`
- `ON_NOTE` = `"SHARPEN ON. Confirm in one short line. From now on, follow this method on every prompt:"`
- `OFF_NOTE` = `"SHARPEN OFF. Confirm in one short line. Stop running the Sharpen step; act on prompts as typed."`
- `STATUS_ON` / `STATUS_OFF` = `"SHARPEN is on. Report that in one short line."` / `"SHARPEN is off. Report that in one short line."`
- `USAGE` = `"SHARPEN: unknown option. Tell the user in one line: /sharpen on, /sharpen off, or /sharpen for status."`

Decision table (`p` = `prompt.trim()`, matched case-insensitively):

| Condition (first match wins) | context | newState |
|---|---|---|
| `p` matches `/^\/sharpen(\s+(\S+))?\s*$/i` with arg `on` | `ON_NOTE + "\n\n" + method` | `{on:true}` |
| … arg `off` | `OFF_NOTE` | `{on:false}` |
| … no arg | `STATUS_ON` or `STATUS_OFF` | `null` |
| … any other arg | `USAGE` | `null` |
| `p` starts with `sharpen:` | `FORCE_NOTE + "\n\n" + method` | `null` |
| `p` starts with `/` | `null` | `null` |
| state off | `null` | `null` |
| `p` starts with `raw:` | `RAW_NOTE` | `null` |
| otherwise | `NUDGE` | `null` |

- [ ] **Step 1: Write the failing tests** in `tests/core.test.js`. Use `M = 'METHOD'`.
  - `on toggles` → `decide('/sharpen on', {on:false}, M)` → `newState` `{on:true}`, `context` starts with `ON_NOTE` and ends with `METHOD`
  - `off toggles` → `decide('/sharpen off', {on:true}, M)` → `{ context: OFF_NOTE, newState: {on:false} }`
  - `status` → `'/sharpen'` gives `STATUS_ON` when on and `STATUS_OFF` when off, and `newState` is `null`
  - `unknown arg` → `'/sharpen maybe'` → `context: USAGE`, `newState: null`
  - `case and whitespace` → `'  /SHARPEN On  '` toggles on. `'Sharpen: fix it'` and `'SHARPEN:fix'` give the FORCE context. `'RAW: x'` when on gives `RAW_NOTE`.
  - `look-alikes are not toggles` → for each of `/sharpening`, `/sharpen-x`, `/sharpenon`: `{ context: null, newState: null }` with state on
  - `force works when off` → `decide('sharpen: fix login', {on:false}, M).context` starts with `FORCE_NOTE` and ends with `METHOD`
  - `other slash commands are left alone` → `'/help'` when on → `{ context: null, newState: null }`
  - `off does nothing` → `'fix the login thing'` when off → `{ context: null, newState: null }`. `'raw: x'` when off also gives null.
  - `on nudges plain prompts` → `'fix the login thing'` when on → `context: NUDGE`
  - `empty prompt` → `''` when on → `context: NUDGE` (harmless). `''` when off → null.
  - `loadMethod strips front matter` → the fixture `tests/fixtures/skill.md` = `"---\r\nname: x\r\n---\r\n\r\nBody line\n"`, and `loadMethod` returns `'Body line'`. A file without front matter is returned trimmed and unchanged.

- [ ] **Step 2: Run** `npm test`. Expected: the core tests FAIL.
- [ ] **Step 3: Implement `hooks/sharpen-core.js`** exactly per the table. It is pure, with no fs access except in `loadMethod`.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat: sharpen decision core`

---

### Task 3: Hook scripts + registration

**Files:**
- Create: `hooks/sharpen-io.js`, `hooks/sharpen-prompt.js`, `hooks/sharpen-session.js`, `hooks/sharpen-statusline.js`, `hooks/hooks.json`
- Test: `tests/hooks.test.js`

**Interfaces:**
- Consumes: `readState`/`writeState` (Task 1); `decide`/`loadMethod`/constants (Task 2).
- Produces:
  - `hooks/sharpen-io.js` → `readStdinJson(timeoutMs = 3000): Promise<object | null>`: resolves `null` on bad JSON or on timeout. The timer is `unref`'d so it never keeps the process alive. `emit(event: string, context: string | null): void`: writes `{"hookSpecificOutput":{"hookEventName":event,"additionalContext":context}}` to stdout, or nothing when `context` is null.
  - `METHOD_FILE = path.join(__dirname, '..', 'skills', 'sharpen', 'SKILL.md')`, exported from `sharpen-io.js`.
- `sharpen-prompt.js`: input → `decide(input.prompt ?? '', readState(), loadMethod(METHOD_FILE))` → `writeState(newState)` if not null → `emit('UserPromptSubmit', context)`. The whole body is in try/catch, and the exit code is always 0.
- `sharpen-session.js`: if `readState().on`, `emit('SessionStart', "SHARPEN is on. Follow this method on every prompt:\n\n" + method)`. Same try/catch rule.
- `sharpen-statusline.js`: prints `[SHARPEN]` (no newline) when on, and nothing when off.
- `hooks/hooks.json` registers SessionStart (matcher `startup|resume|clear|compact`) and UserPromptSubmit. Each command uses a Windows-safe form: `node -e "require(require('path').join(process.env.CLAUDE_PLUGIN_ROOT.split(String.fromCharCode(92)).join('/'), 'hooks/sharpen-prompt.js'))"`, with `timeout: 5`.

- [ ] **Step 1: Write the failing tests.** Spawn with `child_process.spawnSync(process.execPath, [script], { input, env: {...process.env, SHARPEN_HOME: tmp} })`. Until Task 4 exists, create `skills/sharpen/SKILL.md` as a stub with the single line `STUB`.
  - `prompt hook toggles on and emits context` → input `{"prompt":"/sharpen on"}` → status 0, JSON stdout with `hookSpecificOutput.hookEventName === 'UserPromptSubmit'` and `additionalContext` starting with `ON_NOTE`. `state.json` now has `on: true`.
  - `prompt hook silent when off` → `{"prompt":"fix it"}` with no state file → status 0, stdout `''`
  - `bad input` → for each of `'not json'`, `'{}'`, `''`: status 0. For `'{}'` when on, the output is the NUDGE (missing prompt = empty). For the others, stdout is `''`.
  - `exits cleanly when stdin stays open` → `spawn` (async) without ending stdin. The process exits within 4000 ms with code 0.
  - `session hook injects method only when on` → off: stdout `''`. On: `additionalContext` contains `STUB`.
  - `statusline` → off: `''`. On: `'[SHARPEN]'`.
  - `hooks.json is valid` → parses, and has `hooks.SessionStart` and `hooks.UserPromptSubmit`, each referencing an existing file under `hooks/`.
- [ ] **Step 2: Run** `npm test`. Expected: the hook tests FAIL.
- [ ] **Step 3: Implement** the five files per the Interfaces above.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat: sharpen hooks and statusline`

---

### Task 4: The method (SKILL.md), the core prompt-engineering work

**Files:**
- Create or replace: `skills/sharpen/SKILL.md`
- Test: `tests/skill.test.js`

Front matter: `name: sharpen`, plus a `description:` saying it turns a vague prompt into 2–4 specific, engineered prompts using the conversation and the codebase, and that it is used when Sharpen is on or the prompt starts with `sharpen:`.

The body follows `docs/research/2026-11-19-prompt-architecture.md`, and must cover, in this order (the wording is the builder's, and should be tight because it is injected into context):
1. **Three-tier gate.** *Clear* (names what and where, one reading) → say exactly `Clear prompt, running as typed.` and proceed. *Fill-in* (one sensible reading, details recoverable from the conversation or code) → say `Running as: <one-line engineered version>` and proceed without asking. *Ambiguous* (2+ readings that lead to different actions) → go to step 3. Include one short example of each tier.
2. **Gather quickly.** Conversation first. Then at most ~3 searches or reads to find the real files and names. Never a long exploration before asking.
3. **Write 2–4 options, one per interpretation**, ordered most likely first. Each is a different action, not a rewording. Classify the intent and use that type's slots from the research doc's table (Bug, Feature, Refactor, Performance, Question, Review, Explore, Ops, Other). Use plain labelled lines, 3–7 lines, context first and the action last. Leave out slots with no evidence, and never invent paths. Add `Interview me first` when it's a large feature with many open decisions.
4. **Ask.** Claude Code: one `AskUserQuestion`, with each option's label = meaning, description = one line, preview = the full engineered prompt. Always add `Run as typed`. Other hosts: a numbered list, and the user replies with a number.
5. **Run** the picked prompt as if the user typed it. Don't ask again for the same request.
6. **Never:** ask about a clear prompt (unless `sharpen:`), give generic options that use no context, or send anything outside the agent.

- [ ] **Step 1: Write the failing tests** in `tests/skill.test.js`: the front matter has `name: sharpen` and a non-empty `description`. `loadMethod(METHOD_FILE)` contains `Clear prompt, running as typed.`, `Running as:`, `AskUserQuestion`, `Run as typed`, and each intent name `Bug`, `Feature`, `Refactor`, `Performance`, `Question`, `Review`, `Explore`, `Ops`. Its length is under 6000 characters, because it is injected into context.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL (the stub).
- [ ] **Step 3: Write SKILL.md** per the outline.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat: sharpen method`

---

### Task 5: Packaging, command, README

**Files:**
- Create: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `commands/sharpen.md`, `README.md`
- Test: extend `tests/hooks.test.js` with `manifests are valid`

- `plugin.json`: `name: "sharpen"`, `version: "0.1.0"`, a description, `license: "MIT"`, `hooks: "./hooks/hooks.json"`. Author, homepage, and repository use the placeholder `OWNER` until Task 7.
- `marketplace.json`: `name: "sharpen"`, `owner: { name: "OWNER" }`, `plugins: [{ name: "sharpen", source: "./", description, category: "productivity" }]`.
- `commands/sharpen.md`: front matter with `description: Toggle Sharpen (on, off, or status)` and `argument-hint: [on|off]`. The body says: `The Sharpen hook has already handled "/sharpen $ARGUMENTS". Reply with one short line confirming the state it reported. Do nothing else.`
- `README.md`: what it does (with one before/after example), install (`/plugin marketplace add OWNER/sharpen`, `/plugin install sharpen@sharpen`), usage (`/sharpen on|off`, `raw:`, `sharpen:`), the statusline snippet (`"statusLine": { "type": "command", "command": "node <path-to>/hooks/sharpen-statusline.js" }`, and how to chain it with an existing statusline), privacy (nothing leaves your machine), and that Phase 2 platforms are planned.

- [ ] **Step 1: Write the failing test** `manifests are valid`: both JSON files parse. `plugin.json.name === 'sharpen'`, and `plugin.json.hooks` points to an existing file. `marketplace.json.plugins[0].name === 'sharpen'`. `commands/sharpen.md` exists and contains `$ARGUMENTS`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Write the four files.**
- [ ] **Step 4: Run** `npm test`, then `claude plugin validate .`. Expected: all PASS, and validate reports no errors. (If `validate` is not available in the installed CLI, record that and rely on the Task 6 install.)
- [ ] **Step 5: Commit** `feat: sharpen plugin packaging and docs`

---

### Task 6: Install locally and run the prompt-engineering eval

**Files:**
- Create: `tests/eval/prompts.md` (the eval set and its results)
- Modify: `skills/sharpen/SKILL.md` (wording iterations)

- [ ] **Step 1: Install from the local folder:** `/plugin marketplace add "C:\Users\Melthon\Desktop\github repos\sharpen"`, then `/plugin install sharpen@sharpen`, then restart. Check that `/sharpen on` confirms, that the badge shows once the statusline is configured, and that `/sharpen off` confirms.
- [ ] **Step 2: Write `tests/eval/prompts.md`** with 10 prompts to try in a real project (the sargo repo): 5 vague (`fix the login thing`, `make it faster`, `clean this up`, `add the thing we talked about`, `it's broken again`) and 5 clear (each naming a real file and change). Add 2 prefix checks: `raw: make it faster` and `sharpen: <a clear prompt>`.
- [ ] **Step 3: Run each one with Sharpen on, and record the result.** Pass = ambiguous prompts get 2–4 options that name real files or earlier decisions and differ in action. Vague prompts with one obvious reading get `Running as: …` and no question. Each option uses its intent type's slots. Clear prompts run with `Clear prompt, running as typed.`. `raw:` runs directly. `sharpen:` always asks.
- [ ] **Step 4: Iterate.** For each failure, tighten SKILL.md, rerun `npm test` (still green, still under 6000 characters), and re-run that prompt. Stop when all 12 pass or after 3 rounds, and record any that still fail.
- [ ] **Step 5: Commit** `test: sharpen eval set and method tuning`

---

### Task 7: Ship (needs the owner's GitHub account and approval)

- [ ] **Step 1:** Ask the owner for the GitHub account, and replace `OWNER` in `plugin.json`, `marketplace.json`, and `README.md`. Run `npm test`. Expected: PASS.
- [ ] **Step 2:** Commit `chore: set repository owner`.
- [ ] **Step 3: With explicit approval only:** create the public GitHub repo `OWNER/sharpen` and push `main`.
- [ ] **Step 4:** From a clean Claude Code session, run `/plugin marketplace add OWNER/sharpen` and `/plugin install sharpen@sharpen`, then repeat the Task 6 Step 1 checks. Expected: the same behaviour as the local install.
