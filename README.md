<h1 align="center">Sharpen</h1>

<p align="center">
  <em>You type “fix the login thing.” It knows which one.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/ardfaiyaz/sharpen?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/v/release/ardfaiyaz/sharpen?style=flat-square&color=111111&label=release" alt="Release">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code-111111?style=flat-square" alt="Works with Claude Code">
  <img src="https://img.shields.io/badge/dependencies-0-111111?style=flat-square" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/telemetry-none-111111?style=flat-square" alt="No telemetry">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <img src="assets/hero.svg" width="880" alt="You type 'fix the login thing'. Sharpen reads your conversation, code, tools and hooks, and shows the engineered prompt on a review card with Send it and Run my original. It is also copied to your clipboard.">
</p>

<p align="center">
  <strong>Every plain prompt becomes the prompt you meant.</strong><br>
  <strong>Your conversation · your code · your skills, agents, MCP servers and hooks: all in the prompt.</strong><br>
  <strong>And nothing runs until you press Send.</strong><br>
  <sub>12 of 12 test prompts passed in live runs on a real Tauri + React + Firebase codebase, plus spot checks on every release since. 90 automated tests, zero dependencies, nothing leaves your machine. <a href="#numbers">Details</a>.</sub>
</p>

---

You know her. The colleague who never starts the wrong thing. You walk over and say "can you fix the login thing?" She doesn't open an editor. She says: *"The PIN lockout from this morning, or the Google sign-in that's been open since Tuesday?"* One question, and the right one. Then she writes it down properly, with the file, the test and the tools to use, and hands it back for you to sign off.

Sharpen puts her inside your AI agent.

## Numbers

Sharpen was tested on a real codebase, with editing blocked so nothing could change. The prompts went through `claude -p` with the plugin loaded, and every answer was read by hand:

| Prompt type | Prompts | Result |
|---|---|---|
| Clear (`explain what apps/admin/src/api/client.ts exports`) | 5 | 5/5 recognized as clear, with the request left as asked |
| Vague (`make it faster`, `clean this up`, `it's broken again`…) | 5 | 5/5 got options naming real files and the project's own agents |
| `raw:` and `sharpen:` prefixes | 2 | 2/2 after one tuning round |

That full set ran on the first release. Later releases were spot-checked live on the same codebase. Those runs showed `Tools:` and `Hooks:` lines drawn from the real setup, and Claude waiting for the card instead of editing.

What the results don't show: Sharpen's options name things only the codebase knows. For example, *"the 60 s comes from FR-19 in the PRD, so changing it is a spec change"*, or *"leave G1 alone, it's a different 60 seconds"*. A generic prompt rewriter can't do that, because it never reads the code. The full set and how to re-run it: [`tests/eval/prompts.md`](tests/eval/prompts.md).

**The rule was never "ask more questions."** It is: never act on a guess when two guesses lead to different work, and always show the engineered prompt before anything runs. Most prompts take one click.

## Before / after

You type:

```
fix the clipboard so it clears after 30 seconds
```

**Without Sharpen,** the agent starts from those ten words. Whether it also finds the test, the hint on screen and the spec that all say 60 depends on what it happens to look at.

**With Sharpen,** this card comes back first (a real run):

```
Sharpened prompt (fill-in):
  Change the clipboard clear for copied keys from 60 to 30 seconds.
  Where: apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)
  Also update: generate.tsx:181 (hint text), clipboard.test.ts, PRD FR-19 (:269), checklist US-020
  Keep: the "leave it alone if something else was copied" rule
  Hooks: dead-code-check runs after every edit
  Check: npx vitest run apps/admin/src/lib/clipboard.test.ts passes

  ❯ Send it (Recommended)      Run my original      [type your changes]
```

One click, and the agent works on *that*.

## How it works

<p align="center">
  <img src="assets/gate.svg" width="880" alt="The gate sorts each prompt three ways. Clear: Sharpen only adds context. Fill-in: it fills the gaps from the conversation and code. Ambiguous: it asks which you meant, with 2 to 3 options plus Run as typed.">
</p>

**1. Gate.** Sharpen decides what kind of prompt it is. It only asks *which one* when two readings would lead to different work. If every reading ends in the same edit, it writes the one engineered prompt.

<p align="center">
  <img src="assets/how-it-works.svg" width="880" alt="Four inputs feed the engineered prompt: the conversation gives Decided, the codebase gives Where, your installed tools give Tools, and your hooks give Hooks. The prompt goes to a review card: Send it, Run my original, or your changes for an updated card. It is also copied to the clipboard.">
