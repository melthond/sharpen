---
name: sharpen-help
description: >
  Quick reference for Sharpen: what it does, the three outcomes, every command
  and prefix, the companion skills, the status badge, and where its files live.
  One-shot display. Use for /sharpen:sharpen-help, "sharpen help", "how do I
  use sharpen", "what can sharpen do", "sharpen commands".
---

Show the reference card below. Before showing it, read `~/.config/sharpen/state.json` and fill in the status line: `on` when the file says `"on": true`, otherwise `off` (a missing or unreadable file means off). Change nothing else, add no commentary before the card, and answer any follow-up question from this card.

If the user asked about one thing ("how do I turn it off?"), answer that in one or two lines, quoting the row from the card, instead of showing the whole card.

---

**Sharpen**: turns a vague prompt into the one you meant. Right now it's **<on|off>**.

**What it does with each prompt (while on)**

| Your prompt | What happens |
|---|---|
| Already clear: says what and where | `Clear prompt, running as typed.` Then it runs. |
| Vague, one sensible meaning | `Running as: <what it understood>`. Then it runs. Press Esc to correct it. |
| Ambiguous: readings lead to different work | **Which did you mean?** 2–3 options plus **Run as typed**. Each option is a full engineered prompt. Its preview shows every line. |

The options use your conversation, your code (real paths only), and the skills, agents and MCP tools you have installed. They're named on a `Use:` line.

**Commands**

| Type | What it does |
|---|---|
| `/sharpen on` | Turn it on. Remembered across sessions. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on. |
| `raw: <prompt>` | Skip Sharpen for this one prompt. |
| `sharpen: <prompt>` | Always get options for this prompt, even if it's clear or Sharpen is off. |

`/sharpen:sharpen on` and `/sharpen:sharpen off` work too. Other slash commands are never touched.

**Companion skills** (these work whether Sharpen is on or off)

| Skill | What it does |
|---|---|
| `/sharpen:sharpen-prompt <prompt>` | Writes the engineered prompt and **hands it back without running it**. Say "for ChatGPT" or "for a ticket" to get a version that stands on its own. |
| `/sharpen:sharpen-review` | Coaches your recent prompts in this session: what each one left out, and the sharper version. |
| `/sharpen:sharpen-audit` | Checks this project for what Sharpen can't see (test commands, conventions, where things live), and suggests what to write down. |
| `/sharpen:sharpen-help` | This card. |

**Status badge**

A red `[SHARPEN]` badge shows in the status bar while it's on. If you had no status line, `/sharpen on` added one. If you already had one, Sharpen left it alone and offered once to add the badge next to it.

**Files**

| Path | What it is |
|---|---|
| `~/.config/sharpen/state.json` | On or off |
| `~/.config/sharpen/sharpen-statusline.js` | The badge script, kept outside the plugin folder so updates don't break it |
| `~/.claude/settings.json` | Only edited to add the badge when you had no status line |

Nothing leaves your machine: no network calls, no telemetry, and your prompts are never logged.

More: https://github.com/ardfaiyaz/sharpen

---

Shows the card, changes nothing.
