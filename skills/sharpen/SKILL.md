---
name: sharpen
description: Turns the user's plain prompt into an engineered one, built from the conversation, the codebase, and the skills, agents, MCP tools, plugins and hooks of this setup, and shows it on a review card to send. Use when Sharpen is on or the prompt starts with "sharpen:".
---

# Sharpen

Turn the user's prompt into the prompt they meant, show it on a **review card**, and only work once they send it. **Do not start the work before they answer.** The engineered prompt is theirs to check, edit or send.

## 1. Gate

- **Clear**: says what to do and where, and has one reading. *"rename getUser to fetchUser in src/api.ts"*
- **Fill-in**: one sensible reading, but details are missing that the conversation or code supplies. *"now add tests for it"*, right after you wrote a function.
- **Ambiguous**: two or more readings would lead to *different actions*. *"fix the login thing"*, with two open login problems.

If every reading leads to the same action, it isn't ambiguous. Open-ended exploration ("what would you improve here?") is clear: keep it open.

## 2. Gather (fast)

- **Conversation first:** files, errors, decisions and preferences already mentioned. Decisions the user made are binding.
- **Code:** at most 3 quick searches or reads to find the real files, names and check commands. For an ambiguous prompt whose first searches found nothing solid, up to 6, or one `Explore` agent if it's listed. Never a long tour.
- **Setup:** the skills, agents/subagents, MCP tools and plugin slash commands listed in your context, plus the `Setup Sharpen found` block (hooks that run automatically, and enabled plugins). Note which fit this request. Use only names that are actually listed; never invent one.

## 3. Engineer the prompt

Classify the intent, and fill that type's slots:

| Intent | Slots |
|---|---|
| Bug | Symptom · Where · Reproduce (failing test or steps) · Fix · Check |
| Feature | What + for whom · Where it plugs in · Follow pattern (existing file) · Done when · Out of scope |
| Refactor | Target · Behaviour must not change · Check (tests stay green) · Scope limit |
| Performance | Metric · Measure baseline first · Target · Where |
| Question | What to explain · Depth · Read-only, no edits |
| Review | What (diff/files) · Focus · Report only |
| Explore | Keep it open · No edits · Scope of the look |
| Ops (git, deploy, config) | Exact action · Target · Ask before anything irreversible |
| Other | Goal · Where · Constraints · Done when |

Then add the lines that make it fit *this* setup and *this* conversation. `Tools:` is required whenever any listed skill, agent or MCP tool fits the work, which it usually does. `Hooks:` is required whenever the setup block lists a hook that will run during this work (edits, tool calls, the end of the turn):

- `Decided:` earlier decisions that still bind ("keep the counter in pin.ts", "no new dependency"). They're the part a fresh read forgets.
- `Tools:` a short plan of which listed tools to use and in what order, at most 3, each with its job: `Tools: Explore agent to find every caller → systematic-debugging skill → test-automator agent for the regression test`. Prefer the project's own agents and skills over generic ones, and an MCP tool when the work needs live data (logs, a database, an issue tracker).
- `Hooks:` hooks from the setup block that will run during this work and change how to do it: `Hooks: dead-code-check runs after every edit, so remove unused code as you go`. Hooks are never called. They are constraints.

Before showing it, check: it keeps everything the user asked for (for a clear prompt, only *add* context, never change the meaning), it has a finish line (`Done when:` or `Check:`), the scope is stated, every name is real, and no line is filler. Write `(not found)` rather than guess a path. Plain labelled lines, 4–10 in total, context first and the action last.

## 4. Show the review card

**Clear and Fill-in:** start your reply with `Sharpened prompt (clear):` or `Sharpened prompt (fill-in):`, then the engineered prompt in one fenced code block, then call `AskUserQuestion` once:
- question: `Send this sharpened prompt?`, header: `Sharpen`
- option 1: `Send it (Recommended)`, description `Run exactly this prompt`, preview = the engineered prompt, as plain text without the code fence
- option 2: `Run my original`, description `Run what you typed, unchanged`, preview = the user's original prompt

Sharpen copies option 1's preview to the user's clipboard when the card appears. To edit it word by word, they can press Esc, paste it with Ctrl+V, change it and send it.

```
Sharpened prompt (fill-in):
Explain the clipboard helper in apps/admin/src/lib/clipboard.ts.
Cover each export, the timed clear, and the edge cases.
Mention where it's used (generate.tsx, renewals.tsx) and what clipboard.test.ts covers.
Read only. No edits.
Done when: every export is explained, with file:line references.
```

**Ambiguous:** call `AskUserQuestion` once with the question `Which did you mean?`, and 2–3 options, one per interpretation, most likely first. Each option has its label = the meaning (5 words or fewer), description = one line, preview = its full engineered prompt (steps 3 rules). The last option is always `Run as typed`, for 4 choices at most. Each option is a different action, not a rewording. For a large feature with many open decisions, one option can be `Interview me first`: ask questions one at a time, then write a spec before building.

**Hosts without a question tool:** show the prompt or the numbered options, and wait for the user to reply `send`, a number, or their changes.

## 5. After they answer

- `Send it`, or an option: carry out that engineered prompt exactly as written, using the tools it names.
- `Run my original` or `Run as typed`: carry out what they typed, unchanged.
- Their own text (changes): apply the changes to the engineered prompt, and show the updated card once more.
- Don't sharpen again for the same request, including the user's answer to the card.

## Never

- Start the work before the user answers the card. The card *is* the step.
- Skip the first line or the card. Every reply to a prompt starts with `Sharpened prompt (clear):`, `Sharpened prompt (fill-in):`, or the `Which did you mean?` card. The user's status badge reads it.
- Change the meaning of a clear prompt. Only add to it.
- Give generic prompts that ignore the conversation, the code or the setup.
- Invent files, skills, agents, MCP tools or hooks, or call a hook.
- Send the prompt or the code anywhere outside this agent.
