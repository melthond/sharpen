// sharpen — pure decision: (prompt, state, method) -> context to inject + new state
const fs = require('fs');

const NUDGE = 'SHARPEN is on (lite mode). Before acting on this prompt, run the Sharpen step: your reply must start with "Clear prompt, running as typed.", or "Running as: <engineered version>", or the options if the prompt is ambiguous.';
const NUDGE_FULL = 'SHARPEN is on (full mode). Before acting on this prompt, run the Sharpen step. If it is ambiguous, ask with options. Otherwise your reply must start with "Sharpened prompt (clear):" or "Sharpened prompt (fill-in):", followed by the full engineered prompt as a quote block (see Full mode in the method), and then you act on that engineered prompt.';
const RAW_NOTE = 'SHARPEN: the user prefixed this prompt with raw:. Ignore the prefix and run the rest exactly as typed. Do not run the Sharpen step.';
const FORCE_NOTE = 'SHARPEN: the user prefixed this prompt with sharpen:. Ignore the prefix and skip the clear check. Do not answer or do any work yet: first offer options for the rest of the prompt using the method below, and act only after the user picks one.';
const ON_NOTE = 'SHARPEN ON. Confirm in one short line that names the mode.';
const OFF_NOTE = 'SHARPEN OFF. Confirm in one short line. Stop running the Sharpen step; act on prompts as typed.';
const STATUS_ON = 'SHARPEN is on. Report that in one short line, with the mode.';
const STATUS_OFF = 'SHARPEN is off. Report that in one short line.';
const USAGE = 'SHARPEN: unknown option. Tell the user in one line: /sharpen on, /sharpen off, /sharpen full, /sharpen lite, or /sharpen for status.';
const MODE_NOTE = {
  full: 'Mode: full. Every prompt gets a visible "Sharpened prompt" before you act (options when ambiguous).',
  lite: 'Mode: lite. Clear prompts run as typed; vague ones get one "Running as:" line; options only when ambiguous.',
};
const MODES = ['full', 'lite'];

const none = () => ({ context: null, newState: null });

function loadMethod(file) {
  return fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

function decide(prompt, state, method) {
  const p = String(prompt || '').trim();
  const mode = MODES.includes(state.mode) ? state.mode : 'full';
  const cmd = p.match(/^\/sharpen(?::sharpen)?(?:\s+(\S+))?(?:\s+(\S+))?\s*$/i); // also the namespaced /sharpen:sharpen form
  if (cmd) {
    const arg = (cmd[1] || '').toLowerCase();
    const arg2 = (cmd[2] || '').toLowerCase();
    const turnOn = (m) => ({
      context: `${ON_NOTE} ${MODE_NOTE[m]}\n\nFollow this method on every prompt:\n\n${method}`,
      newState: { on: true, mode: m },
    });
    if (arg === 'on' && (!arg2 || MODES.includes(arg2))) return turnOn(arg2 || mode);
    if (MODES.includes(arg) && !arg2) return turnOn(arg);
    if (arg === 'off' && !arg2) return { context: OFF_NOTE, newState: { on: false, mode } };
    if (!arg) return { context: state.on ? `${STATUS_ON} ${MODE_NOTE[mode]}` : STATUS_OFF, newState: null };
    return { context: USAGE, newState: null };
  }
  if (/^sharpen:/i.test(p)) return { context: `${FORCE_NOTE}\n\n${method}`, newState: null };
  if (p.startsWith('/') || !state.on) return none();
  if (/^raw:/i.test(p)) return { context: RAW_NOTE, newState: null };
  return { context: mode === 'lite' ? NUDGE : NUDGE_FULL, newState: null };
}

module.exports = { decide, loadMethod, NUDGE, NUDGE_FULL, MODE_NOTE, RAW_NOTE, FORCE_NOTE, ON_NOTE, OFF_NOTE, STATUS_ON, STATUS_OFF, USAGE };
