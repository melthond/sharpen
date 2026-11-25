#!/usr/bin/env node
// Sharpen review-choice MCP server. Codex renders elicitation/create as its native
// input UI; this server only returns the choice the user made.
const fs = require('fs');
const path = require('path');
const { markerDir } = require('./sharpen-review-availability');
const { stateDir } = require('./sharpen-state');

const SERVER_NAME = 'sharpen-review';
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2025-11-25';
const pending = new Map();
let nextId = 1;
let clientCapabilities = {};
let inputBuffer = '';
let markerPath = null;

const tool = {
  name: 'request_review_choice',
  title: 'Choose how to continue',
  description: 'Present a concise Sharpen review and wait for the user to choose the engineered prompt, the original prompt, or an edit using Codex native input UI. Keep choice labels short. Call this before doing any work for a sharpened request. Pass through reviewToken unchanged when one is supplied.',
  inputSchema: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'Question shown above the review, such as Send this sharpened prompt? or Which did you mean?' },
      review: { type: 'string', description: 'The complete engineered prompt or ambiguity summary to show in the native UI.' },
      reviewToken: { type: 'string', description: 'Opaque fallback-state token supplied by the Codex hook, when present.' },
      choices: {
        type: 'array', minItems: 2, maxItems: 4,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Stable choice key, such as send, original, edit, or an interpretation key.' },
            label: { type: 'string', description: 'Short user-facing choice label.' },
            preview: { type: 'string', description: 'The full engineered prompt for this choice, or a short description for edit.' }
          },
          required: ['id', 'label', 'preview']
        }
      },
      allowEdit: { type: 'boolean', description: 'Include a text field for changes when true.' }
    },
    required: ['question', 'review', 'choices']
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id, value) {
  send({ jsonrpc: '2.0', id, result: value });
}

function error(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function textResult(text, structuredContent, isError = false) {
  const value = { content: [{ type: 'text', text }], isError };
  if (structuredContent) value.structuredContent = structuredContent;
  return value;
}

function ensureAvailabilityMarker() {
  if (!clientCapabilities.elicitation || !clientCapabilities.elicitation.form) return;
  try {
    fs.mkdirSync(markerDir(), { recursive: true });
    markerPath = path.join(markerDir(), `${process.pid}.json`);
    fs.writeFileSync(markerPath, JSON.stringify({ pid: process.pid, formElicitation: true }) + '\n');
  } catch { markerPath = null; }
}

function removeAvailabilityMarker() {
  if (!markerPath) return;
  try {
    const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
    if (marker.pid === process.pid) fs.unlinkSync(markerPath);
  } catch {}
}

function validateInput(args) {
  if (!args || typeof args !== 'object') return 'Expected an input object.';
  if (typeof args.question !== 'string' || !args.question.trim()) return 'A non-empty question is required.';
  if (typeof args.review !== 'string' || !args.review.trim()) return 'A non-empty review preview is required.';
  if (!Array.isArray(args.choices) || args.choices.length < 2 || args.choices.length > 4) return 'Provide 2 to 4 choices.';
  const ids = new Set();
  const labels = new Set();
  for (const choice of args.choices) {
    if (!choice || typeof choice.id !== 'string' || !choice.id.trim() || typeof choice.label !== 'string' || !choice.label.trim() || typeof choice.preview !== 'string') return 'Each choice needs a non-empty id, label, and preview.';
    if (ids.has(choice.id) || labels.has(choice.label)) return 'Choice ids and labels must be unique.';
    ids.add(choice.id);
    labels.add(choice.label);
  }
  return null;
}

function clearFallbackState(token) {
  if (typeof token !== 'string' || !token) return;
  const pendingDir = path.join(stateDir(), 'codex-pending');
  let files;
  try { files = fs.readdirSync(pendingDir); } catch { return; }
  for (const name of files) {
    const file = path.join(pendingDir, name);
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (value.reviewToken === token) fs.unlinkSync(file);
    } catch {}
  }
}