</p>

**2. Gather, fast.** It checks the conversation first, then does a few quick searches of the code: at most 3, or 6 when a prompt is ambiguous and nothing solid turned up. Then it checks your setup: the skills, agents, MCP tools and plugin commands Claude Code lists, plus a summary of **your hooks and enabled plugins** that Sharpen builds at session start. Claude can't see your hooks on its own.

**3. Engineer it.** Sharpen classifies the intent and fills in what that kind of request needs:

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
| `Tools:` | Which installed tools to use, in order. Your project's own agents and skills come first | `Tools: Explore agent to find every caller → systematic-debugging skill → test-automator agent` |
| `Hooks:` | Hooks that will run during the work and change how to do it. They're constraints, never called | `Hooks: dead-code-check runs after every edit, so remove unused code as you go` |

Before showing the prompt, Sharpen checks that your meaning is unchanged, there's a finish line, the scope is stated, every name is real, and there's no filler. Anything it couldn't find says `(not found)`. It never guesses.

**5. Review card, then run.** The engineered prompt appears on a clickable card, and nothing runs until you answer it.

## The review card

| You choose | What happens |
|---|---|
| **Send it** | Claude works on exactly the engineered prompt |
| **Run my original** | Claude works on what you typed, unchanged |
| **Type your changes** ("make it 15 seconds") | You get an updated card |
| **Esc, then Ctrl+V** | The engineered prompt is **already on your clipboard**. Paste it, edit any word, and send it. Sharpen won't sharpen it again |

**Why not swap your prompt in place, or type it into the input box for you?** Claude Code doesn't allow it. Its hook docs say a plugin can't replace your prompt, fill the input box, or send a message as you. The card plus the clipboard is the closest you can get. You always see the engineered prompt first, and you decide whether it runs.

## Skills

Sharpen comes with eight companion skills. They work whether Sharpen is on or off.

| Skill | What it does |
|---|---|
| **`/sharpen:sharpen-prompt <prompt>`** | Writes the engineered prompt and **hands it back without running it**. Say "for ChatGPT" or "for a ticket", and you get a version that stands on its own. |
| **`/sharpen:sharpen-review`** | Coaches **your** prompting: what each recent prompt left out, what that cost, the sharper version, and the one habit that would help most. |
| **`/sharpen:sharpen-audit`** | Finds what an agent can't see from your code: missing test commands, unwritten rules, which folder owns what. Ranked, with paste-ready lines for `CLAUDE.md`. |
| **`/sharpen:sharpen-handoff`** | Turns the whole conversation into **one starting prompt for a fresh session**, including what failed and why. Copy, `/clear`, paste. |
| **`/sharpen:sharpen-split <request>`** | Splits a big request into **small, ordered prompts**, grouped into waves you can run in parallel. Parts that edit the same files never share a wave. |
| **`/sharpen:sharpen-save [name]`** | Turns a prompt you keep typing into a **project slash command**. It shows you the file first and never overwrites. |
| **`/sharpen:sharpen-interview <feature>`** | Asks about a fuzzy feature **one question at a time**, grounded in your code, then writes `SPEC.md`. |
| **`/sharpen:sharpen-help`** | A quick reference card. |

## Status badge

While Sharpen is on, a red badge in Claude Code's status bar shows where your latest prompt stands:

| Badge | Meaning |
|---|---|
| `[SHARPEN - CLEAR - READY]` | Clear prompt; the review card is waiting for you |
| `[SHARPEN - FILL-IN - READY]` | One obvious meaning; the review card is waiting |
| `[SHARPEN - AMBIGUOUS - READY]` | Several meanings; the options are waiting |
| `[SHARPEN - … - SENT]` | You answered the card, and the prompt is running |
| `[SHARPEN - SENT]` | You pasted a sharpened prompt back and sent it |
| `[SHARPEN - RAW]` | You skipped Sharpen with `raw:` |

The badge reads the end of the session's own transcript, which Claude Code hands to the status line, so it costs no tokens and stores nothing. It sets itself up on your first `/sharpen on`. If you already have a status line, it **never overwrites it**: Claude offers once to chain the badge after yours.

## The prompt

Sharpen is one prompt: [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md). Everything else in this repo exists to load it at the right moment, with the right context:

