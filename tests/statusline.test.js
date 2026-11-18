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
