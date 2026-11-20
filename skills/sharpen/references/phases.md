# Prompt phases

Read this when the request belongs to a stage of a larger build: starting a project, specifying a feature, planning it, breaking it into tasks, building a task, running a long loop, checking it's done, or resuming. Pick the phase, write the prompt in that phase's shape, and point to the next phase. Most prompts aren't phased at all: a bug, a small change or a question gets the normal brief.

Sources: [GitHub Spec Kit](https://github.com/github/spec-kit) and its [spec-driven guide](https://github.com/github/spec-kit/blob/main/spec-driven.md); [Kiro specs](https://kiro.dev/docs/specs/feature-specs/), [bugfix specs](https://kiro.dev/docs/specs/bugfix-specs/) and [steering](https://kiro.dev/docs/steering/); the [BMAD Method](https://docs.bmad-method.org/start/how-bmad-works/); Harper Reed, [My LLM codegen workflow](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/) (2025); [Claude Code best practices](https://code.claude.com/docs/en/best-practices); Addy Osmani, [How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) (2026); [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank); Geoffrey Huntley, [Ralph](https://ghuntley.com/ralph/) (2025); Birgitta Böckeler on [martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (2025); Thoughtworks Radar, *Spec-driven development*. Checked 2026-11-20. These tools rename their commands often, so describe the phase, not a tool's command.

## Size the process to the work

Spec-driven workflows "remain elaborate and opinionated" (Thoughtworks), and heavy process on small work backfires: in one review, a small bug in Kiro grew into "4 user stories with a total of 16 acceptance criteria" (Böckeler). Kiro itself says feature specs are not ideal for bug fixes or exploratory coding.

| The work | Phases to use |
|---|---|
| Typo, one-line fix, question, small bug | None: the normal brief |
| A bug that keeps coming back, or one with a regression risk | Bugfix spec, then build |
| A clear, well-understood feature | One-pass spec (spec, design and tasks together), then build |
| A big or fuzzy feature | Interview or spec, then plan, tasks, build |
| A new project | Kickoff first, then the feature path |
| Hours of unattended work | Spec and tasks first, then a long loop |

## Phases

Each phase has signals (what the user's prompt sounds like), what the prompt contains, what it leaves out, its output and the next phase.

### 1. Kickoff (project rules)
- **Signals:** "new project", "set up", "starting", no `CLAUDE.md` or `AGENTS.md` yet, "how should we work on this".
- **Contains:** the stack and versions; the commands to build, test one file, lint and run; where things live, *only where the code doesn't show it*; conventions; boundaries in three tiers: **Always** (run tests before commit), **Ask first** (schema changes, new dependencies), **Never** (commit secrets, edit generated files) (Osmani); principles every later phase is checked against (Spec Kit's "constitution").
- **Leaves out:** what the agent can learn by reading the repo, style rules a linter enforces, secrets ("Never include API keys, passwords, or sensitive data": Kiro). Keep it short: Anthropic recommends staying under 200 lines.
- **Output:** `CLAUDE.md` / `AGENTS.md` (or a constitution file), written once and updated when principles change.
- **Next:** interview or spec.

### 2. Interview (a vague idea)
- **Signals:** "I want X but haven't thought it through", "help me figure out", several unknowns that change the design.
- **Contains:** "Ask me one question at a time" (Harper Reed), each with a recommended answer, until the decisions add up to a spec; then write it ("Interview me until you could write the spec, then write it to SPEC.md": Anthropic).
- **Output:** `SPEC.md`. Use `/sharpen:sharpen-interview`.
- **Next:** a fresh session for plan or build.

### 3. Spec (what and why)
- **Signals:** "spec this", "write requirements", "PRD", "acceptance criteria", a feature big enough to need agreement first.
- **Contains:** the problem and who it's for; user stories; requirements written as testable criteria, for example in EARS form, "WHEN <event> THE SYSTEM SHALL <behaviour>" (Kiro); measurable success criteria; non-goals; every open point marked `[NEEDS CLARIFICATION: <question>]` rather than guessed ("Don't guess": Spec Kit).
- **Leaves out:** the tech stack, APIs and code structure: "Focus on the what and why… not the tech stack" (Spec Kit), which belongs in the plan.
- **Output:** `SPEC.md` (or `specs/<feature>/spec.md`).
- **Next:** clarify, then plan.

### 4. Clarify (check the spec)
- **Signals:** a spec exists with open markers, or "is this spec complete?"
- **Contains:** at most five targeted questions, the answers written back into the spec (Spec Kit); then a read-only pass for inconsistencies, ambiguities, conflicting constraints and gaps (Kiro).
- **Leaves out:** edits to code; the analysis pass changes nothing.
- **Next:** plan.

### 5. Plan (how)
- **Signals:** "plan this", "how should we build it", "architecture", a spec that's agreed.
- **Contains:** the stack and why; architecture and data flow; the data model; API contracts; error handling; the testing strategy; research notes on any unfamiliar library (current docs, versions). Kiro's design doc adds sequence diagrams.
- **Leaves out:** long code. "This implementation plan should remain high-level and readable" (Spec Kit); samples go in a separate file.
- **Output:** `plan.md` (plus `data-model.md` and contracts when large).
- **Next:** tasks.

### 6. Tasks (break it down)
- **Signals:** "break this into tasks", "what order", a plan that's agreed.
- **Contains:** small tasks, each traced to the requirement it serves, each "implemented and tested in isolation" (Osmani), in phases: setup, foundations, one group per user story, polish (Spec Kit); dependencies, and the tasks that can run in parallel marked; tests included when the project wants them.
- **Output:** `tasks.md` or a todo list. For ready-to-paste prompts per task, use `/sharpen:sharpen-split`.
- **Next:** build, one task at a time.

### 7. Build (one task)
- **Signals:** "implement task 3", "build the next step", "build SPEC.md".
- **Contains:** read the spec, plan and task first; one task per session; the agentic brief from `briefs.md` with the task's own check; "keep going until <tests> pass" (Anthropic); mark the task done in `tasks.md`. BMAD sizes a build session at "roughly 500 changed lines, not counting tests", then starts a fresh chat.
- **Leaves out:** other tasks, and changes to the spec. If the spec turns out wrong, stop and say so.
- **Next:** review, then the next task.

### 8. Long loop (unattended)
- **Signals:** "overnight", "keep going until all tasks are done", "run this in a loop".
- **Contains:** one item per loop, "choose the most important thing" from the plan file; "don't assume an item is not implemented": search first; no placeholder implementations; run the tests for the unit changed; update the plan file (Huntley's Ralph); plus the long-run lines, caps and trial run from `briefs.md`.
- **Output:** a prompt file (`PROMPT.md`) and a plan file (`fix_plan.md`) the loop rereads every pass.
- **Next:** review the results; a done-check pass.

### 9. Bugfix spec (a stubborn or risky bug)
- **Signals:** a bug that's been "fixed" before, a regression, "make sure this doesn't break anything else".
- **Contains:** three parts: **Current behaviour** (the defect), **Expected behaviour**, **Unchanged behaviour** (what must keep working) (Kiro); the root cause, once found; a failing test first.
- **Next:** build the fix; the unchanged-behaviour list becomes regression tests.

### 10. Review (check a phase's output)
- **Signals:** "review this", "does this match the spec?"
- **Contains:** the *Review* shape in `briefs.md`, against the spec, skipping style ("review … against SPEC.md… report gaps that affect correctness and skip style": Anthropic), in a fresh session or subagent.
- **Next:** fix the findings, or the next task.

### 11. Done check (converge)
- **Signals:** "is it done?", "what's left?", the end of the task list.
- **Contains:** compare the spec's requirements one by one with the code and tests; list each as met (with evidence), partly met or missing; add tasks for the gaps only, without changing finished ones (Spec Kit's converge step). Repeat until nothing is missing.
- **Next:** done, or the new tasks.

### 12. Resume (pick up again)
- **Signals:** "where were we", "continue tomorrow", a fresh session on old work.
- **Contains:** read the memory or progress files first ("I MUST read ALL memory bank files at the start of EVERY task": Cline); state what's done, what's next and how to check it.
- **Output:** for leaving work, `/sharpen:sharpen-handoff`. For a whole project with many sessions ahead, keep a small set of living files (a brief, the current focus, progress) and update them at each milestone.

## The one-pass prompt ("master prompt")

People often ask for a "master prompt" that does everything. None of the sources above names that as a type. The nearest is Kiro's quick spec: requirements, design and tasks "in one pass without approval gates", for well-understood features. Use it only when the feature is clear and small enough for one session. Write it as the spec, plan and task sections in one prompt, followed by the build brief, with one check at the end. For anything bigger, split it into phases. A single giant prompt runs into the rule-overload limits in `techniques.md` (*Size it*), and nobody checks it until the end.

## On the card

- A big feature with no spec: offer options that are different actions, such as **Interview me** (phase 2), **Spec first** (phase 3) and **Build now** (the normal brief). Most likely first; `Run as typed` stays last.
- Name the phase in the prompt's first line ("Phase: plan for SPEC.md") and end with `Next:` and the next phase, so the user knows the following prompt.
- For the whole chain as files, point to `/sharpen:sharpen-plan`.
