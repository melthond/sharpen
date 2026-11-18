#!/usr/bin/env node
// sharpen — UserPromptSubmit: handle /sharpen toggles and nudge the model on plain prompts
const { readState, writeState } = require('./sharpen-state');
const { decide, loadMethod } = require('./sharpen-core');
const { METHOD_FILE, readStdinJson, emit } = require('./sharpen-io');

readStdinJson()
  .then((input) => {
    if (input && typeof input === 'object') {
      const { context, newState } = decide(input.prompt ?? '', readState(), loadMethod(METHOD_FILE));
      if (newState) writeState(newState);
      emit('UserPromptSubmit', context);
    }
  })
  .catch(() => {}) // never block or break a prompt
  .finally(() => process.exit(0));
