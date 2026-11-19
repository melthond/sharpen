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

**Sharpen is a toggle.** Turn it on, and every prompt you send is read against four things before any work starts:

1. **Your conversation so far:** files, decisions and errors you've already discussed. Earlier decisions are carried forward on a `Decided:` line.
2. **Your codebase:** the real file paths, function names and check commands.
3. **Your tools:** the skills, agents, subagents, MCP servers and plugin commands you have installed. They're named in a `Tools:` plan, in the order to use them.
4. **Your hooks:** the hooks that run automatically, from your settings and plugins. Claude can't see these on its own, so Sharpen reads them for it. Any that will affect the work go on a `Hooks:` line.

Then Sharpen hands you the engineered prompt on a **review card**, and nothing runs until you send it:

```
> fix the clipboard so it clears after 30 seconds

Sharpened prompt (fill-in):
  Change the clipboard clear for copied keys from 60 to 30 seconds.
  Where: apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)
  Also update: generate.tsx:181 (hint text), clipboard.test.ts, PRD FR-19
  Keep: the "leave it alone if something else was copied" rule
  Tools: systematic-debugging skill → tauri-v2 skill
  Hooks: dead-code-check runs after every edit
  Check: npx vitest run apps/admin/src/lib/clipboard.test.ts passes

  Send this sharpened prompt?
  ❯ Send it (Recommended)       ← one click, and Claude works on exactly this
    Run my original
    [type your changes]         ← e.g. "make it 15 seconds", and you get an updated card
```

**It's also on your clipboard.** The moment the card appears, Sharpen copies the engineered prompt. To edit it word by word, press Esc, paste it with **Ctrl+V** (⌘V on a Mac), change anything, and press Enter. Sharpen recognizes the pasted prompt, so it won't sharpen it again.

That example is a real run on a real codebase. Every prompt gets one of three treatments:

| Your prompt | What Sharpen does |
|---|---|
| **Already clear:** `rename getUser to fetchUser in src/api.ts` | `Sharpened prompt (clear):` keeps your request intact, adds only context (where, constraints, tools, how to check), then shows the card. |
| **Vague, but only one sensible meaning:** `now add tests for it` | `Sharpened prompt (fill-in):` is the full version built from your conversation and code, then the card. |
| **Ambiguous:** `fix the login thing` | **Which did you mean?** 2–3 clickable options, each a fully engineered prompt in its preview, plus **Run as typed**. Picking one sends it. |

**Why a card, and not your prompt replaced in place?** Claude Code doesn't let a plugin rewrite your message, fill the input box, or send a message as you. Its hook docs say so. The card plus the clipboard is the closest you can get. You always see the engineered prompt first, and you decide whether it runs.

**The rule was never "ask more questions."** The rule is: never act on a guess when two guesses lead to different work, and show the engineered prompt before anything runs. Most prompts take one click.

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
your prompt ──► gate ──┬── clear ─────► gather ──► engineer ──► review card ──┐
                       ├── fill-in ───► gather ──► engineer ──► review card ──┼──► you send ──► it runs
                       └── ambiguous ─► gather ──► 2–3 options ───────────────┘
                                                        (copied to your clipboard)
