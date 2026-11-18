#!/usr/bin/env node
// sharpen — SessionStart: load the method when sharpen is on
const { readState } = require('./sharpen-state');
const { loadMethod } = require('./sharpen-core');
const { METHOD_FILE, emit } = require('./sharpen-io');

try {
  if (readState().on) emit('SessionStart', `SHARPEN is on. Follow this method on every prompt:\n\n${loadMethod(METHOD_FILE)}`);
} catch {}
process.exit(0);
