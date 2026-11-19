---
name: sharpen-prompt
description: >
  Turn a plain prompt into an engineered one and hand back the text, ready to
  copy, without running it. Uses the conversation, the codebase and the
  installed skills, agents and MCP tools. Good for prompts you'll paste into
  another AI, a ticket, or a teammate's chat. Use for /sharpen:sharpen-prompt,
  "sharpen this prompt", "rewrite my prompt", "prompt-engineer this",
  "make this prompt better", "what should I ask instead".
---

Rewrite the user's prompt into the prompt they *meant* to write, then hand it back.
**Do not run it.** No edits, no commands, no work on the task itself. The output is text the user will copy.

The method lives in one place: `../sharpen/SKILL.md`, relative to this skill's base directory. Read it first for the gate, the intent slots, the `Tools:` and `Hooks:` lines, and the never-rules. This skill only changes what happens at the end: you hand the result back instead of running it.

## 1. Find the prompt

- The prompt is the text after `/sharpen:sharpen-prompt`.
- If there's nothing after the command, use the user's previous message in this conversation, and say so in one line.
- If there's no previous message either, ask for the prompt in one line and stop.
- Keep the user's language and tone. Sharpen the meaning, not the voice.

## 2. Find where it will be used

The same request needs a different prompt depending on who reads it:

| Target | How to write it |
|---|---|
| **This agent** (default) | Real paths, real skill and agent names, a `Tools:` plan and any `Hooks:` that apply, and the check to run. |
| **Another AI or agent** (the user says ChatGPT, Gemini, Cursor, Codex, Copilot, "another chat"…) | Read that tool's profile in `../sharpen/references/targets.md` and follow it. A chat model can't see this repo, so include the context it needs in plain words: stack, the relevant code (short excerpts if needed), and constraints. No `Tools:` or `Hooks:` lines, because that AI has none of these tools. |
| **A person** (ticket, issue, message to a teammate) | Title + what's wrong or wanted + where + how to tell it's done. No agent instructions. |

If the target isn't stated, assume this agent and say so in the header line.

## 3. Gather, fast

- Use the conversation first: files, errors, decisions and preferences already mentioned.
- Then do at most 3 quick searches or reads to find the real files, functions and test commands.
- Check the skills, agents, subagents and MCP tools listed in your context, and note any that fit (this agent only).
- Never invent a path, a function or a tool. If you can't find something, write `(not found)` in its slot. The user can fill it in, and a wrong guess pasted into another AI does more harm than a gap.
- A prompt for another AI, a ticket or a person leaves this agent. Leave out credentials, customer data, internal URLs and private prompts; describe them generically ("a customer record") and say what you left out.

## 4. Build it

1. **Classify the intent** (Bug, Feature, Refactor, Performance, Question, Review, Explore, Ops, Other) and fill that type's slots from the method.
2. **One reading?** Write one engineered prompt.
3. **Two or three readings that lead to different work?** Write one prompt per reading, most likely first, each under its own label. Don't make the user pick before you write. Write them all, so they can copy the right one.
4. **Shape:** plain labelled lines, context first and the action last. Up to about 12 lines for this agent; longer for another AI, which needs the context spelled out.
5. **Always include how to tell it's done:** a test, a command, a visible result. A prompt without a finish line invites the agent to stop early or never stop.

## 5. Output

Start with one header line: `Sharpened for: <target>`, plus `(from your last message)` when step 1 used it.

Then each prompt in its own fenced code block, so it copies cleanly. Put a short label above each block when there's more than one.

Then one line, `What I added:`, naming the 2–4 most important things that weren't in the original (the file, the symptom, the check, the skill).

Then one line, `Not found:`, only if a slot says `(not found)`.

Example, for `/sharpen:sharpen-prompt fix the login thing`, after a conversation about PIN lockout:

Sharpened for: this agent

```
Fix the PIN lockout bug in the admin app.
Symptom: the account locks after 1 wrong PIN; it should lock after 5.
Where: apps/admin/auth/pin.ts (attempt counter), apps/admin/auth/pin.test.ts
Reproduce: add a failing test that enters 4 wrong PINs and expects no lockout.
Tools: systematic-debugging skill
Done when: npm test -- pin passes, including the new test.
```

What I added: the file, the expected vs actual count, a failing test first, the test command.

Example, the same prompt for another AI:

Sharpened for: another AI (it can't see this repo)

```
I have a React + TypeScript admin app. Users get locked out after 1 wrong PIN;
it should allow 5 attempts. The counter lives in this function:

<paste the attempt-counter function from apps/admin/auth/pin.ts here>

Find why it locks after 1 attempt, and give me the fixed function plus a unit
test (Vitest) that enters 4 wrong PINs and expects no lockout.
```

What I added: the stack, the expected behaviour, where to paste the code, the test to write.

## Never

- Run, edit or start the task. This skill only writes text.
- Leave out the finish line ("Done when", "Check").
- Put `Tools:` or `Hooks:` lines, or repo paths, into a prompt meant for an AI or a person who can't use them.
- Invent files, functions, skills, agents or tools.
- Send the prompt or the code anywhere outside this agent.

Writes prompts, changes no code.
