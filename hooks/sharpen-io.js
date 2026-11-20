// sharpen — hook stdin/stdout helpers shared by the hook scripts
const path = require('path');

const METHOD_FILE = path.join(__dirname, '..', 'skills', 'sharpen', 'SKILL.md');
// The method points to these by relative name; the hooks give Claude the absolute folder.
const REFS_NOTE = `Sharpen reference files ("references/…" in the method), read only when the method points to one: ${path.join(__dirname, '..', 'skills', 'sharpen', 'references')}`;

// Resolves null on bad JSON or when stdin never closes (seen on Windows), so a hook can't hang a prompt.
function readStdinJson(timeoutMs = 3000) {
  return new Promise((resolve) => {
    let input = '';
    const done = (value) => { clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => done(null), timeoutMs);
    timer.unref();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('error', () => done(null));
    process.stdin.on('end', () => {
      try { done(JSON.parse(input)); } catch { done(null); }
    });
  });
}

// Resolves once the output is handed to the OS. Callers must wait for it before process.exit: on macOS, pipe writes are
// asynchronous, and exiting early cut the hook's JSON off after ~8 KB once the method grew past that (CI, Node 18).
function emit(event, context) {
  if (!context) return Promise.resolve();
  return new Promise((resolve) => {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: context } }), () => resolve());
  });
}

module.exports = { METHOD_FILE, REFS_NOTE, readStdinJson, emit };
