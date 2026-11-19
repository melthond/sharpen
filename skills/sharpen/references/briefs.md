# Brief shapes

Read this when the engineered prompt needs more than the quick shape: a multi-file change, an agentic run, an analysis, or a strict output format. Use the smallest shape that carries what the task needs, and leave out any line with nothing real to put in it.

Ideas adapted from [prompt-master](https://github.com/nidhinjs/prompt-master) (MIT), the [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Saravia, 2022, MIT), and the Anthropic, OpenAI and Google prompting guides, rewritten for coding agents.

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

## Long or unattended run (background, overnight, many steps)

The agentic brief, plus the lines that let it run without a human:

```
Plan: write a short plan first and keep it updated in <todo tool or plan file>
Progress: track state in <progress.md / tests.json>; commit at each milestone, so a fresh session can pick up
Do every item or say why it's unnecessary; never skip one silently
Limits: <turn, time or spend cap>; stop and report when reached
Deliver to: <a PR, a branch, a summary file>; <who approves before merge>
```

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

## Placement rules (every shape)

- The goal and the hard boundaries go first; the check goes last.
- Firm, plain wording ("Only change…", "Stop and ask before…"), no shouting in capitals.
- Say what to do. Keep "don't" for the few real boundaries.
- Every line must change what the agent does. Cut the rest. The one exception: restating the critical boundary near `Done when:` is emphasis that works.
- Give the reason with any constraint that isn't obvious.
- No two lines that pull against each other; one structure style (XML or Markdown) per prompt.
- For a coding agent, pass paths and symbols, not pasted files: it reads them itself. For a chat model, paste the excerpts it needs.
- For the reasoning, decomposition, examples and grounding techniques, see `techniques.md`. When the prompt being written goes inside the user's product (a system prompt, template, classifier, tool), see `llm-features.md`.