function requestElicitation(args) {
  const validationError = validateInput(args);
  if (validationError) return Promise.resolve({ action: 'error', message: validationError });
  if (!clientCapabilities.elicitation || !clientCapabilities.elicitation.form) {
    return Promise.resolve({ action: 'unavailable', message: 'This Codex host does not advertise native form elicitation. Use the Sharpen numbered review fallback and continue waiting for the user.' });
  }

  const choiceLabels = args.choices.map((choice) => choice.label);
  const editChoice = args.choices.some((choice) => choice.id === 'edit');
  // Preserve the full review while removing blank lines that needlessly push
  // the native choice controls below the visible area of a desktop card.
  const compactReview = args.review.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join('\n');
  const message = [
    `Sharpen review — ${args.question.trim()}`,
    compactReview,
  ].filter(Boolean).join('\n');
  const requestedSchema = {
    type: 'object',
    properties: {
      choice: { type: 'string', title: 'Choose how to continue', enum: choiceLabels },
    },
    required: ['choice'],
  };
  if (args.allowEdit || editChoice) {
    requestedSchema.properties.correction = {
      type: 'string',
      title: 'Correction (optional)',
      description: 'Enter the correction when you choose Edit the prompt.',
    };
  }

  const id = `sharpen-review-${nextId++}`;
  return new Promise((resolve) => {
    pending.set(String(id), resolve);
    send({
      jsonrpc: '2.0', id, method: 'elicitation/create',
      params: { mode: 'form', message, requestedSchema },
    });
  }).then((response) => {
    if (response.error) return { action: 'error', message: response.error.message || 'Codex could not show the native review UI.' };
    const elicitation = response.result;
    if (!elicitation || elicitation.action !== 'accept') {
      clearFallbackState(args.reviewToken);
      return { action: 'cancelled', message: 'The review was closed without a selection. Do not start either prompt or show the review again; wait for the user’s next message.' };
    }
    const selectedLabel = elicitation.content && elicitation.content.choice;
    const selected = args.choices.find((choice) => choice.label === selectedLabel);
    if (!selected) return { action: 'error', message: 'The native review returned an unknown choice. Show the numbered fallback and wait.' };
    const correction = typeof elicitation.content.correction === 'string' ? elicitation.content.correction.trim() : '';
    if (selected.id === 'edit' && !correction) return { action: 'edit-missing', selected, message: 'The user selected Edit the prompt but did not enter a correction. Ask them for the edit and show the review again.' };
    clearFallbackState(args.reviewToken);
    return { action: 'accepted', selected, correction };
  });
}

async function callTool(message) {
  const args = message.params && message.params.arguments;
  const choice = await requestElicitation(args);
  if (choice.action === 'accepted') {
    const structured = {
      action: choice.selected.id,
      label: choice.selected.label,
      selectedPrompt: choice.selected.id === 'edit' ? null : choice.selected.preview,
      correction: choice.correction || null,
    };
    const summary = choice.selected.id === 'edit'
      ? `User selected edit. Correction: ${choice.correction}`
      : `User selected ${choice.selected.label}. Follow this exact choice and prompt:\n\n${choice.selected.preview}`;
    return result(message.id, textResult(summary, structured));
  }
  const fallback = choice.action === 'unavailable' || choice.action === 'error' || choice.action === 'edit-missing';
  // Closing a user-facing review is a normal outcome, not an MCP tool failure.
  // Marking it as an error encourages retries and obscures the fact that no
  // choice was made; the instructions above explicitly stop the workflow.
  return result(message.id, textResult(choice.message, { action: choice.action }, !fallback && choice.action !== 'cancelled'));
}

async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  if (message.id !== undefined && message.method) {
    switch (message.method) {
      case 'initialize': {
        clientCapabilities = message.params && message.params.capabilities || {};
        ensureAvailabilityMarker();
        return result(message.id, {
          protocolVersion: message.params && message.params.protocolVersion || PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          instructions: 'For a Sharpen review, use request_review_choice to display the review using Codex native MCP form elicitation. It waits for the user’s choice. Never act on a sharpened prompt until an accepted choice is returned. If form elicitation is unavailable, show the numbered review fallback and wait for the user’s next message.',
        });
      }
      case 'ping': return result(message.id, {});
      case 'tools/list': return result(message.id, { tools: [tool] });
      case 'tools/call': {
        if (!message.params || message.params.name !== tool.name) return error(message.id, -32601, 'Unknown Sharpen review tool.');
        try { await callTool(message); } catch (err) { result(message.id, textResult(`Native review failed: ${err.message || 'unknown error'}. Show the numbered fallback and wait for the user.`, { action: 'error' }, true)); }
        return;
      }
      default: return error(message.id, -32601, `Unsupported method: ${message.method}`);
    }
  }
  if (message.id !== undefined && !message.method) {
    const resolve = pending.get(String(message.id));
    if (resolve) {
      pending.delete(String(message.id));
      resolve({ result: message.result, error: message.error });
    }
    return;
  }
  if (message.method === 'notifications/cancelled') {
    const requestId = message.params && message.params.requestId;
    const resolve = pending.get(String(requestId));
    if (resolve) {
      pending.delete(String(requestId));
      resolve({ result: { action: 'cancel' } });
    }
  }
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
  let newline;
  while ((newline = inputBuffer.indexOf('\n')) >= 0) {
    const line = inputBuffer.slice(0, newline).trim();
    inputBuffer = inputBuffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    Promise.resolve(handle(message)).catch(() => {});
  }
});
process.stdin.on('end', () => { removeAvailabilityMarker(); process.exit(0); });
process.on('exit', removeAvailabilityMarker);
