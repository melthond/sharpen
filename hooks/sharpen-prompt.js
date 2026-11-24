#!/usr/bin/env node
// sharpen — UserPromptSubmit: handle /sharpen toggles and nudge the model on plain prompts
const { readState, writeState } = require('./sharpen-state');
const { decide, loadMethod } = require('./sharpen-core');
const { METHOD_FILE, REFS_NOTE, readStdinJson, emit } = require('./sharpen-io');
const { ensureStatusline } = require('./sharpen-statusline-setup');
const { setupNote } = require('./sharpen-env');
const fs = require('fs');
const path = require('path');
const { stateDir } = require('./sharpen-state');
const { readStats, bump, takePending, isCorrection } = require('./sharpen-stats');

const lastSharpened = () => { try { return fs.readFileSync(path.join(stateDir(), 'last-sharpened.txt'), 'utf8'); } catch { return null; } };

const withStatusline = (context) => {
  try {
    const nudge = ensureStatusline();
    return nudge ? `${context}\n\n${nudge}` : context;
  } catch { return context; } // the badge is optional; never break the toggle over it
};

readStdinJson()
  .then((input) => {
    if (input && typeof input === 'object') {
      const state = readState();
      const last = lastSharpened();
      // A pushback on the first prompt after a card counts as a correction (counts only, local).
      try { if (takePending() && state.on && isCorrection(input.prompt)) bump('corrections'); } catch {}
      let { context, newState } = decide(input.prompt ?? '', state, loadMethod(METHOD_FILE), last, readStats());
      if (newState) writeState(newState);
      if (newState && newState.on) {
        context = `${context}\n\n${REFS_NOTE}`;
        const setup = setupNote(input.cwd);
        if (setup) context = `${context}\n\n${setup}`;
        context = withStatusline(context);
      }
      return emit('UserPromptSubmit', context); // wait for the write before the exit below
    }
  })
  .catch(() => {}) // never block or break a prompt
  .finally(() => process.exit(0));
