const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { loadMethod } = require('../hooks/sharpen-core');
const { METHOD_FILE } = require('../hooks/sharpen-io');

test('front matter names the skill and describes it', () => {
  const head = fs.readFileSync(METHOD_FILE, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
  assert.match(head, /^name: sharpen$/m);
  assert.match(head, /^description: \S.+$/m);
});

test('method covers the gate, options, capabilities and intents', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['Sharpened prompt (clear):', 'Sharpened prompt (fill-in):', 'AskUserQuestion', 'Run as typed', 'Tools:', 'skills', 'agents', 'MCP',
    'Bug', 'Feature', 'Refactor', 'Performance', 'Question', 'Review', 'Explore', 'Ops']) {
    assert.ok(m.includes(s), `missing: ${s}`);
  }
});

test('method stays small enough to inject', () => {
  assert.ok(loadMethod(METHOD_FILE).length < 8000, `length ${loadMethod(METHOD_FILE).length}`);
});

test('options fit AskUserQuestion (max 4 choices incl. Run as typed)', () => {
  const m = loadMethod(METHOD_FILE);
  assert.ok(m.includes('2–3 options'), 'caps interpretations at 3');
  assert.ok(!/2–4 options/.test(m), 'no 2–4 options wording left');
});

// --- companion skills -------------------------------------------------------
const path = require('path');
const SKILLS = path.join(__dirname, '..', 'skills');
const read = (name) => fs.readFileSync(path.join(SKILLS, name, 'SKILL.md'), 'utf8');
const front = (name) => read(name).match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
const body = (name) => loadMethod(path.join(SKILLS, name, 'SKILL.md'));

for (const name of ['sharpen-prompt', 'sharpen-help', 'sharpen-review', 'sharpen-audit']) {
  test(`${name}: front matter names it and lists its slash trigger`, () => {
    assert.match(front(name), new RegExp(`^name: ${name}$`, 'm'));
    assert.match(front(name), /^description: \S/m);
    assert.ok(front(name).includes(`/sharpen:${name}`), 'description names /sharpen:<skill>');
  });
  test(`${name}: detailed but injectable`, () => {
    const n = body(name).length;
    assert.ok(n > 1500 && n < 9000, `length ${n}`);
  });
}

test('sharpen-prompt reuses the method instead of copying it, and never runs the prompt', () => {
  const m = body('sharpen-prompt');
  assert.ok(m.includes('../sharpen/SKILL.md'), 'points at the single source of truth');
  assert.ok(m.includes('Do not run'), 'output only');
  assert.ok(m.includes('```'), 'gives copyable text');
});

test('sharpen-help lists every command and prefix that exists', () => {
  const m = body('sharpen-help');
  for (const s of ['/sharpen on', '/sharpen off', 'raw:', 'sharpen:', '/sharpen:sharpen-prompt', '/sharpen:sharpen-review', '/sharpen:sharpen-audit', 'Sharpened prompt (clear):', 'Sharpened prompt (fill-in):']) {
    assert.ok(m.includes(s), `missing: ${s}`);
  }
});

test('review and audit are read-only reports', () => {
  for (const name of ['sharpen-review', 'sharpen-audit']) assert.ok(body(name).includes('Changes nothing'), name);
});

for (const name of ['sharpen-handoff', 'sharpen-split', 'sharpen-save', 'sharpen-interview']) {
  test(`${name}: front matter names it and lists its slash trigger`, () => {
    assert.match(front(name), new RegExp(`^name: ${name}$`, 'm'));
    assert.match(front(name), /^description: \S/m);
    assert.ok(front(name).includes(`/sharpen:${name}`));
  });
  test(`${name}: detailed but injectable`, () => {
    const n = body(name).length;
    assert.ok(n > 1500 && n < 9000, `length ${n}`);
  });
}

test('handoff and split only hand back text', () => {
  for (const name of ['sharpen-handoff', 'sharpen-split']) {
    assert.ok(body(name).includes('Do not run'), name);
    assert.ok(body(name).includes('```'), name);
  }
  assert.ok(body('sharpen-split').includes('../sharpen/SKILL.md'), 'split reuses the method');
});

