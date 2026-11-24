const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const c = require('../hooks/sharpen-core');

const M = 'METHOD';
const ON = { on: true };
const OFF = { on: false };
const none = { context: null, newState: null };

test('on toggles', () => {
  const r = c.decide('/sharpen on', OFF, M);
  assert.deepStrictEqual(r.newState, { on: true });
  assert.ok(r.context.startsWith(c.ON_NOTE));
  assert.ok(r.context.endsWith(M));
});

test('off toggles', () => {
  assert.deepStrictEqual(c.decide('/sharpen off', ON, M), { context: c.OFF_NOTE, newState: { on: false } });
});

test('status', () => {
  assert.strictEqual(c.decide('/sharpen', ON, M).context, c.STATUS_ON);
  assert.deepStrictEqual(c.decide('/sharpen', OFF, M), { context: c.STATUS_OFF, newState: null });
  assert.strictEqual(c.decide('/sharpen', ON, M).newState, null);
});

test('unknown arg', () => {
  assert.deepStrictEqual(c.decide('/sharpen maybe', ON, M), { context: c.USAGE, newState: null });
});

test('case and whitespace', () => {
  assert.deepStrictEqual(c.decide('  /SHARPEN On  ', OFF, M).newState, { on: true });
  for (const p of ['Sharpen: fix it', 'SHARPEN:fix']) {
    assert.ok(c.decide(p, ON, M).context.startsWith(c.FORCE_NOTE), p);
  }
  assert.strictEqual(c.decide('RAW: x', ON, M).context, c.RAW_NOTE);
});

test('look-alikes are not toggles', () => {
  for (const p of ['/sharpening', '/sharpen-x', '/sharpenon']) {
    assert.deepStrictEqual(c.decide(p, ON, M), none, p);
  }
});

test('force works when off', () => {
  const ctx = c.decide('sharpen: fix login', OFF, M).context;
  assert.ok(ctx.startsWith(c.FORCE_NOTE));
  assert.ok(ctx.endsWith(M));
});

test('other slash commands are left alone', () => {
  assert.deepStrictEqual(c.decide('/help', ON, M), none);
});

test('off does nothing', () => {
  assert.deepStrictEqual(c.decide('fix the login thing', OFF, M), none);
  assert.deepStrictEqual(c.decide('raw: x', OFF, M), none);
});

test('on nudges plain prompts', () => {
  assert.deepStrictEqual(c.decide('fix the login thing', ON, M), { context: c.NUDGE, newState: null });
});

test('empty prompt', () => {
  assert.strictEqual(c.decide('', ON, M).context, c.NUDGE);
  assert.deepStrictEqual(c.decide('', OFF, M), none);
});

test('loadMethod strips front matter', () => {
  assert.strictEqual(c.loadMethod(path.join(__dirname, 'fixtures', 'skill.md')), 'Body line');
  assert.strictEqual(c.loadMethod(path.join(__dirname, 'fixtures', 'plain.md')), 'Plain body');
});

test('namespaced command toggles', () => {
  assert.deepStrictEqual(c.decide('/sharpen:sharpen on', OFF, M).newState, { on: true });
  assert.deepStrictEqual(c.decide('/sharpen:sharpen off', ON, M), { context: c.OFF_NOTE, newState: { on: false } });
  assert.deepStrictEqual(c.decide('/sharpen:sharpen', ON, M), { context: c.STATUS_ON, newState: null });
  assert.deepStrictEqual(c.decide('/sharpen:other on', ON, M), none);
});

test('companion skill commands are not toggles', () => {
  for (const p of ['/sharpen:sharpen-prompt fix it', '/sharpen:sharpen-help', '/sharpen-review']) {
    assert.deepStrictEqual(c.decide(p, ON, M), none, p);
  }
});

test('there are no modes: full and lite are not commands', () => {
  for (const p of ['/sharpen full', '/sharpen lite']) assert.deepStrictEqual(c.decide(p, OFF, M), { context: c.USAGE, newState: null }, p);
  assert.deepStrictEqual(c.decide('/sharpen on full', OFF, M), none, 'two arguments is not a toggle');
});

test('nudge spells out the required first line', () => {
  for (const s of ['Sharpened prompt (clear):', 'Sharpened prompt (fill-in):', 'code block', 'Send this sharpened prompt?', 'Which did you mean?', 'Do not start the work']) assert.ok(c.NUDGE.includes(s), s);
});

test('a pasted sharpened prompt runs without being sharpened again', () => {
  const last = 'Fix the PIN lockout in apps/admin/auth/pin.ts.\nDone when: npm test -- pin passes';
  assert.deepStrictEqual(c.decide(last, ON, M, last), { context: c.PASTED_NOTE, newState: null }, 'pasted as is');
  assert.deepStrictEqual(c.decide('Fix the PIN lockout in apps/admin/auth/pin.ts.\nDone when: it locks after 3', ON, M, last), { context: c.PASTED_NOTE, newState: null }, 'edited after the first line');
  assert.deepStrictEqual(c.decide('  fix the PIN lockout in   apps/admin/auth/pin.ts. ', ON, M, last), { context: c.PASTED_NOTE, newState: null }, 'case and spacing');
  assert.deepStrictEqual(c.decide('fix the login thing', ON, M, last), { context: c.NUDGE, newState: null }, 'a new prompt');
  assert.deepStrictEqual(c.decide('Fix it.', ON, M, 'Fix it.'), { context: c.NUDGE, newState: null }, 'too short to be sure');
  assert.deepStrictEqual(c.decide(last, OFF, M, last), none, 'off');
});

test('a short go-ahead carries on instead of being sharpened', () => {
  for (const p of ['continue', 'Continue.', 'yes', 'ok', 'okay!', 'go ahead', 'keep going', 'do it', 'lgtm', 'thanks']) {
    assert.deepStrictEqual(c.decide(p, ON, M), { context: c.REPLY_NOTE, newState: null }, p);
  }
  for (const p of ['continue with the login fix', 'yes but rename it too', 'ok now add tests', 'next page layout is broken']) {
    assert.strictEqual(c.decide(p, ON, M).context, c.NUDGE, p);
  }
  assert.deepStrictEqual(c.decide('continue', OFF, M), none, 'off');
});
