#!/usr/bin/env node
// sharpen — SessionStart: load the method and the user's setup when sharpen is on, and keep the badge set up
const { readState } = require('./sharpen-state');
const { loadMethod } = require('./sharpen-core');
const { METHOD_FILE, readStdinJson, emit } = require('./sharpen-io');
const { ensureStatusline } = require('./sharpen-statusline-setup');
const { setupNote } = require('./sharpen-env');

readStdinJson()
  .then((input) => {
    if (!readState().on) return;
    let nudge = null;
    try { nudge = ensureStatusline(); } catch {}
    const parts = [`SHARPEN is on. Follow this method on every prompt:\n\n${loadMethod(METHOD_FILE)}`];
    const setup = setupNote(input && input.cwd);
    if (setup) parts.push(setup);
    if (nudge) parts.push(nudge);
    emit('SessionStart', parts.join('\n\n'));
  })
  .catch(() => {})
  .finally(() => process.exit(0));