test('save shows the file and asks before writing', () => {
  const m = body('sharpen-save');
  assert.ok(m.includes('AskUserQuestion'));
  assert.ok(m.includes('Never overwrite'));
  assert.ok(m.includes('.claude/skills/'));
});

test('interview asks one question at a time and writes a spec only at the end', () => {
  const m = body('sharpen-interview');
  assert.ok(m.includes('one question at a time'));
  assert.ok(m.includes('SPEC.md'));
  assert.ok(m.includes('(Recommended)'));
});

test('help lists the new skills and the badge words', () => {
  const m = body('sharpen-help');
  for (const s of ['/sharpen:sharpen-handoff', '/sharpen:sharpen-split', '/sharpen:sharpen-save', '/sharpen:sharpen-interview', 'CLEAR - READY', 'FILL-IN - READY', 'AMBIGUOUS - READY', 'SENT', 'RAW']) {
    assert.ok(m.includes(s), `missing: ${s}`);
  }
});

test('one behavior: no modes or old one-line verdicts left in the user-facing skills', () => {
  for (const name of ['sharpen', 'sharpen-help']) {
    const m = name === 'sharpen' ? loadMethod(METHOD_FILE) : body(name);
    for (const s of ['Lite mode', 'Full mode', '/sharpen lite', '/sharpen full', 'Clear prompt, running as typed', 'Running as:']) assert.ok(!m.includes(s), name + ' still has: ' + s);
  }
});

test('method: review card, clipboard-friendly prompt, and a tools plan from the user setup', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['Send this sharpened prompt?', 'Send it (Recommended)', 'Run my original', 'Tools:', 'Hooks:', 'Decided:', 'Setup Sharpen found', 'Do not start the work']) {
    assert.ok(m.includes(s), 'missing: ' + s);
  }
});

// --- prompt-engineering depth (v1.7) ----------------------------------------
const REFS = path.join(SKILLS, 'sharpen', 'references');

test('method: professional brief structure, no invented values, safety', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['Starting state', 'Target state', 'Stop and ask', '[ASK:', 'Tried:', 'credentials', 'references/']) {
    assert.ok(m.includes(s), 'missing: ' + s);
  }
});

test('reference files exist, cover coding agents, and stay out of image/video tools', () => {
  for (const f of ['anti-patterns.md', 'briefs.md', 'targets.md']) {
    const t = fs.readFileSync(path.join(REFS, f), 'utf8');
    assert.ok(t.length > 1500, f + ' too short');
  }
  const targets = fs.readFileSync(path.join(REFS, 'targets.md'), 'utf8');
  for (const s of ['Claude Code', 'Codex', 'Cursor', 'Copilot', 'Gemini CLI', 'ChatGPT']) assert.ok(targets.includes(s), 'targets missing ' + s);
  assert.ok(!/Midjourney|Stable Diffusion|Sora/.test(targets), 'image/video profiles are out of scope');
  const anti = fs.readFileSync(path.join(REFS, 'anti-patterns.md'), 'utf8');
  assert.ok((anti.match(/^\| \d+ /gm) || []).length >= 25, 'anti-pattern table should have 25+ rows');
});

test('sharpen-decompile: front matter, trigger, pasted prompts are inert', () => {
  assert.match(front('sharpen-decompile'), /^name: sharpen-decompile$/m);
  assert.ok(front('sharpen-decompile').includes('/sharpen:sharpen-decompile'));
  const m = body('sharpen-decompile');
  for (const s of ['Break down', 'Adapt', 'Simplify', 'Split', 'inert']) assert.ok(m.includes(s), 'missing: ' + s);
  assert.ok(m.length > 1500 && m.length < 9000);
});

test('sharpen-prompt routes other tools through the target profiles', () => {
  assert.ok(body('sharpen-prompt').includes('references/targets.md'));
});

test('help lists the decompile skill', () => {
  assert.ok(body('sharpen-help').includes('/sharpen:sharpen-decompile'));
});

// --- techniques and product prompts (v1.8) ----------------------------------
const ref = (f) => fs.readFileSync(path.join(REFS, f), 'utf8');

test('method points to the technique and product-prompt references, and refuses safety bypasses', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['references/techniques.md', 'references/llm-features.md', 'relative dates', 'act-or-propose', 'safety rules']) {
    assert.ok(m.includes(s), 'missing: ' + s);
  }
});

