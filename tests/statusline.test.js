const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ensureStatusline, STATUSLINE_NUDGE } = require('../hooks/sharpen-statusline-setup');

function sandbox(settings) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-sl-'));
  process.env.SHARPEN_HOME = path.join(root, 'sharpen');
  process.env.CLAUDE_CONFIG_DIR = path.join(root, 'claude');
  fs.mkdirSync(process.env.CLAUDE_CONFIG_DIR, { recursive: true });
  const file = path.join(process.env.CLAUDE_CONFIG_DIR, 'settings.json');
  if (settings !== undefined) fs.writeFileSync(file, typeof settings === 'string' ? settings : JSON.stringify(settings));
  const copy = path.join(process.env.SHARPEN_HOME, 'sharpen-statusline.js');
  return { file, copy, read: () => JSON.parse(fs.readFileSync(file, 'utf8')) };
}

test('no settings file: creates one with the badge and copies the script', () => {
  const s = sandbox();
  assert.strictEqual(ensureStatusline(), null);
  assert.ok(fs.existsSync(s.copy), 'script copied outside the plugin cache');
  assert.match(s.read().statusLine.command, /sharpen-statusline\.js/);
  assert.strictEqual(s.read().statusLine.type, 'command');
});

test('settings without statusLine: adds it and keeps other keys', () => {
  const s = sandbox({ theme: 'dark', permissions: { allow: ['Read'] } });
  assert.strictEqual(ensureStatusline(), null);
  const j = s.read();
  assert.strictEqual(j.theme, 'dark');
  assert.deepStrictEqual(j.permissions, { allow: ['Read'] });
  assert.match(j.statusLine.command, /sharpen-statusline\.js/);
});

test('existing statusLine: never overwritten, nudges once', () => {
  const mine = { statusLine: { type: 'command', command: 'my-line.sh' } };
  const s = sandbox(mine);
  const first = ensureStatusline();
  assert.ok(first.startsWith(STATUSLINE_NUDGE), 'asks Claude to offer chaining');
  assert.ok(first.includes(s.copy.split(path.sep).join('/')), 'names the script path');
  assert.deepStrictEqual(s.read(), mine);
  assert.strictEqual(ensureStatusline(), null, 'only once');
});

test('statusLine already runs the badge: nothing to do', () => {
  const s = sandbox({ statusLine: { type: 'command', command: 'a; node "/x/sharpen-statusline.js"' } });
  assert.strictEqual(ensureStatusline(), null);
});

test('corrupt settings file: left untouched', () => {
  const s = sandbox('{ not json');
  assert.strictEqual(ensureStatusline(), null);
  assert.strictEqual(fs.readFileSync(s.file, 'utf8'), '{ not json');
});

test('copied script prints a red badge when on and nothing when off', () => {
  const s = sandbox();
  ensureStatusline();
  const { spawnSync } = require('child_process');
  const run = () => spawnSync(process.execPath, [s.copy], { env: { ...process.env }, encoding: 'utf8' }).stdout;
  assert.strictEqual(run(), '');
  fs.writeFileSync(path.join(process.env.SHARPEN_HOME, 'state.json'), '{"on":true}');
  assert.strictEqual(run(), '\x1b[38;5;196m[SHARPEN]\x1b[0m');
});

// --- verdict in the badge ---------------------------------------------------
const { verdict } = require('../hooks/sharpen-statusline');
const user = (content, extra = {}) => ({ type: 'user', message: { role: 'user', content }, ...extra });
const say = (...blocks) => ({ type: 'assistant', message: { role: 'assistant', content: blocks } });
const text = (t) => ({ type: 'text', text: t });
const ask = { type: 'tool_use', id: 'q1', name: 'AskUserQuestion', input: {} };
const answered = user([{ type: 'tool_result', tool_use_id: 'q1', content: 'picked' }]);

test('verdict: clear, fill-in, asking, sharpened, raw', () => {
  assert.strictEqual(verdict([user('rename x in a.ts'), say(text('Sharpened prompt (clear):\n> Rename x in a.ts'))]), 'CLEAR');
  assert.strictEqual(verdict([user('add tests'), say(text('Sharpened prompt (fill-in):\n> Add tests for parsePin'))]), 'FILL-IN');
  assert.strictEqual(verdict([user('add tests'), say(text('Running as: add tests'))]), null, 'old one-line verdicts are gone');
  assert.strictEqual(verdict([user('fix the login thing'), say({ type: 'thinking', thinking: '' }), say(ask)]), 'ASKING');
  assert.strictEqual(verdict([user('fix it'), say(text('Which did you mean?\n1. …'))]), 'ASKING');
  assert.strictEqual(verdict([user('fix it'), say(ask), answered, say(text('Fixing the PIN lockout'))]), 'SHARPENED');
  assert.strictEqual(verdict([user('RAW: make it faster'), say(text('ok'))]), 'RAW');
});

test('verdict: only the latest prompt counts', () => {
  const lines = [user('a'), say(text('Sharpened prompt (clear):\n> a')), user('b'), say(text('Sharpened prompt (fill-in):\n> b'))];
  assert.strictEqual(verdict(lines), 'FILL-IN');
});

test('verdict: nothing to show yet, slash commands, other replies', () => {
  assert.strictEqual(verdict([]), null);
  assert.strictEqual(verdict([user('fix it')]), null, 'no reply yet');
  assert.strictEqual(verdict([user('/sharpen on'), say(text('Sharpen is on.'))]), null);
  assert.strictEqual(verdict([user('<command-name>/sharpen:sharpen-help</command-name>'), say(text('card'))]), null);
  assert.strictEqual(verdict([user('hi'), say(text('Hello!'))]), null);
});

test('verdict: ignores tool results and subagent lines when finding the prompt', () => {
  const lines = [
    user('fix it'), say(text('Sharpened prompt (fill-in):\n> Fix the PIN lockout')),
    user([{ type: 'tool_result', tool_use_id: 't', content: 'x' }]),
    user('subagent brief', { isSidechain: true }), say(text('Sharpened prompt (clear):\n> brief')),
  ];
  lines[4].isSidechain = true;
  assert.strictEqual(verdict(lines), 'FILL-IN');
});

test('verdict: prompt given as text blocks', () => {
  assert.strictEqual(verdict([user([{ type: 'text', text: 'rename x' }]), say(text('Sharpened prompt (clear):\n> rename x'))]), 'CLEAR');
});

test('badge shows the verdict read from the transcript', () => {
  const s = sandbox();
  ensureStatusline();
  fs.writeFileSync(path.join(process.env.SHARPEN_HOME, 'state.json'), '{"on":true}');
  const transcript = path.join(process.env.SHARPEN_HOME, 't.jsonl');
  fs.writeFileSync(transcript, ['{"type":"summary"}', JSON.stringify(user('add tests')), JSON.stringify(say(text('Sharpened prompt (fill-in):\n> add tests'))), ''].join('\n'));
  const { spawnSync } = require('child_process');
  const out = spawnSync(process.execPath, [s.copy], { input: JSON.stringify({ transcript_path: transcript }), env: { ...process.env }, encoding: 'utf8' }).stdout;
  assert.strictEqual(out, '\x1b[38;5;196m[SHARPEN - FILL-IN]\x1b[0m');
  const bad = spawnSync(process.execPath, [s.copy], { input: '{"transcript_path":"/nope.jsonl"}', env: { ...process.env }, encoding: 'utf8' }).stdout;
  assert.strictEqual(bad, '\x1b[38;5;196m[SHARPEN]\x1b[0m', 'missing transcript falls back to the plain badge');
});
