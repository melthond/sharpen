#!/usr/bin/env node
// sharpen — SessionStart: load the method when sharpen is on, and keep the badge set up
const { readState } = require('./sharpen-state');
const { loadMethod } = require('./sharpen-core');
const { METHOD_FILE, emit } = require('./sharpen-io');
const { ensureStatusline } = require('./sharpen-statusline-setup');

try {
  if (readState().on) {
    let nudge = null;
    try { nudge = ensureStatusline(); } catch {}
    const context = `SHARPEN is on. Follow this method on every prompt:\n\n${loadMethod(METHOD_FILE)}`;
    emit('SessionStart', nudge ? `${context}\n\n${nudge}` : context);
  }
} catch {}
process.exit(0);
