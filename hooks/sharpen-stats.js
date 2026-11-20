// sharpen — local re-prompt counter: how many review cards were shown, and how many prompts after
// them pushed back ("no, that's wrong", "still failing"). Counts only: no prompt text is stored and
// nothing leaves the machine. Shown by /sharpen (status).
const fs = require('fs');
const path = require('path');
const { stateDir } = require('./sharpen-state');

const KEYS = ['cards', 'corrections'];
const statsFile = () => path.join(stateDir(), 'stats.json');
const count = (v) => (Number.isInteger(v) && v > 0 ? v : 0);

function readStats() {
  try {
    const raw = JSON.parse(fs.readFileSync(statsFile(), 'utf8')) || {};
    return { cards: count(raw.cards), corrections: count(raw.corrections) };
  } catch {
    return { cards: 0, corrections: 0 }; // missing or corrupt = start over
  }
}

function bump(key) {
  if (!KEYS.includes(key)) return; // only known counters, so nothing else can end up in the file
  const s = readStats();
  s[key] += 1;
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.writeFileSync(statsFile(), JSON.stringify(s) + '\n');
}

// shortcut: English keyword match on the start of the prompt; misses polite or non-English pushback.
const CORRECTION = /^(no\b[\s,.!]|nope\b|wrong\b|still\b|try again\b|revert\b|undo\b|not what\b|that'?s (not|wrong)\b)|\b(did ?n[o']t work|does ?n[o']t work|not working|you broke|is wrong)\b/i;
const isCorrection = (prompt) => CORRECTION.test(String(prompt || '').trim());

function statsLine(s) {
  if (!s.cards) return 'No sharpened prompts counted yet.';
  return `Sharpened prompts: ${s.cards}. Follow-up corrections: ${s.corrections} (${Math.round((100 * s.corrections) / s.cards)}%).`;
}

module.exports = { readStats, bump, isCorrection, statsLine };
