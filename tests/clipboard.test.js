const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pickPrompt } = require('../hooks/sharpen-clipboard');

const HOOK = path.join(__dirname, '..', 'hooks', 'sharpen-clipboard.js');
const card = (question, preview) => ({ questions: [{ question, header: 'Sharpen', multiSelect: false, options: [
  { label: 'Send it (Recommended)', description: 'Run exactly this prompt', preview },
  { label: 'Run my original', description: 'Run what you typed' }] }] });

test('pickPrompt takes the first option preview of a Sharpen card', () => {
  assert.strictEqual(pickPrompt(card('Send this sharpened prompt?', 'Fix the PIN lockout.\nDone when: tests pass')), 'Fix the PIN lockout.\nDone when: tests pass');
  assert.strictEqual(pickPrompt(card('Which did you mean?', 'Investigate login')), 'Investigate login');
});

test('pickPrompt ignores other questions and empty previews', () => {
  assert.strictEqual(pickPrompt(card('Which database?', 'Postgres')), null);
  assert.strictEqual(pickPrompt(card('Send this sharpened prompt?', '   ')), null);
  assert.strictEqual(pickPrompt({}), null);
  assert.strictEqual(pickPrompt(null), null);
});

function runHook(input, on) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-clip-'));
  if (on) fs.writeFileSync(path.join(dir, 'state.json'), '{"on":true}');
  const clip = path.join(dir, 'clipboard.txt');
  const r = spawnSync(process.execPath, [HOOK], { input, encoding: 'utf8', env: { ...process.env, SHARPEN_HOME: dir, SHARPEN_CLIPBOARD_FILE: clip } });
  return { r, dir, clip };
}

test('hook copies the engineered prompt and remembers it, when on', () => {
  const input = JSON.stringify({ tool_name: 'AskUserQuestion', tool_input: card('Send this sharpened prompt?', 'Fix the PIN lockout.') });
  const { r, dir, clip } = runHook(input, true);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, '', 'never blocks or changes the question');
  assert.strictEqual(fs.readFileSync(clip, 'utf8'), 'Fix the PIN lockout.');
  assert.strictEqual(fs.readFileSync(path.join(dir, 'last-sharpened.txt'), 'utf8'), 'Fix the PIN lockout.');
});

test('hook does nothing when off, for other tools, or on bad input', () => {
  const input = JSON.stringify({ tool_name: 'AskUserQuestion', tool_input: card('Send this sharpened prompt?', 'x') });
  assert.ok(!fs.existsSync(runHook(input, false).clip));
  assert.ok(!fs.existsSync(runHook(JSON.stringify({ tool_name: 'Bash', tool_input: {} }), true).clip));
  for (const bad of ['not json', '']) {
    const { r, clip } = runHook(bad, true);
    assert.strictEqual(r.status, 0);
    assert.ok(!fs.existsSync(clip));
  }
});

test('runs when loaded the way hooks.json loads it (node -e require)', () => {
  const root = path.join(__dirname, '..');
  const cmd = JSON.parse(fs.readFileSync(path.join(root, 'hooks', 'hooks.json'), 'utf8')).hooks.PreToolUse[0].hooks[0].command;
  const code = cmd.match(/^node -e "(.*)"$/)[1].replace(/\\"/g, '"');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-clip-'));
  fs.writeFileSync(path.join(dir, 'state.json'), '{"on":true}');
  const clip = path.join(dir, 'clipboard.txt');
  const input = JSON.stringify({ tool_name: 'AskUserQuestion', tool_input: card('Send this sharpened prompt?', 'Fix it properly now.') });
  const r = spawnSync(process.execPath, ['-e', code], { input, encoding: 'utf8', env: { ...process.env, CLAUDE_PLUGIN_ROOT: root, SHARPEN_HOME: dir, SHARPEN_CLIPBOARD_FILE: clip } });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(fs.readFileSync(clip, 'utf8'), 'Fix it properly now.');
});
