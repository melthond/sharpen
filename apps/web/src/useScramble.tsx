import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'

const GLYPHS = '.:+*#'
const BAND = 3 // scramble glyphs riding at the cursor

/** One frame: `text` keeps its full length so lines hold their place; only the first `cut` characters are visible. */
export type ScrambleFrame = { text: string; cut: number }

function frame(text: string, typed: number): ScrambleFrame {
  const cut = Math.min(text.length, typed + BAND)
  const band = [...text.slice(typed, cut)].map((c) => /\s/.test(c) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('')
  return { text: text.slice(0, typed) + band + text.slice(cut), cut }
}

/** Where the animation is `t` ms in: erase `from` right to left (half of `ms`), then type `to` left to right (`ms`). */
export function scrambleAt(from: string, to: string, ms: number, t: number): ScrambleFrame | null {
  const erase = from ? ms / 2 : 0
  if (t < erase) return frame(from, Math.round(from.length * (1 - t / erase)))
  const progress = (t - erase) / ms
  return progress < 1 ? frame(to, Math.floor(progress * to.length)) : null
}

/** ASCII scramble that types in on load and backspaces the old text before typing a new one. Visual only; keep the real text in an sr-only node. */
export function useScramble(text: string, ms: number): ScrambleFrame {
  const [state, setState] = useState<ScrambleFrame>({ text, cut: text.length })
  const onScreen = useRef('')
  useEffect(() => {
    const from = onScreen.current
    onScreen.current = text
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
    const started = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const next = still ? null : scrambleAt(from, text, ms, now - started)
      setState(next ?? { text, cut: text.length })
      if (next) raf = requestAnimationFrame(tick)
    }
    tick(started)
    return () => cancelAnimationFrame(raf)
  }, [text, ms])
  return state
}

/** Splits a frame into lines: the typed part shows, the rest stays invisible but keeps its space. */
export function scrambleLines({ text, cut }: ScrambleFrame): ReactNode[] {
  let start = 0
  return text.split('\n').map((line, i) => {
    const shown = Math.max(0, Math.min(line.length, cut - start))
    start += line.length + 1
    return <Fragment key={i}>{line.slice(0, shown)}{shown < line.length && <span className="scramble-ghost">{line.slice(shown)}</span>}</Fragment>
  })
}
