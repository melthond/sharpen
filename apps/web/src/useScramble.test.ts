import { expect, test } from 'vitest'
import { morphLine, scrambleAt } from './useScramble.tsx'

const OLD = '# Install and authenticate (one-time)'
const NEW = '# pip install firecrawl'
const shown = (l: { text: string; cut: number }) => l.text.slice(0, l.cut)

test('corrupts the old text first, then resolves the new text left to right', () => {
  const early = shown(morphLine(OLD, NEW, 0.05))
  expect(early).toHaveLength(OLD.length)
  const kept = [...early].filter((c, i) => c === OLD[i]).length
  expect(kept).toBeGreaterThan(OLD.length / 2) // mostly old, a few characters corrupted
  expect(kept).toBeLessThan(OLD.length)

  let resolved = 0
  for (let p = 0.3; p < 1; p += 0.1) {
    const text = shown(morphLine(OLD, NEW, p))
    let n = 0
    while (n < text.length && text[n] === NEW[n]) n++
    expect(n).toBeGreaterThanOrEqual(resolved) // the resolved prefix only grows
    resolved = n
  }
  expect(morphLine(OLD, NEW, 1)).toEqual({ text: NEW, cut: NEW.length })
})

test('a longer old line pulls back from the right; a shorter one grows', () => {
  const lengths = [0, 0.2, 0.4, 0.6, 0.8, 0.95].map((p) => morphLine(OLD, NEW, p).cut)
  expect(lengths[0]).toBe(OLD.length)
  for (let i = 1; i < lengths.length; i++) expect(lengths[i]).toBeLessThanOrEqual(lengths[i - 1])
  expect(lengths.at(-1)).toBeLessThan(OLD.length)

  const grow = [0, 0.3, 0.6, 0.9].map((p) => morphLine('', NEW, p))
  expect(grow[0].cut).toBe(0)
  expect(grow[0].text).toBe(NEW) // untyped text still holds its space
  expect(grow[3].cut).toBeGreaterThan(grow[1].cut)
})

test('spaces stay spaces and every line morphs on its own', () => {
  const lines = scrambleAt('ab cd\nlong old line\nextra', 'xy zw\nnew', 0.2)
  expect(lines).toHaveLength(3)
  expect(shown(lines[0])[2]).toBe(' ')
  expect(scrambleAt('a\nb\nc', 'x', 1).map(shown)).toEqual(['x', '', ''])
})
