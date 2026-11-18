#!/usr/bin/env node
// sharpen — UserPromptSubmit: handle /sharpen toggles and nudge the model on plain prompts
const { readState, writeState } = require('./sharpen-state');
const { decide, loadMethod } = require('./sharpen-core');
const { METHOD_FILE, readStdinJson, emit } = require('./sharpen-io');
const { ensureStatusline } = require('./sharpen-statusline-setup');

const withStatusline = (context) => {
  try {
    const nudge = ensureStatusline();
    return nudge ? `${context}\n\n${nudge}` : context;
  } catch { return context; } // the badge is optional; never break the toggle over it
};

readStdinJson()
  .then((input) => {
    if (input && typeof input === 'object') {
      let { context, newState } = decide(input.prompt ?? '', readState(), loadMethod(METHOD_FILE));
      if (newState) writeState(newState);
      if (newState && newState.on) context = withStatusline(context);
      emit('UserPromptSubmit', context);
    }
  })
  .catch(() => {}) // never block or break a prompt
  .finally(() => process.exit(0));
