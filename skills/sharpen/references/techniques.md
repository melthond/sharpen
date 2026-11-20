# Techniques

Read this when a plain brief won't be enough: the task needs reasoning, several dependent steps, a decision between options, checking, long or pasted material, or an agent working on its own for a long stretch. Pick the one technique the task needs and write it into the prompt as a short instruction. Never name the technique in the prompt ("use Tree of Thoughts"); write what to do.

Ideas adapted from the [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Saravia, 2022, MIT), the papers it collects, the Anthropic, OpenAI and Google prompting guides, Anthropic's [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025) and Claude prompting best practices, and the prompting guides in the [OpenAI Cookbook](https://github.com/openai/openai-cookbook) (MIT), rewritten for coding agents.

## Escalation ladder

When `Tried:` shows a plain prompt already failed, climb one rung; don't just reword it.

1. **Zero-shot:** a clear instruction and a finish line.
2. **Examples:** one to three examples of the exact output (see *Examples* below).
3. **Steps:** the procedure as numbered steps, for non-reasoning models (see *Visible steps*).
4. **Chain:** split it into prompts where each output feeds the next, with a check between them.
5. **Tools:** hand the part the model gets wrong to code, a test, a search or a tool.

## Decompose and chain

| Situation | Write into the prompt |
|---|---|
| Steps depend on each other | `1) List every call site of X as file:line. 2) Change only those. 3) Run <test>.` One output feeds the next. |
| A step can go wrong | A gate between steps: "After step 1, run `<check>`; go on only if it passes, otherwise stop and report." |
| Order matters | Numbered steps. When the path is open, give only the goal, the limits and the check, and let the agent plan. |
| A compound question | Numbered sub-questions, each answered with its own evidence, then the combined answer. |
| A long document or many files | First pull out the relevant quotes (with file:line or section), then answer only from those quotes. If there are none, say so. |
| A design or "why" question | Step back first: "State the governing constraint or principle, then apply it to this case." |
| Many items (files, endpoints, tickets) | "Do every item or say why it's unnecessary. Merge duplicates first and say so. Never skip one silently." |

## Reason in the open, check the reasoning

- **Visible steps for non-reasoning models.** Older, small or local chat models, and hybrid models with thinking off, do better when the prompt names the steps ("first list the odd numbers, then add them, then say odd or even") or asks for the working before the answer. That's written reasoning, not hidden reasoning: allowed, and often the fix.
- **Reasoning models and agents** (most current models reason by default) plan on their own. No hand-written step plan and no request to write the reasoning out; a general "think carefully about the edge cases" is fine. Do state the constraints, the process limits and the output format explicitly, since they over- or under-think without them. If an answer comes back shallow, suggest the user raise the host's effort or thinking setting; that's a setting, not prompt text.
- **Never ask for hidden reasoning** ("show me your chain of thought"). Ask for the conclusion, the evidence and the assumptions. Written reasoning isn't always faithful, so evidence is what makes the answer checkable.
- **Compute, don't estimate.** Counting, arithmetic, dates, string operations (spelling, reversing, lengths) and data questions go to code: "Compute it with a short script and report the script and its output." Models fail at these in their heads.
- **Independent candidates.** For a high-stakes judgement (root cause, estimate, risk): "Give 2–3 independent candidate explanations, then say which the evidence supports and where they agree." For long research, keep them as competing hypotheses: "Track each hypothesis with a confidence level in `<notes file>`, update it as evidence arrives, and critique your leading one before concluding."
- **Self-rubric for work from scratch.** For a new page, app, document or design with no existing pattern: "Before building, set 5–7 criteria for an excellent result (keep them to yourself). Check the draft against each and iterate until it meets all of them." This is for creating; a judge rubric (below) is for grading.
- **Draft, review, refine.** When quality matters more than speed, chain three passes: draft it, review the draft against named criteria and list the gaps, then revise only those gaps.
- **High-stakes re-scan.** For legal, financial, medical, security or compliance answers: "Before answering, re-scan for unstated assumptions, numbers not backed by a source, and absolute words (always, never, guaranteed); qualify or remove them." When a missing fact changes the answer (age and weight, jurisdiction, amount, version), the prompt says to ask for it rather than assume. When no authoritative source is available, say so and point to the professional who can answer.
- **Options before a choice.** For a design decision: "Propose 2–3 approaches, rate each against <criteria>, drop the ones that can't work, recommend one with the reason."
- **Look before claiming.** For questions, reviews and exploration: "Open and read the files before making any claim about them; never guess about code you haven't opened."
- **Self-closing check.** Write `Done when:` as a command plus "iterate until it passes", so the agent checks its own work. Don't stack extra "double-check everything" lines on top: some models over-verify.
- **Verify before finishing.** "Before you finish, list the checks that would prove this right, run or answer each one separately, then fix what fails." For prose (summaries, PR descriptions, release notes, docs): "Check each claim against the diff or source and list any it doesn't support."
- **Claim only what a result showed.** "Say a test passed, a payment went through, or a file changed only if a command or tool result in this session showed it; otherwise say it's unverified."
- **Retry with a reason.** After a failed attempt: "Write one line on why it failed, then change one thing and retry. Stop after two failed attempts at the same error and report." Tests are the judge, unless the output is nondeterministic or hardware-dependent; say so then.
- **A plan for long runs.** "Write a short plan first and keep it updated (todo tool or `<plan file>`). Revise it when an observation contradicts it. For big or risky work, show the plan and wait for approval."
- **A judge needs a rubric.** For grade, compare or review prompts, list the criteria and ask for a verdict per criterion, then the overall call.

