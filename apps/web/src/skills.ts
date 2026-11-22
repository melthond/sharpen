// Landing-page tiles: [command, summary, detail]. Same order as SKILL_DOCS.
export const SKILLS = [
  ['sharpen-prompt', 'Write a stronger prompt', 'Turn a rough request into a standalone brief for another AI, a ticket, or a teammate.'],
  ['sharpen-decompile', 'Understand a prompt', 'Break an existing prompt into its parts, name the weak spots, and adapt, simplify, or split it.'],
  ['sharpen-handoff', 'Start fresh with context', 'Carry decisions, work tried, failures, and the next move into one prompt for a new session.'],
  ['sharpen-split', 'Break up big work', 'Turn a large request into ordered, bounded prompts grouped into waves that can run in parallel.'],
  ['sharpen-interview', 'Shape a feature spec', 'Answer one focused question at a time, then get a clear feature specification with decisions captured.'],
  ['sharpen-plan', 'Plan a build in phases', 'Get the kickoff rules, spec, plan, tasks and build prompt a project needs, sized to the work and written only after you approve.'],
  ['sharpen-review', 'Build a prompting habit', 'Review recent prompts, see what was missing, and get one practical improvement to try next.'],
  ['sharpen-save', 'Save a repeatable prompt', 'Package a prompt you use often as a project slash command, with a preview before it is written.'],
  ['sharpen-audit', 'Find setup blind spots', 'Surface rules, checks, and project knowledge an agent cannot infer, with paste-ready CLAUDE.md notes.'],
  ['sharpen-help', 'Find the right command', 'Get a compact reference for Sharpen controls, companion skills, and how to use each one.'],
]

// Docs-page cards: [command, title, use, example].
export const SKILL_DOCS = [
  ['sharpen-prompt', 'Write a prompt for another reader', 'For prompts you will give ChatGPT, another agent, a ticket, or a teammate. It adds the context a reader outside this Claude Code session needs, then hands back the text without doing the work.', '/sharpen:sharpen-prompt fix the empty state — for a ticket'],
  ['sharpen-decompile', 'Understand or adapt a prompt', 'Analyze a prompt you already have, name its weak spots, adapt it, simplify it, or split it. The prompt is treated as material to analyze and is never run.', '/sharpen:sharpen-decompile make the dashboard better'],
  ['sharpen-handoff', 'Move work into a fresh session', 'Prepare a starting prompt with the goal, decisions, completed work, failed attempts, next steps, and checks. Useful before /clear or when handing work to a teammate.', '/sharpen:sharpen-handoff'],
  ['sharpen-split', 'Break a large request into waves', 'Separate a request into outcomes with their own finish lines, order prompts by dependency, and group independent work into waves. Sharpen writes the plan; you run the prompts.', '/sharpen:sharpen-split rebuild settings, tests, and docs'],
  ['sharpen-interview', 'Turn a fuzzy feature into a spec', 'Answer one consequential question at a time. Once decisions are clear, Sharpen writes SPEC.md; it does not build the feature during the interview.', '/sharpen:sharpen-interview add team invitations'],
  ['sharpen-plan', 'Plan a project in phases', 'For a new project or a big feature. Sharpen sizes the work first: a small change gets a normal prompt, a big one gets kickoff rules, a spec, a plan, a task list and a reusable build prompt. It shows every file and writes them only after you approve; it never builds the feature itself.', '/sharpen:sharpen-plan team invitations with roles'],
  ['sharpen-review', 'Improve how you prompt', 'Get coaching on recent prompts in this conversation: what was missing, what that cost, a sharper example, and one practical habit to try.', '/sharpen:sharpen-review'],
  ['sharpen-save', 'Save a prompt you repeat', 'Turn a recurring task into a reusable project slash command. Sharpen generalizes the changing details, shows the proposed file, and asks before writing it.', '/sharpen:sharpen-save check-release'],
  ['sharpen-audit', 'Find project knowledge an agent cannot see', 'Check guidance, test commands, conventions, project boundaries, and available tools. Get ranked, paste-ready suggestions; the audit changes no files.', '/sharpen:sharpen-audit'],
  ['sharpen-help', 'Get the quick reference', 'See the current on/off state, controls, review-card choices, companion skills, status badge, and file locations in one compact reference.', '/sharpen:sharpen-help'],
]

// Skills-section phase chips, same order as SKILLS.
export const SKILL_PHASES = ['ANY', 'REVIEW', 'HANDOFF', 'PLAN', 'SPEC', 'KICKOFF', 'RETRO', 'REUSE', 'SETUP', 'START']
