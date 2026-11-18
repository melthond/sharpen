# How Sharpen should build prompts: research notes

*2026-11-19 · this feeds `skills/sharpen/SKILL.md` (plan Task 4)*

## What the evidence says

1. **Decide how much to change before rewriting.** Sarkar et al. (2025) first classify each prompt as *no / some / heavy* modification and rewrite only the ones that need it. Rewriting improved responses and kept the user's intent, and the gains grew in longer conversations, where there is more context to draw on. Kotte (2026) found that rewriting prompts that were already well formed made results *worse* (−9% on one benchmark). → **A three-tier gate, not yes/no.**
2. **Options should be different interpretations, not rewordings.** Saparina & Lapata (2025) have the model list possible meanings before answering. CLAMBER (2023) asks only when the plausible intents really diverge. → **If every reading leads to the same action, don't ask.**
3. **Models guess instead of asking unless told to.** Zhang et al. (ICLR 2025) and "Knowing but Not Showing" (2026) both find this: models notice the ambiguity but answer anyway. → The per-prompt nudge earns its place; keep it.
4. **What makes a coding prompt good (Claude Code best practices):** name the file, describe the symptom, say what "fixed" looks like, give a check to run, state any preference between approaches, and state the scope. Exploratory prompts *should* stay open ("what would you improve here?" is fine as is). For a big fuzzy feature, have Claude interview you and write a spec first.
5. **Structure (Anthropic prompting docs):** separate the context from the instruction, put context first and the task last, and use consistent section names.

## The design that follows

### Gate: three tiers
| Tier | When | What Sharpen does |
|---|---|---|
| **Clear** | It names what and where, and has one reading | `Clear prompt, running as typed.` |
| **Fill-in** | Only one sensible reading, but details are missing that the conversation or code can supply | Proceed without asking, after one line: `Running as: <one-line engineered version>`. The user can press Esc to correct it. |
| **Ambiguous** | Two or more readings would lead to *different actions* | Ask: 2–4 options + "Run as typed" |

The fill-in tier is new. It keeps the tool fast on the most common case, where the prompt is vague but the conversation makes it obvious.

### Options: one per interpretation
Each option is a *different action* (fix vs. investigate vs. rewrite), not the same action phrased differently. Order them most likely first. Add **"Interview me first"** as an option when the request is a large feature with many open decisions.

### Engineered prompt: slots per intent type
First classify the intent, then fill that type's slots with real names from the conversation and code. Leave out any slot it has no evidence for, and never invent paths.

| Intent | Slots |
|---|---|
| **Bug** | Symptom · Where (files) · Reproduce (failing test or steps) · Fix · Check (test/command) |
| **Feature** | What + for whom · Where it plugs in · Follow existing pattern X · Done when · Out of scope |
| **Refactor** | Target · Behaviour must not change · Check (tests stay green) · Scope limit |
| **Performance** | Metric · Measure the baseline first · Target · Where |
| **Question / explain** | What to explain · Depth · Read-only, no edits |
| **Review** | What (diff/files) · Focus · Report only |
| **Explore / ideas** | Keep it open, no edits, scope of the look |
| **Ops (git, deploy, config)** | Exact action · Target · Needs approval before anything irreversible |
| **Other** | Goal · Where · Constraints · Done when |

Format: plain labelled lines, 3–7 lines in total, context first and the action last. It is short enough to read in the option preview, and it is the text Claude then acts on.

### Example
Prompt: `fix the login thing` (the conversation earlier mentioned PIN lockout in the admin app)
- **Fix PIN lockout bug:** Symptom: lockout triggers after 1 wrong PIN, not 5 · Where: `apps/admin/auth/pin.ts` · Reproduce: failing test in `pin.test.ts` · Fix · Check: `npm test -- pin`
- **Find why login fails:** Read-only: trace the login flow, report the likely cause, no edits
- **Run as typed**

## Sources
- Sarkar et al., *Conversational User-AI Intervention: A Study on Prompt Rewriting* — https://arxiv.org/abs/2503.16789v1
- Kotte, *Not All Queries Need Rewriting* — https://arxiv.org/pdf/2603.13301
- Zhang, Knox, Choi, *Modeling Future Conversation Turns to Teach LLMs to Ask Clarifying Questions* — https://arxiv.org/html/2410.13788v2
- Kuhn et al., *CLAMBER / Clarify When Necessary* — https://arxiv.org/pdf/2311.09469v1.pdf
- *Aligning Language Models to Explicitly Handle Ambiguity* — https://huggingface.co/papers/2404.11972.md
- Claude Code best practices — https://code.claude.com/docs/en/best-practices
- Anthropic prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags
