// sharpen — the on/off flag and mode, one small JSON file per user
const fs = require('fs');
const os = require('os');
const path = require('path');

const MODES = ['full', 'lite'];
const stateDir = () => process.env.SHARPEN_HOME || path.join(os.homedir(), '.config', 'sharpen');
const stateFile = () => path.join(stateDir(), 'state.json');

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    const on = parsed !== null && parsed.on === true;
    const mode = parsed && MODES.includes(parsed.mode) ? parsed.mode : 'full';
    return { on, mode };
  } catch {
    return { on: false, mode: 'full' }; // missing or corrupt file = off, default mode
  }
}

function writeState(state) {
  fs.mkdirSync(stateDir(), { recursive: true });
  const mode = MODES.includes(state.mode) ? state.mode : 'full';
  fs.writeFileSync(stateFile(), JSON.stringify({ on: state.on === true, mode }) + '\n');
}

module.exports = { MODES, stateDir, readState, writeState };
