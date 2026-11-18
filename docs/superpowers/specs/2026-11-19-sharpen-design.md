# Sharpen — design

*2026-11-19 · working name "sharpen" (placeholder, easy to rename)*

## Intent and why

Developers type plain, often vague prompts into coding agents ("fix the login thing", "make it faster"). The agent guesses what they meant and sometimes guesses wrong, which wastes a turn or produces the wrong change.

Sharpen is a toggle, like Ponytail. While it is on, before the agent acts on a plain prompt it:

1. reads the prompt against the **past conversation** and the **project's codebase**,
2. offers 2–4 **engineered versions** of the prompt as choices ("did you mean…"), each specific (names files, earlier decisions, the goal, what "done" looks like),
3. runs the version the user picks.

It is meant to be published so **other developers** can install it from plugin marketplaces: Claude Code first, then other agents that have a plugin or extension marketplace.

*Decided with the owner:* the main problem is the agent misreading vague prompts. Clear prompts run as typed. A user who wants a clear prompt polished anyway starts it with `sharpen:`.

## Goals

- One command toggles it: `/sharpen on`, `/sharpen off`, `/sharpen` (status). The state survives across sessions.
- It is visible when on (status-bar badge in Claude Code).
- It uses the conversation history and the codebase to make the options concrete.
- **It skips prompts that are already clear and specific** and proceeds directly with one short line ("Clear prompt, running as typed."). Asking on every prompt makes people turn it off.
- Options are short, concrete, and distinct, and always include "Run my prompt as typed". The user can also type their own.
- It is installable by other developers with the platform's standard marketplace commands.

## Non-goals

- Rewriting the prompt text in place before the model reads it. Claude Code hooks cannot do this (see Constraints).
- Calling any outside LLM API or service. The host agent does the thinking.
- Prompt history, analytics, telemetry, or webhooks.
- A GUI or browser extension.

## Anti-goals (failure even if it "works")

- Interrupting clear prompts with a question.
- Generic options ("Do you want it fast or thorough?") that do not use the conversation or the code.
- Long exploration before showing options. Gathering context must be quick: a few greps or reads, not a full codebase tour.
- Sending prompt or code content anywhere outside the agent.

## Constraints

- **Claude Code hooks cannot modify the user's prompt.** A `UserPromptSubmit` hook can only add context or block the prompt. So the hook injects an instruction ("run the sharpen step on this prompt"), and the model does the interpretation.
- **Clickable choices depend on the host.** Claude Code has `AskUserQuestion` (options with previews). Agents without a question tool get a numbered text list and the user replies with a number.
- Hooks run on Windows, macOS, and Linux. Use Node (as Ponytail does) and not bash-only scripts.
- Plugins cannot set the status line themselves. Ship a statusline script and document how to enable it (Ponytail's approach).

## Approaches considered

1. **Claude Code plugin with hooks, a skill, and a toggle command. Chosen.** It is the only approach with real clickable options plus access to the conversation and the codebase. Later it ports to other agents' plugin formats by reusing the same skill text.
2. **A rules or instructions file copied to every agent (Cursor, Cline, Copilot…).** Broad reach, but no toggle and no clickable options in most hosts. Kept as a possible later add-on, not the core.
3. **An MCP server exposing a "refine prompt" tool.** Cross-agent, but the agent decides on its own whether to call it (unreliable), and the server cannot see the chat history unless the agent passes it. Rejected.

The owner picked 1, with the requirement that it also ships to other AIs that have a plugin marketplace.

## Design

### One shared core, thin per-platform wrappers

Follow Ponytail's layout: a single source of truth for the method, plus a small manifest per platform.

```
sharpen/
  skills/sharpen/SKILL.md        # the method (below); shared by every platform
  commands/                      # /sharpen toggle (md for Claude, toml for Gemini)
  hooks/
    hooks.json                   # Claude Code + Codex hook registration
    sharpen-session.js           # SessionStart: if on, inject the method
    sharpen-prompt.js            # UserPromptSubmit: toggle handling + per-prompt nudge
    sharpen-state.js             # read/write the on/off flag
    sharpen-statusline.js        # prints "SHARPEN" when on
  .claude-plugin/plugin.json + marketplace.json
  .codex-plugin/plugin.json      # phase 2
  gemini-extension.json          # phase 2
  .github/plugin/plugin.json     # phase 2 (Copilot CLI)
  tests/
  README.md
```

### State

- One flag file per user: `~/.config/sharpen/state.json` → `{ "on": true }`. Default: off.
- `/sharpen on|off` writes it. `/sharpen` with no argument reports the state.

### Hooks (Claude Code)

- **SessionStart:** if on, inject the full method from `SKILL.md` as additional context.
- **UserPromptSubmit:**
  - If the prompt is a `/sharpen …` command, update the state and let the command run.
  - If off, do nothing.
  - If on, skip when the prompt starts with `/` (other slash commands) or with `raw:` (escape hatch for one prompt). If it starts with `sharpen:`, tell the model to always offer options (skip the clear check), even when sharpen is off. Otherwise add a short line of context telling the model to run the sharpen step on this prompt before acting.
- The hooks never block a prompt, never print the prompt anywhere, and never touch the network.

### The method (SKILL.md)

*Updated after research (`docs/research/2026-11-19-prompt-architecture.md`):* the clear check is now a three-tier gate: clear → run, fill-in → `Running as: …` without asking, ambiguous → options. Each option is one interpretation, built from the slots for its intent type (Bug, Feature, Refactor, Performance, Question, Review, Explore, Ops, Other). The steps below are refined by that doc.

1. **Clear check.** If the prompt already names what to change and where, and there is one sensible reading given the conversation, say "Clear prompt, running as typed." and proceed.
2. **Gather context, quickly.** Use the conversation so far first. Then at most a few quick searches or reads of the project to find the files and names the prompt likely refers to.
3. **Write 2–4 engineered prompts.** Each has a short label (what it means), and a full version that states the goal, the specific files or areas, constraints from earlier in the conversation, and how to tell it is done. The options must differ in *meaning*, not wording.
4. **Ask.** In Claude Code, use `AskUserQuestion`: label = short meaning, preview = the full engineered prompt, plus "Run as typed". Elsewhere, use a numbered list.
5. **Run** the chosen version as if the user had typed it.

### Status badge

`sharpen-statusline.js` prints `SHARPEN` when on. The README shows how to add it to `statusLine` in settings, and how to chain it with an existing statusline.

### Platforms and phases

- **Phase 1 — Claude Code:** plugin, own marketplace (`marketplace.json` in the repo). Install: `/plugin marketplace add <owner>/sharpen` then `/plugin install sharpen@sharpen`.
- **Phase 2 — other marketplaces**, reusing `SKILL.md` unchanged:
  - **OpenAI Codex:** `.codex-plugin/plugin.json`. It shares the hook format with Claude Code (Ponytail does this).
  - **Gemini CLI:** `gemini-extension.json` + `commands/sharpen.toml` + context file.
  - **GitHub Copilot CLI:** `.github/plugin/plugin.json`.
  - Hosts without a question tool use the numbered-list fallback.
  - *Designer's call:* only ship to a host that has a per-prompt hook (or an equivalent), so on/off really works there. A host that can only load a context file all the time is skipped until it gets hooks. Check each host's current hook docs at Phase 2 planning time.
- Each platform's install line goes in the README.
- *Designer's call:* the first build plan covers **Phase 1 only**. Phase 2 gets its own plan after Phase 1 works.

### Verification

- Automated (Node built-in test runner, no dependencies): state read/write; toggle commands; hook output when off, on, on with a slash command, on with `raw:`, and with `sharpen:` (both on and off); valid JSON output shape.
- Manual eval: a fixed list of about 10 prompts (5 vague, 5 clear) run in a real project. Pass = vague ones produce concrete options that name real files, and clear ones run with no question.

## Left to the builder

- Exact wording of SKILL.md and of the injected per-prompt line (keep it short, because it is added to every prompt).
- Exact hook file names, and helper structure inside `hooks/`.
- README layout, logo, license (suggest MIT).
- Statusline chaining details.

## Open with the owner

- Final name and GitHub owner/repo. These must be fixed before Phase 1 is published, because renaming later breaks installs.
