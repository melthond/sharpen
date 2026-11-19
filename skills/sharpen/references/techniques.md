# Techniques

Read this when a plain brief won't be enough: the task needs reasoning, several dependent steps, a decision between options, checking, or long or pasted material. Pick the one technique the task needs and write it into the prompt as a short instruction. Never name the technique in the prompt ("use Tree of Thoughts"); write what to do.

Ideas adapted from the [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Saravia, 2022, MIT), the papers it collects, and the Anthropic, OpenAI and Google prompting guides, rewritten for coding agents.

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
- **Independent candidates.** For a high-stakes judgement (root cause, estimate, risk): "Give 2–3 independent candidate explanations, then say which the evidence supports and where they agree."
- **Options before a choice.** For a design decision: "Propose 2–3 approaches, rate each against <criteria>, drop the ones that can't work, recommend one with the reason."
- **Look before claiming.** For questions, reviews and exploration: "Open and read the files before making any claim about them; never guess about code you haven't opened."
- **Self-closing check.** Write `Done when:` as a command plus "iterate until it passes", so the agent checks its own work. Don't stack extra "double-check everything" lines on top: some models over-verify.
- **Verify before finishing.** "Before you finish, list the checks that would prove this right, run or answer each one separately, then fix what fails." For prose (summaries, PR descriptions, release notes, docs): "Check each claim against the diff or source and list any it doesn't support."
- **Retry with a reason.** After a failed attempt: "Write one line on why it failed, then change one thing and retry. Stop after two failed attempts at the same error and report." Tests are the judge, unless the output is nondeterministic or hardware-dependent; say so then.
- **A plan for long runs.** "Write a short plan first and keep it updated (todo tool or `<plan file>`). Revise it when an observation contradicts it. For big or risky work, show the plan and wait for approval."
- **A judge needs a rubric.** For grade, compare or review prompts, list the criteria and ask for a verdict per criterion, then the overall call.

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

## Output shape

- **Close the set.** When the answer is a choice, list the exact allowed values (`status: todo | done | failed`), spelled as in the code, and say "output only the label".
- **Name the empty case.** Every search, extraction, classification or Q&A prompt names the literal reply when there's nothing to find: `none found`, `NA`, `[]`, `Unsure`. That stops invented answers.
- **Machine-read output** (parsed or pasted into code): field names, types, ranges, required vs optional, the exact wrapper, and "return only the JSON/code, no prose around it". Small models pad otherwise.
- **Lock only the final answer** when the task needs reasoning first. A rigid template over the whole response can cost accuracy.
- **End on the label** for chat models: finish the prompt with `Answer:` or the first line of the template, so the reply starts in the right shape.
- **The prompt's style leaks into the output.** Want plain prose back? Keep the prompt light on Markdown.
- **Name the polish** when it's wanted: "include hover and focus states, empty, loading and error states", not "make it nice".
- **Long outputs:** outline first, then expand each part. For summaries: write one, then rewrite it denser without getting longer.

## Context placement

- **Delimit pasted material** for every target: logs, code, specs, docs and user text go in named tags or fences (`<error_log>…</error_log>`) and are referred to by that name.
- **Label several documents** (`<doc id="1" source="api.md">`) and refer to them by label in the question.
- **Mind the middle.** Models miss material buried in the middle of long context. Put the key excerpts next to the question, and trim the rest.
- **Where the question goes depends on the target**: Claude does best with long documents first and the question last; many others want the instruction first. With only a little context, the instruction goes first. See `targets.md`.
- **Stable first, changing last.** In a reusable prompt or system prompt, put the fixed part first and the per-request part last, so provider caching can work.
- **Relevance check.** For research: "For each source, note whether it's relevant and current before relying on it."

## Grounding and time

- **Dates.** For "latest", "recent" or "current", write `Today: <YYYY-MM-DD>` (from the environment) and a real date range. Models are bad with relative time.
- **Exact search terms.** Put the exact product, version, error string and the source types to search into a research prompt.
- **Name the source** ("according to the project's `docs/api.md`…") and ask for a citation per claim.
- **Code beats docs.** "If the docs conflict with the code or with real output, report the conflict, treat the code and the output as the truth, and note the doc's version and date."
- **Attach niche specs.** For an internal or obscure API, include the spec or the relevant excerpt; don't rely on the model knowing it.
- **Generated knowledge, with sources.** "First list what the provided docs and code say about X (with file:line), then answer." Unsourced fact lists invent things.

## Wording

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
