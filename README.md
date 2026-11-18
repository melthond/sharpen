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

You know her. The colleague who never starts the wrong thing. You walk over and say "can you fix the login thing?" She doesn't open an editor. She says: *"The PIN lockout from this morning, or the Google sign-in that's been open since Tuesday?"* One question, and the right one. Then she's gone, and it's done.

Sharpen puts her inside your AI agent.

Every prompt you send an agent is plain text, and the agent has to guess what you meant. When it guesses wrong, you lose a turn, or worse, you get the wrong change.

**Sharpen is a toggle.** Turn it on, and before Claude acts on a prompt, it reads that prompt against three things:

1. **Your conversation so far:** the files, decisions and errors you've already discussed.
2. **Your codebase:** the real file paths and function names.
3. **Your setup:** the skills, agents, subagents, MCP tools and plugin commands you have installed.

Then **you see the engineered prompt**, and Claude works from that, not from the plain one you typed:

```
> explain the clipboard helper

Sharpened prompt (fill-in):
> Explain the clipboard helper in the admin app, apps/admin/src/lib/clipboard.ts.
> Cover each export, the timed clear, the edge cases, and why it was built this way.
> Mention where it's used (generate.tsx, renewals.tsx) and what clipboard.test.ts covers.
> Read only. No edits.

[Claude now answers exactly that]
```

That's a real run on a real codebase. Every prompt gets one of three treatments:

| Your prompt | What Sharpen does |
|---|---|
| **Already clear:** `rename getUser to fetchUser in src/api.ts` | Shows `Sharpened prompt (clear):`. Your request is kept intact, with only context added (where, constraints, how to check). Then it runs. |
| **Vague, but only one sensible meaning:** `now add tests for it` | Shows `Sharpened prompt (fill-in):`, the full version built from your conversation and code. Then it runs. |
| **Ambiguous:** `fix the login thing` | Asks **Which did you mean?**, with 2–3 clickable options. Each option is a fully engineered prompt. **Run as typed** is always available. |

Claude Code doesn't let a plugin swap the message you sent, so Sharpen does the next best thing. The very first thing in Claude's reply is the engineered prompt, and everything after it follows that prompt. You always see what it understood, and you can press Esc the moment it's wrong.

**The rule was never "ask more questions."** The rule is: never act on a guess when two guesses lead to different work, and never ask when they don't. The questions are rare because they're needed, not just to look careful.

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
your prompt ──► gate ──┬── clear ─────► gather ──► "Sharpened prompt (clear)" ────► run it
                       ├── fill-in ───► gather ──► "Sharpened prompt (fill-in)" ──► run it
                       └── ambiguous ─► gather ──► 2–3 options ──► you pick ──────► run it
