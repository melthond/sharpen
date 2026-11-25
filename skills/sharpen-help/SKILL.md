---
name: sharpen-help
description: >
  Quick reference for Sharpen: what it does, the three outcomes, commands and
  prefixes, companion skills, status details, and where its files live.
  One-shot display. Use for /sharpen:sharpen-help, $sharpen-help, "sharpen help", "how do I
  use sharpen", "what can sharpen do", "sharpen commands".
---

Show the reference card below. Before showing it, read `~/.config/sharpen/state.json` and fill in the status line: `on` when the file says `"on": true`, otherwise `off` (a missing or unreadable file means off). Change nothing else, add no commentary before the card, and answer any follow-up question from this card.

If the user asked about one thing ("how do I turn it off?"), answer that in one or two lines, quoting the row from the card, instead of showing the whole card.

---

**Sharpen**: turns a vague prompt into the one you meant. Right now it's **<on|off>**.

**What it does with each prompt (while on)**

| Your prompt | What happens |
|---|---|
| Already clear: says what and where | `Sharpened prompt (clear):` keeps your request intact and adds context (where, constraints, tools, how to check). Then the review card. |
| Vague, one sensible meaning | `Sharpened prompt (fill-in):`, the full version built from your conversation and code. Then the review card. |
| Ambiguous: readings lead to different work | **Which did you mean?** 2–3 options plus **Run as typed**. Each option is a full engineered prompt; picking one sends it. |

**The review card:** nothing runs until you answer it.
- **Send it:** Claude works on exactly the engineered prompt.
- **Run my original:** Claude works on what you typed.
- **Type your changes:** you get an updated card.

The engineered prompt is also **on your clipboard**. Press Esc, paste it with Ctrl+V (⌘V on a Mac), edit it and send it. A pasted prompt isn't sharpened again.

In Codex, the local review tool presents the prompt and choices through Codex's native input UI when the host supports MCP form elicitation. If it is unavailable, Sharpen falls back to numbered choices in the conversation. Choose **Send it** or an interpretation to continue, **Run my original** to continue unchanged, or select **Edit the prompt** and enter a correction. Codex companion skills are invoked as `$sharpen-prompt`, `$sharpen-plan`, and so on. Clipboard copying, prompt statistics, and the status badge are Claude-only.

Every prompt is built from your conversation (`Decided:`), your code (real paths only), the skills, agents and MCP tools you have installed (`Tools:`), and the hooks that will run during the work (`Hooks:`).

**Commands**

| Type | What it does |
|---|---|
| `/sharpen on` | Turn it on. Remembered across sessions. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on, plus how many sharpened prompts needed a follow-up correction (counted locally). |
| `raw: <prompt>` | Skip Sharpen for this one prompt. |
| `sharpen: <prompt>` | Always get options for this prompt, even if it's clear or Sharpen is off. |

`/sharpen:sharpen on` and `/sharpen:sharpen off` work too. Other slash commands are never touched, and a bare `continue`, `yes` or `ok` just carries on.

**Companion skills** (these work whether Sharpen is on or off)

| Skill | What it does |
|---|---|
| `/sharpen:sharpen-prompt <prompt>` | Writes the engineered prompt and **hands it back without running it**. Say "for ChatGPT" or "for a ticket" to get a version that stands on its own. |
| `/sharpen:sharpen-review` | Coaches your recent prompts in this session: what each one left out, and the sharper version. |
| `/sharpen:sharpen-audit` | Checks this project for what Sharpen can't see (test commands, conventions, where things live), and suggests what to write down. |
| `/sharpen:sharpen-handoff` | Turns this conversation into one starting prompt for a fresh session: goal, decisions, what's done, what failed, what's next. Copy it, `/clear`, paste. |
| `/sharpen:sharpen-split <request>` | Splits a big request into small ordered prompts, grouped into waves that can run in parallel. |
| `/sharpen:sharpen-save [name]` | Saves a prompt you keep typing as a project slash command, after showing you the file. |
| `/sharpen:sharpen-interview <feature>` | Asks one question at a time about a fuzzy feature, then writes `SPEC.md`. |
| `/sharpen:sharpen-plan <project or feature>` | Builds the phase chain (kickoff, spec, plan, tasks, build prompt), sized to the work, and writes the files only after you approve. |
| `/sharpen:sharpen-decompile <prompt>` | Breaks down, adapts (for another tool), simplifies or splits a prompt you already have. |
| `/sharpen:sharpen-help` | This card. |

**Status badge**

A red badge shows in the status bar while Sharpen is on, with what it decided about your latest prompt:

| Badge | Meaning |
|---|---|
| `[SHARPEN - CLEAR - READY]` | Clear prompt; the review card is waiting for you |
| `[SHARPEN - FILL-IN - READY]` | One obvious meaning; the review card is waiting |
| `[SHARPEN - AMBIGUOUS - READY]` | Several meanings; the options are waiting |
| `[SHARPEN - … - SENT]` | You answered the card, and the prompt is running |
| `[SHARPEN - SENT]` | You pasted a sharpened prompt back and sent it |
| `[SHARPEN - RAW]` | You used `raw:` |
| `[SHARPEN]` | Nothing to show yet, or a slash command |

If you had no status line, `/sharpen on` added one. If you already had one, Sharpen left it alone and offered once to add the badge next to it.

**Files**

| Path | What it is |
|---|---|
| `~/.config/sharpen/state.json` | On or off |
| `~/.config/sharpen/last-sharpened.txt` | The last engineered prompt, so a pasted copy isn't sharpened again |
| `~/.config/sharpen/stats.json` | Two counts: cards shown and follow-ups that pushed back. No prompt text |
| `~/.config/sharpen/card-pending` | Empty marker so only the prompt right after a card is checked for pushback |
| `~/.config/sharpen/sharpen-statusline.js` | The badge script, kept outside the plugin folder so updates don't break it |
| `~/.claude/settings.json` | Only edited to add the badge when you had no status line |

Nothing leaves your machine: no network calls, no telemetry, and your prompts are never logged.

More: https://sharpen-site.vercel.app/docs/ · https://github.com/melthond/sharpen

---

Shows the card, changes nothing.
