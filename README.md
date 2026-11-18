<h1 align="center">Sharpen</h1>

<p align="center">
  <em>You type “fix the login thing.” It knows which one.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/ardfaiyaz/sharpen?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code-111111?style=flat-square" alt="Works with Claude Code">
  <img src="https://img.shields.io/badge/dependencies-0-111111?style=flat-square" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/telemetry-none-111111?style=flat-square" alt="No telemetry">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

---

Every prompt you send an AI agent is plain text, and the agent has to guess what you meant. When it guesses wrong, you lose a turn, or worse, you get the wrong change.

**Sharpen is a toggle.** Turn it on, and before Claude acts on a prompt, it reads that prompt against three things:

1. **Your conversation so far:** the files, decisions and errors you've already discussed.
2. **Your codebase:** the real file paths and function names.
3. **Your setup:** the skills, agents, subagents, MCP tools and plugin commands you have installed.

Then it does whichever of three things fits:

| Your prompt | What Sharpen does |
|---|---|
| **Already clear:** `rename getUser to fetchUser in src/api.ts` | Runs it. `Clear prompt, running as typed.` |
| **Vague, but only one sensible meaning:** `now add tests for it` | Runs it, and first says what it understood: `Running as: add unit tests for parsePin in src/pin.ts, run npm test` |
| **Ambiguous:** `fix the login thing` | Asks **Which did you mean?**, with 2–3 clickable options. Each option is a fully engineered prompt. **Run as typed** is always available. |

Most prompts go straight through. Sharpen only stops you when a wrong guess would cost you.

## Before / after

**You type:**

```
fix the login thing
```

**Without Sharpen**, Claude picks one interpretation and starts editing.

**With Sharpen**, you get this:

```
Which did you mean?

❯ Fix PIN lockout            Symptom: lockout after 1 wrong PIN instead of 5
                             Where: apps/admin/auth/pin.ts
                             Reproduce: failing test in pin.test.ts
                             Use: systematic-debugging skill
                             Check: npm test -- pin

  Investigate login only     Goal: find why admin login fails
                             Read-only: trace the login flow, report the cause, no edits

  Run as typed
```

Pick one, and Claude runs it as if you had typed all of that yourself.

## How it works

```
your prompt ──► gate ──┬── clear ─────────► run it
                       ├── fill-in ───────► "Running as: …" ──► run it
                       └── ambiguous ─────► gather ──► 2–3 options ──► you pick ──► run it
```

**1. Gate.** Sharpen decides how much the prompt needs, and usually the answer is "nothing." It only asks when two readings would lead to **different actions**. If every reading ends in the same edit, it just goes.

**2. Gather, fast.** It checks the conversation first, then does at most a few quick searches of the codebase. It never goes on a long exploration before asking.

**3. Build options for the kind of request.** Each option is a different *interpretation*, not the same idea reworded. Sharpen classifies the intent and fills in what that kind of request needs:

| Intent | What the engineered prompt spells out |
|---|---|
| **Bug** | Symptom · Where · Reproduce (failing test) · Fix · Check |
| **Feature** | What and for whom · Where it plugs in · Existing pattern to follow · Done when · Out of scope |
| **Refactor** | Target · Behaviour that must not change · Tests stay green · Scope limit |
| **Performance** | Metric · Measure the baseline first · Target · Where |
| **Question** | What to explain · Depth · Read-only |
| **Review** | What · Focus · Report only |
| **Explore** | Keep it open · No edits · Scope |
| **Ops** (git, deploy, config) | Exact action · Target · Ask before anything irreversible |

**4. Use what you have installed.** When one of your installed skills, agents or MCP tools fits, the option names it with a `Use:` line, for example `Use: performance-engineer agent` or `Use: Supabase MCP to read the auth logs`. Sharpen only suggests what is actually installed. It never invents tools, files or paths; if it couldn't find something, the option says `(not found)`.

**5. Ask, then run.** In Claude Code the options appear as clickable choices, and each choice's preview shows the full engineered prompt. Sharpen never asks twice about the same request.

### Why this design

It's based on research, not vibes. The full notes are in [`docs/research/2026-11-19-prompt-architecture.md`](docs/research/2026-11-19-prompt-architecture.md).

- **Rewriting prompts that are already clear makes results *worse*.** That's why Sharpen has a gate, and why most prompts pass straight through.
- **Models notice ambiguity but guess anyway, unless they're told to stop and check.** That's why there's a hook on every prompt.
- **Good clarifying questions offer distinct interpretations, not rewordings.** That's why there's one option per meaning.
- **Specific prompts name the file, the symptom and what "done" looks like** (Claude Code best practices). That's why options are built from slots for each intent.

## Install

**Claude Code**, as two separate prompts:

```
/plugin marketplace add ardfaiyaz/sharpen
```
```
/plugin install sharpen@sharpen
```

Restart Claude Code, then turn it on:

```
/sharpen on
```

Sharpen is **off by default**, and stays on or off across sessions until you change it.

## Commands

| Command | What it does |
|---|---|
| `/sharpen on` | Turn Sharpen on. Remembered across sessions. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on. |
| `raw: <prompt>` | Skip Sharpen for this one prompt. |
| `sharpen: <prompt>` | Always get options for this prompt, even when it's clear or Sharpen is off. |

Other slash commands are never touched. `/sharpen:sharpen on` works too.

## Status badge

While Sharpen is on, a red **`[SHARPEN]`** badge shows in Claude Code's status bar. It disappears when you turn Sharpen off.

It sets itself up the first time you run `/sharpen on`:

- **No status line yet:** Sharpen adds one to `~/.claude/settings.json` automatically.
- **You already have one** (for example, Ponytail's): Sharpen **never overwrites it**. Claude offers, once, to chain the badge after yours:

  ```
  your-statusline-command; node "~/.config/sharpen/sharpen-statusline.js"
  ```

The badge script is copied to `~/.config/sharpen/`, outside the plugin folder that Claude Code replaces on every update, so the badge keeps working across updates.

## Privacy

- **Nothing leaves your machine.** No API calls, no telemetry, no webhooks. The thinking is done by the agent you're already using.
- **Your prompts are never logged.** The hooks read the prompt, decide, and exit.
- **Files written:** `~/.config/sharpen/state.json` (`{ "on": true }` or `false`) and a copy of the badge script. `~/.claude/settings.json` is only edited to add the badge when you have no status line yet.

## The prompt

Sharpen is one prompt: [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md), about 4 KB. Everything else in this repo exists to load it at the right moment:

| File | Job |
|---|---|
| `hooks/sharpen-prompt.js` | `UserPromptSubmit` hook: handles `/sharpen on\|off` and adds one short line next to each prompt while Sharpen is on |
| `hooks/sharpen-session.js` | `SessionStart` hook: loads the method when Sharpen is on |
| `hooks/sharpen-core.js` | The decision table: pure functions, fully tested |
| `hooks/sharpen-state.js` | The on/off file |
| `hooks/sharpen-statusline.js` | The red `[SHARPEN]` badge |
| `hooks/sharpen-statusline-setup.js` | Puts the badge in your status bar without overwriting yours |

The hooks never block a prompt. On any error they exit quietly, and if stdin never closes (a known Windows quirk) they give up after 3 seconds.

## Tested

- **40 automated tests** (`npm test`, Node's built-in runner, zero dependencies): toggles, prefixes, case and whitespace, look-alike commands, corrupt state files, bad hook input, hooks that hang, and a status line setup that never overwrites yours.
- **A live eval** on a real Tauri + React + Firebase codebase: 12 prompts (5 vague, 5 clear, plus `raw:` and `sharpen:`). **12/12 pass** after one tuning round. Clear prompts ran directly. Vague ones got options that named real files and the project's own agents. See [`tests/eval/prompts.md`](tests/eval/prompts.md), and re-run it yourself with [`tests/eval/run.sh`](tests/eval/run.sh).

## FAQ

**Won't this slow me down?**
Only when your prompt is truly ambiguous, which is exactly when a wrong guess would slow you down more. Clear prompts go straight through, and so do vague prompts with one obvious meaning (with a `Running as:` line so you can see what it understood).

**Does it cost extra tokens?**
A little. The method (~4 KB) is loaded once per session, plus one short line per prompt. When it does ask, it saves you the turn a wrong guess would have cost.

**What if none of the options is right?**
Pick **Run as typed**, or type your own answer. Claude Code always offers a free-text choice.

**What if I want it to stay out of the way for one prompt?**
Start the prompt with `raw:`.

**What if a prompt is clear but I still want it polished?**
Start it with `sharpen:`, and you'll get options even when Sharpen is off.

**Does it work in Codex, Gemini CLI, Copilot CLI, Cursor…?**
Not yet. Claude Code comes first. Support for other agents is planned, and will reuse the same `SKILL.md`. Sharpen will only ship to agents that let a plugin run on every prompt, so that `/sharpen off` really turns it off.

**Why "sharpen"?**
A blunt prompt still cuts, just not where you meant.

## Develop

```bash
git clone https://github.com/ardfaiyaz/sharpen
cd sharpen
npm test
```

Try your local copy without installing it:

```bash
claude --plugin-dir /path/to/sharpen
```

The design and plan live in [`docs/superpowers/`](docs/superpowers/). Issues and PRs are welcome. If you change `SKILL.md`, run the eval before and after.

## License

[MIT](LICENSE)
