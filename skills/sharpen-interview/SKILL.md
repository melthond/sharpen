---
name: sharpen-interview
description: >
  For a big or fuzzy feature: interview the user one question at a time, with
  clickable options and a recommended pick, grounded in the codebase, until the
  decisions add up to a spec. Then write SPEC.md (goals, non-goals, decisions,
  done-when) for a fresh session to build from. Use for /sharpen:sharpen-interview,
  "interview me", "help me spec this", "I haven't thought this through",
  "what do I need to decide", or the "Interview me first" option.
---

The user knows roughly what they want, but not every decision behind it. Ask until those decisions are made, then write them down, so the build starts from a spec and not a guess.
Ask **one question at a time**. Build nothing during the interview. The only file written is the spec, at the end.

## 1. Understand before asking

- The topic is the text after `/sharpen:sharpen-interview`, or the request that led to the "Interview me first" option.
- Read what already answers questions: the conversation, then a few quick looks at the code this feature would touch (existing patterns, similar features, data models, the test setup).
- Never ask what the project or the conversation already answers. State it instead: "You already use Zod for request validation, so I'll assume the same here."

## 2. Decide what's worth asking

List the open decisions, and keep only the ones where **the answer changes what gets built**. Typical ground (don't read these out as a script):
- who it's for, and what success looks like;
- scope: what's in, what's explicitly out;
- behaviour at the edges: limits, errors, empty states, what happens to existing data;
- where it plugs in: which existing pattern or component it should follow;
- constraints: performance, security, compatibility, deadline.

Order them by impact: the decision that changes the most comes first. Usually 3–8 questions. Stop when the remaining unknowns are small enough for a builder to settle.

## 3. Ask, one question at a time

- Use `AskUserQuestion` with **one** question per call, and 2–4 options.
- Make each option concrete, with its trade-off in the description. Put your pick first, with `(Recommended)` at the end of its label. Use a preview when the options are visual or shown as code (a layout, an API shape).
- Build each question on the last answer: "You chose per-user limits, so what happens to a request over the limit: reject it, or queue it?"
- If the user picks "Other" or says "you decide", make the call, state it in one line, and mark it as yours in the spec.
- Every 3–4 answers, play back what's settled in 2–3 lines, so the user can catch a misunderstanding early.

## 4. Write the spec

When the decisions add up, say `That's enough to build from. Writing the spec.`, and write it to `SPEC.md` at the project root. If `SPEC.md` already exists, use `SPEC-<topic>.md`. Never overwrite one.

```
# <Feature>: spec

## Goal
<one paragraph: what, for whom, why>

## Non-goals
- <explicitly out>

## Decisions
- <decision> (user)
- <decision> (my call: <one-line reason>)

## Behaviour
- <edge cases, errors, limits, existing data>

## Where it plugs in
- <real paths, existing patterns to follow>

## Done when
- <checks: tests, commands, visible results>

## Open (for the builder)
- <small things a builder can settle>
```

Mark every decision as `(user)` or `(my call: …)`, so the user can see which choices were theirs.

## 5. Hand it over

Reply with:
1. `Spec written: SPEC.md`, and the three most important decisions in one line each.
2. `My calls:`, the decisions you made for them, so they can check those first.
3. `Next: start a fresh session and say "build SPEC.md"`. A fresh session starts clean, with the spec as its definition of done.

## Never

- Ask more than one question per message.
- Ask what the code or the conversation already answers.
- Start building, scaffolding or installing during the interview.
- Never overwrite an existing spec file.
- Present your own call as the user's decision.

Asks questions, then writes one spec file.
