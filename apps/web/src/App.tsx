import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { FloatingPaths } from '@/components/ui/background-paths'
import AsciiGlitch from './AsciiGlitch.tsx'
import Faq from './Faq.tsx'
import SiteFooter, { ArrowLink } from './SiteFooter.tsx'
import SiteHeader from './SiteHeader.tsx'
import { INSTALL } from './site.ts'
import SkillsShowcase from './SkillsShowcase.tsx'
import Terminal from './Terminal.tsx'
import { scrambleLines, useScramble } from './useScramble.tsx'

// The four gate outcomes from the docs' examples section. Only the clipboard card is from a real run (`real`).
const GATE = [
  {
    tab: 'Ambiguous',
    prompt: 'fix the login thing',
    kind: 'Ambiguous · asks',
    ask: 'Pick one reading.',
    actions: ['The PIN lockout', 'The expired session'],
    card: { title: 'Which did you mean?', lines: ['The PIN lockout', 'The expired member session', 'Run as typed'], options: true },
  },
  {
    tab: 'Fill-in',
    prompt: 'fix the clipboard so it clears after 30 seconds',
    kind: 'Fill-in',
    ask: 'Send this sharpened prompt?',
    actions: ['Send it', 'Run my original'],
    real: true,
    card: { title: 'Sharpened prompt (fill-in)', lines: ['Change the clipboard clear for copied keys from 60 to 30 seconds.', 'Where: apps/admin/src/lib/clipboard.ts:2', 'Check: the clipboard test passes.'] },
  },
  {
    tab: 'Clear',
    prompt: 'Rename getUser to fetchUser in src/api.ts',
    kind: 'Clear · keeps the ask',
    ask: 'Send this sharpened prompt?',
    actions: ['Send it', 'Run my original'],
    card: { title: 'Sharpened prompt (clear)', lines: ['Rename getUser to fetchUser in src/api.ts.', 'Also update: the callers it finds.', 'Check: the project’s test command.'] },
  },
  {
    tab: 'Your value',
    prompt: 'Set the plan price to the right amount',
    kind: 'Your value · asks',
    ask: 'Fill the blank, then send.',
    actions: ['Fill it in', 'Run my original'],
    card: { title: 'Sharpened prompt (fill-in)', lines: ['Set the plan price to [ASK: plan price].'] },
  },
]

const FLOW = [
  ['Gate', 'Clear stays as typed. One reading gets filled in. Two get a question.'],
  ['Gather', 'Your chat first, then a few code searches, then your skills, tools and hooks.'],
  ['Engineer', 'Target, files, limits, tools and a finish line, checked for common mistakes.'],
  ['Review', 'It lands on a card. Nothing runs until you send it, edit it, or run your original.'],
]

// The real fill-in run from the Sharpen README, as quoted in the docs.
const SHARPENED = [
  ['Goal', 'Change the clipboard clear for copied keys from 60 to 30 seconds.'],
  ['Where', 'apps/admin/src/lib/clipboard.ts:2 (HOLD_MS = 60_000 → 30_000)'],
  ['Also update', 'generate.tsx:181, clipboard.test.ts, PRD FR-19, checklist US-020.'],
  ['Keep', 'the "leave it alone if something else was copied" rule.'],
  ['Hooks', 'dead-code-check runs after every edit.'],
  ['Check', 'the clipboard test passes.'],
]

const FEATURES = [
  ['Knows which one', 'Two open login bugs? It asks which one you meant.'],
  ['Full briefs', 'Start and target state, scope, stop rules and evidence for code changes.'],
  ['No guessed values', 'Prices, limits and wording only you know become [ASK: …] blanks.'],
  ['88 anti-patterns', 'Vague verbs, missing finish lines and test gaming, caught before the card.'],
  ['Techniques built in', 'Escalation, gated chains, search budgets and long-run plans.'],
  ['Your setup, used', 'Tools: and Hooks: lines name what you actually have.'],
  ['Knows the phase', 'Kickoff, spec, plan, tasks or build each get their shape. Small fixes stay small.'],
  ['Safety checks', 'Risky verbs get confirmed, new packages checked, and private data kept in.'],
  ['Grounded in research', 'Built on the Anthropic, OpenAI and Google guides, studies and 2025–2026 surveys.'],
]

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
          <p className="lead">Sharpen turns what you typed into what you meant, and shows you before any work starts.</p>
          <Terminal commands={INSTALL} ariaLabel="Install commands" />
          <div className="hero-docs"><ArrowLink href="/docs/">Read the docs</ArrowLink></div>
        </section>

        <section id="how" className="section section-wide reveal">
          <div className="how-grid">
            <div className="how-copy">
              <SectionHead index="01" label="How it works" title="One gate before every task." lead="Every request takes one of three paths: keep it, fill it in, or ask. Pick one to see its card." />
              <FlowSteps />
            </div>
            <GateDemo />
          </div>
        </section>

        <section id="features" className="section section-wide reveal">
          <SectionHead index="02" label="What it adds" title="Same request. A prompt that can finish." lead="A real run from the README. One line in, a full brief out." wide />
          <div className="split">
            <div className="split-before">
              <span className="split-label">You type</span>
              <p>“fix the clipboard so it clears after 30 seconds”</p>
              <span className="split-meta">1 line · no file · no check</span>
            </div>
            <SplitBrief />
          </div>
          <ul className="feature-list">
            {FEATURES.map(([title, text], i) => <li key={title} style={{ '--stagger-index': i } as CSSProperties}>
              <span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div>
            </li>)}
          </ul>
        </section>

        <SkillsShowcase />

        <section id="faq" className="section reveal">
          <SectionHead index="04" label="FAQ" title="Questions, answered." />
          <Faq />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function SectionHead({ index, label, title, lead, wide }: { index: string; label: string; title: string; lead?: string; wide?: boolean }) {
  return <header className={wide ? 'section-head is-wide' : 'section-head'}>
    <p className="section-eyebrow">{index} <span aria-hidden="true">·</span> {label}</p>
    <h2>{title}</h2>
    {lead && <p className="section-lead">{lead}</p>}
  </header>
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Runs `onEnter` once, the first time the element scrolls into view. Returns undefined when it can't watch (old browser). */
function onFirstView(el: Element, onEnter: () => void, threshold = 0.35) {
  if (!('IntersectionObserver' in window)) return undefined
  const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { io.disconnect(); onEnter() } }, { threshold })
  io.observe(el)
  return () => io.disconnect()
}

