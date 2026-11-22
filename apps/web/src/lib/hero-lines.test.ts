// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { SAMPLES, pointAt, shapeFromD } from './hero-lines'

describe('shapeFromD (analytic sampling, no getPointAtLength)', () => {
  it('samples a straight cubic evenly by arc length', () => {
    const { total, points } = shapeFromD('M0 0C0 0 100 0 100 0') // control points bunched at the ends
    expect(total).toBeCloseTo(100, 3)
    expect(points.length).toBe((SAMPLES + 1) * 2)
    // Even spacing along the length, even though the curve's t-speed is uneven.
    for (const at of [0, 0.25, 0.5, 0.75, 1]) expect(pointAt(points, at)[0]).toBeCloseTo(100 * at, 1)
  })

  it('chains several cubics and keeps the end points exact', () => {
    const { total, points } = shapeFromD('M0 0C0 0 0 50 0 50C0 50 50 50 50 50')
    expect(total).toBeCloseTo(100, 2)
    expect(pointAt(points, 0)).toEqual([0, 0])
    const [ex, ey] = pointAt(points, 1)
    expect(ex).toBeCloseTo(50, 5); expect(ey).toBeCloseTo(50, 5)
    const [mx, my] = pointAt(points, 0.5)
    expect(mx).toBeCloseTo(0, 1); expect(my).toBeCloseTo(50, 1) // the corner sits at half the length
  })

  it('parses the hero path format, including negative numbers', () => {
    const d = 'M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875'
    const { total, points } = shapeFromD(d)
    expect(pointAt(points, 0)).toEqual([-380, -189])
    const [ex, ey] = pointAt(points, 1)
    expect(ex).toBeCloseTo(684, 3); expect(ey).toBeCloseTo(875, 3)
    expect(total).toBeGreaterThan(Math.hypot(684 + 380, 875 + 189)) // a curve is longer than its chord
  })
})
