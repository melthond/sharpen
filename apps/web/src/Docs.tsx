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
          <p className="doc-lead">Install Sharpen, see what it reads, review the prompts it writes, and pick the right companion skill.</p>
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
            <p>You need Claude Code with plugin support and Node.js 18 or later. Run each command as its own prompt:</p>
            <Terminal commands={INSTALL} ariaLabel="Terminal with Sharpen installation commands" />
            <ol className="guide-steps">
              <li><strong>Restart Claude Code.</strong> Plugins load when a session starts.</li>
              <li><strong>Enable Sharpen:</strong> send <code>/sharpen on</code>.</li>
              <li><strong>Try a real request.</strong> Sharpen starts off and remembers its setting across sessions.</li>
            </ol>
            <aside className="guide-callout"><strong>Use the official source.</strong> Install only from <a href={REPO}>melthond/sharpen</a>. It is plain JavaScript and Markdown, with no binaries.</aside>
          </section>
          <section className="docs-reveal" id="workflow">
            <span className="doc-index">02 / THE FLOW</span>
            <h2>From rough request to reviewed prompt</h2>
            <p>Sharpen runs before Claude starts: it gates the request, gathers context, engineers the prompt, checks it, and asks you.</p>
            <ol className="workflow-list">
              <li><strong>Gate the request.</strong><span>Clear requests keep their wording. One obvious reading gets the gaps filled. If readings lead to different work, it asks which you mean.</span></li>
              <li><strong>Gather context.</strong><span>The conversation first, then a few code searches, then your tools and hook summary.</span></li>
              <li><strong>Engineer and check.</strong><span>Target, files, limits, tools, finish line and evidence, checked for problems like vague scope or no success condition.</span></li>
              <li><strong>Show the card.</strong><span>You decide. Nothing starts until you pick an option.</span></li>
            </ol>
            <p className="guide-note">Sharpen classifies silently and never shows chain-of-thought. You see the prompt and its constraints.</p>
          </section>
          <section className="docs-reveal" id="examples">
            <span className="doc-index">03 / EXAMPLES</span>
            <h2>See how the gate handles different requests</h2>
            <article className="example-card example-featured">
              <span className="example-label">REAL EXAMPLE · FILL-IN</span>
              <h3>A short bug report with project context</h3>
              <p><strong>You type:</strong> “fix the clipboard so it clears after 30 seconds”</p>
              <p>In a real run, Sharpen found the 60-second setting and linked it to the matching hint, test, requirement, checklist and hook.</p>
              <div className="prompt-output"><span>AN EXCERPT FROM THAT CARD</span><pre>{'Change the clipboard clear for copied keys from 60 to 30 seconds.\nWhere: apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)\nAlso update: generate.tsx:181, clipboard.test.ts, PRD FR-19, checklist US-020.\nKeep: the "leave it alone if something else was copied" rule.\nHooks: dead-code-check runs after every edit.\nCheck: the clipboard test passes.'}</pre></div>
              <p className="example-footnote">Those paths come from the README's example project. In yours, Sharpen uses the paths it finds.</p>
            </article>
            <div className="example-grid">
              <article className="example-card"><span className="example-label">AMBIGUOUS · ASK</span><h3>“Fix the login thing”</h3><p>Two live login problems, a PIN lockout and an expired session, need different fixes. Sharpen asks which, with one choice each plus <strong>Run as typed</strong>.</p></article>
              <article className="example-card"><span className="example-label">CLEAR · KEEP THE ASK</span><h3>“Rename getUser to fetchUser in src/api.ts”</h3><p>One action, a real location. Sharpen keeps the rename and may add callers and a check. It never turns it into a different task.</p></article>
              <article className="example-card"><span className="example-label">USER-OWNED VALUE · ASK</span><h3>“Set the plan price to the right amount”</h3><p>If nothing sets the price, Sharpen marks it <code>[ASK: …]</code>. It never invents a number.</p></article>
            </div>
          </section>
          <section className="docs-reveal" id="context">
            <span className="doc-index">04 / CONTEXT AND PROMPT DESIGN</span>
            <h2>What Sharpen uses—and what it adds</h2>
            <p>It checks in a fixed order, so you never repeat yourself:</p>
            <ul className="guide-bullets">
              <li><strong>The conversation:</strong> decisions, paths, errors, past attempts and constraints you gave.</li>
              <li><strong>The codebase:</strong> up to three quick searches for files, symbols and checks; up to six when an ambiguous prompt needs more.</li>
              <li><strong>Your Claude Code setup:</strong> listed skills, agents, MCP tools and plugin commands, plus a session-start summary of hooks and enabled plugins.</li>
            </ul>
            <p>The prompt fits the work. Bugs get symptom, location, repro, fix and check. Features add the user need, integration point, existing pattern, done condition and what is out of scope. Refactors say what must not change, performance work names a metric and baseline, and reviews stay read-only.</p>
            <div className="intent-examples">
              <article><span>FEATURE</span><p><strong>You ask:</strong> “Add CSV export to reports.”</p><p>Pins down who uses it, where it goes, the existing download pattern, what makes the file correct, and which reports are out of scope.</p></article>
              <article><span>REFACTOR</span><p><strong>You ask:</strong> “Move date parsing into dateUtils.”</p><p>Keeps timezone behavior, keeps callers in scope, and requires the date tests to stay green.</p></article>
              <article><span>QUESTION OR REVIEW</span><p><strong>You ask:</strong> “What does fetchSession return?”</p><p>Stays read-only: explains the return value and points to the source.</p></article>
              <article><span>OPERATIONS</span><p><strong>You ask:</strong> “Deploy the current main build.”</p><p>Names the target and exact action, and stops for you before anything irreversible.</p></article>
            </div>
            <div className="prompt-lines">
              <article><code>Decided:</code><p>Earlier choices that still apply.</p></article>
              <article><code>Tools:</code><p>Relevant installed skills, agents and tools, in order.</p></article>
              <article><code>Hooks:</code><p>Hooks that may run. Sharpen reads their names; it never calls them.</p></article>
              <article><code>Check:</code><p>A real test, build or other visible finish line, when one exists.</p></article>
            </div>
            <aside className="guide-callout"><strong>It never guesses for you.</strong> Choices only you can make, like price, limits or wording, stay as <code>[ASK: …]</code> blanks.</aside>
          </section>
          <section className="docs-reveal" id="review">
            <span className="doc-index">05 / YOUR DECISION</span>
            <h2>The review card is the approval point</h2>
            <p>Read the prompt before Claude acts. You can:</p>
            <div className="choice-grid">
              <article><h3>Send it</h3><p>Recommended when it matches what you meant. Claude works on it.</p></article>
              <article><h3>Run my original</h3><p>Use the words you typed, unchanged.</p></article>
              <article><h3>Type your changes</h3><p>Adjust a detail, like “make it 15 seconds”, and get an updated card.</p></article>
              <article><h3>Esc, then paste</h3><p>The prompt is on your clipboard. Press Esc, paste with Ctrl+V (⌘V on macOS), edit and send.</p></article>
            </div>
            <p className="guide-note">Plugins can’t fill your input box or send as you, so Sharpen uses a card and the clipboard.</p>
          </section>
          <section className="docs-reveal" id="skills">
            <span className="doc-index">06 / COMPANION SKILLS</span>
            <h2>Ten focused workflows, on or off</h2>
            <p>These work whether automatic review is on or off. Some return text, some coach or plan, and some write a file only after you review it.</p>
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
              <div><code>/sharpen on</code><span>Turn on prompt review. It stays on across sessions.</span></div>
              <div><code>/sharpen off</code><span>Turn off automatic review. Companion skills still work.</span></div>
              <div><code>/sharpen</code><span>Show on or off, and how many sharpened prompts needed a follow-up.</span></div>
              <div><code>raw: &lt;request&gt;</code><span>Skip sharpening for one request.</span></div>
              <div><code>sharpen: &lt;request&gt;</code><span>Review one request even when automatic review is off.</span></div>
              <div><code>/sharpen:sharpen on</code><span>The slash-command spelling works too.</span></div>
            </div>
            <p className="guide-note">Other slash commands pass through. A pasted sharpened prompt is never sharpened twice.</p>
          </section>
          <section className="docs-reveal" id="status">
            <span className="doc-index">08 / STATUS</span><h2>Read the status badge</h2>
            <p>With no status line, turning Sharpen on adds its badge. If you have one, Sharpen leaves it and offers to chain its badge after yours.</p>
            <div className="command-table badge-table">
              <div><code>[SHARPEN - CLEAR - READY]</code><span>A clear request’s card is waiting.</span></div>
              <div><code>[SHARPEN - FILL-IN - READY]</code><span>One likely reading was filled in; review it.</span></div>
              <div><code>[SHARPEN - AMBIGUOUS - READY]</code><span>Several possible actions await your choice.</span></div>
              <div><code>[SHARPEN - … - SENT]</code><span>You picked a card option; work has started.</span></div>
              <div><code>[SHARPEN - SENT]</code><span>You pasted and sent a sharpened prompt.</span></div>
              <div><code>[SHARPEN - RAW]</code><span>You bypassed it with the <code>raw:</code> prefix.</span></div>
            </div>
          </section>
          <section className="docs-reveal" id="privacy">
            <span className="doc-index">09 / PRIVACY AND LOCAL FILES</span><h2>What stays on your machine</h2>
            <ul className="guide-bullets">
              <li><strong>No API calls or telemetry.</strong> It runs through your agent; nothing goes to a Sharpen service.</li>
              <li><strong>No prompt log.</strong> Hooks read the prompt, decide and exit. No history is kept.</li>
              <li><strong>Hook settings, summarized safely.</strong> Only event and script names are kept, never arguments that might hold tokens. Settings are read, not rewritten.</li>
              <li><strong>The clipboard is used.</strong> The prompt is copied there when the card appears.</li>
            </ul>
            <p>Local files: <code>~/.config/sharpen/state.json</code>, <code>~/.config/sharpen/last-sharpened.txt</code>, <code>~/.config/sharpen/stats.json</code> (two counts, no prompt text), and <code>~/.config/sharpen/sharpen-statusline.js</code>. Sharpen edits <code>~/.claude/settings.json</code> only to add its badge when you have no status line.</p>
            <p>Zero dependencies: plain JavaScript and Markdown.</p>
          </section>
          <section className="docs-reveal" id="updates">
            <span className="doc-index">10 / UPDATES AND TROUBLESHOOTING</span>
            <h2>Update, restart, and check common issues</h2>
            <p>Update both, then restart Claude Code. Run each as its own prompt:</p>
            <Terminal commands={'/plugin marketplace update sharpen\n/plugin update sharpen@sharpen'} ariaLabel="Terminal with Sharpen update commands" />
            <div className="trouble-grid">
              <article><h3>No review card appears</h3><p>An older version may still be loaded. Restart Claude Code, check <code>/sharpen</code>, and try again.</p></article>
              <article><h3>The status badge is missing</h3><p>Sharpen never replaces an existing status line. Add <code>node "~/.config/sharpen/sharpen-statusline.js"</code> to your status-line command to show both.</p></article>
              <article><h3>Copying fails on Linux</h3><p>Install <code>wl-copy</code>, <code>xclip</code> or <code>xsel</code>. macOS uses <code>pbcopy</code>; Windows uses <code>clip</code>.</p></article>
            </div>
          </section>
          <section className="docs-reveal" id="faq">
            <span className="doc-index">11 / FAQ AND LIMITS</span><h2>Common questions</h2>
            <Faq />
            <div className="doc-help"><p>For the full method, card screenshots, evaluations and sources:</p><a href="https://github.com/melthond/sharpen/blob/main/README.md">Read the complete plugin README ↗</a><a href="https://github.com/melthond/sharpen/issues">Ask a question or report an issue ↗</a></div>
          </section>
        </div>
      </article>
      <nav className="doc-toc" aria-label="On this page"><span>ON THIS PAGE</span>{SECTIONS.map(([id, title]) => <a key={id} href={'#' + id}>{title}</a>)}</nav>
    </main>
    <SiteFooter />
  </div>
}
