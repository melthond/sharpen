#!/usr/bin/env node
// sharpen — Codex UserPromptSubmit bridge. The hook adds review instructions;
// the local MCP server opens Codex native input UI when form elicitation is available.
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { readState, writeState, stateDir } = require('./sharpen-state');
const core = require('./sharpen-core');
const { METHOD_FILE, REFS_NOTE, readStdinJson, emit } = require('./sharpen-io');
const { codexSetupNote } = require('./sharpen-codex-env');
const { hasNativeReview } = require('./sharpen-review-availability');

const CODEX_FLOW = [
  'Codex has already received the original prompt, so do not start the requested work before showing the review and getting the user’s choice.',
  'Use the conversation, repository, available skills, MCP tools and setup summary. For a clear or fill-in request, show “Sharpened prompt (clear/fill-in):” and prepare the complete engineered prompt. For ambiguity, prepare 2–3 distinct engineered options plus the original. Use the Sharpen review-choice MCP tool from this plugin when available; it presents the review through Codex native MCP form elicitation. Pass the complete review in the tool and wait for its result. If the tool reports that native elicitation is unavailable, show the numbered text fallback and wait for the user’s next message. Codex skills use `$skill-name`; translate this method’s slash references to their matching skill names and use only skills available in this session.',
  'After the review tool returns, follow its exact selection: act on the selected engineered prompt, or run the original unchanged. If the user chose an edit, apply that correction and show the revised review with the native tool again. Never sharpen the same request twice.',
].join('\n');
const CONTINUE_NOTE = 'SHARPEN: the user selected an option from the review shown immediately above. Follow that exact option: act on its engineered prompt, or run the original unchanged if that is what they selected. If they selected an edit option, revise and show the review again. Do not sharpen the request again.';
const ORIGINAL_NOTE = 'SHARPEN: the user chose “Run my original”. Carry out their original prompt exactly as first submitted, without sharpening it again.';
const EDIT_NOTE = 'SHARPEN: the user is editing the review. Apply their change to the pending engineered prompt, show the updated review options, and wait again. Do not start the work.';
const pick = (p) => /^(send it|\d+|yes|go ahead|approved?)\.?$/i.test(String(p || '').trim());
const original = (p) => /^(run my original|run as typed|original)\.?$/i.test(String(p || '').trim());
const pendingFile = (sessionId) => {
  const key = String(sessionId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(stateDir(), 'codex-pending', `${key}.json`);
};
const readPending = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
const clearPending = (file) => { try { fs.unlinkSync(file); } catch {} };
const writePending = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value) + '\n');
};

readStdinJson().then(async (input) => {
  if (!input || typeof input !== 'object') return;
  const submitted = String(input.prompt || '').trim();
  const prompt = submitted.replace(/^sharpen(?:\s+(on|off))?$/i, (_match, arg) => `/sharpen${arg ? ` ${arg}` : ''}`);
  const pendingPath = pendingFile(input.session_id);
  const pending = readPending(pendingPath);
  if (pending) {
    if (pick(prompt)) {
      clearPending(pendingPath);
      return emit('UserPromptSubmit', CONTINUE_NOTE);
    }
    if (original(prompt)) { clearPending(pendingPath); return emit('UserPromptSubmit', ORIGINAL_NOTE); }
    // Explicit Sharpen controls still take precedence over an edit to the review.
    if (!/^\/?sharpen\b/i.test(prompt)) return emit('UserPromptSubmit', EDIT_NOTE);
    clearPending(pendingPath);
  }

  const state = readState();
  const { context, newState } = core.decide(prompt, state, core.loadMethod(METHOD_FILE), null, null);
  if (newState) writeState(newState);
  if (!context) return;

  if (context === core.NUDGE || context.startsWith(core.FORCE_NOTE)) {
    const setup = codexSetupNote(input.cwd);
    const forcedSharpen = context.startsWith(core.FORCE_NOTE);
    let reviewToken = null;
    if (((state.on && context === core.NUDGE) || forcedSharpen) && !hasNativeReview()) {
      reviewToken = randomUUID();
      writePending(pendingPath, { at: Date.now(), reviewToken });
    }
    const flow = reviewToken
      ? `${CODEX_FLOW}\nIf you call the native review tool, pass this opaque reviewToken exactly: ${reviewToken}.`
      : CODEX_FLOW;
    const parts = [context === core.NUDGE ? flow : context, ...(context === core.NUDGE ? [] : [flow]), REFS_NOTE];
    if (setup) parts.push(setup);
    return emit('UserPromptSubmit', parts.join('\n\n'));
  }
  return emit('UserPromptSubmit', context);
}).catch(() => {}).finally(() => process.exit(0));