## Agent runs: eagerness, context and long horizons

For prompts that send an agent off to work on its own: how far to search, how to use its context, and how to keep a long run on track.

**Context is a budget.**
- Aim for the smallest set of high-signal material that gets the result. Accuracy falls off gradually as context grows ("context rot"), so more context isn't safer.
- For a coding agent, pass identifiers (paths, symbols, a query, a URL) and let it load them when it needs them ("just in time"). Pre-load only the standing rules (`CLAUDE.md`, `AGENTS.md`) and the one excerpt the task hinges on.
- Names, folders, sizes and dates are signals too: `tests/test_utils.py` and `src/core/test_utils.py` mean different things, so give the real path.

**Calibrate how eager it is.**
- *Small or clear task:* give a search budget and an early stop. "Search only until you can name the exact lines to change, at most <N> searches, then act." Always add the escape hatch: "If you're still unsure after that, proceed on the most reasonable reading and list the assumption at the end." A limit without the escape hatch makes it stall.
- *Broad or uncertain task:* ask for persistence. "Keep going until it's fully resolved. Don't hand back on uncertainty: choose the most reasonable assumption, act, and list it at the end." Keep "Stop and ask before:" for the risky actions, with a lower bar for asking before deleting or checking out than before searching.
- Leave out thoroughness amplifiers ("be THOROUGH", "gather maximum context", "if in doubt, use <tool>") on small tasks. They cause over-searching on current models. If an agent under-explores, say what to look at, not how hard.
- *Overthinking:* "Pick an approach and see it through; revisit it only if new information contradicts it."
- *No progress:* "If you've edited the same files twice and the check hasn't moved, stop and summarise what you tried."

**Batch independent work.** "Plan the reads and searches you need, run the independent ones in parallel, and run dependent steps in order. Never guess a missing value or use a placeholder in a tool call: look it up or ask."

**Long runs: pick the lever.**

| Situation | Write into the prompt |
|---|---|
| Long back-and-forth, one thread | Compaction: "When summarising to continue, keep decisions, open bugs, the files in play and the next step; drop raw tool output." |
| Iterative build with milestones | Structured notes: a progress file, the todo tool, and a git commit per milestone, so any fresh session can resume |
| Broad research or parallel tracks | Subagents with clean context, each returning a condensed result with a stated size: "under 300 words" or "a file:line list" |

