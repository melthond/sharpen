const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readStats, bump, isCorrection, statsLine } = require('../hooks/sharpen-stats');
const { decide } = require('../hooks/sharpen-core');

const fresh = () => (process.env.SHARPEN_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-stats-')));

test('stats start at zero and count up', () => {
  fresh();
  assert.deepStrictEqual(readStats(), { cards: 0, corrections: 0 });
  bump('cards'); bump('cards'); bump('corrections');
  assert.deepStrictEqual(readStats(), { cards: 2, corrections: 1 });
});

test('stats file holds only counts, never prompt text', () => {
  const dir = fresh();
  bump('cards');
  const raw = JSON.parse(fs.readFileSync(path.join(dir, 'stats.json'), 'utf8'));
  assert.deepStrictEqual(Object.keys(raw).sort(), ['cards', 'corrections']);
  bump('anything-else');
  assert.deepStrictEqual(Object.keys(JSON.parse(fs.readFileSync(path.join(dir, 'stats.json'), 'utf8'))).sort(), ['cards', 'corrections']);
});

test('corrupt or odd stats files read as zero', () => {
  for (const raw of ['', '{', 'null', '{"cards":"x","corrections":-3}']) {
    const dir = fresh();
    fs.writeFileSync(path.join(dir, 'stats.json'), raw);
    assert.deepStrictEqual(readStats(), { cards: 0, corrections: 0 }, 'raw=' + raw);
  }
});

test('isCorrection spots a re-prompt that pushes back', () => {
  for (const p of ["no, that's wrong", 'still failing', "that didn't work", 'it does not work', 'try again', 'not what I asked', 'wrong file', 'you broke the build', 'revert that']) {
    assert.ok(isCorrection(p), p);
  }
  for (const p of ['now add tests for it', 'nothing else needed', 'add a node about stillness', 'rename getUser to fetchUser', '', 'notice the footer']) {
    assert.ok(!isCorrection(p), p);
  }
});

test('isCorrection spots polite and non-English pushback', () => {
  for (const p of ["that isn't what I asked", 'that is not what I meant', "that's not right", 'not quite', "that's not it",
    'non, pas ça', 'ça ne marche pas', 'no funciona', 'eso no es lo que pedí', 'não funcionou', 'nein, falsch', 'funktioniert nicht']) {
    assert.ok(isCorrection(p), p);
  }
});

test('isCorrection ignores new instructions that only start like pushback', () => {
  for (const p of ['no need to change the tests', 'still, add a comment', 'not quite done yet: add the footer too', 'nothing to fix, add docs']) {
    assert.ok(!isCorrection(p), p);
  }
});

test('statsLine reports the rate, and says so when there is no data', () => {
  assert.strictEqual(statsLine({ cards: 0, corrections: 0 }), 'No sharpened prompts counted yet.');
  assert.strictEqual(statsLine({ cards: 20, corrections: 3 }), 'Sharpened prompts: 20. Follow-up corrections: 3 (15%).');
});

test('/sharpen status includes the stats line', () => {
  const r = decide('/sharpen', { on: true }, 'METHOD', null, { cards: 4, corrections: 1 });
  assert.ok(r.context.includes('Sharpened prompts: 4. Follow-up corrections: 1 (25%).'), r.context);
  assert.strictEqual(decide('/sharpen', { on: false }, 'METHOD').context.includes('SHARPEN is off'), true);
});
