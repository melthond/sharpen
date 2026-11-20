---
name: sharpen-plan
description: >
  Turn a project or big feature into a phased plan of prompts and files: kickoff
  rules, spec, plan, tasks and the build prompt for each phase, sized to the work,
  each ending with what comes next. Shows everything first and writes files only
  after the user approves. Use for /sharpen:sharpen-plan, "plan this project",
  "spec-driven", "kickoff prompt", "master prompt", "give me the phases",
  "set this up so an agent can build it".
---

Build the phase chain for a piece of work so each session starts from a written artifact instead of a long chat. The phase shapes, their signals and their sources are in `../sharpen/references/phases.md`; read it first and follow it. **Do not run the build.** This skill writes planning files and prompts, never application code.

## 1. Size it first

Read the conversation, `CLAUDE.md` / `AGENTS.md`, the README and the manifests. Then place the work in the sizing table in `phases.md`:

- A small change or a bug: say so in one line, give the normal sharpened prompt instead, and stop. Heavy process on small work backfires.
- A clear, contained feature: the one-pass prompt (spec, design and tasks in one), then the build prompt.
- A big or fuzzy feature: the full chain. If the decisions aren't made yet, start with `/sharpen:sharpen-interview` and come back with its `SPEC.md`.
- A new project with no rules file: kickoff first.

## 2. Draft the artifacts

Draft only the phases the work needs, in order:

1. **Kickoff** (only if there are no project rules): stack, commands (build, test one file, lint, run), conventions the code doesn't show, and the Always / Ask first / Never boundaries. Under 200 lines. No secrets.
2. **Spec**: the what and why. User stories, requirements as testable "WHEN … THE SYSTEM SHALL …" lines, success criteria, non-goals, and `[NEEDS CLARIFICATION: …]` for every open point. No stack.
3. **Plan**: stack and why, architecture, data model, contracts, error handling, testing strategy. High-level; no long code.
4. **Tasks**: small tasks traced to requirement ids, grouped as setup, foundations, one group per story, polish; dependencies and parallel tasks marked; each with its own check.
5. **Build prompt**: one reusable prompt for "build the next task": read the spec, plan and `tasks.md` first; take the next unchecked task; the agentic brief from `../sharpen/references/briefs.md` with that task's check; mark it done; stop after one task.
6. **Long loop** (only if the user wants unattended runs): `PROMPT.md` for one item per pass, with caps and a trial run.

Ground every artifact in the real project: real paths, real commands, real conventions. A fact only the user knows becomes `[ASK: …]` or `[NEEDS CLARIFICATION: …]`, never a guess.

## 3. Show, then ask

Show a short table first: phase, file, one line on what's in it. Then each file's content in its own fenced block. Then call `AskUserQuestion` once:

- question: `Write these planning files?`, header: `Plan`
- option 1: `Write them (Recommended)`: writes the files shown, at the paths shown
- option 2: `Show me only`: nothing is written; the user copies what they need
- option 3: `Change something`: the user says what, and you show the updated set once more

Files go at the project root, or under `specs/<feature>/` when the project already has a `specs/` folder. **Never overwrite an existing file**: if `SPEC.md`, `plan.md` or `tasks.md` exists, use `SPEC-<feature>.md` and so on, and say so.

## 4. Hand over

After writing (or showing), end with:

1. `Plan ready:` the files, one line each.
2. `Next:` the exact first prompt to run, in a fenced block. It's usually the build prompt for task 1, or the clarify step when the spec still has open markers. Say to start it in a fresh session.
3. `Order:` the phase sequence still to come, one line.

## Never

- Write application code, run builds, or start the first task.
- Overwrite a file, or write anything before the user picks `Write them`.
- Put the tech stack in the spec, or long code in the plan.
- Invent requirements, numbers or decisions: mark them for clarification.
- Include secrets, or send the project anywhere outside this agent.

Writes planning files only after approval. Changes no code.