```

**1. Gate.** Sharpen decides what kind of prompt it is. It only *asks* when two readings would lead to **different actions**. If every reading ends in the same edit, it writes out the engineered prompt and goes.

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

- **Rewriting prompts that are already clear can make results *worse*.** That's why a clear prompt is only ever added to, never reworded.
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

Only install Sharpen from `ardfaiyaz/sharpen` on GitHub. It's plain JavaScript and Markdown with zero dependencies, and it never ships binaries. A copy that does isn't the real one.

## Commands

| Command | What it does |
|---|---|
| `/sharpen on` | Turn Sharpen on. Every prompt shows its engineered version before Claude acts. Remembered across sessions. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on. |
| `raw: <prompt>` | Skip Sharpen for this one prompt. |
| `sharpen: <prompt>` | Always get options for this prompt, even when it's clear or Sharpen is off. |

Other slash commands are never touched. `/sharpen:sharpen on` works too.

## Skills

Sharpen ships with eight companion skills. They work whether Sharpen is on or off.

| Skill | What it does |
|---|---|
| **`/sharpen:sharpen-prompt <prompt>`** | Writes the engineered prompt and **hands it back without running it**, in a code block ready to copy. Say "for ChatGPT" or "for a ticket", and you get a version that stands on its own: no repo paths, with the needed context spelled out. |
| **`/sharpen:sharpen-review`** | Coaches **your** prompting. It looks at your recent prompts in this session, shows what each one left out and what that cost (an extra question, a redo), gives the sharper version, and ends with the one habit that would help most. |
| **`/sharpen:sharpen-audit`** | Audits the project for what an agent can't see from the code: missing test commands, unwritten conventions, which folder owns what, stale instructions, and installed tools nobody mentions. Ranked, with paste-ready lines for `CLAUDE.md`. Better notes mean sharper options. |
| **`/sharpen:sharpen-handoff`** | Turns the whole conversation into **one starting prompt for a fresh session**: goal, decisions, what's done, what failed and why, what's next, and how to check. Copy it, run `/clear`, paste. The "what failed" part stops the new session repeating dead ends. |
| **`/sharpen:sharpen-split <request>`** | Splits a big multi-part request into **small, ordered, self-contained prompts**, each with its own finish line. They're grouped into waves you can run in parallel (separate agents or worktrees), and two parts that edit the same files never share a wave. |
| **`/sharpen:sharpen-save [name]`** | Turns a prompt you keep typing into a **project slash command** (`.claude/skills/<name>/`). The parts that change become arguments. It shows you the file and only writes it after you say yes. It never overwrites. |
| **`/sharpen:sharpen-interview <feature>`** | For a fuzzy feature: **one question at a time**, with clickable options and a recommended pick, grounded in your code. Then it writes `SPEC.md` with every decision marked as yours or its own call. |
| **`/sharpen:sharpen-help`** | A quick reference card: the three outcomes, every command, the skills, the badge words, and the files. |

`sharpen-prompt` reads the same method as the toggle (`skills/sharpen/SKILL.md`) instead of keeping its own copy, so there's one source of truth. So does `sharpen-split`. The review and the audit only report. `sharpen-save` and `sharpen-interview` each write one file: `save` only after you approve it, `interview` only at the end, and neither ever overwrites.

## Status badge

While Sharpen is on, a red badge shows in Claude Code's status bar with **what Sharpen decided about your latest prompt**:

| Badge | Meaning |
|---|---|
| `[SHARPEN - CLEAR]` | Your prompt was clear: it showed `Sharpened prompt (clear):` and ran that |
| `[SHARPEN - FILL-IN]` | It had one obvious meaning: it showed `Sharpened prompt (fill-in):` and ran that |
| `[SHARPEN - ASKING]` | It was ambiguous, and the options are waiting for you |
| `[SHARPEN - SHARPENED]` | You picked an option, and the engineered prompt is running |
| `[SHARPEN - RAW]` | You skipped Sharpen with `raw:` |
| `[SHARPEN]` | Nothing to show yet, or a slash command |

The badge reads the end of the session's own transcript, which Claude Code hands to the status line, and looks for Sharpen's first line. That costs no extra tokens or tool calls, and nothing is stored. It disappears when you turn Sharpen off.

It sets itself up the first time you run `/sharpen on`:

- **No status line yet:** Sharpen adds one to `~/.claude/settings.json` automatically.
- **You already have one,** say from another plugin: Sharpen **never overwrites it**. Claude offers, once, to chain the badge after yours:

  ```
  your-statusline-command; node "~/.config/sharpen/sharpen-statusline.js"
  ```

The badge script is copied to `~/.config/sharpen/`, outside the plugin folder that Claude Code replaces on every update, so the badge keeps working across updates.

## Privacy

- **Nothing leaves your machine.** No API calls, no telemetry, no webhooks. The thinking is done by the agent you're already using.
- **Your prompts are never logged.** The hooks read the prompt, decide, and exit.
- **Files written:** `~/.config/sharpen/state.json` (`{ "on": true }` or `false`) and a copy of the badge script. `~/.claude/settings.json` is only edited to add the badge when you have no status line yet.

## The prompt

Sharpen is one prompt: [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md), about 4 KB. The companion skills sit next to it in [`skills/`](skills/). Everything else in this repo exists to load the method at the right moment:

| File | Job |
|---|---|
| `hooks/sharpen-prompt.js` | `UserPromptSubmit` hook: handles `/sharpen on\|off` and adds one short line next to each prompt while Sharpen is on |
| `hooks/sharpen-session.js` | `SessionStart` hook: loads the method when Sharpen is on |
| `hooks/sharpen-core.js` | The decision table: pure functions, fully tested |
| `hooks/sharpen-state.js` | The on/off file |
| `hooks/sharpen-statusline.js` | The red badge, with the verdict read from the transcript |
| `hooks/sharpen-statusline-setup.js` | Puts the badge in your status bar without overwriting yours |

The hooks never block a prompt. On any error they exit quietly, and if stdin never closes (a known Windows quirk) they give up after 3 seconds.

## Tested

- **74 automated tests** (`npm test`, Node's built-in runner, zero dependencies): toggles, prefixes, case and whitespace, look-alike commands, corrupt state files, bad hook input, hooks that hang, a status line setup that never overwrites yours, and the companion skills (each names its trigger, stays small enough to load, and the review and audit stay read-only).
- **A live eval** on a real Tauri + React + Firebase codebase: 12 prompts (5 vague, 5 clear, plus `raw:` and `sharpen:`). **12/12 pass** after one tuning round. Clear prompts ran directly. Vague ones got options that named real files and the project's own agents. See [`tests/eval/prompts.md`](tests/eval/prompts.md), and re-run it yourself with [`tests/eval/run.sh`](tests/eval/run.sh).

## FAQ

**Won't this slow me down?**
It only stops to ask when your prompt is truly ambiguous, which is exactly when a wrong guess would slow you down more. Every other prompt runs straight away, with a few lines at the top of the reply showing what it understood.

**Does it cost extra tokens?**
A little. The method (~5 KB) is loaded once per session, plus one short line per prompt. Each reply starts with the 3–7 line engineered prompt. When it does ask, it saves you the turn a wrong guess would have cost.

**Doesn't rewriting a clear prompt make it worse?**
It can, when the rewrite changes what you asked for. That's why, for a clear prompt, Sharpen keeps every part of your request and only *adds* context: where, constraints, how to check. To skip it for one prompt, start it with `raw:`.

**What if none of the options is right?**
Pick **Run as typed**, or type your own answer. Claude Code always offers a free-text choice.

**What if I want it to stay out of the way for one prompt?**
Start the prompt with `raw:`.

**What if a prompt is clear but I still want it polished?**
Start it with `sharpen:`, and you'll get options even when Sharpen is off.

**Does it work in Codex, Gemini CLI, Copilot CLI, Cursor…?**
Not yet. Claude Code comes first. Support for other agents is planned, and will reuse the same `SKILL.md`. Sharpen will only ship to agents that let a plugin run on every prompt, so that `/sharpen off` really turns it off.

**Can it read my mind?**
No. It reads your conversation, which is the next best thing, and more reliable.

**Why "sharpen"?**
A blunt prompt still cuts, just not where you meant.

## Where it doesn't work (yet)

- **`claude -p` and other headless runs:** no clickable options there, so they show up as a numbered list.
- **A brand-new session with nothing said yet:** there's no conversation to read, so the options come from the code alone. They're still concrete, just less sure.
- **Other agents:** see the FAQ.

## Contributing

Bug fixes are welcome. A change to the method needs an eval that compares no Sharpen, `main` and your branch, because a harmless-looking rewording can make Sharpen ask about clear prompts. Everything is in **[CONTRIBUTING.md](CONTRIBUTING.md)**.

```bash
git clone https://github.com/ardfaiyaz/sharpen
cd sharpen
npm test
claude --plugin-dir .   # try your checkout without installing it
```

The design, plan and research live in [`docs/`](docs/).

## License

[MIT](LICENSE.md) © ardfaiyaz
