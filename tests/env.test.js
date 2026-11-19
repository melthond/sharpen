const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { summarizeSetup, hookLabel } = require('../hooks/sharpen-env');

const put = (file, obj) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof obj === 'string' ? obj : JSON.stringify(obj)); };

function world() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-env-'));
  const claude = path.join(root, 'claude');
  const cwd = path.join(root, 'project');
  fs.mkdirSync(cwd, { recursive: true });
  return { root, claude, cwd };
}

test('hookLabel names the script, never its arguments', () => {
  assert.strictEqual(hookLabel({ type: 'command', command: 'node "C:/x/hooks/format.js" --token SECRET123' }), 'format.js');
  assert.strictEqual(hookLabel({ type: 'command', command: 'bash ~/.claude/hooks/guard.sh' }), 'guard.sh');
  assert.strictEqual(hookLabel({ type: 'command', command: 'npx prettier --write "$FILE"' }), 'npx prettier');
  assert.strictEqual(hookLabel({ type: 'http', url: 'https://x' }), 'http hook');
  assert.ok(!hookLabel({ type: 'command', command: 'curl -H "Authorization: Bearer abc" https://x' }).includes('abc'));
});

test('summarizes user, project and local hooks with their matchers', () => {
  const w = world();
  put(path.join(w.claude, 'settings.json'), { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node /h/require-tests.js' }] }] } });
  put(path.join(w.cwd, '.claude', 'settings.json'), { hooks: { PostToolUse: [{ matcher: 'Edit|Write', hooks: [{ type: 'command', command: 'npx prettier --write' }] }] } });
  put(path.join(w.cwd, '.claude', 'settings.local.json'), { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'sh guard.sh' }] }] } });
  const s = summarizeSetup({ claudeDir: w.claude, cwd: w.cwd });
  assert.match(s, /Stop: require-tests\.js \(user\)/);
  assert.match(s, /PostToolUse \[Edit\|Write\]: npx prettier \(project\)/);
  assert.match(s, /PreToolUse \[Bash\]: guard\.sh \(local\)/);
});

test('includes hooks from enabled plugins, skips disabled ones and Sharpen itself', () => {
  const w = world();
  const p = (name) => path.join(w.root, 'plugins', name);
  put(path.join(p('fmt'), 'hooks', 'hooks.json'), { hooks: { PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'node ${CLAUDE_PLUGIN_ROOT}/hooks/fmt.js' }] }] } });
  put(path.join(p('off'), 'hooks', 'hooks.json'), { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node off.js' }] }] } });
  put(path.join(p('sharpen'), 'hooks', 'hooks.json'), { hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'node sharpen-prompt.js' }] }] } });
  put(path.join(w.claude, 'plugins', 'installed_plugins.json'), { version: 2, plugins: {
    'fmt@m': [{ installPath: p('fmt') }], 'off@m': [{ installPath: p('off') }], 'sharpen@sharpen': [{ installPath: p('sharpen') }] } });
  put(path.join(w.claude, 'settings.json'), { enabledPlugins: { 'fmt@m': true, 'off@m': false, 'sharpen@sharpen': true } });
  const s = summarizeSetup({ claudeDir: w.claude, cwd: w.cwd });
  assert.match(s, /PostToolUse \[Edit\]: fmt\.js \(plugin fmt\)/);
  assert.ok(!s.includes('off.js'), 'disabled plugin left out');
  assert.ok(!s.includes('sharpen-prompt'), 'Sharpen leaves itself out');
  assert.match(s, /Plugins enabled: fmt\b/);
});

test('nothing configured, or unreadable files: null, never a crash', () => {
  const w = world();
  assert.strictEqual(summarizeSetup({ claudeDir: w.claude, cwd: w.cwd }), null);
  put(path.join(w.claude, 'settings.json'), '{ broken');
  assert.strictEqual(summarizeSetup({ claudeDir: w.claude, cwd: w.cwd }), null);
});

test('long setups are capped', () => {
  const w = world();
  const hooks = {};
  for (let i = 0; i < 40; i++) hooks['E' + i] = [{ hooks: [{ type: 'command', command: `node h${i}.js` }] }];
  put(path.join(w.claude, 'settings.json'), { hooks });
  const s = summarizeSetup({ claudeDir: w.claude, cwd: w.cwd });
  assert.match(s, /and 15 more/);
  assert.ok(s.split('\n').length < 32);
});