```

**1. Gate.** Sharpen decides what kind of prompt it is. It only *asks* when two readings would lead to **different actions**. If every reading ends in the same edit, it writes the one engineered prompt.

**2. Gather, fast.** It checks the conversation first, then does at most a few quick searches of the codebase (a few more, or an `Explore` agent, when a prompt is ambiguous and nothing solid turned up). Then it checks your setup: listed skills, agents, MCP tools and plugin commands, plus a summary of your hooks and enabled plugins that Sharpen builds at session start.

**3. Engineer it for the kind of request.** Sharpen classifies the intent and fills in what that kind of request needs. When a prompt is ambiguous, each option is a different *interpretation*, not the same idea reworded:

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

**4. Fit it to your setup.** Three lines tie the prompt to *your* environment:

| Line | What it carries | Example |
|---|---|---|
| `Decided:` | Earlier decisions from the conversation that still bind | `Decided: keep the counter in pin.ts, no new dependency` |
| `Tools:` | A short plan of which installed tools to use and in what order. It prefers your project's own agents and skills | `Tools: Explore agent to find every caller → systematic-debugging skill → test-automator agent` |
| `Hooks:` | Hooks that will run during the work and change how to do it. They're constraints, never called | `Hooks: dead-code-check runs after every edit, so remove unused code as you go` |

Sharpen only names tools and hooks that actually exist in your setup. It never invents files, paths, tools or hooks; if it couldn't find something, the prompt says `(not found)`. Before showing the prompt it checks it: your meaning is unchanged, there's a finish line, the scope is stated, and there's no filler.

**5. Review card, then run.** The engineered prompt appears on a clickable card (**Send it**, **Run my original**, or type your changes) and on your clipboard. Nothing runs until you answer. Sharpen never sharpens the same request twice, including a prompt you pasted back.

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
| `[SHARPEN - CLEAR - READY]` | Your prompt was clear; the review card is waiting for you |
| `[SHARPEN - FILL-IN - READY]` | It had one obvious meaning; the review card is waiting |
| `[SHARPEN - AMBIGUOUS - READY]` | It had several meanings; the options are waiting |
| `[SHARPEN - … - SENT]` | You answered the card, and the prompt is running |
| `[SHARPEN - SENT]` | You pasted a sharpened prompt back and sent it |
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
- **Your settings are read, not changed.** To summarize your hooks, Sharpen reads your `settings.json` files and the hook files of your enabled plugins. It only keeps each hook's event and script *name*, never its arguments, which can hold tokens. The summary goes into Claude's context and nowhere else.
- **Your clipboard is used.** When a review card appears, the engineered prompt replaces what's on your clipboard.
- **Files written:** `~/.config/sharpen/state.json` (`{ "on": true }` or `false`), `last-sharpened.txt` (the last engineered prompt, so a pasted copy isn't sharpened twice), and a copy of the badge script. `~/.claude/settings.json` is only edited to add the badge when you have no status line yet.

## The prompt

Sharpen is one prompt: [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md), about 6 KB. The companion skills sit next to it in [`skills/`](skills/). Everything else in this repo exists to load the method at the right moment:

| File | Job |
|---|---|
| `hooks/sharpen-prompt.js` | `UserPromptSubmit` hook: handles `/sharpen on\|off` and adds one short line next to each prompt while Sharpen is on |
| `hooks/sharpen-session.js` | `SessionStart` hook: loads the method when Sharpen is on |
| `hooks/sharpen-core.js` | The decision table: pure functions, fully tested |
| `hooks/sharpen-state.js` | The on/off file |
| `hooks/sharpen-statusline.js` | The red badge, with the verdict read from the transcript |
| `hooks/sharpen-statusline-setup.js` | Puts the badge in your status bar without overwriting yours |
| `hooks/sharpen-env.js` | The setup summary: your hooks (names only) and enabled plugins, for Claude to see |
| `hooks/sharpen-clipboard.js` | `PreToolUse` hook on the review card: copies the engineered prompt to your clipboard |

The hooks never block a prompt. On any error they exit quietly, and if stdin never closes (a known Windows quirk) they give up after 3 seconds.

## Tested

- **90 automated tests** (`npm test`, Node's built-in runner, zero dependencies): toggles, prefixes, case and whitespace, look-alike commands, corrupt state files, bad hook input, hooks that hang, a status line setup that never overwrites yours, and the companion skills (each names its trigger, stays small enough to load, and the review and audit stay read-only).
- **A live eval** on a real Tauri + React + Firebase codebase: 12 prompts (5 vague, 5 clear, plus `raw:` and `sharpen:`). **12/12 pass** after one tuning round. Clear prompts ran directly. Vague ones got options that named real files and the project's own agents. See [`tests/eval/prompts.md`](tests/eval/prompts.md), and re-run it yourself with [`tests/eval/run.sh`](tests/eval/run.sh).

## FAQ

**Won't this slow me down?**
By one click per prompt: **Send it**. In exchange, you see exactly what will run before it runs, and a wrong guess costs you one look instead of a wrong change. For a prompt you're sure about, start it with `raw:` and it runs as typed.

**Can it put the engineered prompt straight into my input box, or send it for me?**
Not in Claude Code today. Its hook docs say a plugin can't replace your prompt, fill the input box, or send a message as you. So Sharpen shows the prompt on a card with **Send it**, and copies it to your clipboard so you can paste and edit it. That's as close as Claude Code allows.

**Does it cost extra tokens?**
A little. The method (~6 KB) and your setup summary are loaded once per session, plus one short line per prompt. Each reply starts with the engineered prompt. In return, the work starts from a prompt with the right files, tools and finish line, which usually saves the turn a vague prompt would have cost.

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
