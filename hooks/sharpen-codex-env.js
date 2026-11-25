// sharpen — a names-only view of Codex skills, MCP servers and hooks.
// Reads configuration locally; never includes hook arguments or secrets.
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_LINES = 25;
const readText = (file) => { try { return fs.readFileSync(file, 'utf8'); } catch { return ''; } };
const readJson = (file) => { try { return JSON.parse(readText(file)); } catch { return null; } };

function skillNames(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'SKILL.md')))
      .map((entry) => entry.name);
  } catch { return []; }
}

function hookNamesFromToml(text, source) {
  const lines = [];
  let event = null;
  for (const line of text.split(/\r?\n/)) {
    const section = line.match(/^\s*\[\[hooks\.([A-Za-z]+)\]\]/);
    if (section) { event = section[1]; lines.push(`- ${event}: configured in ${source}`); }
  }
  return lines;
}

function codexSetupNote(cwd) {
  try {
    const home = os.homedir();
    const userConfig = path.join(home, '.codex', 'config.toml');
    const projectConfig = cwd && path.join(cwd, '.codex', 'config.toml');
    const configText = readText(userConfig);
    const projectText = projectConfig ? readText(projectConfig) : '';
    const skills = [...new Set([
      ...skillNames(path.join(home, '.agents', 'skills')),
      ...(cwd ? skillNames(path.join(cwd, '.agents', 'skills')) : []),
    ])].filter((name) => name !== 'sharpen' && !name.startsWith('sharpen-')).sort();
    const mcp = [...new Set([
      ...[...configText.matchAll(/^\s*\[mcp_servers\.([^\]]+)\]/gm)].map((match) => match[1].replace(/^"|"$/g, '')),
      ...[...projectText.matchAll(/^\s*\[mcp_servers\.([^\]]+)\]/gm)].map((match) => match[1].replace(/^"|"$/g, '')),
    ])].sort();
    const hooks = [
      ...hookNamesFromToml(configText, 'user config'),
      ...hookNamesFromToml(projectText, 'project config'),
    ];
    const projectHooks = readJson(cwd && path.join(cwd, '.codex', 'hooks', 'hooks.json'));
    for (const [event, groups] of Object.entries((projectHooks && projectHooks.hooks) || {})) {
      if (Array.isArray(groups) && groups.some((group) => Array.isArray(group.hooks) && group.hooks.length)) {
        hooks.push(`- ${event}: configured in project hooks`);
      }
    }
    const out = ['Setup Sharpen found (Codex; names only):'];
    if (skills.length) out.push(`Skills available: ${skills.join(', ')}`);
    if (mcp.length) out.push(`MCP servers configured: ${mcp.join(', ')}`);
    if (hooks.length) out.push('Hooks configured:', ...hooks.slice(0, MAX_LINES));
    if (!skills.length && !mcp.length && !hooks.length) return null;
    if (hooks.length > MAX_LINES) out.push(`- …and ${hooks.length - MAX_LINES} more`);
    return out.join('\n');
  } catch { return null; }
}

module.exports = { codexSetupNote };
