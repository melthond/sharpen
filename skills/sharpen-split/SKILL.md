---
name: sharpen-split
description: >
  Split a big, multi-part request into small, ordered, self-contained prompts:
  each one engineered (where, constraints, done-when), with dependencies marked
  and the ones that can run in parallel grouped into waves. Nothing runs.
  Use for /sharpen:sharpen-split, "split this up", "break this into tasks",
  "this is too big", "plan the prompts", "what order should I do this in".
---

Turn one big request into a short sequence of prompts that each do one job well.
**Do not run them.** No edits, no commands. The output is a plan of prompts the user runs one at a time, hands to separate agents, or pastes into tickets.

Big mixed prompts fail differently from vague ones. The agent does the easy part well, rushes the rest, and finishes having checked only some of it. Small prompts with their own finish line don't.

The method lives in `../sharpen/SKILL.md`, relative to this skill's base directory. Read it first. Every prompt you write here follows its intent slots, its `Tools:` and `Hooks:` lines and its never-rules.

## 1. Find the request

- The request is the text after `/sharpen:sharpen-split`. If there's nothing after it, use the user's previous message, and say so in one line.
- If the request is actually one job ("rename X to Y everywhere"), say `This is one task, no split needed.`, and give the single engineered prompt instead.

## 2. Find the parts

- List every distinct outcome the request asks for, including the ones only implied ("and make sure it still works" is a part: verification).
- Use the conversation and at most 3 quick searches to find where each part lives (real paths) and what it touches.
- A part is the right size when it has **one** finish line you can check, and it touches one area of the code. If a part needs "and" in its finish line, split it again. If two parts must change the same lines, merge them.
- Name hidden parts the request will need, such as a migration, a config change or a doc update, and mark them `(implied)`.

## 3. Order them

For each part, decide what it needs first:
- **Depends on:** it uses something another part creates (a type, an endpoint, a table). It runs after that part.
- **Conflicts with:** it edits the same files as another part. They can't run at the same time; put them in sequence even if neither needs the other.
- **Independent:** different files, no shared output. It can run in parallel.

Group the parts into **waves**: wave 1 has everything that needs nothing, wave 2 has everything that only needs wave 1, and so on. Inside a wave, parts can run at the same time in separate sessions, agents or worktrees, as long as they don't touch the same files.

Put risky or uncertain parts early, such as an unknown API or a schema change. Finding out early that a plan doesn't work is cheaper than finding out late.

## 4. Write each prompt

Each prompt must stand alone, as if pasted into a fresh session:
- the goal of this part only, plus one line of context on the larger goal;
- **Where:** real paths;
- **Needs:** what an earlier part produced, and where to find it;
- **Don't touch:** the files that other parts in the same wave own;
- `Tools:` when an installed skill, agent or MCP tool fits, and `Hooks:` when a hook changes how to do this part;
- **Done when:** one check (a test, a command or a visible result).

## 5. Output

Start with: `<N> prompts in <W> waves.`, and one line on the order logic ("the schema first, because everything reads it").

Then, for each wave, a heading `Wave 1 (parallel)` or `Wave 2 (after wave 1)`, and each prompt as a numbered label plus one fenced code block:

**Wave 1 (parallel)**

1. Add the `max_attempts` column

```
Part 1 of 3 in making admin lockout configurable.
Add an integer column `max_attempts` (default 5) to the admins table.
Where: db/migrations/ (new file), db/schema.ts
Don't touch: apps/admin/ (part 2 owns it)
Tools: supabase-postgres-best-practices skill
Done when: npm run db:migrate succeeds on a fresh database and db:test passes.
```

2. …

**Wave 2 (after wave 1)**

3. …

Then `Run in this order:` as one line (`1 + 2 together, then 3`), and `Not found:` if any slot says `(not found)`.

## Never

- Run, edit or start any part. This skill only writes prompts.
- Put two parts that edit the same files in the same wave.
- Leave a prompt without its own finish line.
- Invent files, endpoints, skills or tools.
- Split a one-job request just to look thorough.

Writes prompts, changes no code.
