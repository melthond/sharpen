#!/usr/bin/env node
// sharpen — PreToolUse on AskUserQuestion: when Sharpen shows its review card, copy the engineered
// prompt to the clipboard (so the user can Ctrl+V, edit and send it) and remember it, so the pasted
// prompt isn't sharpened twice. Local only; never blocks or changes the question.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readState, stateDir } = require('./sharpen-state');
const { readStdinJson } = require('./sharpen-io');
const { markCard } = require('./sharpen-stats');

const SHARPEN_QUESTION = /^(send this sharpened prompt\?|which did you mean\?)/i;

function pickPrompt(toolInput) {
  const q = toolInput && Array.isArray(toolInput.questions) ? toolInput.questions.find((x) => x && SHARPEN_QUESTION.test(String(x.question || '').trim())) : null;
  const first = q && Array.isArray(q.options) ? q.options[0] : null;
  const text = first && typeof first.preview === 'string' ? first.preview.trim() : '';
  return text || null;
}

function copy(text) {
  if (process.env.SHARPEN_CLIPBOARD_FILE) return fs.writeFileSync(process.env.SHARPEN_CLIPBOARD_FILE, text); // tests
  const run = (cmd, args, input) => spawnSync(cmd, args, { input, timeout: 3000, windowsHide: true }).status === 0;
  if (process.platform === 'win32') return run('clip', [], Buffer.from(text, 'utf16le')); // clip reads UTF-16LE; no BOM, or it gets pasted
  if (process.platform === 'darwin') return run('pbcopy', [], text);
  return run('wl-copy', [], text) || run('xclip', ['-selection', 'clipboard'], text) || run('xsel', ['-b', '-i'], text);
}

// Run as a hook when started directly or through hooks.json's `node -e "require(...)"` (no main
// module there); stay quiet when a test requires it for pickPrompt.
if (require.main === module || require.main === undefined) {
  readStdinJson()
    .then((input) => {
      if (!input || input.tool_name !== 'AskUserQuestion' || !readState().on) return;
      const text = pickPrompt(input.tool_input);
      if (!text) return;
      fs.mkdirSync(stateDir(), { recursive: true });
      fs.writeFileSync(path.join(stateDir(), 'last-sharpened.txt'), text);
      try { markCard(); } catch {} // the counter is optional; never get in the way of the card
      copy(text);
    })
    .catch(() => {}) // the clipboard is a convenience; never get in the way of the question
    .finally(() => process.exit(0));
}

module.exports = { pickPrompt };
