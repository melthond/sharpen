---
name: sharpen-save
description: >
  Save a prompt you keep typing as a reusable project skill (a slash command):
  sharpen it, generalize the parts that change into arguments, show the exact
  file, and write it only after you approve. Can also find repeated prompts in
  this conversation and suggest which to save. Use for /sharpen:sharpen-save,
  "save this prompt", "make this a command", "I keep typing this",
  "turn this into a slash command".
---

Turn a prompt the user repeats into a project skill they can call with one slash command. Their teammates get it too, once it's committed.
This is the only Sharpen skill that writes a file, so it **shows the file and asks first**. It never writes without a yes.

## 1. Find the prompt to save

- **Given:** the text after `/sharpen:sharpen-save`. If it's only a name (`/sharpen:sharpen-save fix-tests`), use the user's previous prompt as the content and that word as the name.
- **Not given:** look through this conversation for prompts the user typed more than once with the same intent ("run the tests and fix what fails", "check the build before you finish"). Offer the top 1–3 with `AskUserQuestion`. If none repeat, ask in one line which prompt to save, and stop.
- Never save a one-off. A prompt is worth saving when it's a *routine*: the same job, done again on different targets.

## 2. Sharpen and generalize it

1. Sharpen it with the method in `../sharpen/SKILL.md` (intent slots, `Tools:` and `Hooks:` lines, finish line). Run its gate silently. A saved skill always gets the full engineered version.
2. **Find the parts that change** between uses (the file, the feature, the test name) and turn each into an argument:
   - one free-form argument: `$ARGUMENTS`;
   - several positional arguments: `$1`, `$2`, …, with each one explained in `argument-hint`.
3. **Keep the parts that never change** literal: the real test command, the folder conventions, "don't touch migrations".
4. Say what to do when an argument is missing, so the skill never guesses: "If no file is given, use the files changed since the last commit."
5. Saved prompts are fragile: small edits or a model change can shift what they do. In the closing message, suggest trying the skill on one or two real targets after it's written, and again after a model change.

## 3. Pick the name and place

- **Name:** short, lowercase, hyphenated, verb first: `fix-tests`, `check-build`, `review-auth`. It must not clash with an existing skill, command or built-in, so check `.claude/skills/`, `.claude/commands/`, and the skills listed in your context. On a clash, suggest another name.
- **Place:**
  - project, shared with the team: `.claude/skills/<name>/SKILL.md` (default; commit it);
  - personal, every project: `~/.claude/skills/<name>/SKILL.md`, but only if the user says it's just for them.
- Never overwrite an existing file. If one exists, stop and offer a new name or to show the difference.

## 4. Write the file content

```
---
name: fix-tests
description: Run the test suite, fix what fails, and re-run until green. Use for /fix-tests, "fix the failing tests".
argument-hint: [test file or folder, optional]
---

Run `npm test -- $ARGUMENTS` (the whole suite if no argument is given).
For each failure: read the test and the code under test, find the cause, and fix the code, not the test, unless the test itself is wrong (say so).
Don't touch db/migrations/.
Re-run until everything passes, then report each fix in one line, with the final test output.
```

Rules for the content:
- The `description` says what it does **and** when to use it, with the slash trigger, so Claude can also pick it automatically.
- The body is the engineered prompt, written as instructions. It isn't a conversation, and it doesn't mention Sharpen.
- Keep it under about 40 lines. A saved skill is loaded every time it runs.
- Use only real commands and paths from this project.

## 5. Show, ask, then write

1. Show the full path and the full file content in a code block.
2. Ask with `AskUserQuestion`: "Save this as `/fix-tests`?". The options are **Save** (Recommended), **Change the name**, **Make it personal (~/.claude)**, and **Don't save**.
3. Only on **Save**: create the folder and write the file, exactly as shown.
4. After writing, reply in two lines: `Saved: .claude/skills/fix-tests/SKILL.md`, then `Use it: /fix-tests <file>. Commit it to share it with your team. It shows up in new sessions.`

## Never

- Write a file without an explicit yes in this run.
- Never overwrite an existing skill or command.
- Save secrets, tokens or personal paths into a project skill.
- Save a one-off prompt, or invent commands the project doesn't have.

Writes one file, after you approve it.
