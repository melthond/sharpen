import { useEffect, useRef } from 'react'
import { fitCanvas, lineState, pathShape, pointAt, runWhileVisible } from '@/lib/hero-lines'

const GLYPHS = '.:+*#%@=-'
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]
const STEP_PX = 9 // spacing between characters along a line

// A glitched stretch of one line: `at` and `span` are fractions of the line's currently drawn stretch,
// so the glitch rides along with the line as it moves.
type Glitch = { path: SVGPathElement; id: number; position: number; at: number; span: number; born: number; life: number }

/**
 * Makes the hero's moving lines glitch into ASCII: short stretches of a line are covered and redrawn as flickering
 * characters along the line's own curve. Place inside .hero-bg after the FloatingPaths. Visual only, off under reduced motion.
 */
export default function AsciiGlitch() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true) return
    const canvas = ref.current
    const host = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !host || !context) return
    const paths = [...host.querySelectorAll<SVGPathElement>('path[data-line]')]
    if (!paths.length) return

    let glitches: Glitch[] = []
    let nextBurst = performance.now() + 1500

    // Same clock and timing as FloatingPaths, so the characters sit exactly on the line drawn in this frame.
    const stateOf = (g: Pick<Glitch, 'id' | 'position'>, now: number) => lineState(g.id, g.position, now)

    function spawn(now: number, count: number) {
      for (let i = 0; i < count; i++) {
        const path = paths[(Math.random() * paths.length) | 0]
        const g = { path, id: Number(path.dataset.line), position: Number(path.dataset.position) }
        if (stateOf(g, now).length < 0.08) continue
        glitches.push({ ...g, at: Math.random() * 0.8, span: 0.08 + Math.random() * 0.3, born: now, life: 150 + Math.random() * 650 })
      }
    }

    function draw(now: number) {
      const box = canvas!.getBoundingClientRect()
      context!.clearRect(0, 0, box.width, box.height)
      context!.font = '700 11px ui-monospace, Consolas, monospace'
      context!.textAlign = 'center'
      context!.textBaseline = 'middle'

      // Narrow screens pack the lines closer together, so glitch less there or the characters bury the lines.
      const density = Math.min(1, box.width / 1200)
      if (Math.random() < density) spawn(now, 3)
      if (now > nextBurst) { spawn(now, Math.round(40 * density)); nextBurst = now + 1200 + Math.random() * 2000 }
      glitches = glitches.filter((g) => now - g.born < g.life).slice(-200)
      const matrices = new Map<SVGSVGElement, DOMMatrix | null>() // one screen transform per <svg> per frame

      for (const g of glitches) {
        const { from, length, opacity } = stateOf(g, now)
        const svg = g.path.ownerSVGElement
        if (!svg || length < 0.02) continue
        if (!matrices.has(svg)) matrices.set(svg, svg.getScreenCTM())
        const matrix = matrices.get(svg)
        if (!matrix) continue
        const { total, points } = pathShape(g.path)
        const startAt = from + g.at * length
        const endAt = Math.min(from + length, startAt + g.span * length)
        const step = STEP_PX / (Math.hypot(matrix.a, matrix.b) * total) // as a 0-1 fraction of the path
        // Ease in and out so a stretch never pops between line and characters.
        const life = (now - g.born) / g.life
        const fade = Math.min(1, life * 6, (1 - life) * 3)
        const alpha = Math.min(1, 0.25 + Math.min(1, 0.1 + g.id * 0.03) * opacity) * fade
        for (let at = startAt; at <= endAt; at += step) {
          const [px, py] = pointAt(points, at)
          const x = matrix.a * px + matrix.c * py + matrix.e - box.left
          const y = matrix.b * px + matrix.d * py + matrix.f - box.top
          if (x < -8 || x > box.width + 8 || y < -8 || y > box.height + 8) continue
          context!.fillStyle = `rgba(255, 255, 255, ${fade})` // cover the stroke so this stretch reads as characters
          context!.fillRect(x - 4.5, y - 5.5, 9, 11)
          context!.fillStyle = `rgba(184, 54, 29, ${alpha})`
          context!.fillText(glyph(), x, y)
        }
      }
    }

    const unfit = fitCanvas(canvas, context)
    const stop = runWhileVisible(host, draw)
    return () => { stop(); unfit() }
  }, [])

  return <canvas ref={ref} className="hero-glitch" aria-hidden="true" />
}
