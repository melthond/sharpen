// sharpen — local re-prompt counter: how many review cards were shown, and how many prompts after
// them pushed back ("no, that's wrong", "still failing"). Counts only: no prompt text is stored and
// nothing leaves the machine. Shown by /sharpen (status).
const fs = require('fs');
const path = require('path');
const { stateDir } = require('./sharpen-state');

const KEYS = ['cards', 'corrections'];
const statsFile = () => path.join(stateDir(), 'stats.json');
const pendingFile = () => path.join(stateDir(), 'card-pending');
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

// A card was just shown: count it and arm the next prompt to be checked for pushback.
function markCard() {
  bump('cards');
  fs.writeFileSync(pendingFile(), '');
}

// True once, for the first prompt after a card; later prompts are not "right after" it.
function takePending() {
  try { fs.unlinkSync(pendingFile()); return true; } catch { return false; }
}

// shortcut: keyword match in English, French, Spanish, Portuguese and German only; other languages and
// sarcasm are missed. Upgrade if the correction rate ever drives a decision.
// Starters like "no" or "still" only count when they read as pushback, so "no need to…" or "still, add…" don't.
const CORRECTION = new RegExp([
  String.raw`^(no(\s*[,.!]|$|\s+(that|this|it'?s|not|wrong|you)\b)|nope\b|wrong\b|still\s+(fail|broken|not|does|wrong|the same|getting|seeing|happening)|try again\b|revert\b|undo\b|not what\b|not quite(\s*[,.!]|$|\s+(right|it|what)\b)|that'?s (not|wrong)\b)`,
  String.raw`\b(did ?n[o']t work|does ?n[o']t work|not working|you broke|is wrong|(is ?n[o']t|is not|was ?n[o']t|was not) what i (asked|meant|wanted|said))`,
  String.raw`^(non|nein|não|nao)(\s*[,.!]|$)`,
  // no \b here: JavaScript's \b is ASCII-only, so it fails next to ç or ã
  String.raw`pas ça|pas ca\b|ne marche pas|ne fonctionne pas|no funciona|no es lo que|eso no es|não funcion|nao funcion|funktioniert nicht|das ist falsch|\bfalsch\b`,
].join('|'), 'i');
const isCorrection = (prompt) => CORRECTION.test(String(prompt || '').trim());

function statsLine(s) {
  if (!s.cards) return 'No sharpened prompts counted yet.';
  return `Sharpened prompts: ${s.cards}. Follow-up corrections: ${s.corrections} (${Math.round((100 * s.corrections) / s.cards)}%).`;
}

module.exports = { readStats, bump, markCard, takePending, isCorrection, statsLine };
