# Security

Sharpen reads every prompt you type, so its security comes down to one promise: **nothing leaves your machine**. It makes no network calls and has no telemetry or dependencies. It never logs prompts, and it keeps only the event and script names of your hooks, never their arguments.

## Supported versions

| Version | Supported |
|---|---|
| 2.2.x (latest) | ✅ |
| Older | ❌ Update first: see [Updating](README.md#updating) |

## Reporting a vulnerability

Please **don't open a public issue.** Report it privately through [GitHub's private vulnerability reporting](https://github.com/melthond/sharpen/security/advisories/new), with:

- what an attacker could do;
- the steps to reproduce it, and the Sharpen, Claude Code and OS versions;
- a fix, if you have one.

Expect a reply within a few days. Once a fix is released, the advisory is published with credit to you, unless you'd rather stay anonymous.

## In scope

- Anything that sends prompt text, code or settings off the machine.
- Hook output that could make Claude run something the user didn't approve.
- Credentials or hook arguments leaking into Sharpen's files (`~/.config/sharpen/`) or into the context.
- Unsafe writes to `~/.claude/settings.json`.

Install only from [`melthond/sharpen`](https://github.com/melthond/sharpen). Sharpen is plain JavaScript and Markdown, so a copy that ships binaries isn't the real one.
