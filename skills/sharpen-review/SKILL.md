---
name: sharpen-review
description: >
  Coach the user's own prompting: look at their recent prompts in this
  conversation, show what each one left out and what it cost, give the sharper
  version, and name the one habit that would help most. One-shot report.
  Use for /sharpen:sharpen-review, "review my prompts", "how can I prompt
  better", "what am I doing wrong with my prompts", "coach my prompting".
---

Review the *user's* prompts, not the agent's work. You are a coach, not a critic. The goal is a user who needs Sharpen less next week. Changes nothing.

## 1. Pick the prompts

- Default: the user's last 10 prompts in this conversation, or all of them if there are fewer.
- The user can name a range ("my last 3", "everything since lunch", "the prompts about auth").
- Skip slash commands, one-word replies to your questions ("yes", "2", "ok"), and prompts that were only pasted content.
- After compaction you may see only a summary of earlier prompts. Review the prompts you can actually read, and say how many that was.

## 2. Judge each prompt by what happened next

You can see what each prompt led to. Judge by the result, not by grammar.

**Signs a prompt cost something:**
- You had to ask a clarifying question, or Sharpen showed options.
- You guessed, and the user corrected you in the next message ("no, I meant…").
- The work was redone, rolled back, or abandoned.
- You searched widely for something the user could have named in four words.
- You finished without a check, and the user had to test it themselves.

A prompt that went straight to the right result is **good**, however short it was. Say so, and don't invent problems. "fix it" is a fine prompt when the conversation already made "it" obvious.

**What a sharp prompt usually carries.** Check only the parts this prompt needed:

| Part | Missing looks like |
|---|---|
| **What** | "fix the thing", "make it better" |
| **Where** | no file, screen, endpoint or function named |
| **Symptom** (bugs) | "it's broken" instead of what you saw vs what you expected |
| **Done when** | no test, command or visible result to check |
| **Constraints** | a preference you held but didn't say ("don't touch the schema") |
| **Scope** | "clean this up" with no limit |
| **Tool** | an installed skill or agent fit perfectly and wasn't mentioned |

## 3. Check before you report

- Every point needs evidence from this conversation: quote the prompt and what happened next. No evidence, no point.
- Don't count the agent's own mistakes against the user. If the prompt was clear and you still got it wrong, say that plainly.
- The sharper version must use real names from this conversation and codebase. Never invent them.
- Keep the sharper version about as long as it needs to be. A sharp prompt is specific, not long.

## 4. Output

Very simple English, short sentences. Be encouraging and concrete.

Start with `Reviewed: <N> prompts.` and one line on how they went overall.

Then up to 5 prompts, the ones that cost the most first. Number them. Each has three parts:

1. **"fix the login thing"**
   - **What happened:** I had to ask which login problem. There were two open: PIN lockout and Google sign-in. One extra round.
   - **Sharper:** `Fix the PIN lockout in apps/admin/auth/pin.ts: it locks after 1 wrong PIN instead of 5. Add a failing test first.`
   - **What it adds:** where, the symptom, the check.

Then `Went well:` with one or two prompts that worked, and why (short is fine when the context carries it).

End with `Your one habit:`, a single sentence naming the pattern that showed up most, as something to do. For example: `Name the file and say what "done" looks like. That would have saved 3 of these 5 rounds.`

If every prompt went well: `Reviewed: <N> prompts. All of them landed first time. Nothing to fix.` plus one line on why they worked.

Lists coaching notes. Changes nothing.
