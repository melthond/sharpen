// sharpen — hook stdin/stdout helpers shared by the hook scripts
const path = require('path');

const METHOD_FILE = path.join(__dirname, '..', 'skills', 'sharpen', 'SKILL.md');

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

function emit(event, context) {
  if (!context) return;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
}

module.exports = { METHOD_FILE, readStdinJson, emit };
