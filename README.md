# Sharpen

**Turn vague prompts into specific ones, without writing them yourself.**

Turn Sharpen on, and before Claude acts on a prompt it reads the prompt against your **conversation so far**, your **codebase**, and the **skills, agents and MCP tools you have installed**. Then it does one of three things:

| Your prompt | What Sharpen does |
|---|---|
| Already clear: `rename getUser to fetchUser in src/api.ts` | Runs it. `Clear prompt, running as typed.` |
| Vague, but only one sensible meaning: `now add tests for it` | Runs it, and first says what it understood: `Running as: add unit tests for parsePin in src/pin.ts…` |
| Ambiguous: `fix the login thing` | Shows 2–4 clickable options, each a fully engineered prompt, plus **Run as typed** |

### Example

You type `fix the login thing`, and Sharpen asks **Which did you mean?**

```
Fix PIN lockout                         ← preview shows the full prompt:
                                          Symptom: lockout after 1 wrong PIN instead of 5
                                          Where: apps/admin/auth/pin.ts
                                          Reproduce: failing test in pin.test.ts
                                          Use: systematic-debugging skill
                                          Check: npm test -- pin
Investigate login only
Run as typed
```

You pick one, and Claude runs it as if you had typed it.

## Install (Claude Code)

```
/plugin marketplace add OWNER/sharpen
/plugin install sharpen@sharpen
```

Restart Claude Code after installing.

## Use

| Command | Does |
|---|---|
| `/sharpen on` | Turn it on. This is remembered across sessions. |
| `/sharpen off` | Turn it off. |
| `/sharpen` | Show whether it's on. |
| `raw: …` | Skip Sharpen for this one prompt. |
| `sharpen: …` | Always get options for this prompt, even if it's clear or Sharpen is off. |

Other slash commands are never touched.

## Status badge (optional)

Plugins can't set the status line themselves. To show `[SHARPEN]` while it's on, add this to `~/.claude/settings.json`, using the path where the plugin was installed:

```json
"statusLine": { "type": "command", "command": "node /path/to/sharpen/hooks/sharpen-statusline.js" }
```

If you already have a status line, call both from one command, for example `your-statusline; node /path/to/sharpen/hooks/sharpen-statusline.js`.

## How it works

- A `UserPromptSubmit` hook adds one short line next to your prompt while Sharpen is on. A `SessionStart` hook loads the method (`skills/sharpen/SKILL.md`).
- The thinking is done by the agent you're already using. **Nothing leaves your machine**: there are no outside API calls and no telemetry, and the prompt is never logged.
- The state lives in `~/.config/sharpen/state.json`.

Why it works this way, including when to ask and how options are built for each kind of request: [`docs/research/2026-11-19-prompt-architecture.md`](docs/research/2026-11-19-prompt-architecture.md).

## Other agents

Codex, Gemini CLI and GitHub Copilot CLI are planned. They'll reuse the same method file.

## Develop

```
npm test        # node --test, no dependencies
```

MIT licensed.
