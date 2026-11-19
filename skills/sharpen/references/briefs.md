# Brief shapes

Read this when the engineered prompt needs more than the quick shape: a multi-file change, an agentic run, an analysis, or a strict output format. Use the smallest shape that carries what the task needs, and leave out any line with nothing real to put in it.

Ideas adapted from [prompt-master](https://github.com/nidhinjs/prompt-master) (MIT) and Anthropic's prompt-engineering tutorial, rewritten for coding agents.

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
Goal: <one sentence; add why only if it changes the approach>
Starting state: <what exists now: files, behaviour, what passes or fails>
Target state: <what's true after: files changed, behaviour, checks green>
Decided: <binding decisions from the conversation>
Tried: <what already failed, and why>
Work only in: <paths>   Do not touch: <paths>
Constraints: <stack, versions, conventions>. Only make the changes this asks for.
Stop and ask before: <deleting files, new dependencies, schema changes, pushing, deploying>
Tools: <listed skills/agents/MCP tools, in order, each with its job>
Hooks: <hooks that will run, and how they change the work>
Done when:
- [ ] <binary check 1>
- [ ] <binary check 2>
Evidence: report the commands you ran and their real output.
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

When the exact shape matters and describing it isn't working, show it. One or two short examples beat a paragraph of rules.

```
<task>
Match this format exactly:
<example>…</example>
<example>…</example>
```

## Grounded research (facts, docs, APIs)

```
Question: <what to find out>
Sources: <the docs, files or tools to use>
Rules: state only what a source supports; cite it; mark anything unverified as [unverified]
Return: <shape and length>
```

## Placement rules (every shape)

- The goal and the hard boundaries go first; the check goes last.
- Firm, plain wording ("Only change…", "Stop and ask before…"), no shouting in capitals.
- Say what to do. Keep "don't" for the few real boundaries.
- Every line must change what the agent does. Cut the rest.
