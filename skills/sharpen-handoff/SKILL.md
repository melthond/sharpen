---
name: sharpen-handoff
description: >
  Turn this whole conversation into one tight starting prompt for a fresh
  session: the goal, what's decided, what's done, what failed and why, what's
  next, and how to check it's done. Copy it, run /clear, paste it. Nothing runs.
  Use for /sharpen:sharpen-handoff, "hand this off", "start fresh", "write a
  handoff", "summarize for a new session", "I want to /clear", "continue tomorrow".
---

Write the prompt a fresh session needs to pick up exactly where this one stands, and nothing more.
**Do not run it.** No edits, no commands, no work on the task. The output is text the user will copy into a new session after `/clear`, or give to a teammate.

A good handoff beats a long conversation. A fresh session with a sharp starting prompt makes fewer mistakes than one dragging 200K tokens of dead ends behind it. The most valuable part is what *didn't* work, because a fresh session will otherwise try it again.

## 1. Read the whole conversation

- Read from the start, not just the last few turns. Early decisions are the ones that get lost.
- If the conversation was compacted, use the summary plus what's visible after it. Say in one line that earlier detail may be missing.
- Find the **current goal**. It may have changed since the first message. Use the latest one, and note the change only if it explains a decision.

## 2. Collect, in this order

1. **Goal:** one or two sentences, in the user's terms. What success looks like.
2. **Decided:** choices the user made or approved (approach, names, libraries, "don't touch X"). These are binding for the next session. Quote the user's own words when the wording matters.
3. **Done:** what exists now. Files created or changed (real paths), commits, what's verified and how (the command and its result).
4. **Tried and failed:** each dead end in one line: what was tried, what happened, and why it's ruled out. Error messages go in verbatim if they're short.
5. **Open:** the next concrete step, then anything unresolved: questions waiting on the user, known bugs, skipped checks.
6. **How to check:** the exact test, build or run commands that prove the work, and which ones currently pass or fail.
7. **Where to look:** the 3–8 files the next session should read first, with one line each on why.
8. **Constraints:** environment facts the code can't show (OS and shell, accounts, "never push without asking", deadlines).

Leave out the history of *how* you got here, unless a step explains a decision or a dead end. Leave out chit-chat, tool output and code that's already in files. Point to the file instead.

**Point to code, don't describe it.** Name the files, symbols (`incrementAttempts()` in `pin.ts:42`) and commits (`git log` hashes or the branch) the next session should read, rather than explaining how the code works in prose. In a study cited by Addy Osmani, prose summaries answered 4 of 45 behavioural questions about the code, while the source itself answered 27 of 45. Write in prose only what the code can't show: decisions, intent, and dead ends.

## 3. Check before you hand it over

- Every path, command, branch and name must be real: check that the file exists if you're unsure. Never invent a status ("tests pass") you didn't see in this conversation. Write `(not verified)` instead.
- Nothing secret: no tokens, keys, passwords or `.env` values. Name the variable, never its value.
- It must stand alone: someone who never saw this conversation can act on it.
- Keep it tight: usually 20–50 lines. If it's longer, cut the history, not the decisions or the dead ends.

## 4. Output

Start with one line: `Handoff ready. Run /clear, then paste this:` (or `Handoff for a teammate:` if the user said it's for a person).

Then the prompt, in one fenced code block, using these headings and skipping any that are empty:

```
Continue this work. Read the files under "Where to look" before changing anything.

## Goal
Make admin login lock after 5 wrong PINs instead of 1.

## Decided
- Keep the counter in apps/admin/auth/pin.ts; no new dependency.
- User: "don't change the lockout duration, only the count".

## Done
- Added failing test "locks after 5 attempts" in apps/admin/auth/pin.test.ts (fails as expected).

## Tried and failed
- Resetting the counter in useEffect: resets on every render, so it never locks. Ruled out.

## Open
1. Fix the off-by-one in incrementAttempts() (pin.ts:42).
2. (waiting on user) Should lockout survive an app restart?

## How to check
npm test -- pin   (currently: 1 failing, the new test)

## Where to look
- apps/admin/auth/pin.ts: the counter and lockout
- apps/admin/auth/pin.test.ts: the new test

## Constraints
- Windows, PowerShell. Never push without asking.
```

Then one line, `Left out:`, naming anything relevant you chose not to include, such as long logs or a side topic, so the user can add it back.

## Never

- Run, edit or continue the task. This skill only writes text.
- Drop a "Tried and failed" item to save space. That's the part a fresh session can't rediscover cheaply.
- Report a status you didn't see verified in this conversation.
- Include secrets, or send the conversation anywhere outside this agent.

Writes a handoff prompt, changes no code.
