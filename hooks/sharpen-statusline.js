#!/usr/bin/env node
// sharpen — statusline badge: [SHARPEN] plus what Sharpen decided about the latest prompt.
// Self-contained (no requires of our own) because it is copied out of the plugin cache,
// which Claude Code replaces on every update. Reads only the local transcript; logs nothing.
const fs = require('fs');
const os = require('os');
const path = require('path');

const TAIL_BYTES = 256 * 1024; // long sessions: the latest prompt is always near the end

// The prompt the user typed, or null for tool results, subagent lines and non-prompts.
function promptText(line) {
  if (!line || line.type !== 'user' || line.isSidechain || !line.message) return null;
  const c = line.message.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c) || c.some((b) => b && b.type === 'tool_result')) return null;
  const t = c.filter((b) => b && b.type === 'text').map((b) => b.text).join('\n');
  return t || null;
}

// Map Sharpen's first move after the latest prompt to a badge word.
function verdict(lines) {
  let i = lines.length - 1;
  while (i >= 0 && promptText(lines[i]) === null) i--;
  if (i < 0) return null;
  const prompt = promptText(lines[i]).trim();
  if (prompt.startsWith('/') || prompt.includes('<command-name>')) return null;
  if (/^raw:/i.test(prompt)) return 'RAW';

  let asked = null;
  for (const line of lines.slice(i + 1)) {
    if (line.isSidechain) continue;
    const blocks = line.message && Array.isArray(line.message.content) ? line.message.content : [];
    if (line.type === 'user' && asked && blocks.some((b) => b && b.type === 'tool_result' && b.tool_use_id === asked)) return 'SHARPENED';
    if (line.type !== 'assistant') continue;
    for (const b of blocks) {
      if (!b) continue;
      if (b.type === 'tool_use' && b.name === 'AskUserQuestion') { if (!asked) asked = b.id || true; continue; }
      if (b.type !== 'text' || asked) continue;
      const t = b.text.trim();
      if (/^Sharpened prompt \(clear\)/i.test(t)) return 'CLEAR';
      if (/^Sharpened prompt \(fill-in\)/i.test(t)) return 'FILL-IN';
      if (/which did you mean/i.test(t)) return 'ASKING';
      return null; // replied without a Sharpen verdict
    }
  }
  return asked ? 'ASKING' : null;
}

function readTail(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, TAIL_BYTES);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    const lines = buf.toString('utf8').split('\n');
    if (len < size) lines.shift(); // first line is cut mid-way
    return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } finally {
    fs.closeSync(fd);
  }
}

function main() {
  const dir = process.env.SHARPEN_HOME || path.join(os.homedir(), '.config', 'sharpen');
  let on = false;
  try { on = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8')).on === true; } catch {}
  if (!on) return; // off, missing or corrupt state: print nothing

  let word = null;
  try {
    if (!process.stdin.isTTY) {
      const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
      if (input.transcript_path) word = verdict(readTail(input.transcript_path));
    }
  } catch {} // no stdin or no transcript: plain badge
  process.stdout.write(`\x1b[38;5;196m[SHARPEN${word ? ` - ${word}` : ''}]\x1b[0m`);
}

if (require.main === module) main();
module.exports = { verdict };
