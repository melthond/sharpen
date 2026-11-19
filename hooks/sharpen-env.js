// sharpen — a short summary of the user's setup that Claude can't see on its own:
// the hooks that will run (user, project, local and plugin settings) and the enabled plugins.
// Names only: never a hook's arguments, which can hold tokens. Reads local files, sends nothing.
const fs = require('fs');
const path = require('path');

const MAX_HOOK_LINES = 25;
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
const SCRIPT = /[^\s"'`]+\.(?:js|mjs|cjs|ts|sh|ps1|py|rb|bat|cmd)\b/gi;

function hookLabel(hook) {
  if (!hook || typeof hook !== 'object') return 'hook';
  if (hook.type && hook.type !== 'command') return `${hook.type} hook`;
  const cmd = String(hook.command || '');
  const scripts = cmd.match(SCRIPT);
  if (scripts) return path.basename(scripts[scripts.length - 1].replace(/\\/g, '/'));
  // No script file: the program and its subcommand, e.g. "npx prettier"; never flags or values.
  const words = cmd.split(/\s+/).filter((w) => w && !w.startsWith('-') && !/["'$=:/\\]/.test(w));
  return words.slice(0, 2).join(' ') || 'command hook';
}

function hookLines(config, source) {
  const lines = [];
  const hooks = config && config.hooks && typeof config.hooks === 'object' ? config.hooks : {};
  for (const [event, groups] of Object.entries(hooks)) {
    if (!Array.isArray(groups)) continue;
    for (const g of groups) {
      const matcher = g && g.matcher && g.matcher !== '*' ? ` [${g.matcher}]` : '';
      for (const h of (g && Array.isArray(g.hooks) ? g.hooks : [])) lines.push(`- ${event}${matcher}: ${hookLabel(h)} (${source})`);
    }
  }
  return lines;
}

function pluginHookConfigs(installPath) {
  const manifest = readJson(path.join(installPath, '.claude-plugin', 'plugin.json')) || {};
  const listed = manifest.hooks ? [].concat(manifest.hooks) : [];
  const files = new Set([path.join(installPath, 'hooks', 'hooks.json')]);
  for (const h of listed) if (typeof h === 'string') files.add(path.join(installPath, h));
  const configs = [...files].map(readJson).filter(Boolean);
  for (const h of listed) if (h && typeof h === 'object') configs.push(h); // inline hooks in plugin.json
  return configs;
}

function summarizeSetup({ claudeDir, cwd }) {
  const user = readJson(path.join(claudeDir, 'settings.json')) || {};
  const lines = [
    ...hookLines(user, 'user'),
    ...(cwd ? hookLines(readJson(path.join(cwd, '.claude', 'settings.json')), 'project') : []),
    ...(cwd ? hookLines(readJson(path.join(cwd, '.claude', 'settings.local.json')), 'local') : []),
  ];

  const enabled = Object.entries(user.enabledPlugins || {}).filter(([, on]) => on === true).map(([id]) => id);
  const installed = (readJson(path.join(claudeDir, 'plugins', 'installed_plugins.json')) || {}).plugins || {};
  const names = [];
  for (const id of enabled) {
    const name = id.split('@')[0];
    if (name === 'sharpen') continue; // Sharpen's own hooks are not part of the user's work
    names.push(name);
    for (const entry of [].concat(installed[id] || []).slice(0, 1)) {
      if (!entry || !entry.installPath) continue;
      for (const cfg of pluginHookConfigs(entry.installPath)) lines.push(...hookLines(cfg, `plugin ${name}`));
    }
  }

  if (!lines.length && !names.length) return null;
  const out = ['Setup Sharpen found (Claude cannot see hooks otherwise; names only):'];
  if (lines.length) {
    out.push('Hooks that run automatically:', ...lines.slice(0, MAX_HOOK_LINES));
    if (lines.length > MAX_HOOK_LINES) out.push(`- …and ${lines.length - MAX_HOOK_LINES} more`);
  }
  if (names.length) out.push(`Plugins enabled: ${names.join(', ')}`);
  return out.join('\n');
}

// The summary for this machine: CLAUDE_CONFIG_DIR (or ~/.claude) plus the session's project folder.
function setupNote(cwd) {
  try {
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(require('os').homedir(), '.claude');
    return summarizeSetup({ claudeDir, cwd });
  } catch { return null; }
}

module.exports = { summarizeSetup, hookLabel, setupNote };
