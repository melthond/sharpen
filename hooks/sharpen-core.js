// sharpen — pure decision: (prompt, state, method) -> context to inject + new state
const fs = require('fs');
const { statsLine } = require('./sharpen-stats');

const NUDGE = 'SHARPEN is on. Run the Sharpen step on this prompt, using the conversation, the code and the setup (skills, agents, MCP tools, plugins, hooks). Do not start the work yet. If it is ambiguous, ask "Which did you mean?" with options. Otherwise start your reply with "Sharpened prompt (clear):" or "Sharpened prompt (fill-in):", put the engineered prompt in a code block (with a "Tools:" line naming the listed skills/agents/MCP tools to use, and a "Hooks:" line for hooks from the setup block that will run during the work), then ask "Send this sharpened prompt?" using the host’s native review UI: AskUserQuestion in Claude Code or this plugin’s review-choice MCP tool in Codex when available. If the Codex tool is unavailable, show numbered choices in the conversation and wait. Act only after the user chooses.';
const PASTED_NOTE = 'SHARPEN: the user sent a sharpened prompt they pasted from the review card, possibly edited. Do not sharpen it again and do not ask. Start your reply with "Sending sharpened prompt." and act on it exactly as written.';
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

// Same first line as the prompt Sharpen last put on the clipboard = the user pasted it (maybe edited below).
const norm = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
function isPasted(prompt, last) {
  const head = norm(String(last || '').split('\n')[0]);
  return head.length >= 20 && norm(prompt).startsWith(head);
}

function decide(prompt, state, method, last = null, stats = null) {
  const p = String(prompt || '').trim();
  const cmd = p.match(/^\/sharpen(?::sharpen)?(?:\s+(\S+))?\s*$/i); // also the namespaced /sharpen:sharpen form
  if (cmd) {
    const arg = (cmd[1] || '').toLowerCase();
    if (arg === 'on') return { context: `${ON_NOTE}\n\n${method}`, newState: { on: true } };
    if (arg === 'off') return { context: OFF_NOTE, newState: { on: false } };
    if (!arg) {
      const status = state.on ? STATUS_ON : STATUS_OFF;
      return { context: stats ? `${status} Then add this line: ${statsLine(stats)}` : status, newState: null };
    }
    return { context: USAGE, newState: null };
  }
  if (/^sharpen:/i.test(p)) return { context: `${FORCE_NOTE}\n\n${method}`, newState: null };
  if (p.startsWith('/') || !state.on) return none();
  if (/^raw:/i.test(p)) return { context: RAW_NOTE, newState: null };
  if (isPasted(p, last)) return { context: PASTED_NOTE, newState: null };
  return { context: NUDGE, newState: null };
}

module.exports = { decide, loadMethod, NUDGE, PASTED_NOTE, RAW_NOTE, FORCE_NOTE, ON_NOTE, OFF_NOTE, STATUS_ON, STATUS_OFF, USAGE };
