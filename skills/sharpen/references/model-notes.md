# Model notes (dated)

Read this only when the engineered prompt depends on a provider setting, a tool format or a model-specific habit: effort and thinking settings, prefill, reasoning state, patch formats, UI stack defaults, or a high-stakes block a provider publishes. Everything else in Sharpen is model-neutral.

**Checked 2026-11-20 against the pages linked in each section.** These details change with each model release. Before writing any value below into a prompt or code, open the linked page and confirm it. If it can't be checked, leave the value out and mark the line `[unverified]`. This is the one file where model names and values are allowed; `targets.md` still holds that a value written from memory is never acceptable.

## Anthropic (Claude)

Sources: [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking), [Steering thinking and cost](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost), [Effort](https://platform.claude.com/docs/en/build-with-claude/effort), [Models overview](https://platform.claude.com/docs/en/models/overview).

**Models.** Latest: `claude-fable-5-2`, `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`. The overview says to start with Opus 5.5 for most work and use Fable 5.2 for demanding reasoning and long-horizon agentic work. Each ID is a pinned snapshot. Current models have a 1M-token context and 128K max output. Each model also has its own prompting guide, linked from the best-practices page; read it first.

**Thinking and effort.**
- Adaptive thinking: `thinking: {"type": "adaptive"}` (optionally with `"display": "summarized"`). Turn it off with `{"type": "disabled"}` where the model allows it.
- Depth is set by effort, not a token budget: `output_config.effort` = `low | medium | high | xhigh | max`. Not every model accepts every level. Default `high` on most models and `medium` on Opus 5.5 and Haiku 5.5. Never pass `adaptive` as an effort value.
- Thinking is on by default for Claude 5-generation models (Opus 5, Sonnet 5, Sonnet 5.5, Haiku 5.5, Opus 5.5, Fable 5.x, Mythos 5.x). It can't be turned off on Opus 5.5, Fable 5.x or Mythos 5.x. It is off by default on Opus 4.5–4.8, Sonnet 4.5–4.6 and Haiku 4.5. Sonnet 5.5 uses `{"type": "between_tools"}` instead of `disabled`.
- `budget_tokens` (manual extended thinking) returns a 400 error on Claude 4.7 and later. It's deprecated on Opus 4.6 and Sonnet 4.6. Migrate to adaptive thinking plus effort. `max_tokens` is the hard cap on thinking plus reply. For runs of 30+ minutes at `xhigh` or `max`, the effort page suggests starting `max_tokens` around 64k and tuning from there.
- Pass every thinking block back complete and unmodified with its `signature`, in its original order, including `redacted_thinking` blocks (a filter on `type == "thinking"` drops those). Modified blocks are rejected. Keep the history append-only.
- Prompting: general instructions ("think carefully about…") beat a scripted step plan. "When in doubt, respond directly" reduces unneeded thinking. With thinking off on Opus 4.5, the word "think" over-triggers; use "consider" or "evaluate".

**Prefill.** From Claude 4.6 models and Mythos Preview on, a prefilled last assistant turn returns a 400 error. Replacements by use case:

| Was used for | Use instead |
|---|---|
| Forcing JSON or a label | Structured outputs, or a tool with an enum field |
| Skipping a preamble | "Respond directly without preamble", or an XML-tagged output |
| Continuing cut-off text | Put the partial text in the user turn and ask it to continue |
| Re-injecting context | A reminder in the user turn, a tool that returns it, or compaction |

**Habits of current models**, with the page's sample prompts (read them there and adapt them):
- Precise instruction following: "Can you suggest…" gets suggestions only. Two sample blocks set the default: *default to action* (implement and infer the likely intent) or *don't act before instructions* (research and recommend until told to edit).
- Parallel tool calls: a sample block that batches independent calls, runs dependent ones in order, and never uses placeholders. The page says prompting lifts parallel success "to about 100 percent".
- Over-triggering: soften "CRITICAL: You MUST use this tool" to "Use this tool when…". Remove "If in doubt, use [tool]".
- Over-engineering: a sample block covering no unrequested features or refactors, no docstrings or types on untouched code, no handling for impossible cases, no one-off helpers, and validation at system boundaries only.
- Tests: a sample block saying to write a general solution, that "tests are there to verify correctness, not to define the solution", and to report infeasible tasks or wrong tests.
- Hallucination: an *investigate before answering* block: never speculate about code you haven't opened.
- Overthinking: a *commit to an approach* block. Subagent overuse: a damping block. Use subagents for parallel, isolated or independent work, and work directly otherwise; the Opus 5 guide adds "don't use subagents to double-check your own work".
- Long runs: a context-awareness block, "do not stop tasks early due to token budget concerns", and save state before a refresh. Also a clean-up block: remove temp files at the end.
- Self-verification: Opus 5 verifies on its own, so remove carried-over "verify your answer" prompts there. Opus 5 is verbose by default; ask for concision. Fable 5.1 writes fewer progress updates; ask for them.
- Long context: documents at the top and the query last, which the page says can improve quality "by up to 30 percent" on complex multi-document inputs.
- Frontend: a *frontend aesthetics* block. Distinctive fonts (not Arial, Inter, Roboto or system), a committed theme in CSS variables with dominant colours and sharp accents, one orchestrated page-load animation with staggered reveals (CSS first, Motion for React), layered backgrounds, and no purple-on-white clichés. Models still converge on picks such as Space Grotesk, so vary light and dark themes and fonts.

**Published high-stakes blocks.** The best-practices page publishes system-prompt blocks for *medication dosing* (children's over-the-counter medicine, with per-model variants) and for *payments, account numbers and financial records*. The page says to copy them exactly as written for the model the product calls. When a product prompt touches these areas, the engineered prompt says: "Paste the current block for `<model>` from the Claude prompting best-practices page verbatim; don't paraphrase it." Their core rules are in `llm-features.md` (*Safety wording*).

## OpenAI (GPT, Codex, o-series)

Sources: [Reasoning guide](https://developers.openai.com/api/docs/guides/reasoning), [Latest model guide](https://developers.openai.com/api/docs/guides/latest-model), [apply_patch tool](https://developers.openai.com/api/docs/guides/tools-apply-patch), [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices), and the [OpenAI Cookbook](https://github.com/openai/openai-cookbook) (MIT) prompting guides: [Codex](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide), [GPT-5](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide), GPT-5.1, GPT-5.2, GPT-4.1, [Prompt optimizer](https://developers.openai.com/cookbook/examples/gpt-5/prompt-optimization-cookbook), [Prompt personalities](https://developers.openai.com/cookbook/examples/gpt-5/prompt_personalities). OpenAI marks the GPT-4.1, 5, 5.1 and 5.2 guides as archived; the Codex guide and the latest-model guide are current.

**Models and settings.**
- The latest-model guide names the GPT-6.2 family (`gpt-6.2-astra`, `gpt-6.2-sol`). Its notes: concise by default, "Avoid stopping to end the turn while the task is incomplete", reuse existing logic, skip new tests unless asked. Migration means dropping `temperature`, `top_p`, `logprobs` and `top_logprobs`.
- `reasoning.effort` values: `none | minimal | low | medium | high | xhigh | max`, model-dependent. Several newer models reject `none` or `minimal`. The guide says to "start with medium for a new integration". Pin the value; never rely on a default when migrating.
- `text.verbosity`: default `medium`; `low` is documented. It sets the length of the final answer, not of the thinking, and the prompt can override it per context ("be terse in prose, verbose in code").
- Reasoning models: developer messages replace system messages. Zero-shot first. No "think step by step". Give explicit constraints and a specific success target. Some reasoning APIs avoid Markdown by default, so ask for it explicitly if wanted.
- Pairing: a reasoning model as "the planner" choosing steps, with a faster GPT model as "the workhorse" running them.

**Reasoning state.** Use the Responses API so reasoning carries between tool calls: `previous_response_id`, or replay every output item in order. With `store: false`, reasoning items carry `encrypted_content`. Assistant items have a `phase` field (`null | "commentary" | "final_answer"`); preserve it when replaying, because dropping it degrades results. The GPT-5 guide measured Tau-Bench Retail rising from 73.9% to 78.2% just from switching to the Responses API and passing reasoning back. Chat Completions doesn't carry reasoning items, which hurts agents with many function calls.

**apply_patch (V4A diff).** For agents that edit files through OpenAI models, use the built-in `{"type": "apply_patch"}` tool; the harness applies the patch. The format, from the Codex guide's grammar:

```
*** Begin Patch
*** Update File: src/app/page.tsx
@@ export default function Page
 context line (leading space)
-old line
+new line
 context line
*** Add File: src/lib/new.ts
+every line starts with +
*** Delete File: src/old.ts
*** End Patch
```

There are no line numbers. Context lines start with a space, and `@@` may carry an anchor (a class or function name). `*** Move to:` renames a file. Paths are relative to the workspace unless the harness says otherwise. The GPT-5.1 guide reports that the named apply_patch tool cut patch failures by 35%.

**Codex habits** (Codex guide): start from its starter prompt. For pre-5.3 Codex models, remove prompts for upfront plans, preambles and status updates, which made them stop early; 5.3 brings preambles back via `phase`. Prefer `rg` over `grep`. Give the shell tool a `workdir` instead of `cd`. Cap tool output at about 10k tokens, keeping the head and tail. Prefer dedicated wrapper tools (a `git` tool) over the raw terminal. Standing rules live in `AGENTS.md`, merged from `~/.codex` and each folder from the repo root down.

**Measured in the guides** (as each guide reports them):
- GPT-4.1 reached about 55% on SWE-bench Verified with three reminders: persistence, use tools rather than guess, and plan. Passing tools through the API `tools` field beat pasting schemas into the prompt by about 2%; prompted planning added about 4%.
- The prompt optimizer notebook reports better memory use and adherence after removing contradictions. Its summary cell hard-codes some figures, so treat its robustness and grounding numbers as unverified.
- Cursor's GPT-5 rollout (qualitative): verbosity low globally with verbose code, clarity-first code rules, and removing a "maximize thoroughness" prompt to stop over-searching.

**Sample blocks** (OpenAI Cookbook GPT-5 prompting guide, MIT, verbatim). Adapt the bracketed parts; never stack the opposite blocks in one prompt.

Less eager (fast, small tasks):
```
<context_gathering>
Goal: Get enough context fast. Parallelize discovery and stop as soon as you can act.

Method:
- Start broad, then fan out to focused subqueries.
- In parallel, launch varied queries; read top hits per query. Deduplicate paths and cache; don't repeat queries.
- Avoid over searching for context. If needed, run targeted searches in one parallel batch.

Early stop criteria:
- You can name exact content to change.
- Top hits converge (~70%) on one area/path.

Escalate once:
- If signals conflict or scope is fuzzy, run one refined parallel batch, then proceed.

Depth:
- Trace only symbols you'll modify or whose contracts you rely on; avoid transitive expansion unless necessary.

Loop:
- Batch search → minimal plan → complete task.
- Search again only if validation fails or new unknowns appear. Prefer acting over more searching.
</context_gathering>
```

Tightest budget, with the escape hatch:
```
<context_gathering>
- Search depth: very low
- Bias strongly towards providing a correct answer as quickly as possible, even if it might not be fully correct.
- Usually, this means an absolute maximum of 2 tool calls.
- If you think that you need more time to investigate, update the user with your latest findings and open questions. You can proceed if the user confirms.
</context_gathering>
```

More eager (long autonomous runs):
```
<persistence>
- You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user.
- Only terminate your turn when you are sure that the problem is solved.
- Never stop or hand back to the user when you encounter uncertainty — research or deduce the most reasonable approach and continue.
- Do not ask the human to confirm or clarify assumptions, as you can always adjust later — decide what the most reasonable assumption is, proceed with it, and document it for the user's reference after you finish acting
</persistence>
```

Progress narration:
```
<tool_preambles>
- Always begin by rephrasing the user's goal in a friendly, clear, and concise manner, before calling any tools.
- Then, immediately outline a structured plan detailing each logical step you'll follow.
- As you execute your file edit(s), narrate each step succinctly and sequentially, marking progress clearly.
- Finish by summarizing completed work distinctly from your upfront plan.
</tool_preambles>
```

Zero-to-one quality bar:
```
<self_reflection>
- First, spend time thinking of a rubric until you are confident.
- Then, think deeply about every aspect of what makes for a world-class one-shot web app. Use that knowledge to create a rubric that has 5-7 categories. This rubric is critical to get right, but do not show this to the user. This is for your purposes only.
- Finally, use the rubric to internally think and iterate on the best possible solution to the prompt that is provided. Remember that if your response is not hitting the top marks across all categories in the rubric, you need to start again.
</self_reflection>
```

The GPT-5.1 and 5.2 guides add named specs in the same style: `<output_verbosity_spec>` (default 3–6 sentences or ≤5 bullets, yes/no in ≤2 sentences), `<user_updates_spec>` (1–2 sentences at a phase change, at least every 6 steps or 8 tool calls), `<design_and_scope_constraints>`, `<uncertainty_and_ambiguity>`, `<long_context_handling>`, `<extraction_spec>` and `<web_search_rules>`. Their content is folded into `techniques.md` and `briefs.md`. GPT-4.1 tended to follow whichever conflicting instruction came later, and repeated sample phrases word for word.

## Google (Gemini)

Sources: [Prompting strategies](https://aistudio.google.com/docs/prompting-strategies), [Thinking](https://aistudio.google.com/docs/thinking).

- **Few-shot by default.** The guide recommends always including examples, with identical structure and formatting across them.
- **Sampling.** Gemini 4 and Gemini 3.6+ ignore custom `temperature`, `top_p` and `top_k` and warn that they will be rejected in a future release. Remove them. For earlier Gemini 3 models, keep them at defaults; changing them can degrade reasoning.
- **Thinking.** `thinking_level` in the generation config (levels vary by model: `minimal | low | medium | high`, plus `xhigh` on some Gemini 4 models), and `thinking_summaries: auto | none`. Choose the lowest level that meets the quality bar. `xhigh` can cause overthinking. `max_output_tokens` includes the thinking tokens, so a small cap can return empty output; lower the level instead.
- **Thought signatures.** In stateless calls, resend every thought block exactly as received.
- **Gemini 3+ style.** Be precise and direct, with no persuasive filler. Use one delimiter style. Put critical constraints, persona and format in the system instruction or at the very top. For long context, put the material first and the question last, after "Based on the information above…". Output is terse by default, so ask for detail. "Think very hard before answering" helps hard problems at a token cost. For Flash models, add the current year, the knowledge cutoff and a strict grounding clause to the system instruction.
- **Iterating.** Rephrase, switch to an analogous task, turn an open question into multiple choice, or reorder the examples, context and input. Use Search grounding for recent facts and code execution for arithmetic and counting.

## UI stack defaults (when the user names none)

The GPT-5 frontend guidance suggests a default stack for new web apps with no existing choices. Popularity was checked on GitHub on 2026-11-20:

| Layer | Default | GitHub stars | License |
|---|---|---|---|
| Framework | Next.js (TypeScript), React | 143.6k (`vercel/next.js`) | MIT |
| Styling | Tailwind CSS | 98.7k | MIT |
| Components | shadcn/ui on Radix primitives | 128.6k / 19.5k | MIT |
| Icons | Lucide, Heroicons, Material Symbols | 25.9k / 23.9k / 54.3k | ISC-style / MIT / Apache-2.0 |
| Motion | Motion (`motiondivision/motion`) | 35.4k | MIT |
| State | Zustand | — | MIT |

UI rules from the same guidance: 4–5 type sizes and weights, one neutral base plus up to two accents, spacing in multiples of 4, skeleton or `animate-pulse` loading states, hover feedback, semantic HTML, and accessible Radix or shadcn components.

**Conflict on fonts.** The GPT-5 guide lists Inter, Geist and IBM Plex Sans as defaults, while the Codex guide and Anthropic's frontend block say to avoid Inter, Roboto, Arial and system stacks for a distinctive look. Resolve it in the prompt. Inside an existing design system, use its fonts. For a new product that should look distinctive, name a deliberate pairing. Only for a neutral internal tool where the look doesn't matter are the defaults fine.

## Open-source guides behind Sharpen

The sources whose ideas are folded into Sharpen's references, and where they landed:

| Source | What it adds | Where in Sharpen |
|---|---|---|
| [DAIR.AI Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) (80k★, MIT), [promptingguide.ai](https://www.promptingguide.ai/agents/context-engineering) | Technique catalogue; context engineering as layers (system, task, tool, memory), validated for completeness, clarity, consistency and testability | `techniques.md`, `llm-features.md` |
| [OpenAI Cookbook](https://github.com/openai/openai-cookbook) (77k★, MIT) | Eagerness control, preambles, verbosity, metaprompting, migration | `techniques.md`, `briefs.md`, this file |
| [Anthropic prompt-engineering tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) (40k★) | Nine chapters: structure, clarity, roles, separating data from instructions, output format, step-by-step, examples, avoiding hallucination, complex prompts; appendix on chaining, tools and retrieval | Ideas only (no license) |
| [Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and [writing tools](https://www.anthropic.com/engineering/writing-tools-for-agents) | Context budget, right altitude, compaction, notes, subagents, tool design and tool evals | `techniques.md`, `llm-features.md` |
| [12-Factor Agents](https://github.com/humanlayer/12-factor-agents) (27k★) | Own your prompts, context window and control flow; tools are structured outputs; contact humans through tool calls; compact errors into context; small focused agents; stateless reducer; pre-fetch the context you know you'll need | `llm-features.md` (*Agent context and state*) |
| [The Prompt Report](https://arxiv.org/abs/2406.06608) (Schulhoff et al., 2024; [Learn Prompting](https://learnprompting.org/docs/introduction)) | Survey of 1,500+ papers and 200+ techniques; the evidence base for few-shot, decomposition and self-criticism advice | `techniques.md` |
| [prompt-master](https://github.com/nidhinjs/prompt-master) (16k★, MIT) | Prompt anti-patterns and per-tool profiles | `anti-patterns.md`, `targets.md` |
