const test = require('node:test')
const assert = require('node:assert/strict')
const { spawn, spawnSync } = require('node:child_process')
const { once } = require('node:events')
const { createInterface } = require('node:readline')
const os = require('node:os')
const path = require('node:path')
const fs = require('node:fs')

test('Codex prompt hook injects the native review flow when enabled', (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-codex-prompt-'))
  t.after(() => fs.rmSync(home, { recursive: true, force: true }))
  fs.writeFileSync(path.join(home, 'state.json'), '{"on":true}\n')
  const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'hooks', 'codex-prompt.js')], {
    input: JSON.stringify({ prompt: 'summarize this repository', cwd: path.join(__dirname, '..'), session_id: 'test' }),
    encoding: 'utf8',
    env: { ...process.env, SHARPEN_HOME: home },
  })
  assert.equal(result.status, 0, result.stderr)
  const context = JSON.parse(result.stdout).hookSpecificOutput.additionalContext
  assert.match(context, /request_review_choice/)
  assert.match(context, /each full prompt in its choice preview/)
  assert.match(context, /review is cancelled or dismissed/)
})

test('declining the Codex review is a non-error outcome and clears its fallback token', async (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sharpen-codex-review-'))
  t.after(() => fs.rmSync(home, { recursive: true, force: true }))
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'hooks', 'sharpen-review-mcp.js')], {
    env: { ...process.env, SHARPEN_HOME: home },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  const lines = createInterface({ input: server.stdout })[Symbol.asyncIterator]()
  const pendingDir = path.join(home, 'codex-pending')
  fs.mkdirSync(pendingDir, { recursive: true })
  fs.writeFileSync(path.join(pendingDir, 'session.json'), JSON.stringify({ reviewToken: 'fallback-token' }))
  const next = async () => {
    const line = await lines.next()
    assert.equal(line.done, false, 'review server exited before responding')
    return JSON.parse(line.value)
  }
  const send = (message) => server.stdin.write(`${JSON.stringify(message)}\n`)

  t.after(() => { if (!server.killed) server.kill() })
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { capabilities: { elicitation: { form: {} } } } })
  assert.equal((await next()).result.serverInfo.name, 'sharpen-review')

  send({
    jsonrpc: '2.0', id: 2, method: 'tools/call',
    params: { name: 'request_review_choice', arguments: {
      question: 'Send this sharpened prompt?',
      review: 'Do the task only after the user chooses.',
      reviewToken: 'fallback-token',
      choices: [
        { id: 'send', label: 'Send it (Recommended)', preview: 'Do the task.' },
        { id: 'original', label: 'Run my original', preview: 'Original task.' },
      ],
    } },
  })
  const request = await next()
  assert.equal(request.method, 'elicitation/create')
  send({ jsonrpc: '2.0', id: request.id, result: { action: 'decline' } })
  const response = await next()

  assert.equal(response.id, 2)
  assert.equal(response.result.isError, false)
  assert.equal(response.result.structuredContent.action, 'cancelled')
  assert.match(response.result.content[0].text, /wait for the user’s next message/)
  assert.deepEqual(fs.readdirSync(pendingDir), [])

  server.stdin.end()
  await once(server, 'exit')
})
