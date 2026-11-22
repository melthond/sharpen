import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { FloatingPaths } from '@/components/ui/background-paths'
import AsciiGlitch from './AsciiGlitch.tsx'
import CopyButton from './CopyButton.tsx'
import Faq from './Faq.tsx'
import SiteFooter, { ArrowLink } from './SiteFooter.tsx'
import SiteHeader from './SiteHeader.tsx'
import { INSTALL } from './site.ts'
import { SKILL_DOCS, SKILLS } from './skills.ts'
import { scrambleLines, useScramble } from './useScramble.tsx'

// The four gate outcomes from the docs' examples section. Only the clipboard card is from a real run (`real`).
const GATE = [
  {
    prompt: 'fix the login thing',
    kind: 'Ambiguous · asks',
    card: { title: 'Which did you mean?', lines: ['The PIN lockout', 'The expired member session', 'Run as typed'], options: true },
  },
  {
    prompt: 'fix the clipboard so it clears after 30 seconds',
    kind: 'Fill-in',
    real: true,
    card: { title: 'Sharpened prompt (fill-in)', lines: ['Change the clipboard clear for copied keys from 60 to 30 seconds.', 'Where: apps/admin/src/lib/clipboard.ts:2', 'Check: the clipboard test passes.'] },
  },
  {
    prompt: 'Rename getUser to fetchUser in src/api.ts',
    kind: 'Clear · keeps the ask',
    card: { title: 'Sharpened prompt (clear)', lines: ['Rename getUser to fetchUser in src/api.ts.', 'Also update: the callers it finds.', 'Check: the project’s test command.'] },
  },
  {
    prompt: 'Set the plan price to the right amount',
    kind: 'Your value · asks',
    card: { title: 'Sharpened prompt (fill-in)', lines: ['Set the plan price to [ASK: plan price].'] },
  },
]

const FLOW = [
  ['Gate', 'Clear requests keep their wording. One reading gets the gaps filled. Two readings get a question.'],
  ['Gather', 'The conversation first, then a few focused code searches, then your skills, tools and hooks.'],
  ['Engineer', 'Target, files, limits, tools, a finish line and evidence, checked for common prompt problems.'],
  ['Review', 'The prompt lands on a card. Nothing starts until you send it, edit it, or run your original.'],
]

// The real fill-in run from the Sharpen README, as quoted in the docs.
const SHARPENED = [
  ['', 'Change the clipboard clear for copied keys from 60 to 30 seconds.'],
  ['Where', 'apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)'],
  ['Also update', 'generate.tsx:181, clipboard.test.ts, PRD FR-19, checklist US-020.'],
  ['Keep', 'the "leave it alone if something else was copied" rule.'],
  ['Hooks', 'dead-code-check runs after every edit.'],
  ['Check', 'the clipboard test passes.'],
]

const FEATURES = [
  ['Knows which one', 'Two open login bugs? It asks which you meant, with one option per reading.'],
  ['Full briefs', 'Starting state, target state, scope lock, stop-and-ask rules and evidence for anything that edits code.'],
  ['No guessed values', 'Prices, limits and wording only you can decide become visible [ASK: …] blanks.'],
  ['88 anti-patterns', 'Vague verbs, missing finish lines, relative dates, test gaming and third-try corrections are caught before you see the card.'],
  ['Techniques built in', 'Escalation, gated chains, search budgets, context limits and long-run plans, drawn from the major prompting guides.'],
  ['Your setup, used', 'Tools: and Hooks: lines name the skills, agents and hooks you actually have installed.'],
  ['Knows the phase', 'Kickoff, spec, plan, tasks or build: each gets its own shape and a next step. Small fixes stay small.'],
  ['Safety checks', 'Risky verbs get confirmed, new packages get checked in the registry, and private data plus outward sends get a stop.'],
  ['Grounded in research', 'Built from the Anthropic, OpenAI and Google guides, published studies and 2025–2026 developer surveys, each linked in the references.'],
]

// Featured bento tiles (larger) by index into SKILLS: sharpen-prompt and sharpen-split.
const FEATURED = new Set([0, 3])

