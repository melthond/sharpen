import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?!*-='
const STEP_MS = 45 // random characters refresh on this beat, not every frame, so the churn reads smooth
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

/** One line of a frame: the first `cut` characters show; the rest of `text` stays invisible and holds the line's space. */
export type ScrambleLine = { text: string; cut: number }

const clamp = (n: number) => Math.min(1, Math.max(0, n))
const ease = (n: number) => n * n * (3 - 2 * n)
// Fixed per position, so the same characters stay corrupted as the share grows.
const threshold = (i: number) => { const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453; return x - Math.floor(x) }

/**
 * Morphs one line at progress p (0..1): the old characters corrupt into random ones, the new text resolves left to right,
 * and the visible length slides from the old length to the new one (a longer old line pulls back from the right).
 */
export function morphLine(from: string, to: string, p: number): ScrambleLine {
  if (p >= 1) return { text: to, cut: to.length }
  const corrupt = ease(clamp(p / 0.45))
  const resolved = Math.floor(to.length * ease(clamp((p - 0.25) / 0.75)))
  const length = Math.max(resolved, Math.round(from.length + (to.length - from.length) * ease(clamp((p - 0.15) / 0.7))))
  let text = ''
  for (let i = 0; i < length; i++) {
    if (i < resolved) { text += to[i]; continue }
    const source = i < from.length ? from[i] : to[i] ?? ' '
    text += /\s/.test(source) ? source : i < from.length && threshold(i) >= corrupt ? source : glyph()
  }
  return { text: text + to.slice(length), cut: length }
}

/** Every line morphs on its own, all at once. Lines that only exist in the old text retract to nothing. */
export function scrambleAt(from: string, to: string, p: number): ScrambleLine[] {
  const a = from.split('\n'), b = to.split('\n')
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => morphLine(a[i] ?? '', b[i] ?? '', p))
}

const settled = (text: string) => text.split('\n').map((line) => ({ text: line, cut: line.length }))

/** Character-morph scramble: resolves in on load and morphs old text into new on change. Visual only; keep the real text in an sr-only node. */
export function useScramble(text: string, ms: number): ScrambleLine[] {
  const [lines, setLines] = useState(() => settled(text))
  const onScreen = useRef('')
  useEffect(() => {
    const from = onScreen.current
    onScreen.current = text
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
    const started = performance.now()
    let raf = 0, step = -1
    const tick = (now: number) => {
      const t = now - started
      if (still || t >= ms) { setLines(settled(text)); return }
      const s = Math.floor(t / STEP_MS)
      if (s !== step) { step = s; setLines(scrambleAt(from, text, t / ms)) }
      raf = requestAnimationFrame(tick)
    }
    tick(started)
    return () => cancelAnimationFrame(raf)
  }, [text, ms])
  return lines
}

/** Renders frame lines: the visible part shows, the rest stays invisible but keeps its space. */
export function scrambleLines(lines: ScrambleLine[]): ReactNode[] {
  return lines.map(({ text, cut }, i) => <Fragment key={i}>{text.slice(0, cut)}{cut < text.length && <span className="scramble-ghost">{text.slice(cut)}</span>}</Fragment>)
}
