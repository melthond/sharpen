// Runs tests/*.test.js by name: Node 18 can't expand globs, Node 22 won't take a directory,
// and a bare `node --test` on Node 23.6+ would also pick up the site's .ts tests in apps/web.
const { readdirSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const dir = path.join(__dirname, '..', 'tests')
const files = readdirSync(dir).filter((f) => f.endsWith('.test.js')).map((f) => path.join(dir, f))
if (!files.length) { console.error('no tests found in tests/'); process.exit(1) }
process.exit(spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' }).status ?? 1)