- **Fresh-window startup.** For work that spans sessions: "On start, run `pwd`, read `progress.md` and `tests.json`, check `git log`, then continue the next unchecked item." Early in the work, add a setup script (`init.sh`) that starts the server and runs the tests. Keep structured status as JSON, free notes as text, and checkpoints in git.
- **Don't stop for budget.** When the host compacts context on its own: "Don't stop early because of context limits; save progress to `<file>` before a reset."
- **Plan hygiene.** No plan for a trivial task. For anything medium or larger: 2–5 milestone items (not "open file" or "run tests"), one in progress at a time, the plan updated after each milestone. Before finishing, mark every item done, blocked (with why) or cancelled (with why). Never end on only a plan, and don't promise tests or follow-ups that won't happen.
- **Progress updates.** A one-line plan before the first tool call. Then 1–2 sentences at each new phase or plan change, outcome first ("Cause is in `cache.ts:40`; next: patch and rerun the suite"). Don't narrate each tool call. Newer models may finish after the last tool call with no summary, so ask for the closing summary when it's wanted.
- **Clean up.** "Delete any temp scripts or scratch files you created before you finish."

## Examples (few-shot)

- **How many depends on the target.** Reasoning models: start with none, and add examples only if the format misses. Claude: 3–5 relevant, diverse ones, each in `<example>` inside `<examples>`. Small or local models: a few, always. Too many and the model overfits to them.
- Examples teach the *format* and the *label set* more than the answers, so match the real input and output shapes exactly.
- Make them **varied** and realistic: different cases, the same format. A single example gets copied word for word, surface details included.
- When examples carry labels or categories, cover **each label about equally** and **mix the order**. Skewed or grouped examples bias the output.
- Include one case where the right answer is the fallback (`NA`, `none found`), so the model learns that "no answer" is allowed.
- Every example must obey every rule in the prompt. A bad example beats a good rule.
- An unusual label the model hasn't seen ("nutral", an internal status) needs a one-line definition as well as an example; models drift back to familiar labels.
- For API targets, put examples in as earlier user/assistant turns rather than inline text.
- When concrete examples would leak content or bias the answer, give a structural skeleton instead (`Step 1: … / Step 2: … / Final answer: …`).
- **Canonical examples beat a list of edge cases.** Three to five varied, typical examples, plus the principle behind them, teach more than fifteen "if X then Y" rules.
- **Sample phrases get copied.** If the prompt offers sample wording (a greeting, a refusal), say it's a sample and to vary it.
- With thinking or reasoning on, an example can show the problem, the method and the answer; the model picks up the method.

## Output shape

- **Close the set.** When the answer is a choice, list the exact allowed values (`status: todo | done | failed`), spelled as in the code, and say "output only the label".
- **Name the empty case.** Every search, extraction, classification or Q&A prompt names the literal reply when there's nothing to find: `none found`, `NA`, `[]`, `Unsure`. That stops invented answers.
- **Machine-read output** (parsed or pasted into code): field names, types, ranges, required vs optional, the exact wrapper, and "return only the JSON/code, no prose around it". Small models pad otherwise.
- **Lock only the final answer** when the task needs reasoning first. A rigid template over the whole response can cost accuracy.
- **End on the label** for chat models: finish the prompt with `Answer:` or the first line of the template, so the reply starts in the right shape.
- **The prompt's style leaks into the output.** Want plain prose back? Keep the prompt light on Markdown.
- **Name the polish** when it's wanted: "include hover and focus states, empty, loading and error states", not "make it nice".
- **Long outputs:** outline first, then expand each part. For summaries: write one, then rewrite it denser without getting longer.
- **Missing means null.** For extraction: "If a field isn't in the source, set it to `null`; never infer it. Re-scan the source before returning." With several documents, keep one result per document under a stable id.
- **Say what to do, shown in the wanted style.** "Write flowing prose paragraphs" works better than "no bullet points". Name the container too (`<summary>…</summary>`).
- **Tone shapes style, not format.** A persona or tone line never overrides a required format (JSON, code, an email template), and an artifact such as an email or code comment takes the tone its task calls for.

