# Target profiles

Read this when the engineered prompt is for a tool other than the agent you're running in: mostly through `/sharpen:sharpen-prompt` ("for Cursor", "for ChatGPT"). The default target is this agent, and needs no profile.

Ideas adapted from [prompt-master](https://github.com/nidhinjs/prompt-master) (MIT). Sharpen covers coding agents and text models; image, video and voice tools are out of scope.

**Model names change fast.** Never write a model name, version, context size or setting into a prompt from memory. If it matters, check the provider's current docs, or leave it out and say it's unverified.

## Coding agents (edit files, run commands)

All of these need the agentic brief from `briefs.md`: starting state, target state, scope lock, "stop and ask before", and a binary done-when. They differ in emphasis:

| Target | What matters most |
|---|---|
| **Claude Code** | Front-load the goal, paths, constraints and the check command. Add "Only make the changes this asks for." Use subagents only for independent, sizeable tracks. Ask for real command output as evidence. |
| **Codex (CLI, IDE, cloud)** | Goal, context, scope, constraints, approval boundaries, done. Name the verification commands. One agent owns the result; any delegated part gets a bounded deliverable. |
| **Cursor / Windsurf** | The file-scope shape: exact path and symbol, current behaviour, desired change, a do-not-touch list, the language version, and "Done when". Split big tasks into sequential prompts. |
| **Cline** | Starting and target state, the files it may edit, and approval gates: "Ask before running terminal commands or installing dependencies." Match the wording to the model it runs on. |
| **GitHub Copilot (inline)** | Write the exact signature, docstring or comment right above the cursor: inputs, return type, edge cases, and what it must not do. It completes what it predicts, so leave no ambiguity. |
| **Copilot agent / Gemini CLI** | The agentic brief, with the repo's check commands, and explicit approval boundaries for destructive commands. |
| **Devin / SWE-agent** | Very explicit start and target state, a filesystem scope ("Only work in `src/`"), and a forbidden-actions list: these make their own decisions otherwise. |
| **App builders (Bolt, v0, Lovable)** | Stack and versions, what not to scaffold, component boundaries, and "Do not add features that aren't listed" (auth, dark mode…) to stop boilerplate bloat. |
| **Browser agents** | The outcome, not the clicks. Permission limits ("research only, no purchases") and a stop before any form submission, purchase or message. |

## Chat models (no file access)

The model can't see the repo, so the prompt must carry it: the stack, the relevant code as short excerpts, the constraints, and the exact output wanted. No `Tools:` or `Hooks:` lines.

| Target | What matters most |
|---|---|
| **ChatGPT / OpenAI models** | Goal, context, constraints, done, output. Start lean; add structure only for complex tasks. Ask for conclusions, assumptions and checks, not hidden reasoning. |
| **Claude (chat or API)** | Clear and direct; XML tags such as `<context>`, `<task>` and `<output_format>` for mixed content; long documents before the question. |
| **Gemini** | Strong with long context. Lock the output format with a labelled example, and add "Base your answer only on the provided context" for grounded work. |
| **Reasoning models (o-series, DeepSeek-R1, thinking modes)** | Short, clean instructions: the goal and what done looks like. No "think step by step" and no reasoning scaffolding: they reason on their own, and scaffolding makes them worse. |
| **Open-weight and local models (Llama, Mistral, Qwen via Ollama)** | Shorter, flatter prompts with a clear role in the system prompt. Be more explicit than with frontier models. Ask which model is running when it matters. |

## People (tickets, issues, a teammate)

Title, what's wrong or wanted, where, and how to tell it's done. No agent instructions and no tool lines.
