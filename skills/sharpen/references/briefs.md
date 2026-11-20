# Brief shapes

Read this when the engineered prompt needs more than the quick shape: a multi-file change, an agentic run, an analysis, a review, UI work, a prompt that misbehaves, or a strict output format. Use the smallest shape that carries what the task needs, and leave out any line with nothing real to put in it.

Ideas adapted from [prompt-master](https://github.com/nidhinjs/prompt-master) (MIT), the [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Saravia, 2022, MIT), the Anthropic, OpenAI and Google prompting guides, Anthropic's context-engineering and Claude prompting best-practice guides, and the Codex and GPT-5 prompting guides in the [OpenAI Cookbook](https://github.com/openai/openai-cookbook) (MIT), rewritten for coding agents.

## Quick (most prompts)

For a clear, small task: one change, one place, an obvious check.

```
<Goal: precise verb + what + where>
Where: <path:line, symbol>
Done when: <one binary check>
```

## Agentic brief (edits, commands, several files)

For anything that changes code or runs commands and isn't trivial. Front-load the outcome and the boundaries: the first lines get the most weight.

```
Goal: <one sentence: make the edits / propose only; and the why>
Starting state: <what exists now: files, behaviour, what passes or fails>
Target state: <what's true after: files changed, behaviour, checks green>
Decided: <binding decisions from the conversation>
Tried: <what already failed, and why>
Work only in: <paths>   Do not touch: <paths>
Constraints: <stack, versions, conventions, each with its reason if not obvious>. Only make the changes this asks for.
Pitfall: <the known trap for this kind of task, if there is one>
Proceed on reasonable assumptions and list them at the end; ask only for the items below.
Stop and ask before: <deleting files, new dependencies, schema changes, pushing, force-push or reset --hard, public comments or messages, deploying>
If it fails: <retry once with a change; then mark it failed with the reason and stop>
Tools: <listed skills/agents/MCP tools, in order, each with its job>
Hooks: <hooks that will run, and how they change the work>
Done when:
- [ ] <binary check 1: a command; iterate until it passes>
- [ ] <binary check 2>
- [ ] <the one critical boundary, restated>
Evidence: report the commands you ran and their real output.
```

Defaults worth adding when they apply:
- **Code with tests:** "Implement the general logic. Don't special-case test inputs, don't edit or delete tests to make them pass; if a test looks wrong, say so."
- **Shared worktree:** "Never use `--no-verify` or skip checks. Don't revert changes you didn't make or delete files you don't recognise; if the worktree changes unexpectedly, stop and ask."
- **Artifacts in the conversation:** point to them (`@path/to/file`, the pasted screenshot, the log file) instead of paraphrasing them.
- **A feature the user wants complete:** list the extras (empty, loading and error states, keyboard navigation), and drop "Only make the changes this asks for", which pushes the other way.
- **Code quality:** "Fix the root cause. Follow the codebase's conventions, and search for an existing helper before writing one. No broad try/catch, silent fallbacks or type escapes (`as any`). Don't add docstrings, comments or types to code you didn't change, error handling for cases that can't happen, or one-off helpers. Validate only at real boundaries (user input, external APIs)."
- **Exploration:** "Plan the reads you need, run the independent ones in parallel, and stop searching once you can name the lines to change." Add the eagerness lines from `techniques.md` (*Agent runs*) when the task is clearly small or clearly open.
- **Cleanup:** "Delete any temp scripts or scratch files you created."
- **Guards stay.** "Never remove a guard, check, validation or feature to make a test pass, an error go away or something 'secure'. If one looks unnecessary, say so and ask." Agents "fix" bugs by deleting guard clauses nobody can explain (Osmani, *Intent debt*), and one security pass made "the insecure things secure by turning them off" (reported by Simon Willison).
- **Owner line** for refactors, cleanups and anything that touches existing structure: "You are the owner and long-term maintainer of this codebase, and its design is up to you." In Anthropic's tests it raised consolidation of duplicated code from under 10% to about 75% of runs, at about 70–80% more output tokens, so use it where design matters, not on one-line fixes ([Claude Fable 5.2 guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2)).
- **Tests that encode intent.** For bugs and behaviour changes: "First write a test for the intended behaviour and show it failing for the right reason; then fix; then show it passing." Add the way out: "If the tests and the spec conflict, stop and flag it; don't make them pass." On ImpossibleBench, giving agents an explicit flag-for-a-human option cut GPT-5's cheating on conflicting tests from 54% to 9% and o3's from 49% to 12% ([Zhong et al. 2025](https://arxiv.org/abs/2510.20270)). When coverage looks good but the tests are shallow, ask for a mutation-testing pass (Thoughtworks Radar: Adopt).
- **New dependencies:** see `techniques.md` (*Dependencies and docs*): confirm the package exists before installing it.

**Evidence by task type** (the `Evidence:` line). Name the proof that fits, because "it's done" without a way to check is the most common gap ("Claude said it was done and it wasn't quite, usually because it had no way to check its own work": [Claude Code best practices](https://code.claude.com/docs/en/best-practices)). In 2025, 66% of developers named "almost right, but not quite" as their top frustration with AI, and 45.2% said debugging AI code takes longer ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai)).

| Task | Evidence to ask for |
|---|---|
| Code change, bug | The test command and its output, red before and green after |
| UI | Screenshots at each named width, plus the states checked |
| Refactor | The full suite before and after, and "behaviour unchanged" stated against it |
| Performance | The baseline number, the change, the new number, measured the same way |
| Question, explore, review | file:line for every claim |
| Config, deploy, ops | The command, its output, and a read-back of the changed setting |
| Docs, prose | Each claim checked against the source, with any unsupported ones listed |

**Making it self-checking.** When the agent tends to stop early, add one of these to `Tools:` or `Hooks:` (only ones that exist in the setup): a Stop hook that blocks ending until the check command passes, the `/goal` command, or a review by a fresh subagent that didn't write the code ("review against `<spec>`, skip style").

## Long or unattended run (background, overnight, many steps)

The agentic brief, plus the lines that let it run without a human:

```
Plan: 2–5 milestones in <todo tool or plan file>, one in progress at a time, updated after each; before finishing, mark every item done, blocked (why) or cancelled (why)
Progress: track state in <progress.md / tests.json>; commit at each milestone, so a fresh session can pick up
Startup: on a fresh session, run pwd, read <progress.md>, <tests.json> and git log, then continue the next unchecked item
Context: don't stop early because of context limits; save progress to <progress.md> before a reset
Updates: 1–2 sentences at each new phase or plan change, outcome first; no narration of each tool call
Do every item or say why it's unnecessary; never skip one silently
No progress: if the same files are edited twice and the check doesn't move, stop and summarise
Limits: <turn cap> and <spend cap: [ASK: maximum spend in USD]>; stop and report when reached. Headless Claude Code: `claude -p "<prompt>" --max-turns <N> --max-budget-usd <amount>`
Trial run: try it on <three files / one module> first, check the result, then widen
Parallel: one git worktree per session (`claude -w <name>`), at most <N> sessions at once, sized to how much review you can actually do
Deliver to: <a PR, a branch, a summary file>; <who approves before merge>
```

Hard caps, not soft warnings. Unattended runs can burn large budgets (one research run reported by Simon Willison cost an estimated ~$100,000), and soft "warn me after $X" caps "will not cut it". Claude Code's headless mode takes `--max-turns` and `--max-budget-usd` ([best practices](https://code.claude.com/docs/en/best-practices)). Parallel sessions need a cap too: Thoughtworks warns that review capacity becomes the bottleneck and oversight turns into "human-in-the-loop theater" when review can't keep up.

For the choice between compaction, notes and subagents, see `techniques.md` (*Agent runs*).

For multi-session work, pair it with `/sharpen:sharpen-handoff`.

## Chain with gates (dependent steps)

When one step's output is the next step's input, or a wrong step would waste the rest:

```
1. <step>. Output: <what it produces, e.g. a file:line list>
   Gate: <check>; go on only if it passes, otherwise stop and report
2. <step that uses the output of 1>
   Gate: <check>
3. ...
Done when: <final check>
```

## Decision (choose between approaches)

```
Decide: <the choice to make>
Criteria: <what matters, in priority order>
Options: propose 2–3 (or compare <A> and <B>); rate each against the criteria; drop the ones that can't work
Return: the recommendation, the reason, the evidence, and what would change the decision
Read-only.
```

## Review (code, a PR, a diff)

Report only; the user decides what to fix.

```
Review: <diff, branch, PR number or files>
Focus: <correctness, security, performance, tests: in priority order>
Against: <the spec, issue or acceptance criteria the change must meet>
Read the code around the change, not only the diff. No edits. Skip style and naming unless asked.
Report only findings that would cause a wrong result, a security hole, data loss or a failed requirement; leave out nice-to-haves.
Return:
1. Findings, most severe first, each with file:line, the concrete failure (input → wrong result), and a suggested fix
2. Open questions or assumptions
3. One-line overall verdict
If nothing meets that bar, say "No blocking issues" and list what you checked.
```

A reviewer told to find problems "will always find *something*", and fixing every finding piles up "extra abstraction layers and tests for cases that can't happen" ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). Hence the spec to review against, the severity bar and the allowed "no issues" answer. Use a fresh subagent or session that didn't write the code.

## UI and frontend

Say which of two situations this is; they pull opposite ways.

```
Inside an existing design system:
Use the existing tokens, components and patterns (<path to tokens / component library>). Don't invent colours, shadows, fonts, spacing or animations. Match <reference screen or component>. When unsure, pick the simplest reading.

From scratch, or a redesign the user wants bold:
Direction: <the look, in a few concrete words: "editorial, high contrast, serif headings">
Type: a deliberate font pairing, not a default stack (Inter, Roboto, Arial, system)
Colour: one cohesive palette as CSS variables (one base, up to two accents); avoid clichéd defaults such as purple gradients on white
Motion: one or two purposeful animations (a staggered reveal on load), CSS first
Depth: layered backgrounds, gradients or shapes, not flat fills

Both:
States: hover, focus, active, disabled, empty, loading, error
Layout: works at <360px, 768px, 1280px>; no horizontal scroll
Accessibility: keyboard reachable, visible focus, labels, contrast AA
Done when: it renders at each width, and screenshots are checked against <reference or the direction above>
```

## Prompt fix (a prompt that misbehaves)

For a system prompt, template or agent prompt that gives wrong results. Find the cause before patching.

```
Prompt: <path or pasted, in <prompt> tags>
Failures: <transcripts or input → bad output pairs, in <failures> tags>
1. Root cause only: for each failure, quote the lines that cause it (a contradiction, a missing format, a missing fallback, a thoroughness amplifier, a sample phrase being copied)
2. Patch: the smallest edits that fix those causes; keep the structure and roughly the length; no redesign
Return: each edit with its reason, then the revised prompt
Done when: the eval set (normal, edge, empty, adversarial inputs) passes before and after; see llm-features.md
```

## Final report (what the agent hands back)

Size the report to the change, and add it to any brief whose final message matters:

```
Report: lead with what changed, where (path:line) and how it was checked.
- Tiny change: 2–5 sentences, no headings
- Medium: up to 6 bullets
- Large: one short line per file or area, then risks and next steps
No full files, no before/after code pairs, no build or test logs unless something failed. List assumptions and anything unverified.
Where to look: the 1–3 spots a human should review first (riskiest logic, a changed contract, anything guessed), each as path:line with why.
Explain (optional, when the user is learning or the change is non-obvious): the key decision, the alternative rejected, and why.
```

"Where to look" points scarce review at what matters. More than 40% of pull requests now start with an agent ([GitHub Octoverse 2026](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/)), and reviewing everything at the same intensity "ends in human-in-the-loop theater" (Thoughtworks Radar, *Risk-tiered human oversight*). "Explain" counters skill decay. 16.3% of developers say "it's hard to understand how or why the code works" ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai)). In a short study cited by Addy Osmani, AI users scored 50% on a follow-up quiz against 67% for people coding by hand, and the best AI results came from people who asked for explanations ([Agentic skill decay](https://addyosmani.com/blog/agentic-skill-decay/)).

## Subagent contract (delegating part of the work)

Each delegated task gets a brief that can stand alone, because the subagent can't see the conversation:

```
Goal: <one bounded task>
Inputs: <paths, ids, the exact question>; context it can't find itself
Out of scope: <what it must not touch or decide>
Return: <shape and size: "under 300 words" / "a file:line list" / a JSON schema>
Done when: <its own check>
Verified by: <the lead agent / a test / a second reviewer>; the subagent never marks its own work verified
```

The MAST study of 1,600+ multi-agent traces found 14 failure modes in three groups: system design (for example disobeying the task spec, step repetition, unaware of stopping conditions), inter-agent misalignment (failing to ask for clarification, withholding information, reasoning-action mismatch) and task verification (premature termination, no or incorrect verification) ([Cemri et al. 2025](https://arxiv.org/abs/2503.13657)). Each line of the contract closes one of those: a clear goal and scope, an explicit stop, a stated return, and a separate verifier.

## Machine-read output (parsed, pasted into code, or fed to a later step)

```
Return only <JSON / code / CSV>, with no prose around it.
Schema: <field: type, range or enum, required or optional>
Allowed values: <status: todo | done | failed>
If nothing is found: <the exact empty value, e.g. []>
Example: <one valid output>
```

## File-scope (one precise edit)

For a focused change inside one file or function, where breaking something nearby is the main risk.

```
File: <path>   Symbol: <function or component>
Now: <what it does today>
Change to: <what it should do>
Keep: <signatures, names, behaviour that must not change>
Done when: <test or check>
```

## Auditable analysis (debugging, comparing options, reviews)

For judgement work where the answer has to be checkable. Never ask for hidden reasoning.

```
Question: <what to decide or explain>
Scope: <files, data or diff to look at>; read-only
Return:
1. Conclusion
2. Evidence (file:line, measurements, output)
3. Assumptions
4. What would change the conclusion, and what's still uncertain
```

For performance, add: "Measure the baseline first, then change one thing, then measure again."

## Format lock (output must match a shape)

When the exact shape matters and describing it isn't working, show it. A few examples beat a paragraph of rules; how many depends on the target (see `techniques.md`, *Examples*).

```
<task>
Match this format exactly:
<examples>
<example>…</example>
<example>…</example>
</examples>
```

The examples are varied, follow every rule in the prompt, cover each label about equally in mixed order, and include one "nothing found" case. When the task needs reasoning first, lock only the final answer's format. For API targets, examples can go in as earlier user/assistant turns.

## Grounded research (facts, docs, APIs)

```
Today: <YYYY-MM-DD>; period: <the real date range, if "latest" or "recent" matters>
Question: <what to find out, split into numbered sub-questions if compound>
Search terms: <exact product, version, error string>; source types: <official docs, changelog, issues>
Sources: <the docs, files or tools to use, in order of preference>
Success criteria: <what a complete answer contains>
Rules: quote the relevant passages first, then answer only from them; cite each claim; cross-check key claims in two sources where possible; if docs conflict with the code or real output, report it and trust the code; mark anything unverified as [unverified]; if the sources don't say, answer "not in sources"
Return: <shape and length>
```

If a search returns nothing useful, change the query; don't build on the empty result.

For a deeper or unattended research run, add: "Follow second-order leads (a source's own sources, the changelog behind a claim). Where sources disagree, resolve the conflict or report both with dates. When the question is open and no one is there to ask, cover each plausible reading rather than asking." Keep a notes file with the hypotheses and their confidence (see `techniques.md`).

## Placement rules (every shape)

- The goal and the hard boundaries go first; the check goes last.
- Firm, plain wording ("Only change…", "Stop and ask before…"), no shouting in capitals.
- Say what to do. Keep "don't" for the few real boundaries.
- Every line must change what the agent does. Cut the rest. The one exception: restating the critical boundary near `Done when:` is emphasis that works.
- Give the reason with any constraint that isn't obvious.
- No two lines that pull against each other; one structure style (XML or Markdown) per prompt.
- For a coding agent, pass paths and symbols, not pasted files: it reads them itself. For a chat model, paste the excerpts it needs.
- For the reasoning, decomposition, examples and grounding techniques, see `techniques.md`. When the prompt being written goes inside the user's product (a system prompt, template, classifier, tool), see `llm-features.md`.
