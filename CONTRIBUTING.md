# Contributing

Thanks for helping. This page covers what gets merged and what a PR needs.

- **Found a bug?** [Open an issue](https://github.com/melthond/sharpen/issues) with the prompt you used, your OS and your Sharpen version.
- **Found a security issue?** Don't open an issue. Follow [SECURITY.md](SECURITY.md).
- **Planning a bigger change?** Open an issue first, so we can agree it fits before you build it.

## The rule Sharpen can't break

**Nothing leaves the user's machine.** That means no network calls, telemetry, analytics or prompt logging. A PR that adds any of these gets closed, however useful it is. Sharpen reads people's prompts, and that only works if they can trust it.

## Method changes need an eval

The **method** is everything Sharpen loads into a session:

- [`skills/sharpen/SKILL.md`](skills/sharpen/SKILL.md) and [`skills/sharpen/references/`](skills/sharpen/references/)
- the text the hooks inject: the constants in [`hooks/sharpen-core.js`](hooks/sharpen-core.js) and the nudge in [`hooks/sharpen-statusline-setup.js`](hooks/sharpen-statusline-setup.js)

A wording change that looks harmless can make Sharpen ask about clear prompts or miss ambiguous ones. So the PR has to show an eval with three arms, all using the same prompts, project and model:

| Arm | Runs |
|---|---|
| `baseline` | No Sharpen |
| `main` | Current Sharpen |
| `branch` | Sharpen with your change |

The PR shows:

- **one prompt where your change helps**, with all three outputs;
- **the full set in [`tests/eval/prompts.md`](tests/eval/prompts.md)** run on your branch, with nothing that passed before now failing. Clear prompts still run without a question. Ambiguous ones still get 2–3 options plus `Run as typed`;
- **the model and the project**, which must be a real codebase. In an empty folder Sharpen has no files to find.

[`tests/eval/run.sh`](tests/eval/run.sh) runs one prompt headless with editing blocked and prints the reply:

```bash
cd /path/to/a/real/project
SHARPEN_EVAL_ARM=baseline bash /path/to/sharpen/tests/eval/run.sh v1-base "fix the login thing"
SHARPEN_PLUGIN_DIR=/abs/path/to/sharpen-main bash /path/to/sharpen/tests/eval/run.sh v1-main "fix the login thing"
SHARPEN_PLUGIN_DIR=/abs/path/to/your-branch  bash /path/to/sharpen/tests/eval/run.sh v1-branch "fix the login thing"
```

- Each run uses real API credit: about $0.40 per prompt on a large model.
- Headless mode shows the options as a numbered list. If your change affects the question itself, check the clickable card in a normal session too.
- If your case isn't in `tests/eval/prompts.md` yet, add it with what you expect to happen.

### Rules for the method

These come from the [research behind Sharpen](docs/research/). A change that breaks one needs a very good reason.

- **Most prompts pass straight through.** Rewriting clear prompts makes results worse.
- **Ask only when the readings lead to different actions.** A rewording isn't a separate option.
- **2–3 options plus `Run as typed`.** Claude Code's question tool allows 4 choices at most.
- **Real names only.** Never invent files, skills, agents or tools.
- **Keep it short.** The method sits in the context window, and the tests fail if `SKILL.md` reaches 8,500 characters.

## Everything else

Bug fixes in the hooks, docs, packaging or website don't need an eval.

- **Every behaviour change comes with a test.** Write it first and watch it fail.
- **Hooks never block a prompt.** On any error they exit 0 with no output. Keep the test that proves this.
- **Tests never touch real settings.** The test helpers point `SHARPEN_HOME` and `CLAUDE_CONFIG_DIR` at temp folders, so use them.
- **Zero dependencies.** Node built-ins only (the website in `apps/web` has its own).
- **One change per PR,** linked to the issue it fixes.

### PR checklist

- [ ] `npm test` passes (plus `npm run lint`, `npm test` and `npm run build` in `apps/web` if you touched the site)
- [ ] A test covers the behaviour change
- [ ] An eval is attached if the method changed
- [ ] The docs are updated if a skill, command, badge or file changed (README, `apps/web/src/skills.ts`, `Docs.tsx`, `public/llms.txt`)
- [ ] There's a `CHANGELOG.md` entry under **Unreleased**

## Development

```bash
git clone https://github.com/melthond/sharpen
cd sharpen
npm test                     # Node's built-in test runner, no install step
claude plugin validate .     # checks the plugin and marketplace manifests
claude --plugin-dir .        # try your checkout without installing it
```

| Task | How |
|---|---|
| README diagrams | Edit `assets/src/*.svg`, then run `node scripts/build-diagrams.js`. The tests fail if a built diagram is out of date. |
| Website | See [`apps/web/README.md`](apps/web/README.md). |
| Release | Bump the version in both `package.json` and `.claude-plugin/plugin.json` (installed copies only update when it changes), move the **Unreleased** entries in [`CHANGELOG.md`](CHANGELOG.md) under the new version, and tag `vX.Y.Z`. |

## New agents (Codex, Gemini CLI, Copilot CLI, …)

Open an issue first. Sharpen ships to an agent only if that agent can run a hook on every prompt, so that `/sharpen off` really turns it off. Each new agent:

- reuses `skills/sharpen/SKILL.md` unchanged, adding only a thin manifest and adapter;
- comes with real screenshots in `assets/screenshots/<agent>/` and its own dropdown under "Sharpen in action" in the README.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE.md).
