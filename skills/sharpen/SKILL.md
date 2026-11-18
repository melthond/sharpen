---
name: sharpen
description: Turns a vague prompt into 2-4 specific, engineered prompts built from the conversation, the codebase, and the skills, agents and MCP tools available here. Use when Sharpen is on or the prompt starts with "sharpen:".
---

# Sharpen

Before acting on the user's prompt, decide how much it needs. Most prompts need nothing.

## 1. Gate

- **Clear**: says what to do and where, and has one reading. Write `Clear prompt, running as typed.` and do it.
  *"rename getUser to fetchUser in src/api.ts"*
- **Fill-in**: one sensible reading, but details are missing that the conversation or code supplies. Write `Running as: <one-line engineered version>` and do it. Do not ask.
  *"now add tests for it"*, right after you wrote a function.
- **Ambiguous**: two or more readings would lead to *different actions*. Go to steps 2–4.
  *"fix the login thing"*, with no earlier mention of which problem.

If every reading leads to the same action, it is not ambiguous. Open-ended exploration ("what would you improve here?") counts as clear: keep it open.

## 2. Gather (fast)

- Use the conversation first: files, decisions, errors and preferences already mentioned.
- Then do at most 3 quick searches or reads to find the real files and names. No long exploration before asking.
- Check the capabilities listed in your context: **skills**, **agents/subagents**, **MCP** tools, and plugin slash commands. Note any that fit this request. Use only ones that are actually listed; never invent one.

## 3. Build 2–4 options

Write 2–4 options, one per interpretation, most likely first, plus `Run as typed`. Don't add a "Something else" option, because the user can always type their own. Each option is a different action, not a rewording. Classify the intent and fill that type's slots:

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

Add a `Use:` line to any option where a listed skill, agent or MCP tool fits, naming it exactly as listed. For example: `Use: systematic-debugging skill`, `Use: Explore agent to find every caller`, `Use: Supabase MCP to read the auth logs`. Leave the line out when nothing fits.

Rules for every option:
- Plain labelled lines, 3–7 in total, context first and the action last.
- Use real paths and names from step 2. If something wasn't found, say `(not found)`. Never guess a path.
- Carry over constraints the user already stated in the conversation.
- For a large feature with many open decisions, add the option `Interview me first`: ask questions one at a time, then write a spec before building.

Example, for "fix the login thing" after a conversation about PIN lockout:
```
Fix PIN lockout
Symptom: lockout after 1 wrong PIN instead of 5
Where: apps/admin/auth/pin.ts
Reproduce: failing test in pin.test.ts
Use: systematic-debugging skill
Check: npm test -- pin
```
```
Investigate login only
Goal: find why admin login fails
Read-only: trace the login flow, report the likely cause, no edits
```

## 4. Ask

- **Claude Code:** call `AskUserQuestion` once, with the question "Which did you mean?". For each option: label = the meaning (5 words or fewer), description = one line, preview = the full engineered prompt. Always include `Run as typed` as the last option.
- **Hosts without a question tool:** a numbered list, the same options plus `Run as typed`. The user replies with a number.

## 5. Run

Carry out the chosen prompt as if the user had typed it, using any skill, agent or tool it names. Don't sharpen again for the same request, including the user's reply that picks an option.

## Never

- Ask about a clear or fill-in prompt (unless it starts with `sharpen:`; then ask *before* doing any work).
- Give generic options that ignore the conversation and the code.
- Explore at length before asking.
- Invent files, skills, agents or tools.
- Send the prompt or the code anywhere outside this agent.
