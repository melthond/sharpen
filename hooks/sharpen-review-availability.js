// Check whether this Codex runtime has a live Sharpen MCP server with form elicitation.
const fs = require('fs');
const path = require('path');
const { stateDir } = require('./sharpen-state');

const markerDir = () => path.join(stateDir(), 'codex-native-review');

function hasNativeReview() {
  let entries;
  try { entries = fs.readdirSync(markerDir()); } catch { return false; }
  for (const entry of entries) {
    const file = path.join(markerDir(), entry);
    try {
      const marker = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (marker.formElicitation === true && Number.isInteger(marker.pid)) {
        process.kill(marker.pid, 0);
        return true;
      }
    } catch {}
  }
  return false;
}

module.exports = { markerDir, hasNativeReview };
