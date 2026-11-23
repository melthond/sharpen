# Credits

Every guide, repository, paper, survey and article that shaped Sharpen's method and reference files, and what each one contributed. Thank you to everyone below for publishing your work openly.

- Ideas are rewritten in Sharpen's own words. Text is copied word for word only from openly licensed sources (the MIT-licensed OpenAI Cookbook), credited where it appears.
- Each figure in the reference files links to its source, and the model details in [`model-notes.md`](skills/sharpen/references/model-notes.md) show the date they were checked.

## Open-source repositories

| Repository | License | What Sharpen took from it |
|---|---|---|
| [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) by DAIR.AI (Elvis Saravia), and [promptingguide.ai](https://www.promptingguide.ai/agents/context-engineering) | MIT | The technique catalogue behind `techniques.md` (examples, decomposition, chaining, grounding); context engineering as layers checked for completeness, clarity, consistency and testability |
| [nidhinjs/prompt-master](https://github.com/nidhinjs/prompt-master) | MIT | Prompt anti-patterns and per-tool target profiles (`anti-patterns.md`, `targets.md`) |
| [openai/openai-cookbook](https://github.com/openai/openai-cookbook) | MIT | Eagerness control, tool preambles, verbosity, self-reflection rubrics, metaprompting, prompt migration, personalities; the verbatim `<context_gathering>`, `<persistence>`, `<tool_preambles>` and `<self_reflection>` blocks in `model-notes.md` |
| [github/spec-kit](https://github.com/github/spec-kit) ([spec-driven guide](https://github.com/github/spec-kit/blob/main/spec-driven.md)) | MIT | The phase model in `phases.md`: constitution, specify, clarify, plan, tasks, implement, converge; `[NEEDS CLARIFICATION]` markers; specs without the stack |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) ([docs](https://docs.bmad-method.org/start/how-bmad-works/)) | see repository | Role-based planning documents (brief, PRD, architecture, stories) and sizing a build session |
| [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) | see repository | Own your prompts, context window and control flow; tools as structured outputs; contacting humans through tool calls; small, focused agents (`llm-features.md`) |
| [anthropics/prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) | no license file | Ideas only: prompt structure, separating data from instructions, examples, avoiding hallucinations |

Also consulted while choosing sources: [promptslab/Awesome-Prompt-Engineering](https://github.com/promptslab/Awesome-Prompt-Engineering), [yzfly/awesome-context-engineering](https://github.com/yzfly/awesome-context-engineering), [jasontang-ai/Context-Engineering](https://github.com/jasontang-ai/Context-Engineering) and [Learn Prompting](https://learnprompting.org/docs/introduction).

The UI stack table in `model-notes.md` names [Next.js](https://github.com/vercel/next.js), [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss), [shadcn/ui](https://github.com/shadcn-ui/ui), [Radix](https://github.com/radix-ui/primitives), [Lucide](https://github.com/lucide-icons/lucide), [Heroicons](https://github.com/tailwindlabs/heroicons), [Material Symbols](https://github.com/google/material-design-icons) and [Motion](https://github.com/motiondivision/motion) as defaults, with star counts checked on 2026-11-20.

## Provider guides and documentation

**Anthropic**
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025): context as a budget, the right altitude, just-in-time context, compaction, structured notes, subagents
- [Writing effective tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents) (2025): task-shaped tools, namespacing, meaningful returns, token efficiency, tool evals
- [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) and the [Claude Fable 5.2 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2): act-or-propose defaults, parallel tools, over-engineering, the owner line, frontend aesthetics, high-stakes blocks
- [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking), [steering thinking and cost](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost), [effort](https://platform.claude.com/docs/en/build-with-claude/effort) and [models overview](https://platform.claude.com/docs/en/models/overview): settings in `model-notes.md`
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices): verification, two failed corrections then a fresh session, hooks over emphasis, reviewers that always find something, caps for unattended runs, worktrees, the interview-me pattern

**OpenAI**
- Cookbook prompting guides: [Codex](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide), [GPT-5](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide), GPT-5.1, GPT-5.2, [GPT-4.1](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide), [prompt optimizer](https://developers.openai.com/cookbook/examples/gpt-5/prompt-optimization-cookbook), [prompt personalities](https://developers.openai.com/cookbook/examples/gpt-5/prompt_personalities), [ChatGPT prompting guide](https://developers.openai.com/cookbook/examples/chatgpt/chatgpt_prompt_guide/chatgpt_prompt_guide) and [document and multimodal tips](https://developers.openai.com/cookbook/examples/multimodal/document_and_multimodal_understanding_tips)
- API docs: [reasoning](https://developers.openai.com/api/docs/guides/reasoning), [latest model](https://developers.openai.com/api/docs/guides/latest-model), [reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices), [apply_patch](https://developers.openai.com/api/docs/guides/tools-apply-patch) and [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

**Google**
- [Gemini prompting strategies](https://aistudio.google.com/docs/prompting-strategies) and [thinking](https://aistudio.google.com/docs/thinking): few-shot by default, sampling deprecation, thinking levels, thought signatures

**Other tools**
- [Cursor rules](https://cursor.com/docs/context/rules): rule types, keeping rules under 500 lines
- [GitHub Copilot prompt engineering](https://docs.github.com/en/copilot/using-github-copilot/copilot-chat/prompt-engineering-for-copilot-chat): start general then specific, fresh conversations per task
- [Kiro specs](https://kiro.dev/docs/specs/feature-specs/), [bugfix specs](https://kiro.dev/docs/specs/bugfix-specs/) and [steering](https://kiro.dev/docs/steering/): EARS requirements, quick specs, current / expected / unchanged behaviour
- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank): living project files for resuming work

## Research papers

- Schulhoff et al., [The Prompt Report](https://arxiv.org/abs/2406.06608) (2024): the survey behind the technique taxonomy
- Yang et al., [What Prompts Don't Say](https://arxiv.org/abs/2505.13360) (2025): underspecification; the missed-requirements sweep
- Jaroslawicz et al., [How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/abs/2507.11538) (IFScale, 2025): rule overload and order bias
- Spracklen et al., [We Have a Package for You!](https://arxiv.org/abs/2406.10279) (USENIX Security 2025): package hallucination; the dependency check
- Sclar et al., [Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design](https://arxiv.org/abs/2310.11324) (ICLR 2024): format-variant evals
- Cemri et al., [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) (MAST, 2025): the subagent contract
- Zhong, Raghunathan and Carlini, [ImpossibleBench](https://arxiv.org/abs/2510.20270) (2025): test cheating and the flag-for-a-human way out
- Liu et al., [Lost in the Middle](https://arxiv.org/abs/2307.03172) (TACL 2023): context placement
- Hong, Troynikov and Huber, [Context Rot](https://www.trychroma.com/research/context-rot) (Chroma, 2025): degradation with input length
- Xiao et al., [DevGPT](https://arxiv.org/abs/2309.03914) (MSR 2024): consulted for how developers prompt

## Developer surveys and industry reports

- [Stack Overflow Developer Survey 2025, AI](https://survey.stackoverflow.co/2025/ai) and [2026](https://survey.stackoverflow.co/2026): "almost right" answers, debugging cost, trust, context discovered late
- [JetBrains State of Developer Ecosystem 2025](https://devecosystem-2025.jetbrains.com/): control and code-quality concerns
- METR, [early-2025 developer study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [late-2025 update](https://metr.org/blog/2026-02-24-uplift-update/) and [2026 usage survey](https://metr.org/blog/2026-05-11-ai-usage-survey/): perceived vs measured speed; the reason for the local re-prompt counter
- [GitHub Octoverse 2026](https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/): agent-started pull requests and review load
- Google DORA, [trust in AI](https://dora.dev/insights/trust-in-ai/) and [concerns beyond accuracy](https://dora.dev/insights/concerns-beyond-accuracy-of-ai-output/)
- [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar) (Vol 35): agent instruction bloat, human-in-the-loop theater, risk-tiered oversight, toxic flow analysis, mutation testing, spec-driven development

## Articles and practitioners

- Simon Willison: [the lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), [notes on coding agents](https://simonwillison.net/tags/coding-agents/) and [prompt engineering](https://simonwillison.net/tags/prompt-engineering/), including the [structured context formats study](https://simonwillison.net/2026/Feb/9/structured-context-engineering-for-file-native-agentic-systems/)
- Addy Osmani: [Audit your agent files](https://addyosmani.com/blog/audit-your-agent-files/), [Agentic skill decay](https://addyosmani.com/blog/agentic-skill-decay/), [Intent debt](https://addyosmani.com/blog/intent-debt/), [Agentic code quality](https://addyosmani.com/blog/agentic-code-quality/), [How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) and [The 70% problem](https://addyo.substack.com/p/the-70-problem-hard-truths-about)
- Harper Reed, [My LLM codegen workflow](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/): idea honing, spec, prompt plan, execution
- Geoffrey Huntley, [Ralph](https://ghuntley.com/ralph/): the long-loop prompt
- Birgitta Böckeler, [Understanding spec-driven development: Kiro, spec-kit, and Tessl](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) on martinfowler.com: sizing process to the work

If your work shaped Sharpen and isn't listed here, please open an issue and it will be added.
