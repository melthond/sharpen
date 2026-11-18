const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { stateDir, readState, writeState } = require('../hooks/sharpen-state');

const fresh = () => (process.env.SHARPEN_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-')));

test('defaults to off when no file', () => {
  fresh();
  assert.deepStrictEqual(readState(), { on: false, mode: 'full' });
});

test('round-trips on', () => {
  fresh();
  writeState({ on: true, mode: 'lite' });
  assert.deepStrictEqual(readState(), { on: true, mode: 'lite' });
});

test('creates the directory', () => {
  const tmp = fresh();
  process.env.SHARPEN_HOME = path.join(tmp, 'a', 'b');
  writeState({ on: true });
  assert.ok(fs.existsSync(path.join(tmp, 'a', 'b', 'state.json')));
});

test('treats corrupt file as off', () => {
  for (const raw of ['', '{', 'null', '{"on":"yes"}']) {
    const dir = fresh();
    fs.writeFileSync(path.join(dir, 'state.json'), raw);
    assert.deepStrictEqual(readState(), { on: false, mode: 'full' }, `raw=${JSON.stringify(raw)}`);
  }
});

test('stateDir uses ~/.config/sharpen by default', () => {
  delete process.env.SHARPEN_HOME;
  assert.strictEqual(stateDir(), path.join(os.homedir(), '.config', 'sharpen'));
});

test('unknown or missing mode reads as full; old files keep working', () => {
  for (const raw of ['{"on":true}', '{"on":true,"mode":"loud"}']) {
    const dir = fresh();
    fs.writeFileSync(path.join(dir, 'state.json'), raw);
    assert.deepStrictEqual(readState(), { on: true, mode: 'full' }, raw);
  }
});
