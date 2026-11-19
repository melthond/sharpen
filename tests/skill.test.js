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
