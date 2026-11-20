# Target profiles

Read this when the engineered prompt is for a tool other than the agent you're running in: mostly through `/sharpen:sharpen-prompt` ("for Cursor", "for ChatGPT"). The default target is this agent, and needs no profile.

Ideas adapted from [prompt-master](https://github.com/nidhinjs/prompt-master) (MIT), the [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Saravia, 2022, MIT), the Anthropic, OpenAI and Google prompting guides, and the Codex, GPT-5 and reasoning guides in the [OpenAI Cookbook](https://github.com/openai/openai-cookbook) (MIT). Sharpen covers coding agents and text models; image, video and voice tools are out of scope.

**Model names change fast.** Never write a model name, version, context size or setting into a prompt from memory. If it matters, check the provider's current docs, or leave it out and say it's unverified. `model-notes.md` holds dated, sourced notes on settings, prefill, reasoning state, patch formats and UI stack defaults for Anthropic, OpenAI and Google, with the page to confirm each one.

## Coding agents (edit files, run commands)

All of these need the agentic brief from `briefs.md`: starting state, target state, scope lock, "stop and ask before", and a binary done-when. They differ in emphasis:

| Target | What matters most |
|---|---|
| **Claude Code** | Front-load the goal, paths, constraints and the check command, written as "run X and iterate until it passes". Point to artifacts with `@path` instead of pasting them. Add "Only make the changes this asks for" for bugs and refactors; for a feature the user wants complete, list the extras instead. Use subagents for independent, sizeable tracks or to keep a noisy search out of the main context, and a fresh subagent to review the result; not to redo the same build. A rule that keeps getting missed belongs in a hook. Ask for real command output as evidence. |
| **Codex (CLI, IDE, cloud)** | Goal, context, scope, constraints, approval boundaries, done. Name the verification commands. Bias to action: proceed on reasonable assumptions and list them, and don't end on a plan or a question unless blocked. One agent owns the result; any delegated part gets a bounded deliverable. Standing rules belong in `AGENTS.md` (merged from the repo root down to the working folder), not in every prompt. Root-cause fixes that follow the codebase's conventions; no destructive git; never revert changes it didn't make. For reviews: findings first, by severity, with file:line. |
| **Cursor / Windsurf** | The file-scope shape: exact path and symbol, current behaviour, desired change, a do-not-touch list, the language version, and "Done when". Split big tasks into sequential prompts. |
| **Cline** | Starting and target state, the files it may edit, and approval gates: "Ask before running terminal commands or installing dependencies." Match the wording to the model it runs on. |
| **GitHub Copilot (inline)** | Write the exact signature, docstring or comment right above the cursor: inputs, return type, edge cases, and what it must not do. It completes what it predicts, so leave no ambiguity. |
| **Copilot agent / Gemini CLI** | The agentic brief, with the repo's check commands, and explicit approval boundaries for destructive commands. |
| **Devin / SWE-agent** | Very explicit start and target state, a filesystem scope ("Only work in `src/`"), and a forbidden-actions list: these make their own decisions otherwise. |
| **App builders (Bolt, v0, Lovable)** | Stack and versions, what not to scaffold, component boundaries, and "Do not add features that aren't listed" (auth, dark mode…) to stop boilerplate bloat. |
| **Browser agents** | The outcome, not the clicks. Permission limits ("research only, no purchases") and a stop before any form submission, purchase or message. |

## Chat models (no file access)

The model can't see the repo, so the prompt must carry it: the stack, the relevant code as short excerpts in named tags, the constraints, and the exact output wanted. No `Tools:` or `Hooks:` lines.

For every chat model: a bug report carries the code, the expected output and the actual output; a SQL request carries the table definitions and the dialect; code that gets pasted somewhere names the function or variable, what to leave out (imports, prose) and the wrapper. Strip customer data, internal URLs and private prompts before anything leaves this agent. For API use, the system part holds the role and standing rules and the user part the task; examples can be earlier user/assistant turns; when the reply is parsed, also turn on the provider's structured-output mode. Sampling settings aren't prompt text; never write values from memory.

| Target | What matters most |
|---|---|
| **ChatGPT / OpenAI models** | Goal, context, constraints, done, output. Start lean; add structure only for complex tasks. Markdown sections for the instructions, XML tags for pasted reference material. Ask for conclusions, assumptions and checks, not hidden reasoning. Spell out how much autonomy it has: when to proceed on assumptions and when to stop and ask. Precise models suffer most from contradictions, so remove them. Markdown only where it's meaningful, with backticks for file and function names. For very long context, put the instructions both before and after the material. A short scope gets depth: one prompt, one deliverable. |
| **Claude (chat or API)** | Clear and direct, with the reason behind each constraint; XML tags such as `<context>`, `<task>` and `<output_format>` for mixed content; long documents (each in `<document>` with its `<source>`) before the question; 3–5 diverse examples in `<examples>` when format matters. Calm wording: "CRITICAL"/"MUST" makes current models over-trigger. Say plainly whether to act or only suggest. Ask for what newer models drop by default: a summary after tool use, progress updates, polish and animation in UI work. Don't rely on prefilling the reply. |
| **Gemini** | Strong with long context: put the material first and the question after, opening with "Based on the information above…". Few-shot examples with identical structure, and a labelled output prefix to lock the format. One structure style (XML or Markdown), fuzzy terms defined. For grounded work: "Base your answer only on the provided context; if it isn't there, say so", plus today's date for time-sensitive questions. |
| **Reasoning models (o-series, DeepSeek-R1, thinking modes)** | Most current models reason by default. Clear instructions: the goal, the constraints, the output format and what done looks like, stated explicitly so they don't over- or under-think. No hand-written step plan and no request to write the reasoning out (it may be declined, and it doesn't help); a general "think carefully" is fine. Zero-shot first; add examples only if the format misses, and make them match the instructions. Shallow answer? Raise the effort or thinking setting, not the wording. Give a specific success target and let it iterate until it's met. For a pipeline, a reasoning model can plan and pick the steps while a faster model runs each one. |
| **Open-weight and local models (Llama, Mistral, Qwen via Ollama)** | Shorter, flatter prompts, more explicit than for frontier models. A clear role up front: in the system prompt if the model has one, otherwise at the top of the first user turn. No generic safety text: it makes small models refuse harmless requests. Name the steps for multi-step logic, give a hard length or format limit and a clear end ("Stop after the code block"), plain standard English, and "return only the code/JSON" when it's parsed. A few examples help. The runtime (Ollama, an API) applies the chat template; on a raw completion endpoint, use the model card's template, never special tokens from memory. Ask which model is running when it matters. |
| **Base / completion models (no instruction tuning)** | They continue text rather than follow commands. Write the start of the wanted output: a few examples ending in an open slot (`Answer:`), a `Q:`/`A:` frame, or a function signature and docstring to complete. No system role. |

## People (tickets, issues, a teammate)

Title, what's wrong or wanted, where, and how to tell it's done. No agent instructions and no tool lines.
