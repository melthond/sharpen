#!/usr/bin/env node
// sharpen — statusline badge. Self-contained (no requires) because it is copied out of the
// plugin cache, which Claude Code replaces on every update.
const fs = require('fs');
const os = require('os');
const path = require('path');

try {
  const dir = process.env.SHARPEN_HOME || path.join(os.homedir(), '.config', 'sharpen');
  const state = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'));
  if (state && state.on === true) process.stdout.write('\x1b[38;5;196m[SHARPEN]\x1b[0m');
} catch {} // missing or corrupt state = off, print nothing
