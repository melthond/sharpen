const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { ON_NOTE, NUDGE, loadMethod } = require('../hooks/sharpen-core');

const ROOT = path.join(__dirname, '..');
const hook = (name) => path.join(ROOT, 'hooks', name);
const home = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-hook-'));
const setOn = (dir) => fs.writeFileSync(path.join(dir, 'state.json'), '{"on":true}');
const run = (name, input, dir) =>
  spawnSync(process.execPath, [hook(name)], { input, env: { ...process.env, SHARPEN_HOME: dir }, encoding: 'utf8' });

test('prompt hook toggles on and emits context', () => {
  const dir = home();
  const r = run('sharpen-prompt.js', '{"prompt":"/sharpen on"}', dir);
  assert.strictEqual(r.status, 0);
  const out = JSON.parse(r.stdout).hookSpecificOutput;
  assert.strictEqual(out.hookEventName, 'UserPromptSubmit');
  assert.ok(out.additionalContext.startsWith(ON_NOTE));
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8')).on, true);
});

test('prompt hook silent when off', () => {
  const r = run('sharpen-prompt.js', '{"prompt":"fix it"}', home());
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, '');
});

test('bad input', () => {
  for (const input of ['not json', '']) {
    const dir = home();
    setOn(dir);
    const r = run('sharpen-prompt.js', input, dir);
    assert.strictEqual(r.status, 0, input);
    assert.strictEqual(r.stdout, '', input);
  }
  const dir = home();
  setOn(dir);
  const r = run('sharpen-prompt.js', '{}', dir);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, NUDGE);
});

test('exits cleanly when stdin stays open', async () => {
  const child = spawn(process.execPath, [hook('sharpen-prompt.js')], { env: { ...process.env, SHARPEN_HOME: home() } });
  const code = await new Promise((resolve, reject) => {
    const t = setTimeout(() => { child.kill(); reject(new Error('hook hung')); }, 4000);
    child.on('exit', (c) => { clearTimeout(t); resolve(c); });
  });
  assert.strictEqual(code, 0);
});

test('session hook injects method only when on', () => {
  const dir = home();
  assert.strictEqual(run('sharpen-session.js', '{}', dir).stdout, '');
  setOn(dir);
  const out = JSON.parse(run('sharpen-session.js', '{}', dir).stdout).hookSpecificOutput;
  assert.strictEqual(out.hookEventName, 'SessionStart');
  assert.ok(out.additionalContext.includes(loadMethod(path.join(ROOT, 'skills', 'sharpen', 'SKILL.md'))));
});

test('statusline', () => {
  const dir = home();
  assert.strictEqual(run('sharpen-statusline.js', '', dir).stdout, '');
  setOn(dir);
  assert.strictEqual(run('sharpen-statusline.js', '', dir).stdout, '[SHARPEN]');
});

test('hooks.json is valid', () => {
  const { hooks } = JSON.parse(fs.readFileSync(hook('hooks.json'), 'utf8'));
  for (const [event, file] of [['SessionStart', 'sharpen-session.js'], ['UserPromptSubmit', 'sharpen-prompt.js']]) {
    const cmd = hooks[event][0].hooks[0].command;
    assert.ok(cmd.includes(`hooks/${file}`), event);
    assert.ok(fs.existsSync(hook(file)), file);
  }
});

test('manifests are valid', () => {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  const plugin = read('.claude-plugin/plugin.json');
  assert.strictEqual(plugin.name, 'sharpen');
  assert.ok(fs.existsSync(path.join(ROOT, plugin.hooks)), 'plugin.hooks points to a file');
  assert.strictEqual(read('.claude-plugin/marketplace.json').plugins[0].name, 'sharpen');
  assert.ok(fs.readFileSync(path.join(ROOT, 'commands', 'sharpen.md'), 'utf8').includes('$ARGUMENTS'));
});