## Context placement

- **Delimit pasted material** for every target: logs, code, specs, docs and user text go in named tags or fences (`<error_log>…</error_log>`) and are referred to by that name.
- **Label several documents** (`<doc id="1" source="api.md">`) and refer to them by label in the question.
- **Mind the middle.** Models miss material buried in the middle of long context. Put the key excerpts next to the question, and trim the rest.
- **Where the question goes depends on the target**: Claude does best with long documents first and the question last; many others want the instruction first. With only a little context, the instruction goes first. See `targets.md`.
- **Stable first, changing last.** In a reusable prompt or system prompt, put the fixed part first and the per-request part last, so provider caching can work.
- **Relevance check.** For research: "For each source, note whether it's relevant and current before relying on it."
- **Very long context, instruction-first targets.** For OpenAI-family and similar models, put the instructions both before and after the material; if only once, above it.
- **Document lists in XML or pipes, not JSON.** `<doc id="1" title="…">…</doc>` or `ID: 1 | TITLE: … | CONTENT: …` both work better than a JSON array of documents.
- **Answering from long material.** "Outline the relevant sections first, restate the constraints (date range, jurisdiction, version), and tie each claim to its section; quote exact figures and dates."

## Grounding and time

- **Dates.** For "latest", "recent" or "current", write `Today: <YYYY-MM-DD>` (from the environment) and a real date range. Models are bad with relative time.
- **Exact search terms.** Put the exact product, version, error string and the source types to search into a research prompt.
- **Name the source** ("according to the project's `docs/api.md`…") and ask for a citation per claim.
- **Code beats docs.** "If the docs conflict with the code or with real output, report the conflict, treat the code and the output as the truth, and note the doc's version and date."
- **Attach niche specs.** For an internal or obscure API, include the spec or the relevant excerpt; don't rely on the model knowing it.
- **Generated knowledge, with sources.** "First list what the provided docs and code say about X (with file:line), then answer." Unsourced fact lists invent things.

## Wording

- **Colleague test.** Would a capable colleague who is new to this project do the right thing from the prompt alone? If not, add what they'd be missing.
- **The right altitude.** Between a brittle script of if-else rules and a vague goal: the principles, the concrete signals to act on, and an example or two.
- **Rigid or flexible, on purpose.** Rigid ("do all N, in this order") when completeness matters. Otherwise allow judgement with a short reason. Mark optional steps as optional and give the decision criteria.
- **Give the reason** with any constraint that isn't obvious ("no ellipses: a text-to-speech engine reads this aloud"). Models generalise from the why.
- **Don't stack NEVER/ALWAYS or "CRITICAL: you MUST".** It makes current models over-trigger, and agents brittle and over-cautious. Keep hard rules for real boundaries. When a rule keeps getting missed despite clear wording, suggest a hook that enforces it instead of louder text.
- **No contradictions.** Scan the finished prompt for lines that pull against each other ("be thorough" against "minimal change"). The model wastes effort reconciling them; keep one, or say which wins.
- **One structure style.** XML tags or Markdown sections, not a mix. Define any fuzzy term ("active user = signed in within 30 days").
- **Act or propose, said plainly.** "Can you suggest changes" gets suggestions. Write "Make the edits" or "Propose only; no edits".
- **How far to go.** Agents read requests conservatively. For a feature the user wants complete, list the extras ("empty and error states, keyboard navigation"). Keep "only make the changes this asks for" for bugs, refactors and narrow edits.
- **Repeat the one critical boundary.** In a long brief, restate it next to `Done when:`. That's emphasis that works, unlike capitals.
- **Name the known pitfall** for this kind of task up front, even if it hasn't happened yet ("the tests mock the clock; don't use real timers").
- **Role, tone and reading level** only when they change the output: for user-facing text, a system prompt, or an explanation for a set audience ("for a new team member who knows React but not this codebase").
- **Plain, standard wording** for small or narrow-language models: no slang, no mixed languages.
