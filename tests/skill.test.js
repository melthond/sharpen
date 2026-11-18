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
  for (const s of ['Clear prompt, running as typed.', 'Running as:', 'AskUserQuestion', 'Run as typed', 'Use:', 'skills', 'agents', 'MCP',
    'Bug', 'Feature', 'Refactor', 'Performance', 'Question', 'Review', 'Explore', 'Ops']) {
    assert.ok(m.includes(s), `missing: ${s}`);
  }
});

test('method stays small enough to inject', () => {
  assert.ok(loadMethod(METHOD_FILE).length < 6000, `length ${loadMethod(METHOD_FILE).length}`);
});

test('options fit AskUserQuestion (max 4 choices incl. Run as typed)', () => {
  const m = loadMethod(METHOD_FILE);
  assert.ok(m.includes('2–3 options'), 'caps interpretations at 3');
  assert.ok(!/2–4 options/.test(m), 'no 2–4 options wording left');
});
