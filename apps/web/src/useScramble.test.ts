import { expect, test } from 'vitest'
import { scrambleAt } from './useScramble.tsx'

test('backspaces the old text right to left, then types the new text left to right', () => {
  const cuts = [0, 100, 200, 300, 400, 500, 600].map((t) => scrambleAt('old text', 'new words', 400, t))
  // erase phase (first 200ms) shows the old text, shrinking
  expect(cuts[0]!.text).toHaveLength(8)
  expect(cuts[0]!.cut).toBeGreaterThan(cuts[1]!.cut)
  expect(cuts[1]!.text.startsWith('old')).toBe(true)
  // type phase shows the new text, growing
  expect(cuts[2]!.text).toHaveLength(9)
  expect(cuts[3]!.cut).toBeLessThan(cuts[5]!.cut)
  expect(cuts[5]!.text.startsWith('new')).toBe(true)
  expect(cuts[6]).toBeNull()
})

test('first load only types in', () => {
  expect(scrambleAt('', 'hello', 100, 0)!.text).toHaveLength(5)
  expect(scrambleAt('', 'hello', 100, 0)!.cut).toBe(3)
  expect(scrambleAt('', 'hello', 100, 100)).toBeNull()
})
