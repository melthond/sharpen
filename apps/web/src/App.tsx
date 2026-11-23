import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { FloatingPaths } from '@/components/ui/background-paths'
import AsciiGlitch from './AsciiGlitch.tsx'
import Faq from './Faq.tsx'
import SiteFooter, { ArrowLink } from './SiteFooter.tsx'
import SiteHeader from './SiteHeader.tsx'
import { INSTALL } from './site.ts'
import SkillsShowcase from './SkillsShowcase.tsx'
import Terminal from './Terminal.tsx'
import { scrambleLines, useScramble } from './useScramble.tsx'

// The four requests from the docs' examples, each with the path it takes and the card it shows.
// Only the clipboard card is from a real run (`real`).
const GATE = [
  { prompt: 'fix the login thing', path: 2, title: 'Which did you mean?', actions: ['The PIN lockout', 'The expired session'] },
  { prompt: 'fix the clipboard so it clears after 30 seconds', path: 1, title: 'Sharpened prompt (fill-in)', actions: ['Send it', 'Run my original'], real: true },
  { prompt: 'rename getUser to fetchUser in src/api.ts', path: 0, title: 'Sharpened prompt (clear)', actions: ['Send it', 'Run my original'] },
  { prompt: 'set the plan price', path: 2, title: 'Set the plan price to [ASK: plan price].', actions: ['Fill it in', 'Run my original'] },
]

const PATHS = [
  ['Clear', 'Keep it', 'Stays as you typed it.'],
  ['Fill-in', 'Fill it in', 'Gaps filled from your code and chat.'],
  ['Ambiguous', 'Ask', 'Two readings, or a value only you know.'],
]

// The real fill-in run from the Sharpen README, as quoted in the docs.
const SHARPENED = [
  ['Goal', 'Change the clipboard clear for copied keys from 60 to 30 seconds.'],
  ['Where', 'apps/admin/src/lib/clipboard.ts:2'],
  ['Also update', 'generate.tsx, clipboard.test.ts, the PRD.'],
  ['Keep', 'Skip it if something else was copied.'],
  ['Hooks', 'dead-code-check runs after every edit.'],
  ['Check', 'The clipboard test passes.'],
]

// Two rows on purpose: five on top, four below.
const FEATURES = [
  ['Knows which one', 'Full briefs', 'No guessed values', '88 anti-patterns', 'Techniques built in'],
  ['Your setup, used', 'Knows the phase', 'Safety checks', 'Grounded in research'],
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

        <section id="how" className="section section-center reveal">
          <SectionHead index="01" label="How it works" title={<>One gate before<br /><span>every task.</span></>} lead="Pick a request. See where it goes." />
          <GateDemo />
        </section>

        <section id="features" className="section section-center reveal">
          <SectionHead index="02" label="What it adds" title={<>Same request.<br /><span>A prompt that can finish.</span></>} />
          <Flip />
          <div className="feature-pills">
            {FEATURES.map((row, r) => <ul key={r}>
              {row.map((name, i) => <li key={name} style={{ '--stagger-index': r * 5 + i } as CSSProperties}>{name}</li>)}
            </ul>)}
          </div>
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

function SectionHead({ index, label, title, lead }: { index: string; label: string; title: ReactNode; lead?: string }) {
  return <header className="section-head">
    <p className="section-eyebrow">{index} <span aria-hidden="true">·</span> {label}</p>
    <h2>{title}</h2>
    {lead && <p className="section-lead">{lead}</p>}
  </header>
}

/** Pick a request: the path it takes lights up, and the card it would show sits underneath. */
function GateDemo() {
  const [active, setActive] = useState(1)
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

  return <div className="gate">
    <div className="gate-requests" role="tablist" aria-label="Pick a request" onKeyDown={onKeyDown}>
      {GATE.map((g, i) => <button key={g.prompt} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === active} aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}>
        {g.prompt}
      </button>)}
    </div>
    <div className="gate-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
      <ol className="gate-paths">
        {PATHS.map(([tag, name, text], i) => <li key={tag} className={i === item.path ? 'gate-path is-lit' : 'gate-path'} aria-current={i === item.path ? 'true' : undefined}>
          <div className="gate-path-top"><span>0{i + 1}</span><span className="gate-tag">{tag}</span></div>
          <h3>{name}</h3>
          <p>{text}</p>
        </li>)}
      </ol>
      <div className="gate-result">
        <span className="gate-dot" aria-hidden="true" />
        <strong><span className="sr-only">{item.title}</span><ScrambleText>{item.title}</ScrambleText></strong>
        <span className="gate-actions" aria-hidden="true">{item.actions.map((a, j) => <FitPill key={j} label={a} className={j === 0 ? 'action-pill is-primary' : 'action-pill'} />)}</span>
        <span className="gate-source">{item.real ? 'Real run' : 'Example'}</span>
      </div>
    </div>
  </div>
}

