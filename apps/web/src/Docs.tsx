import { useEffect } from 'react'
import { FloatingPaths } from '@/components/ui/background-paths'
import Faq from './Faq.tsx'
import { INSTALL, REPO } from './site.ts'
import { SKILL_DOCS } from './skills.ts'
import SiteFooter from './SiteFooter.tsx'
import SiteHeader from './SiteHeader.tsx'
import Terminal from './Terminal.tsx'

const SECTIONS = [
  ['start', 'Start here'], ['workflow', 'What happens to a prompt'], ['examples', 'Examples'],
  ['context', 'Context and prompt design'], ['review', 'The review card'], ['skills', 'Ten companion skills'],
  ['controls', 'Commands and controls'], ['status', 'Status badge'], ['privacy', 'Privacy and files'],
  ['updates', 'Update and troubleshoot'], ['faq', 'FAQ and limits'],
]

export default function Docs() {
  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const elements = document.querySelectorAll<HTMLElement>('.docs-reveal')
    if (motion?.matches || !('IntersectionObserver' in window)) { elements.forEach((element) => element.classList.add('in')); return }
    // Reveal once and stop watching: toggling back out made sections vanish whenever they scrolled past an edge.
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target) }
    }), { threshold: 0.05 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return <div className="docs-page">
    <SiteHeader solid />
    <header className="docs-hero">
      <div className="hero-bg" aria-hidden="true"><FloatingPaths position={1} /><FloatingPaths position={-1} /></div>
      <div className="docs-hero-inner">
        <div className="docs-hero-copy">
          <p className="docs-eyebrow">DOCS <span aria-hidden="true">·</span> GET STARTED</p>
          <h1>Make the prompt<br /><span>you meant.</span></h1>
          <p className="doc-lead">A practical guide to installing Sharpen, understanding what it reads, reviewing the prompt it prepares, and choosing the right companion skill for the job.</p>
          <div className="guide-meta"><span>Claude Code plugin</span><span>Runs locally</span><span>Nothing starts before review</span></div>
        </div>
        <Terminal commands={INSTALL} ariaLabel="Quick start install commands" />
      </div>
    </header>
    <main className="docs-layout">
      <aside className="docs-sidebar">
        <a className="docs-back" href="/">← Back to Sharpen</a>
        <details className="docs-menu" open>
          <summary>Sharpen guide <span aria-hidden="true">⌄</span></summary>
          <nav aria-label="Documentation sections">{SECTIONS.map(([id, title], index) => <a key={id} href={'#' + id}><span>{String(index + 1).padStart(2, '0')}</span>{title}</a>)}</nav>
        </details>
        <a className="docs-source" href={REPO}>Plugin source on GitHub ↗</a>
      </aside>
      <article className="doc-article">
        <div className="doc-blocks">
          <section className="docs-reveal" id="start">
            <span className="doc-index">01 / GETTING STARTED</span>
            <h2>Install once, then turn it on</h2>
            <p>Sharpen needs Claude Code with plugin support and Node.js 18 or later for its hooks. In Claude Code, run each command as a separate prompt:</p>
            <Terminal commands={INSTALL} ariaLabel="Terminal with Sharpen installation commands" />
            <ol className="guide-steps">
              <li><strong>Restart Claude Code.</strong> Plugins load at the start of a session, so the current session will not pick up the installation.</li>
              <li><strong>Enable Sharpen:</strong> send <code>/sharpen on</code>.</li>
              <li><strong>Try a real request.</strong> Sharpen is off by default and remembers its on/off setting across sessions.</li>
            </ol>
            <aside className="guide-callout"><strong>Use the official source.</strong> Install only from <a href={REPO}>melthond/sharpen</a>. Sharpen is plain JavaScript and Markdown; it does not ship binaries.</aside>
          </section>
          <section className="docs-reveal" id="workflow">
            <span className="doc-index">02 / THE FLOW</span>
            <h2>From rough request to reviewed prompt</h2>
            <p>Sharpen sits before Claude starts the task. It gates the request, gathers useful context, engineers a prompt for that intent, checks it, and asks you what to do.</p>
            <ol className="workflow-list">
              <li><strong>Gate the request.</strong><span>Clear requests keep their wording. One obvious interpretation gets missing context filled in. If different interpretations would lead to different work, Sharpen asks which one you mean.</span></li>
              <li><strong>Gather context.</strong><span>It checks the conversation first, makes a few focused code searches, and reads the tools and hook summary available in your Claude Code setup.</span></li>
              <li><strong>Engineer and check.</strong><span>It states the target, relevant files, constraints, installed tools, finish line, and evidence. It checks for common prompt problems such as vague scope or a missing success condition.</span></li>
              <li><strong>Show the card.</strong><span>The prompt is presented for your decision. Nothing in the task starts until you choose an option.</span></li>
            </ol>
            <p className="guide-note">Sharpen classifies the request silently; it does not expose private chain-of-thought. You see the useful prompt and its concrete constraints.</p>
          </section>
          <section className="docs-reveal" id="examples">
            <span className="doc-index">03 / EXAMPLES</span>
            <h2>See how the gate handles different requests</h2>
            <article className="example-card example-featured">
              <span className="example-label">REAL EXAMPLE · FILL-IN</span>
              <h3>A short bug report with project context</h3>
              <p><strong>You type:</strong> “fix the clipboard so it clears after 30 seconds”</p>
              <p>In a documented real run, Sharpen found that the configured duration was 60 seconds and connected the implementation to the matching hint, test, product requirement, checklist, and project hook.</p>
              <div className="prompt-output"><span>AN EXCERPT FROM THAT CARD</span><pre>{'Change the clipboard clear for copied keys from 60 to 30 seconds.\nWhere: apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)\nAlso update: generate.tsx:181, clipboard.test.ts, PRD FR-19, checklist US-020.\nKeep: the "leave it alone if something else was copied" rule.\nHooks: dead-code-check runs after every edit.\nCheck: the clipboard test passes.'}</pre></div>
              <p className="example-footnote">Those file references are from the example project in Sharpen's README. In your project, Sharpen should use paths it actually finds.</p>
            </article>
            <div className="example-grid">
              <article className="example-card"><span className="example-label">AMBIGUOUS · ASK</span><h3>“Fix the login thing”</h3><p>If the conversation or code shows two live login problems, such as a PIN lockout and an expired member session, those would lead to different fixes. Sharpen asks which one you mean and gives distinct choices, plus <strong>Run as typed</strong>.</p></article>
              <article className="example-card"><span className="example-label">CLEAR · KEEP THE ASK</span><h3>“Rename getUser to fetchUser in src/api.ts”</h3><p>There is one action and a real location. Sharpen keeps the requested rename intact, then can add relevant callers and a check command. It should not turn a clear request into a different task.</p></article>
              <article className="example-card"><span className="example-label">USER-OWNED VALUE · ASK</span><h3>“Set the plan price to the right amount”</h3><p>If the project and conversation do not establish the price, Sharpen marks it <code>[ASK: …]</code>. It does not invent a number or present a guess as a decision.</p></article>
            </div>
          </section>
          <section className="docs-reveal" id="context">
            <span className="doc-index">04 / CONTEXT AND PROMPT DESIGN</span>
            <h2>What Sharpen uses—and what it adds</h2>
            <p>It looks in a narrow order so it can use facts already established instead of asking you to repeat them:</p>
            <ul className="guide-bullets">
              <li><strong>The conversation:</strong> decisions, paths, errors, earlier attempts, and constraints you have already supplied.</li>
              <li><strong>The codebase:</strong> up to three quick searches for files, symbols, and checks; up to six for an ambiguous prompt when the first search has not found enough.</li>
              <li><strong>Your Claude Code setup:</strong> listed skills, agents, MCP tools, and plugin commands. A session-start summary supplies hook names and enabled plugins that Claude otherwise may not see.</li>
            </ul>
            <p>The prompt shape changes with the work. A bug brief includes symptom, location, reproduction, fix, and check. A feature brief adds the user need, integration point, existing pattern, done condition, and out-of-scope boundary. Refactors state what must not change; performance work names a metric and baseline; reviews and questions can be kept read-only.</p>
            <div className="intent-examples">
              <article><span>FEATURE</span><p><strong>You ask:</strong> “Add CSV export to reports.”</p><p>The brief can pin down who uses it, where the export belongs, the existing download pattern, what makes the file correct, and which reports are out of scope.</p></article>
              <article><span>REFACTOR</span><p><strong>You ask:</strong> “Move date parsing into dateUtils.”</p><p>The prompt can preserve timezone behavior explicitly, keep callers in scope, and require the existing date tests to stay green.</p></article>
              <article><span>QUESTION OR REVIEW</span><p><strong>You ask:</strong> “What does fetchSession return?”</p><p>The request can stay read-only: explain the returned value and point to the actual source, without changing code.</p></article>
              <article><span>OPERATIONS</span><p><strong>You ask:</strong> “Deploy the current main build.”</p><p>The brief should identify the target and exact action. If a step is irreversible, it should stop for your decision before that step.</p></article>
            </div>
            <div className="prompt-lines">
              <article><code>Decided:</code><p>Earlier choices that still constrain the work.</p></article>
              <article><code>Tools:</code><p>Relevant installed skills, agents, and tools, in a useful order.</p></article>
              <article><code>Hooks:</code><p>Hooks that may affect the work. Sharpen reads their names and summaries; it does not call them.</p></article>
              <article><code>Check:</code><p>A real test, build, or other observable completion condition when one can be found.</p></article>
            </div>
            <aside className="guide-callout"><strong>It does not fill every blank with a guess.</strong> A choice only you can make—such as price, limits, or product wording—stays visible as an <code>[ASK: …]</code> placeholder for your review.</aside>
          </section>
          <section className="docs-reveal" id="review">
            <span className="doc-index">05 / YOUR DECISION</span>
            <h2>The review card is the approval point</h2>
            <p>Read the proposed prompt before Claude acts. The card gives you a few different ways to proceed:</p>
            <div className="choice-grid">
              <article><h3>Send it</h3><p>Recommended when the engineered prompt matches your intent. Claude works on that prompt.</p></article>
              <article><h3>Run my original</h3><p>Use the words you typed, unchanged.</p></article>
              <article><h3>Type your changes</h3><p>Clarify a detail, such as “make it 15 seconds”. Sharpen updates the prompt and shows you another card.</p></article>
              <article><h3>Esc, then paste</h3><p>The engineered prompt is copied to the clipboard. Press Esc, paste it with Ctrl+V (⌘V on macOS), edit if you want, and send it yourself.</p></article>
            </div>
            <p className="guide-note">Claude Code plugins cannot replace your input, fill the input box, or send a message as you. That is why Sharpen shows a card and uses the clipboard instead.</p>
          </section>
          <section className="docs-reveal" id="skills">
            <span className="doc-index">06 / COMPANION SKILLS</span>
            <h2>Ten focused workflows, on or off</h2>
            <p>These slash commands are available whether automatic Sharpen is on or off. Some hand back text, some coach or plan, and some write a file only after you review what will be saved.</p>
            <div className="skill-doc-grid">{SKILL_DOCS.map(([command, title, use, example], index) => <article className="skill-doc-card" key={command}>
              <span className="skill-doc-index">{String(index + 1).padStart(2, '0')}</span>
              <code>/sharpen:{command}</code><h3>{title}</h3><p>{use}</p>
              <div className="skill-try"><span>TRY</span><code>{example}</code></div>
            </article>)}</div>
          </section>
          <section className="docs-reveal" id="controls">
            <span className="doc-index">07 / COMMANDS AND CONTROLS</span>
            <h2>Choose when the automatic gate runs</h2>
            <div className="command-table">
              <div><code>/sharpen on</code><span>Enable prompt review. The choice persists between sessions.</span></div>
              <div><code>/sharpen off</code><span>Disable automatic review. Companion skills can still be called directly.</span></div>
              <div><code>/sharpen</code><span>Show whether automatic Sharpen is on or off, and how many sharpened prompts needed a follow-up correction.</span></div>
              <div><code>raw: &lt;request&gt;</code><span>Skip automatic sharpening for this one request.</span></div>
              <div><code>sharpen: &lt;request&gt;</code><span>Ask for a review on this request even if automatic Sharpen is off.</span></div>
              <div><code>/sharpen:sharpen on</code><span>The slash-command spelling also works inside Claude Code.</span></div>
            </div>
            <p className="guide-note">Other slash commands are not intercepted. A pasted sharpened prompt is recognized so it is not sharpened a second time.</p>
          </section>
          <section className="docs-reveal" id="status">
            <span className="doc-index">08 / STATUS</span><h2>Read the status badge</h2>
            <p>If there is no status line yet, turning Sharpen on can add its badge. If you already use one, Sharpen leaves it alone and offers to chain its badge after yours.</p>
            <div className="command-table badge-table">
              <div><code>[SHARPEN - CLEAR - READY]</code><span>The clear request's review card is waiting.</span></div>
              <div><code>[SHARPEN - FILL-IN - READY]</code><span>One likely reading has been filled in; review it.</span></div>
              <div><code>[SHARPEN - AMBIGUOUS - READY]</code><span>Different possible actions are waiting for your choice.</span></div>
              <div><code>[SHARPEN - … - SENT]</code><span>You chose a card option and work is underway.</span></div>
              <div><code>[SHARPEN - SENT]</code><span>You pasted and sent a sharpened prompt.</span></div>
              <div><code>[SHARPEN - RAW]</code><span>You bypassed it with the <code>raw:</code> prefix.</span></div>
            </div>
          </section>
          <section className="docs-reveal" id="privacy">
            <span className="doc-index">09 / PRIVACY AND LOCAL FILES</span><h2>What stays on your machine</h2>
            <ul className="guide-bullets">
              <li><strong>No API calls or telemetry.</strong> Sharpen runs through the AI agent you already use; it does not send prompts to a Sharpen service.</li>
              <li><strong>No prompt log.</strong> Hooks inspect the prompt to make the decision and exit; they do not keep a prompt history.</li>
              <li><strong>Hook settings are summarized carefully.</strong> The session summary keeps hook event and script names, not hook arguments that could contain tokens. Settings are read, not rewritten as part of that summary.</li>
              <li><strong>The clipboard is used.</strong> When the review card appears, the engineered prompt is copied there so you can paste it if you choose.</li>
            </ul>
            <p>Local support files include <code>~/.config/sharpen/state.json</code>, <code>~/.config/sharpen/last-sharpened.txt</code>, <code>~/.config/sharpen/stats.json</code> (two counts only: cards shown and follow-up corrections, no prompt text), and <code>~/.config/sharpen/sharpen-statusline.js</code>. Sharpen only edits <code>~/.claude/settings.json</code> to add its badge when you have no status line; it does not overwrite an existing one.</p>
            <p>The plugin has zero dependencies. Its hook and skill files are plain JavaScript and Markdown.</p>
          </section>
          <section className="docs-reveal" id="updates">
            <span className="doc-index">10 / UPDATES AND TROUBLESHOOTING</span>
            <h2>Update, restart, and check common issues</h2>
            <p>Update the marketplace and plugin, then restart Claude Code so the new version loads in a fresh session. Run these as separate prompts:</p>
            <Terminal commands={'/plugin marketplace update sharpen\n/plugin update sharpen@sharpen'} ariaLabel="Terminal with Sharpen update commands" />
            <div className="trouble-grid">
              <article><h3>No review card appears</h3><p>The session may still have an older plugin version loaded. Restart Claude Code, check that Sharpen is on with <code>/sharpen</code>, and try again.</p></article>
              <article><h3>The status badge is missing</h3><p>If a status line already existed, Sharpen did not replace it. Add <code>node "~/.config/sharpen/sharpen-statusline.js"</code> to the existing status-line command if you want the badge alongside it.</p></article>
              <article><h3>Copying fails on Linux</h3><p>Sharpen uses an available clipboard tool: <code>wl-copy</code>, <code>xclip</code>, or <code>xsel</code>. Install one if none is present. macOS uses <code>pbcopy</code>; Windows uses <code>clip</code>.</p></article>
            </div>
          </section>
          <section className="docs-reveal" id="faq">
            <span className="doc-index">11 / FAQ AND LIMITS</span><h2>Common questions</h2>
            <Faq />
            <div className="doc-help"><p>For the full method, real review-card screenshots, evaluation notes, and source details:</p><a href="https://github.com/melthond/sharpen/blob/main/README.md">Read the complete plugin README ↗</a><a href="https://github.com/melthond/sharpen/issues">Ask a question or report an issue ↗</a></div>
          </section>
        </div>
      </article>
      <nav className="doc-toc" aria-label="On this page"><span>ON THIS PAGE</span>{SECTIONS.map(([id, title]) => <a key={id} href={'#' + id}>{title}</a>)}</nav>
    </main>
    <SiteFooter />
  </div>
}
