// sharpen — the on/off flag, one small JSON file per user
const fs = require('fs');
const os = require('os');
const path = require('path');

const stateDir = () => process.env.SHARPEN_HOME || path.join(os.homedir(), '.config', 'sharpen');
const stateFile = () => path.join(stateDir(), 'state.json');

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    return { on: parsed !== null && parsed.on === true };
  } catch {
    return { on: false }; // missing or corrupt file = off
  }
}

function writeState(state) {
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.writeFileSync(stateFile(), JSON.stringify({ on: state.on === true }) + '\n');
}

module.exports = { stateDir, readState, writeState };