/** A pill whose width eases to fit each new label, while the label fades in. */
function FitPill({ label, className }: { label: string; className: string }) {
  const text = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number>()
  useLayoutEffect(() => { if (text.current) setWidth(text.current.offsetWidth) }, [label])
  return <span className={`fit-pill ${className}`} style={width ? { width } : undefined}>
    <span ref={text} key={label}>{label}</span>
  </span>
}

/** One card, two faces: the line you type, or the brief Sharpen sends. Both share one grid cell so the card never jumps.
 * It opens on the line you type. After the mouse rests on the section for 3s (in view for 3s on touch screens) it flips once
 * to the brief, which scrambles in. A click takes over and stops the auto-flip. */
function Flip() {
  const [after, setAfter] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const auto = useRef(true)
  useEffect(() => {
    const section = ref.current?.closest('section')
    if (!section) return
    let timer = 0
    const arm = () => { if (auto.current && !timer) timer = window.setTimeout(() => { if (auto.current) { auto.current = false; setAfter(true) } }, 3000) }
    const disarm = () => { window.clearTimeout(timer); timer = 0 }
    const hover = window.matchMedia?.('(hover: hover)').matches ?? true
    if (!hover && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) arm(); else disarm() }, { threshold: 0.4 })
      io.observe(section)
      return () => { io.disconnect(); disarm() }
    }
    section.addEventListener('mouseenter', arm)
    section.addEventListener('mouseleave', disarm)
    return () => { section.removeEventListener('mouseenter', arm); section.removeEventListener('mouseleave', disarm); disarm() }
  }, [])
  const pick = (value: boolean) => { auto.current = false; setAfter(value) }

  return <div className="flip" ref={ref}>
    <div className={after ? 'flip-switch is-after' : 'flip-switch'} role="group" aria-label="Show">
      <span className="flip-thumb" aria-hidden="true" />
      <button type="button" aria-pressed={!after} onClick={() => pick(false)}>You type</button>
      <button type="button" aria-pressed={after} onClick={() => pick(true)}>Sharpen sends</button>
    </div>
    <div className="flip-card">
      <div className={after ? 'flip-before is-hidden' : 'flip-before'}>
        <p>“fix the clipboard so it clears after 30 seconds”</p>
        <span className="flip-meta">1 line · no file · no check</span>
      </div>
      <div className={after ? 'flip-after' : 'flip-after is-hidden'}>
        <ul>{SHARPENED.map(([tag, text]) => <li key={tag}><b>{tag}</b><span><span className="sr-only">{text}</span><ScrambleText key={String(after)}>{text}</ScrambleText></span></li>)}</ul>
        <span className="flip-meta">A real run from the README</span>
      </div>
    </div>
  </div>
}

function ScrambleText({ children }: { children: string }) {
  return <span aria-hidden="true">{scrambleLines(useScramble(children, 1000))}</span>
}
