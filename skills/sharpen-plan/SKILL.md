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

- A small change or a bug: say so in one line, then give one engineered prompt in a fenced block (the quick or agentic brief from `../sharpen/references/briefs.md`), and stop: no files, no table, no approval question. Heavy process on small work backfires.
- A bug that keeps coming back, or one with a regression risk: a bugfix spec (current, expected and unchanged behaviour, and a failing test first), then the build prompt.
- A clear, contained feature: the one-pass prompt (spec, design and tasks in one), then the build prompt.
- A big or fuzzy feature: the full chain. If more than about three open decisions would change the design (Sharpen's rule of thumb), recommend `/sharpen:sharpen-interview` first in one line and stop. Otherwise draft the spec and mark each open point.
- A new project with no `CLAUDE.md` or `AGENTS.md`: add kickoff in front of whichever of the above fits.

## 2. Draft the artifacts

Draft only the phases the work needs, in order:

1. **Kickoff** → `CLAUDE.md` (or `AGENTS.md` if that's the project's file): the stack *in use* and the commands (build, test one file, lint, run), conventions the code doesn't show, and the Always / Ask first / Never boundaries. Under 200 lines. No secrets. On a new project with no stack chosen yet, write "Stack: see plan.md" instead of repeating the open choice.
2. **Spec** → `SPEC.md`: the what and why. User stories, requirements with ids (R1, R2…) as testable "WHEN … THE SYSTEM SHALL …" lines, success criteria, non-goals. No stack.
3. **Plan** → `plan.md`: owns the stack *choice* and why, plus architecture, data model, contracts, error handling, testing strategy. High-level; no long code.
4. **Tasks** → `tasks.md`: small tasks traced to requirement ids, grouped as setup, foundations, one group per story, polish; dependencies and parallel tasks marked; each with its own check.
5. **Build prompt** → `BUILD.md`: one reusable prompt for "build the next task": read the spec, plan and `tasks.md` first; take the first unchecked task whose dependencies are done; the agentic brief from `../sharpen/references/briefs.md` with that task's check; tick it in `tasks.md`; stop after one task.
6. **Long loop** (only if the user wants unattended runs) → `PROMPT.md` for one item per pass, plus `fix_plan.md`, the list it rereads and updates each pass; with caps and a trial run.

Ground every artifact in the real project: real paths, real commands, real conventions. Never guess a fact only the user knows. Mark it:
- `[NEEDS CLARIFICATION: <question>]` for an open requirement or behaviour question, in `SPEC.md`;
- `[ASK: <value>]` for a value or choice the user supplies (a command, a provider, a limit), in the other files.

## 3. Show, then ask

Show a short table first: phase, file, one line on what's in it. Then each file's content in its own fenced block. Then call `AskUserQuestion` once:

- question: `Write these planning files?`, header: `Plan`
- option 1: `Write them (Recommended)`: writes the files shown, at the paths shown
- option 2: `Show me only`: nothing is written; the user copies what they need
- option 3: `Change something`: the user says what, you show the updated set, and ask the same question again, until they pick write or show-only

Files go at the project root, or under `specs/<feature>/` when the project already has a `specs/` folder. **Never overwrite an existing file**: if `SPEC.md`, `plan.md` or `tasks.md` exists, use `SPEC-<feature>.md` and so on, and say so.

## 4. Hand over

After writing (or showing), end with:

1. `Plan ready:` the files, one line each.
2. `Next:` the exact first prompt to run, in a fenced block; say to start it in a fresh session. When any `[NEEDS CLARIFICATION]` or `[ASK]` marker is left, it's the clarify prompt: ask about every open marker, at most five questions at a time, each with a recommended answer, write the answers back into the files, then a read-only pass for gaps and contradictions. Otherwise it's `BUILD.md` for the first task.
3. `Order:` the phases still to come on one line, for example `clarify → build T1–T11 (one per session, review after each) → done check`.

## Never

- Write application code, run builds, or start the first task.
- Overwrite a file, or write anything before the user picks `Write them`.
- Put the tech stack in the spec, or long code in the plan.
- Invent requirements, numbers or decisions: mark them for clarification.
- Include secrets, or send the project anywhere outside this agent.

Writes planning files only after approval. Changes no code.
