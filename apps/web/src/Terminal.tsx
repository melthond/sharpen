import { useEffect, useRef, useState } from 'react'
import CopyButton from './CopyButton.tsx'
import { scrambleLines, useScramble } from './useScramble.tsx'

/** Every command block on the site: a white pill with red `$` prompts, a copy icon, and the morph scramble. */
export default function Terminal({ commands, ariaLabel, copyLabel = 'Copy install commands', className = '' }: { commands: string; ariaLabel: string; copyLabel?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [runs, setRuns] = useState(0)
  // Replays the type-in each time the pill scrolls into view, going down or back up.
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setRuns((n) => n + 1) }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return <div className={`install-pill ${className}`.trim()} ref={ref} role="group" aria-label={ariaLabel}>
    {/* A new key remounts the text, which replays the type-in while each line keeps its full width reserved. */}
    <code aria-hidden="true"><Typed key={runs} text={commands} /></code>
    <span className="sr-only">{commands}</span>
    <CopyButton className="pill-copy" text={commands} label={copyLabel} />
  </div>
}

function Typed({ text }: { text: string }) {
  return <>{scrambleLines(useScramble(text, 900)).map((line, i) => <span key={i}><b>$</b> {line}</span>)}</>
}