export default function App() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) { els.forEach((e) => e.classList.add('in')); return }
    // Reveal once and stop watching: toggling back out made sections vanish whenever they scrolled past an edge.
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.05 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <SiteHeader />

      <main id="top">
        <section className="hero">
          <div className="hero-bg" aria-hidden="true"><FloatingPaths position={1} /><FloatingPaths position={-1} /><AsciiGlitch /></div>
          <h1>You type “fix the login thing.”<br /><span className="scramble-line"><span className="sr-only">It knows which one.</span><ScrambleText>It knows which one.</ScrambleText></span></h1>
          <p className="lead">Sharpen turns the prompt you typed into the prompt you meant, and shows it to you before any work starts.</p>
          <InstallPill />
          <div className="hero-docs"><ArrowLink href="/docs/">Read the docs</ArrowLink></div>
        </section>

        <section id="how" className="section reveal">
          <SectionHead index="01" label="How it works" title="One gate before every task." lead="Sharpen reads your request and takes one of three paths: keep it, fill it in, or ask. Pick a request to see the card it would show." />
          <GateDemo />
          <ol className="flow">
            {FLOW.map(([title, text], i) => <li key={title} style={{ '--stagger-index': i } as CSSProperties}>
              <span>0{i + 1}</span><h3>{title}</h3><p>{text}</p>
            </li>)}
          </ol>
        </section>

        <section id="features" className="section reveal">
          <SectionHead index="02" label="What it adds" title="Same request. A prompt that can finish." lead="A real run from the Sharpen README: one line in, a brief with the file, the related work, the rule to keep and the check out." />
          <div className="compare">
            <div className="compare-side compare-before">
              <span className="compare-label">You type</span>
              <p>“fix the clipboard so it clears after 30 seconds”</p>
            </div>
            <div className="compare-arrow" aria-hidden="true">→</div>
            <div className="compare-side compare-after">
              <span className="compare-label">Sharpen hands Claude</span>
              <ul>
                {SHARPENED.map(([tag, text]) => <li key={text} className={tag ? 'added' : undefined}>
                  {tag && <b>{tag}:</b>} {text}
                </li>)}
              </ul>
            </div>
          </div>
          <ul className="feature-list">
            {FEATURES.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
          </ul>
        </section>

        <section id="skills" className="skills-band reveal">
          <div className="skills-inner">
            <SectionHead index="03" label="Companion skills" title="Ten skills for the prompts around the work." lead="Sharpen runs on its own. These run when you call them: type /sharpen: in Claude Code, whether automatic review is on or off." />
            <ul className="bento">
              {SKILLS.map(([name, summary, detail], i) => <li key={name} className={FEATURED.has(i) ? 'is-featured' : undefined} style={{ '--stagger-index': i } as CSSProperties}>
                <span className="bento-index">0{i + 1}</span>
                <code>/sharpen:{name}</code>
                <h3>{summary}</h3>
                <p>{detail}</p>
                {FEATURED.has(i) && <p className="bento-more">{SKILL_DOCS[i][2]}</p>}
                <div className="bento-try"><span>Try</span><code>{SKILL_DOCS[i][3]}</code></div>
              </li>)}
            </ul>
            <ArrowLink href="/docs/#skills">See every skill in the docs</ArrowLink>
          </div>
        </section>

        <section id="faq" className="section reveal">
          <SectionHead index="04" label="FAQ" title="Questions, answered." />
          <Faq />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function SectionHead({ index, label, title, lead }: { index: string; label: string; title: string; lead?: string }) {
  return <header className="section-head">
    <p className="section-eyebrow">{index} <span aria-hidden="true">·</span> {label}</p>
    <h2>{title}</h2>
    {lead && <p className="section-lead">{lead}</p>}
  </header>
}

function GateDemo() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const item = GATE[active]

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  function onKeyDown(event: KeyboardEvent) {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = (active + step + GATE.length) % GATE.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return <div className="gate-demo">
    <div className="gate-tabs" role="tablist" aria-label="Pick a request" onKeyDown={onKeyDown}>
      <span className="gate-tabs-label" aria-hidden="true">Pick a request</span>
      {GATE.map((g, i) => <button key={g.prompt} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === active} aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}>
        “{g.prompt}”
      </button>)}
    </div>
    <div className="gate-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
      <div className="gate-chips"><span className="gate-kind">{item.kind}</span><span className={`gate-source${item.real ? ' is-real' : ''}`}>{item.real ? 'Real run' : 'Illustration'}</span></div>
      <div className="gate-stack">
        {/* Every card sits hidden in the same cell, so the panel is always the tallest card's size. */}
        {GATE.map((g) => <GateCard key={g.prompt} card={g.card} hidden />)}
        <GateCard card={item.card} />
      </div>
    </div>
  </div>
}

function GateCard({ card, hidden }: { card: (typeof GATE)[number]['card']; hidden?: boolean }) {
  const lines = <ul className={card.options ? 'is-options' : undefined}>{card.lines.map((line) => <li key={line}>{line}</li>)}</ul>
  if (hidden) return <div className="gate-card is-sizer" aria-hidden="true"><strong>{card.title}</strong>{lines}</div>
  return <div className="gate-card">
    <div className="sr-only"><strong>{card.title}</strong>{lines}</div>
    <GateScramble card={card} />
  </div>
}

// Title and lines scramble as one text: on a tab change the old card backspaces out, then the new one types in.
function GateScramble({ card }: { card: (typeof GATE)[number]['card'] }) {
  const [title, ...lines] = scrambleLines(useScramble([card.title, ...card.lines].join('\n'), 520))
  return <div aria-hidden="true">
    <strong>{title}</strong>
    <ul className={card.options ? 'is-options' : undefined}>{lines.map((line, i) => <li key={i}>{line}</li>)}</ul>
  </div>
}

function ScrambleText({ children }: { children: string }) {
  return <span aria-hidden="true">{scrambleLines(useScramble(children, 760))}</span>
}

function InstallPill() {
  const text = useScramble(INSTALL, 680)
  return <div className="install-pill" role="group" aria-label="Install commands">
    <code aria-hidden="true">{scrambleLines(text).map((line, i) => <span key={i}><b>$</b> {line}</span>)}</code>
    <span className="sr-only">{INSTALL}</span>
    <CopyButton className="pill-copy" text={INSTALL} label="Copy install commands" />
  </div>
}