| File | Job |
|---|---|
| `hooks/sharpen-prompt.js` | `UserPromptSubmit`: handles `/sharpen on\|off`, recognizes pasted prompts, and reminds Claude of the step on every prompt |
| `hooks/sharpen-session.js` | `SessionStart`: loads the method and your setup summary |
| `hooks/sharpen-env.js` | The setup summary: your hooks (names only) and enabled plugins |
| `hooks/sharpen-clipboard.js` | `PreToolUse` on the review card: copies the engineered prompt to your clipboard |
| `hooks/sharpen-core.js` | The decision table: pure functions, fully tested |
| `hooks/sharpen-statusline.js` | The red badge, with the verdict read from the transcript |

The hooks never block a prompt. On any error they exit quietly, and if stdin never closes (a known Windows quirk) they give up after 3 seconds.

## Install

**Claude Code**, as two separate prompts:

```
/plugin marketplace add ardfaiyaz/sharpen
```
```
/plugin install sharpen@sharpen
```

Restart Claude Code, then:

```
/sharpen on
```

That was it. Send it a vague prompt and watch.

Sharpen is **off by default**, and stays on or off across sessions until you change it. Only install it from `ardfaiyaz/sharpen` on GitHub. It's plain JavaScript and Markdown with zero dependencies, and it never ships binaries. A copy that does isn't the real one.

## Commands

| Command | What it does |
|---|---|
| `/sharpen on` | Turn Sharpen on. Every prompt gets an engineered version on a review card. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on. |
| `raw: <prompt>` | Skip Sharpen for this one prompt. |
| `sharpen: <prompt>` | Always get options for this prompt, even if it's clear or Sharpen is off. |

Other slash commands are never touched. `/sharpen:sharpen on` works too.

## Privacy

- **Nothing leaves your machine.** No API calls, no telemetry, no webhooks. The thinking is done by the agent you're already using.
- **Your prompts are never logged.** The hooks read the prompt, decide, and exit.
- **Your settings are read, never changed.** The hook summary keeps only each hook's event and script *name*, never its arguments, which can hold tokens.
- **Your clipboard is used.** When a review card appears, the engineered prompt replaces what's on your clipboard.
- **Files written:** `~/.config/sharpen/state.json`, `last-sharpened.txt` (so a pasted copy isn't sharpened twice), and the badge script. `~/.claude/settings.json` is only edited to add the badge when you have no status line yet.

## FAQ

**Won't this slow me down?**
By one click per prompt: **Send it**. In exchange, you see exactly what will run before it runs, and a wrong guess costs you one look instead of a wrong change. For a prompt you're sure about, start it with `raw:`.

**Does it cost extra tokens?**
A little. The method (~6 KB) and your setup summary load once per session, plus one short line per prompt. In return, the work starts from a prompt with the right files, tools and finish line, which usually saves the turn a vague prompt would have cost.

**Doesn't rewriting a clear prompt make it worse?**
It can, when the rewrite changes what you asked for. That's why, for a clear prompt, Sharpen only *adds* context and never rewords your request.

**Does it know my skills, agents, MCP servers and hooks?**
Skills, agents, MCP tools and plugin commands: yes, from what Claude Code lists. Hooks: yes, because Sharpen reads them from your settings and plugins at session start. Claude can't see them otherwise.

**Does it work in Codex, Gemini CLI, Copilot CLI, Cursor…?**
Not yet. Claude Code comes first. Other agents will reuse the same `SKILL.md`, and only agents that let a plugin run on every prompt will get it, so `/sharpen off` really turns it off.

**Can it read my mind?**
No. It reads your conversation, which is the next best thing, and more reliable.

**Why "sharpen"?**
A blunt prompt still cuts, just not where you meant.

## Contributing

Bug fixes are welcome. A change to the method needs an eval that compares no Sharpen, `main` and your branch, because a harmless-looking rewording can make Sharpen worse. Everything is in **[CONTRIBUTING.md](CONTRIBUTING.md)**.

```bash
git clone https://github.com/ardfaiyaz/sharpen
cd sharpen
npm test                 # 90 tests, zero dependencies
claude --plugin-dir .    # try your checkout without installing it
```

The design, plan and research live in [`docs/`](docs/).

## License

[MIT](LICENSE.md). Sharp, short, and yours to use.

The diagrams use the hand-drawn xkcd Script font, which has its own license: see [`assets/fonts/LICENSE.md`](assets/fonts/LICENSE.md).

## Star History

<a href="https://www.star-history.com/#ardfaiyaz/sharpen&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ardfaiyaz/sharpen&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ardfaiyaz/sharpen&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ardfaiyaz/sharpen&type=Date" />
 </picture>
</a>
