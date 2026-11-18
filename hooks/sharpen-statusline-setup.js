// sharpen — put the badge in the status bar. Adds it when there is no status line;
// never overwrites one the user already has (asks Claude to offer chaining, once).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { stateDir } = require('./sharpen-state');

const STATUSLINE_NUDGE = 'SHARPEN STATUSLINE: the user already has a status line, so Sharpen did not touch it. In one short line, offer to add the red [SHARPEN] badge next to it by chaining this command after theirs:';

const claudeDir = () => process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const slash = (p) => p.split(path.sep).join('/');

function ensureStatusline() {
  const copy = path.join(stateDir(), 'sharpen-statusline.js');
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'sharpen-statusline.js'), copy); // refresh on every run
  const command = `node "${slash(copy)}"`;

  const file = path.join(claudeDir(), 'settings.json');
  let settings = {};
  if (fs.existsSync(file)) {
    try { settings = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } // never rewrite a file we can't parse
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null;
  }

  const current = settings.statusLine && String(settings.statusLine.command || '');
  if (current && current.includes('sharpen-statusline')) return null;
  if (current) {
    const flag = path.join(stateDir(), 'statusline-nudged');
    if (fs.existsSync(flag)) return null;
    fs.writeFileSync(flag, '');
    return `${STATUSLINE_NUDGE} ${command}`;
  }

  settings.statusLine = { type: 'command', command };
  fs.mkdirSync(claudeDir(), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  return null;
}

module.exports = { ensureStatusline, STATUSLINE_NUDGE };
