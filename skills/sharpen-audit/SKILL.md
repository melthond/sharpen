---
name: sharpen-audit
description: >
  Audit a project for what Sharpen (and any agent) can't see from the code:
  missing test and run commands, unwritten conventions, where things live,
  rules that only exist in someone's head, and the skills, agents and MCP
  tools that fit the stack. Ranked, with the exact lines to add to CLAUDE.md.
  One-shot report. Use for /sharpen:sharpen-audit, "audit my project for
  sharpen", "what can't you see", "why are my options vague",
  "improve my CLAUDE.md".
---

Sharpen's options are only as specific as what the agent can find. This audit finds the gaps that make options vague or wrong, and says exactly what to write down to close each one. Changes nothing. It's a report the user asked for, so give it in full.

## 1. Map the project first

- Read the instruction files: `CLAUDE.md` at the root and in subfolders, `CLAUDE.local.md`, `.claude/rules/`, `AGENTS.md`, `README.md`, `CONTRIBUTING.md`.
- Read the manifests: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Makefile`, `turbo.json`, workspace files. Note the real scripts.
- Look at the shape: top-level folders, apps and packages in a monorepo, where the tests live, the CI config (`.github/workflows/`, etc.).
- List the project-level `.claude/skills/`, `.claude/agents/` and `.mcp.json`, plus the skills, agents and MCP tools listed in your context.
- Note the size and stack in one line. You'll use it to rank the findings.

## 2. Look for what an agent can't see

Check in this order, most costly first:

1. **How to check work.** Is there a written test, typecheck, lint and build command? Can a single test file be run on its own? A missing or wrong check command is the biggest gap: the agent can't tell when it's done.
2. **How to run it.** Dev server, emulators, seed data, env setup. Required env vars named, with their values never written down.
3. **Where things live.** In a monorepo or a big app: which folder owns what ("auth is in `apps/admin/src-tauri/src/commands/auth.rs`"). Without this, "the login thing" has too many candidates.
4. **Unwritten rules.** Conventions the code follows but no file states: the house component library, error handling style, naming, "migrations are never edited", files that must not be touched.
5. **Mismatches.** Instructions that disagree with the code: a script named in the README that doesn't exist in `package.json`, a renamed folder, a stale command. A wrong instruction is worse than none.
6. **Tools that fit.** Installed skills, agents or MCP servers that match this stack but aren't mentioned anywhere, so they never get suggested in a `Tools:` plan. Also project agents or skills that reference something that no longer exists.
7. **Prune.** Instruction files only grow, and each line "takes a little of Claude's attention on every task". Anthropic recommends staying under 200 lines for `CLAUDE.md`, and Cursor says to keep each rule file under 500 lines. In a 100-repo study cited by Addy Osmani, 62% of agent files carried lint-style rules a linter should enforce, 42% had context bloat and 35% had skill leakage. Flag each line that is:
   - **inferable from the code**: architecture, folder layout or stack the agent can read for itself. Write down only what it can't find by reading the repo.
   - **a lint or format rule**: belongs in the linter or formatter config.
   - **contradicted** by another line, by the code, or across layers (user, project and subfolder files).
   - **stale**: it points at a file, script or folder that no longer exists, or was written for an older model ("CRITICAL: you MUST", "think step by step").
   - **must-never or emphasised** (IMPORTANT, NEVER, capitals): it belongs in a hook or a deny rule. "If you keep adding emphasis to a `CLAUDE.md` line and Claude still misses it, that's a sign the line belongs in a hook."
   - **area-specific**: move it to `.claude/rules/<area>.md` with a `paths:` filter.
   Also list any unused MCP servers in `.mcp.json`: connected servers add their tool names and instructions to the context even when they aren't used.

## 3. Check before you report

- Every finding needs evidence: the file you read, the script that's missing, the folder with no owner. No evidence, no finding.
- Run nothing that changes state. Reading files and listing scripts is fine. Don't run builds, installs or migrations to "check". If a command needs running to verify it, say `(not run)`.
- Never print secret values from `.env` files or configs. Name the variable, never its value.
- Propose the smallest addition that closes each gap: usually one line in `CLAUDE.md`. Point to existing docs instead of copying them.
- Suggest `.claude/rules/<area>.md` with a `paths:` filter instead of `CLAUDE.md` when a rule only matters in one part of the codebase.

## 4. Output

Very simple English. Start with `Project:` and one line (stack, size, which instruction files exist).

Then the findings, ranked, in three groups. Skip empty groups:
- **Add now:** the gaps that make options wrong or leave the agent unable to check its work.
- **Worth adding:** the gaps that make options vaguer than they need to be.
- **Tidy:** stale lines, bloat, small mismatches. For each line to cut, give `Remove or move:` with the exact line, where it goes instead (the linter, a hook, a rules file, nowhere) and why. Recommend archiving removed lines and watching a few sessions before deleting them for good.

Number the findings across all groups, so the user can say "add 1 and 3". Each finding has three parts:

1. **No single-test command** (`package.json`)
   - **Gap:** `npm test` runs the whole suite (about 4 minutes, from the CI log). No line says how to run one file, so every option ends with the slow check.
   - **Add to `CLAUDE.md`:**
     ```
     - Test one file: npx vitest run <path>
     ```
   - **Effect:** options can say `Check: npx vitest run apps/admin/src/lib/clipboard.test.ts`.

End with:
- `Paste-ready:` one code block that gathers every "Add now" and "Worth adding" line in order, ready to paste into `CLAUDE.md`.
- `Not checked:` one line, if something mattered and you couldn't check it.

If nothing is missing: `Project:` line, then `Nothing missing. Sharpen can see what it needs.`, and one line on what you checked.

Lists findings. Changes nothing.