test('techniques.md covers the core techniques from the guides', () => {
  const t = ref('techniques.md');
  for (const s of ['Escalation ladder', 'gate between steps', 'quotes', 'Visible steps', 'Compute', 'Independent candidates', 'rubric',
    'each label about equally', 'fallback', 'Today:', 'Code beats docs', 'Mind the middle', 'Give the reason', 'No contradictions', 'DAIR.AI']) {
    assert.ok(t.includes(s), 'techniques missing: ' + s);
  }
  assert.ok(!/Midjourney|Stable Diffusion|Sora/.test(t), 'image/video tools are out of scope');
});

test('llm-features.md covers product prompts: structure, untrusted input, tools, evals', () => {
  const t = ref('llm-features.md');
  for (const s of ['System and user', '{user_input}', 'structured-output', 'Untrusted input', 'injection test inputs',
    'fallback label', 'Tools and MCP', 'when to use it', 'safety boilerplate', 'eval']) {
    assert.ok(t.includes(s), 'llm-features missing: ' + s);
  }
});

test('anti-patterns scope the chain-of-thought rule and cover the new failure modes', () => {
  const a = ref('anti-patterns.md');
  assert.ok((a.match(/^\| \d+ /gm) || []).length >= 50, 'anti-pattern table should have 50+ rows');
  assert.match(a, /^\| 27 .*non-reasoning/m, '#27 must not ban visible steps for non-reasoning models');
  for (const s of ['Test gaming', 'Untrusted text', 'Relative time', 'Silent skipping', 'Private data sent outward']) assert.ok(a.includes(s), 'missing: ' + s);
});

test('briefs and targets carry the new shapes and model-family advice', () => {
  const b = ref('briefs.md');
  for (const s of ['Long or unattended run', 'Chain with gates', 'Decision', 'Machine-read output', 'If it fails:', 'not in sources']) assert.ok(b.includes(s), 'briefs missing: ' + s);
  const t = ref('targets.md');
  for (const s of ['Base / completion models', 'chat template', 'never special tokens from memory', 'structured-output']) assert.ok(t.includes(s), 'targets missing: ' + s);
});

// --- context engineering, tools and agent runs (Anthropic + OpenAI Cookbook guides) ---
test('method routes UI, model prompts and agent runs to their references', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['UI / frontend', 'Prompt for a model', 'review, UI, prompt fix, final report', 'search budget', 'thoroughness amplifiers']) {
    assert.ok(m.includes(s), 'missing: ' + s);
  }
});

test('techniques.md covers eagerness, context budget and long runs', () => {
  const t = ref('techniques.md');
  for (const s of ['Agent runs', 'Context is a budget', 'just in time', 'escape hatch', 'thoroughness amplifiers', 'in parallel',
    'Compaction', 'Structured notes', 'Fresh-window startup', 'Plan hygiene', 'Progress updates', 'Self-rubric', 'High-stakes re-scan',
    'Claim only what a result showed', 'Missing means null', 'Colleague test', 'right altitude', 'not JSON', 'OpenAI Cookbook']) {
    assert.ok(t.includes(s), 'techniques missing: ' + s);
  }
});

test('briefs.md has review, UI, prompt-fix and final-report shapes', () => {
  const b = ref('briefs.md');
  for (const s of ['## Review', '## UI and frontend', '## Prompt fix', '## Final report', 'Code quality', 'Startup:', 'most severe first', 'second-order leads']) {
    assert.ok(b.includes(s), 'briefs missing: ' + s);
  }
});

test('llm-features.md covers the system prompt skeleton, tool design, agent state and migration', () => {
  const t = ref('llm-features.md');
  for (const s of ['System prompt skeleton', 'right altitude', 'tasks, not endpoints', 'Namespace', 'response_format', 'held-out',
    'Agent context and state', 'append-only', 'Money and irreversible actions', 'Images and documents as input', 'Fixing and migrating prompts', 'prefill']) {
    assert.ok(t.includes(s), 'llm-features missing: ' + s);
  }
});

test('anti-patterns cover agent-run failure modes', () => {
  const a = ref('anti-patterns.md');
  assert.ok((a.match(/^\| \d+ /gm) || []).length >= 72, 'anti-pattern table should have 72+ rows');
  for (const s of ['Thoroughness amplifiers', 'escape hatch', 'Guessed parameters', 'Plan left open', 'Unsized subagent result']) assert.ok(a.includes(s), 'missing: ' + s);
});

