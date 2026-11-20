const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { ON_NOTE, NUDGE, loadMethod } = require('../hooks/sharpen-core');
const { STATUSLINE_NUDGE } = require('../hooks/sharpen-statusline-setup');

const ROOT = path.join(__dirname, '..');
const hook = (name) => path.join(ROOT, 'hooks', name);
const home = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-hook-'));
const setOn = (dir) => fs.writeFileSync(path.join(dir, 'state.json'), '{"on":true}');
// CLAUDE_CONFIG_DIR is always a temp dir so tests can never touch the real ~/.claude/settings.json
const env = (dir) => ({ ...process.env, SHARPEN_HOME: dir, CLAUDE_CONFIG_DIR: path.join(dir, 'claude') });
const run = (name, input, dir) =>
  spawnSync(process.execPath, [hook(name)], { input, env: env(dir), encoding: 'utf8' });

test('prompt hook toggles on and emits context', () => {
  const dir = home();
  const r = run('sharpen-prompt.js', '{"prompt":"/sharpen on"}', dir);
  assert.strictEqual(r.status, 0);
  const out = JSON.parse(r.stdout).hookSpecificOutput;
  assert.strictEqual(out.hookEventName, 'UserPromptSubmit');
  assert.ok(out.additionalContext.startsWith(ON_NOTE));
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8')).on, true);
});

test('card and correction counters: card counted by the clipboard hook, pushback by the prompt hook', () => {
  const dir = home();
  setOn(dir);
  const card = JSON.stringify({ tool_name: 'AskUserQuestion', tool_input: { questions: [{ question: 'Send this sharpened prompt?', options: [{ label: 'Send it', preview: 'Fix the footer year in src/Footer.tsx' }] }] } });
  spawnSync(process.execPath, [hook('sharpen-clipboard.js')], { input: card, env: { ...env(dir), SHARPEN_CLIPBOARD_FILE: path.join(dir, 'clip.txt') }, encoding: 'utf8' });
  run('sharpen-prompt.js', '{"prompt":"still failing after that"}', dir);
  run('sharpen-prompt.js', '{"prompt":"now add a test"}', dir);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'stats.json'), 'utf8')), { cards: 1, corrections: 1 });
  const status = JSON.parse(run('sharpen-prompt.js', '{"prompt":"/sharpen"}', dir).stdout).hookSpecificOutput.additionalContext;
  assert.ok(status.includes('Sharpened prompts: 1. Follow-up corrections: 1 (100%).'), status);
});

test('no correction is counted while Sharpen is off or before any card', () => {
  const dir = home();
  run('sharpen-prompt.js', '{"prompt":"no, wrong"}', dir); // off
  setOn(dir);
  run('sharpen-prompt.js', '{"prompt":"no, wrong"}', dir); // on, but no card shown yet
  assert.strictEqual(fs.existsSync(path.join(dir, 'stats.json')), false);
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
  const child = spawn(process.execPath, [hook('sharpen-prompt.js')], { env: env(home()) });
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
  assert.strictEqual(run('sharpen-statusline.js', '', dir).stdout, '\x1b[38;5;196m[SHARPEN]\x1b[0m');
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
  assert.strictEqual(plugin.hooks, undefined, 'hooks/hooks.json is auto-loaded; listing it again risks a duplicate load');
  assert.ok(fs.existsSync(path.join(ROOT, 'hooks', 'hooks.json')));
  assert.strictEqual(read('.claude-plugin/marketplace.json').plugins[0].name, 'sharpen');
  assert.ok(fs.readFileSync(path.join(ROOT, 'commands', 'sharpen.md'), 'utf8').includes('$ARGUMENTS'));
});

test('/sharpen on puts the badge in an empty status bar', () => {
  const dir = home();
  run('sharpen-prompt.js', '{"prompt":"/sharpen on"}', dir);
  const settings = JSON.parse(fs.readFileSync(path.join(dir, 'claude', 'settings.json'), 'utf8'));
  assert.match(settings.statusLine.command, /sharpen-statusline.js/);
});

test('/sharpen on with an existing status line asks instead of overwriting', () => {
  const dir = home();
  fs.mkdirSync(path.join(dir, 'claude'));
  fs.writeFileSync(path.join(dir, 'claude', 'settings.json'), '{"statusLine":{"type":"command","command":"mine"}}');
  const ctx = JSON.parse(run('sharpen-prompt.js', '{"prompt":"/sharpen on"}', dir).stdout).hookSpecificOutput.additionalContext;
  assert.ok(ctx.includes(STATUSLINE_NUDGE));
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'claude', 'settings.json'), 'utf8')).statusLine.command, 'mine');
});

test('session start sets up the badge when on', () => {
  const dir = home();
  setOn(dir);
  run('sharpen-session.js', '{}', dir);
  assert.ok(fs.existsSync(path.join(dir, 'claude', 'settings.json')));
});

test('plain prompts never touch settings', () => {
  const dir = home();
  setOn(dir);
  run('sharpen-prompt.js', '{"prompt":"fix it"}', dir);
  assert.ok(!fs.existsSync(path.join(dir, 'claude', 'settings.json')));
});

test('session start and /sharpen on include the setup summary', () => {
  const dir = home();
  fs.mkdirSync(path.join(dir, 'claude'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'claude', 'settings.json'), JSON.stringify({ statusLine: { type: 'command', command: 'x sharpen-statusline' }, hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node require-tests.js' }] }] } }));
  setOn(dir);
  const session = JSON.parse(run('sharpen-session.js', JSON.stringify({ cwd: dir }), dir).stdout).hookSpecificOutput.additionalContext;
  assert.match(session, /Stop: require-tests\.js \(user\)/);
  const on = JSON.parse(run('sharpen-prompt.js', JSON.stringify({ prompt: '/sharpen on', cwd: dir }), dir).stdout).hookSpecificOutput.additionalContext;
  assert.match(on, /Stop: require-tests\.js \(user\)/);
  const plain = JSON.parse(run('sharpen-prompt.js', JSON.stringify({ prompt: 'fix it', cwd: dir }), dir).stdout).hookSpecificOutput.additionalContext;
  assert.ok(!plain.includes('require-tests'), 'not repeated on every prompt');
});

test('hooks.json registers the clipboard copy only before AskUserQuestion', () => {
  const { hooks } = JSON.parse(fs.readFileSync(hook('hooks.json'), 'utf8'));
  const entry = hooks.PreToolUse[0];
  assert.strictEqual(entry.matcher, 'AskUserQuestion');
  assert.ok(entry.hooks[0].command.includes('hooks/sharpen-clipboard.js'));
});

test('session start and /sharpen on tell Claude where the reference files are', () => {
  const dir = home();
  setOn(dir);
  const refs = path.join(ROOT, 'skills', 'sharpen', 'references');
  const session = JSON.parse(run('sharpen-session.js', JSON.stringify({ cwd: dir }), dir).stdout).hookSpecificOutput.additionalContext;
  assert.ok(session.includes(refs), 'session context names the references folder');
  const on = JSON.parse(run('sharpen-prompt.js', JSON.stringify({ prompt: '/sharpen on', cwd: dir }), dir).stdout).hookSpecificOutput.additionalContext;
  assert.ok(on.includes(refs), '/sharpen on names the references folder');
});