/** The four steps. Prerendered fully lit; with script they dim, then light 01 to 04 one by one the first time the list comes into view. */
function FlowSteps() {
  const ref = useRef<HTMLOListElement>(null)
  const [lit, setLit] = useState(FLOW.length)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const timers: number[] = []
    const stop = onFirstView(el, () => FLOW.forEach((_, i) => timers.push(window.setTimeout(() => setLit(i + 1), 350 + i * 650))))
    if (!stop) return
    setLit(0)
    return () => { stop(); timers.forEach(clearTimeout) }
  }, [])

  return <ol className="how-steps" ref={ref} style={{ '--lit': lit / FLOW.length } as CSSProperties}>
    {FLOW.map(([title, text], i) => <li key={title} className={i < lit ? 'is-lit' : undefined}>
      <span className="how-dot" aria-hidden="true" />
      <h3><span>0{i + 1}</span> {title}</h3>
      <p>{text}</p>
    </li>)}
  </ol>
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

  // One red indicator slides to the active tab. Until it is measured, the active tab paints its own red.
  const [box, setBox] = useState<CSSProperties | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const tab = tabs.current[active]
      if (tab) setBox({ width: tab.offsetWidth, height: tab.offsetHeight, transform: `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)` })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  return <div className="console">
    <div className={box ? 'console-tabs has-indicator' : 'console-tabs'} role="tablist" aria-label="Pick a request" onKeyDown={onKeyDown}>
      {box && <span className="console-indicator" aria-hidden="true" style={box} />}
      {GATE.map((g, i) => <button key={g.prompt} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === active} aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}>
        {g.tab}
      </button>)}
    </div>
    <div className="console-body" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
      <p className="console-prompt"><b aria-hidden="true">&gt; </b><span className="sr-only">{item.prompt}</span><ScrambleText>{item.prompt}</ScrambleText></p>
      <div className="gate-chips"><span className="console-from"><span aria-hidden="true">✳</span> Sharpen</span><FitPill className="gate-kind" label={item.kind} /><FitPill className={item.real ? 'gate-source is-real' : 'gate-source'} label={item.real ? 'Real run' : 'Illustration'} /></div>
      <div className="gate-stack">
        {/* Every card sits hidden in the same cell, so the panel is always the tallest card's size. */}
        {GATE.map((g) => <GateCard key={g.prompt} card={g.card} hidden />)}
        <GateCard card={item.card} />
      </div>
      <div className="console-actions">
        <p><span className="sr-only">{item.ask}</span><ScrambleText>{item.ask}</ScrambleText></p>
        <div aria-hidden="true">{item.actions.map((a, j) => <FitPill key={j} label={a} className={j === 0 ? 'action-pill is-primary' : 'action-pill'} />)}</div>
      </div>
    </div>
  </div>
}

/** A pill (chip or card button) whose width eases to fit each new label, while the label fades in. No scramble. */
function FitPill({ label, className }: { label: string; className: string }) {
  const text = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number>()
  useLayoutEffect(() => { if (text.current) setWidth(text.current.offsetWidth) }, [label])
  return <span className={`fit-pill ${className}`} style={width ? { width } : undefined}>
    <span ref={text} key={label}>{label}</span>
  </span>
}

/** The brief from the real run. Its lines scramble in again the first time it scrolls into view. */
function SplitBrief() {
  const ref = useRef<HTMLDivElement>(null)
  const [runs, setRuns] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    return onFirstView(el, () => setRuns(1))
  }, [])

  return <div className="split-after" ref={ref}>
    <span className="split-label">Sharpen hands Claude</span>
    <ul>{SHARPENED.map(([tag, text]) => <li key={tag}><b>{tag}</b><span><span className="sr-only">{text}</span><ScrambleText key={runs}>{text}</ScrambleText></span></li>)}</ul>
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
  const [title, ...lines] = scrambleLines(useScramble([card.title, ...card.lines].join('\n'), 1100))
  return <div aria-hidden="true">
    <strong>{title}</strong>
    <ul className={card.options ? 'is-options' : undefined}>{lines.map((line, i) => <li key={i}>{line}</li>)}</ul>
  </div>
}

function ScrambleText({ children }: { children: string }) {
  return <span aria-hidden="true">{scrambleLines(useScramble(children, 1000))}</span>
}
