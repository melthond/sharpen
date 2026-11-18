// sharpen — pure decision: (prompt, state, method) -> context to inject + new state
const fs = require('fs');

const NUDGE = 'SHARPEN is on. Before acting on this prompt, run the Sharpen step (clear check first; offer options only if the prompt is unclear).';
const RAW_NOTE = 'SHARPEN: the user prefixed this prompt with raw:. Ignore the prefix and run the rest exactly as typed. Do not run the Sharpen step.';
const FORCE_NOTE = 'SHARPEN: the user prefixed this prompt with sharpen:. Ignore the prefix and skip the clear check. Do not answer or do any work yet: first offer options for the rest of the prompt using the method below, and act only after the user picks one.';
const ON_NOTE = 'SHARPEN ON. Confirm in one short line. From now on, follow this method on every prompt:';
const OFF_NOTE = 'SHARPEN OFF. Confirm in one short line. Stop running the Sharpen step; act on prompts as typed.';
const STATUS_ON = 'SHARPEN is on. Report that in one short line.';
const STATUS_OFF = 'SHARPEN is off. Report that in one short line.';
const USAGE = 'SHARPEN: unknown option. Tell the user in one line: /sharpen on, /sharpen off, or /sharpen for status.';

const none = () => ({ context: null, newState: null });

function loadMethod(file) {
  return fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

function decide(prompt, state, method) {
  const p = String(prompt || '').trim();
  const cmd = p.match(/^\/sharpen(?:\s+(\S+))?\s*$/i);
  if (cmd) {
    const arg = (cmd[1] || '').toLowerCase();
    if (arg === 'on') return { context: `${ON_NOTE}\n\n${method}`, newState: { on: true } };
    if (arg === 'off') return { context: OFF_NOTE, newState: { on: false } };
    if (!arg) return { context: state.on ? STATUS_ON : STATUS_OFF, newState: null };
    return { context: USAGE, newState: null };
  }
  if (/^sharpen:/i.test(p)) return { context: `${FORCE_NOTE}\n\n${method}`, newState: null };
  if (p.startsWith('/') || !state.on) return none();
  if (/^raw:/i.test(p)) return { context: RAW_NOTE, newState: null };
  return { context: NUDGE, newState: null };
}

module.exports = { decide, loadMethod, NUDGE, RAW_NOTE, FORCE_NOTE, ON_NOTE, OFF_NOTE, STATUS_ON, STATUS_OFF, USAGE };