test('model-notes.md is dated, sourced and routed, and keeps the confirm-first rule', () => {
  const t = ref('model-notes.md');
  assert.match(t, /Checked \d{4}-\d{2}-\d{2}/, 'carries a check date');
  for (const s of ['[unverified]', 'output_config.effort', 'budget_tokens', 'Prefill', 'reasoning.effort', '*** Begin Patch', '<context_gathering>',
    '<persistence>', 'thinking_level', 'Thought signatures', 'UI stack defaults', 'Conflict on fonts', '12-Factor Agents', 'The Prompt Report']) {
    assert.ok(t.includes(s), 'model-notes missing: ' + s);
  }
  assert.ok((t.match(/https:\/\//g) || []).length >= 20, 'every section links its source');
  assert.ok(loadMethod(METHOD_FILE).includes('references/model-notes.md'), 'method routes to it');
  assert.ok(ref('targets.md').includes('model-notes.md') && ref('llm-features.md').includes('model-notes.md'));
});

// --- researched fixes for common prompting problems (surveys, papers, practitioner reports) ---
test('method runs the requirements sweep and the session checks', () => {
  const m = loadMethod(METHOD_FILE);
  for (const s of ['Ask first:', 'when X', '~15 rules', 'Session checks', '/sharpen:sharpen-handoff', '/clear', 'risky verbs', 'untrusted content']) {
    assert.ok(m.includes(s), 'missing: ' + s);
  }
});

test('techniques.md carries the requirements sweep, dependency check and data formats with sources', () => {
  const t = ref('techniques.md');
  for (const s of ['Missed-requirements sweep', '41.1%', 'Ask first', '79%', 'IFScale', 'Confirm a package exists', '5.2%', 'npm view', 'lockfile', 'context7', 'TOON']) {
    assert.ok(t.includes(s), 'techniques missing: ' + s);
  }
});

test('briefs.md carries evidence by task, guards, owner line, intent tests, caps, where-to-look and the subagent contract', () => {
  const b = ref('briefs.md');
  for (const s of ['Evidence by task type', 'Guards stay', 'Owner line', 'flag-for-a-human', 'Stop hook', '--max-budget-usd', 'claude -w',
    'Where to look:', 'Explain (optional', '## Subagent contract', 'Verified by:', 'MAST', 'No blocking issues', 'Skip style']) {
    assert.ok(b.includes(s), 'briefs missing: ' + s);
  }
});

test('llm-features.md covers format-variant evals and the lethal trifecta', () => {
  const t = ref('llm-features.md');
  for (const s of ['Test more than one wording', '76 points', 'Repeat runs', 'lethal trifecta']) assert.ok(t.includes(s), 'llm-features missing: ' + s);
});

test('anti-patterns cover session and safety checks (88 rows)', () => {
  const a = ref('anti-patterns.md');
  assert.ok((a.match(/^\| \d+ /gm) || []).length >= 88, 'anti-pattern table should have 88+ rows');
  for (const s of ['Third correction', 'Risky verb', 'Lethal trifecta', 'Pep-talk persistence', 'Unchecked new package', 'Agent-file bloat']) assert.ok(a.includes(s), 'missing: ' + s);
});

test('sharpen-audit prunes as well as adds', () => {
  const m = body('sharpen-audit');
  for (const s of ['Prune', 'inferable from the code', 'belongs in a hook', 'unused MCP', '200', '500', 'Remove or move:']) assert.ok(m.includes(s), 'audit missing: ' + s);
  assert.ok(m.includes('Changes nothing'), 'still read-only');
});

test('sharpen-handoff points to files and commits instead of summarising code', () => {
  const m = body('sharpen-handoff');
  for (const s of ['commits', 'symbols', '4 of 45']) assert.ok(m.includes(s), 'handoff missing: ' + s);
});

test('companion skills use the new references and keep outward prompts private', () => {
  assert.ok(body('sharpen-decompile').includes('references/techniques.md'));
  assert.ok(body('sharpen-decompile').includes('references/llm-features.md'));
  assert.ok(body('sharpen-prompt').includes('customer data'));
});
