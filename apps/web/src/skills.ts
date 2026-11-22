// Landing-page tiles: [command, summary, detail]. Same order as SKILL_DOCS.
export const SKILLS = [
  ['sharpen-prompt', 'Write a stronger prompt', 'Turn a rough request into a standalone brief for another AI, a ticket or a teammate.'],
  ['sharpen-decompile', 'Understand a prompt', 'Break a prompt into parts, name its weak spots, then adapt, simplify or split it.'],
  ['sharpen-handoff', 'Start fresh with context', 'Carry decisions, attempts, failures and the next move into one prompt for a new session.'],
  ['sharpen-split', 'Break up big work', 'Turn a big request into ordered, bounded prompts, grouped into waves that run in parallel.'],
  ['sharpen-interview', 'Shape a feature spec', 'Answer one question at a time, then get a clear spec with every decision captured.'],
  ['sharpen-plan', 'Plan a build in phases', 'Kickoff rules, spec, plan, tasks and a build prompt, sized to the work and written after you approve.'],
  ['sharpen-review', 'Build a prompting habit', 'See what your recent prompts missed and get one habit to try next.'],
  ['sharpen-save', 'Save a repeatable prompt', 'Save a prompt you reuse as a project slash command, previewed before it is written.'],
  ['sharpen-audit', 'Find setup blind spots', 'Find the rules, checks and project knowledge an agent can’t infer, as paste-ready CLAUDE.md notes.'],
  ['sharpen-help', 'Find the right command', 'A compact reference for Sharpen’s controls and every companion skill.'],
]

// Docs-page cards: [command, title, use, example].
export const SKILL_DOCS = [
  ['sharpen-prompt', 'Write a prompt for another reader', 'For prompts going to ChatGPT, another agent, a ticket or a teammate. Adds the context an outside reader needs and hands back the text without doing the work.', '/sharpen:sharpen-prompt fix the empty state — for a ticket'],
  ['sharpen-decompile', 'Understand or adapt a prompt', 'Breaks down a prompt you already have, names its weak spots, and adapts, simplifies or splits it. The prompt is analyzed, never run.', '/sharpen:sharpen-decompile make the dashboard better'],
  ['sharpen-handoff', 'Move work into a fresh session', 'A starting prompt with the goal, decisions, finished work, failed attempts, next steps and checks. Use it before /clear or to hand work to a teammate.', '/sharpen:sharpen-handoff'],
  ['sharpen-split', 'Break a large request into waves', 'Splits a request into outcomes with their own finish lines, ordered by dependency and grouped into parallel waves. Sharpen writes the plan; you run it.', '/sharpen:sharpen-split rebuild settings, tests, and docs'],
  ['sharpen-interview', 'Turn a fuzzy feature into a spec', 'One key question at a time. Once the decisions are clear, Sharpen writes SPEC.md. It builds nothing during the interview.', '/sharpen:sharpen-interview add team invitations'],
  ['sharpen-plan', 'Plan a project in phases', 'For a new project or big feature. Small changes get a normal prompt; big ones get kickoff rules, a spec, a plan, tasks and a reusable build prompt. Every file is shown first and written only after you approve. It never builds the feature.', '/sharpen:sharpen-plan team invitations with roles'],
  ['sharpen-review', 'Improve how you prompt', 'Coaching on this conversation’s prompts: what was missing, what it cost, a sharper example and one habit to try.', '/sharpen:sharpen-review'],
  ['sharpen-save', 'Save a prompt you repeat', 'Turns a recurring task into a project slash command. It generalizes the changing details, shows the file and asks before writing.', '/sharpen:sharpen-save check-release'],
  ['sharpen-audit', 'Find project knowledge an agent cannot see', 'Checks guidance, test commands, conventions, boundaries and tools, then ranks paste-ready fixes. It changes no files.', '/sharpen:sharpen-audit'],
  ['sharpen-help', 'Get the quick reference', 'On/off state, controls, card choices, companion skills, the status badge and file locations in one reference.', '/sharpen:sharpen-help'],
]

// Skills-section phase chips, same order as SKILLS.
export const SKILL_PHASES = ['ANY', 'REVIEW', 'HANDOFF', 'PLAN', 'SPEC', 'KICKOFF', 'RETRO', 'REUSE', 'SETUP', 'START']
