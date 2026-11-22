import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Terminal from './Terminal.tsx'
import { SKILL_CARDS, SKILL_DOCS, SKILLS } from './skills.ts'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
// The sticker's 24-point star, in a 100×100 box.
const STAR = '50,0 59,13 75,7 77,23 93,25 87,41 100,50 87,59 93,75 77,77 75,93 59,87 50,100 41,87 25,93 23,77 7,75 13,59 0,50 13,41 7,25 23,23 25,7 41,13'

/** Companion skills: a sticky command list on the left, one two-panel card per skill on the right. */
export default function SkillsShowcase() {
  const [active, setActive] = useState(0)
  const anchors = useRef<(HTMLDivElement | null)[]>([])

  // The active skill is the last card whose top has passed 45% of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.45
      let next = 0
      anchors.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top < line) next = i })
      setActive(next)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function go(i: number) {
    setActive(i)
    anchors.current[i]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  return <section id="skills" className="skills reveal" aria-labelledby="skills-title">
    <div className="skills-inner">
      <header className="skills-head">
        <div>
          <p className="section-eyebrow">03 <span aria-hidden="true">·</span> Companion skills</p>
          <h2 id="skills-title">Ten skills, one plugin.<br /><span>Use one, or all of them.</span></h2>
        </div>
        <p className="section-lead">Sharpen runs on its own. These run when you call them: type <code>/sharpen:</code> in Claude Code, whether automatic review is on or off.</p>
      </header>
      <div className="skills-layout">
        <nav className="skills-nav" aria-label="Companion skills">
          <span className="skills-nav-bar" aria-hidden="true" style={{ transform: `translateY(${active * 100}%)` }} />
          {SKILLS.map(([name], i) => <button key={name} type="button" aria-current={i === active ? 'true' : undefined} onClick={() => go(i)}>{name}</button>)}
        </nav>
        <div className="skills-list">
          {SKILLS.map(([name, , detail], i) => <div key={name}>
            <div className="skill-anchor" id={`skill-${name}`} ref={(el) => { anchors.current[i] = el }} />
            <SkillCard index={i} name={name} detail={detail} />
          </div>)}
        </div>
      </div>
    </div>
  </section>
}

function SkillCard({ index, name, detail }: { index: number; name: string; detail: string }) {
  const [, use, , command] = SKILL_DOCS[index]
  const [phase] = SKILL_CARDS[index]
  const short = name.replace(/^sharpen-/, '')
  return <article className={`skill-card theme-${index % 3}`} aria-labelledby={`skill-title-${short}`}>
    <div className="skill-face">
      <span className="skill-sticker" aria-hidden="true">
        <svg viewBox="-4 -4 108 108"><polygon points={STAR} /></svg>
        {/* One inner element, so both lines center together in the star. */}
        <span><span>PHASE<br />{phase}</span></span>
      </span>
      <h3 id={`skill-title-${short}`}><span>sharpen-</span>{short}</h3>
      <p>{detail}</p>
      <p className="skill-use"><span>Best for</span>{use}</p>
      <Terminal commands={command} ariaLabel={`${name} command`} copyLabel={`Copy ${command}`} className="term-pill" />
      <a className="skill-doc" href="/docs/#skills">Read the docs <span aria-hidden="true">→</span></a>
    </div>
    <SkillChat index={index} command={command} />
  </article>
}

/** An example Claude Code exchange: your command, then the reply card. Rows rise in once when it scrolls into view. */
function SkillChat({ index, command }: { index: number; command: string }) {
  const [, title, lines, actions, note] = SKILL_CARDS[index]
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || !('IntersectionObserver' in window)) return
    // Hidden only once script runs, so prerendered and no-JS pages show the whole chat.
    el.classList.add('is-waiting')
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      el.classList.remove('is-waiting')
      io.disconnect()
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return <figure className="skill-chat" ref={ref}>
    <figcaption className="chat-bar"><span className="chat-dot" aria-hidden="true" />Claude Code<span className="chat-tag">Example</span></figcaption>
    <div className="chat-body">
      <p className="chat-you" style={{ '--i': 0 } as CSSProperties}><span className="sr-only">You: </span>{command}</p>
      <div className="chat-reply" style={{ '--i': 1 } as CSSProperties}>
        <p className="chat-from"><span aria-hidden="true">✳</span> Sharpen</p>
        <div className="chat-card">
          <strong>{title}</strong>
          <dl>{lines.map(([k, v], j) => <div key={j} style={{ '--i': j + 2 } as CSSProperties}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {actions.length > 0 && <div className="chat-actions" aria-hidden="true">{actions.map((a, j) => <span key={a} className={j === 0 ? 'is-primary' : undefined}>{a}</span>)}</div>}
        </div>
      </div>
      <p className="chat-note">{note}</p>
    </div>
  </figure>
}
