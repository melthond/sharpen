#!/usr/bin/env node
// sharpen — statusline badge
const { readState } = require('./sharpen-state');
if (readState().on) process.stdout.write('[SHARPEN]');
