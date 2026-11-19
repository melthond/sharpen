# Contributing

Thanks for helping. This page covers what gets merged and what a PR needs to include.

## The one rule Sharpen can't break

**Nothing leaves the user's machine.** No network calls, no telemetry, no analytics, and no logging of prompts. A PR that adds any of these will be closed, however useful it is. Sharpen reads people's prompts, and that only works if they can trust it completely.

## Changes to the method need an eval

The method is what every Sharpen user loads into every session. That means [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md), and any text the hooks inject: the constants in [`hooks/sharpen-core.js`](hooks/sharpen-core.js) and the status line nudge in [`hooks/sharpen-statusline-setup.js`](hooks/sharpen-statusline-setup.js).

A change to wording that looks harmless can make Sharpen ask about clear prompts, or miss ambiguous ones. So a method change is only merged when the PR shows an eval with three arms. Each arm uses the same prompts, the same project and the same model:

1. `baseline`: no Sharpen
2. `main`: current Sharpen
3. `branch`: Sharpen with your change

The PR should show:

- **a prompt where your change should help,** with the output from all three arms showing that it does;
- **the full set in [`tests/eval/prompts.md`](tests/eval/prompts.md),** run on your branch, showing that nothing that passed before now fails. Clear prompts must still run without a question. Ambiguous prompts must still get 2–3 options plus `Run as typed`;
- **the model and the project you used.** Use a real codebase, not an empty folder: Sharpen's options are only as good as the files it can find.

[`tests/eval/run.sh`](tests/eval/run.sh) runs the evals. It runs one prompt headless, with editing tools blocked, and prints what Claude said:

```bash
cd /path/to/a/real/project
SHARPEN_EVAL_ARM=baseline bash /path/to/sharpen/tests/eval/run.sh v1-base "fix the login thing"
SHARPEN_PLUGIN_DIR=/abs/path/to/sharpen-main bash /path/to/sharpen/tests/eval/run.sh v1-main "fix the login thing"
SHARPEN_PLUGIN_DIR=/abs/path/to/your-branch  bash /path/to/sharpen/tests/eval/run.sh v1-branch "fix the login thing"
```

Each run costs real API usage, about $0.40 per prompt on a large model. Headless mode can't show the clickable options, so they appear as a numbered list. Also check the clickable version in a normal session when your change affects the question itself.

If your case isn't in `tests/eval/prompts.md` yet, add it with what you expect, so the next person checks it too.

## Rules for the method itself

These come from the research behind Sharpen ([`docs/research/`](docs/research/)). A change that breaks one of them needs a very good reason:

- **Most prompts pass straight through.** Rewriting clear prompts makes results worse.
- **Ask only when readings lead to different actions.** Rewordings are not options.
- **2–3 options plus `Run as typed`.** Claude Code's question tool allows at most 4 choices.
- **Real names only.** Never invent files, skills, agents or tools.
- **Keep it short.** The method is injected into context. The test suite fails if it reaches 8000 characters.

## Everything else

Bug fixes in hooks, docs and packaging don't need an eval. Before you open the PR, run:

```bash
npm test                     # zero dependencies, Node's built-in runner
claude plugin validate .     # the plugin and marketplace manifests
```

- **Every behaviour change comes with a test.** Write it first, and watch it fail.
- **Hooks must never block a prompt.** On any error they exit 0 with no output. Keep it that way, and keep the test that proves it.
- **Hooks must never touch the user's real settings in tests.** The test helpers point `SHARPEN_HOME` and `CLAUDE_CONFIG_DIR` at temp folders. Use them.
- **Zero dependencies.** Node built-ins only.
- **One change per PR,** linked to the issue it fixes.

## New agents (Codex, Gemini CLI, Copilot CLI, …)

Open an issue first. Sharpen ships to an agent only if that agent can run a hook on every prompt, so that `/sharpen off` really turns it off. Each new agent should reuse `skills/sharpen/SKILL.md` unchanged, and add only a thin manifest and adapter. When it ships, add real screenshots of its cards to `assets/screenshots/<agent>/`, and give it a dropdown in the README's "Sharpen in action" section, next to Claude Code.

## Development

The README diagrams are built from `assets/src/*.svg` by `node scripts/build-diagrams.js`, which embeds the hand-drawn font and the wobble filter. Edit the source, then rebuild. The test suite fails if a built diagram is out of date.

```bash
git clone https://github.com/ardfaiyaz/sharpen
cd sharpen
npm test
claude --plugin-dir .        # try your checkout without installing it
```

When you change the version, bump it in both `package.json` and `.claude-plugin/plugin.json`. Installed copies only update when it changes.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE.md).
