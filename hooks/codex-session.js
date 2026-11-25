#!/usr/bin/env node
// sharpen — Codex SessionStart: load the method and a names-only setup summary.
const { readState } = require('./sharpen-state');
const { loadMethod } = require('./sharpen-core');
const { METHOD_FILE, REFS_NOTE, readStdinJson, emit } = require('./sharpen-io');
const { codexSetupNote } = require('./sharpen-codex-env');

const CODEX_FLOW = [
  'Codex has already received each original prompt, so do not start the requested work before showing its review and getting the user’s choice.',
  'For a clear or fill-in request, prepare the complete engineered prompt. For ambiguity, prepare 2–3 distinct engineered options plus the original. Use this plugin’s Sharpen review-choice MCP tool when available; it presents the review through Codex native MCP form elicitation and waits for the user. If the tool reports that native elicitation is unavailable, show numbered text choices and wait for the next user message. After selection, act on that exact prompt without sharpening again. If the user edits it, revise the review and ask again.',
  'Codex skills use $skill-name when an invocation is needed. Use only skills and MCP tools that are actually available in this session or listed in the setup summary.',
].join('\n');

readStdinJson().then((input) => {
  if (!readState().on) return;
  const parts = [`SHARPEN is on. Follow this method on every prompt:\n\n${loadMethod(METHOD_FILE)}`, CODEX_FLOW, REFS_NOTE];
  const setup = codexSetupNote(input && input.cwd);
  if (setup) parts.push(setup);
  return emit('SessionStart', parts.join('\n\n'));
}).catch(() => {}).finally(() => process.exit(0));
