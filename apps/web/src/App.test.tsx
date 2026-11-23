// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.tsx'

const INSTALL = '/plugin marketplace add melthond/sharpen\n/plugin install sharpen@sharpen'

// No test may reach the real GitHub API.
beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline'))) })
afterEach(cleanup)
afterEach(() => { vi.unstubAllGlobals() })

test('renders the hero with only the headline, lead and install pill, and a header with Docs and GitHub', () => {
  const { container } = render(<App />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('It knows which one')
  expect(screen.queryByText('A Claude Code plugin')).toBeNull()
  expect(screen.queryByRole('link', { name: 'Install Sharpen' })).toBeNull()
  expect(container.querySelector('.review-preview')).toBeNull()
  expect(container.querySelector('.hero .install-pill .sr-only')!.textContent).toBe(INSTALL)

  const header = within(screen.getByRole('navigation', { name: 'Site' }))
  expect(header.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs/')
  expect(header.getByRole('link', { name: 'Sharpen on GitHub' }).getAttribute('href')).toBe('https://github.com/melthond/sharpen')
  expect(container.querySelector('#install')).toBeNull()
  for (const id of ['how', 'features', 'skills', 'faq']) expect(container.querySelector(`section#${id}`), id).not.toBeNull()
})

test('header is transparent at the top and turns solid after scrolling', () => {
  const { container } = render(<App />)
  const header = container.querySelector('.site-header')!
  const scrollTo = (y: number) => act(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
  })
  expect(header.classList.contains('is-scrolled')).toBe(false)
  scrollTo(120)
  expect(header.classList.contains('is-scrolled')).toBe(true)
  scrollTo(0)
  expect(header.classList.contains('is-scrolled')).toBe(false)
})

test('GitHub pill shows the live star count, and hides it when the API fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 1234 }) }))
  render(<App />)
  expect(await screen.findByRole('link', { name: 'Sharpen on GitHub, 1.2k stars' })).toBeTruthy()
  cleanup()

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
  const { container } = render(<App />)
  await waitFor(() => expect(fetch).toHaveBeenCalled())
  expect(container.querySelector('.gh-stars')).toBeNull()
})

test('hero install pill copies both install commands', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const { container } = render(<App />)
  fireEvent.click(within(container.querySelector<HTMLElement>('.install-pill')!).getByRole('button', { name: 'Copy install commands' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(INSTALL))
})

test('FAQ answers open and close, and closed answers cannot take focus', () => {
  const { container } = render(<App />)
  const question = within(container.querySelector<HTMLElement>('#faq')!).getByRole('button', { name: /Does Sharpen cost extra/ })
  const answer = document.getElementById(question.getAttribute('aria-controls')!)!
  expect(question.getAttribute('aria-expanded')).toBe('false')
  expect(answer.hasAttribute('inert')).toBe(true)
  fireEvent.click(question)
  expect(question.getAttribute('aria-expanded')).toBe('true')
  expect(answer.hasAttribute('inert')).toBe(false)
  fireEvent.click(question)
  expect(question.getAttribute('aria-expanded')).toBe('false')
})

test('docs terminal copies the install commands and announces success', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const Docs = (await import('./Docs.tsx')).default
  const { container } = render(<Docs />)
  const terminal = container.querySelector<HTMLElement>('.install-pill')!
  expect(terminal.querySelector('code')!.getAttribute('aria-hidden')).toBe('true')
  expect(terminal.querySelector(':scope > .sr-only')!.textContent).toContain('/plugin install sharpen@sharpen')

  fireEvent.click(within(terminal).getByRole('button', { name: 'Copy install commands' }))

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(INSTALL))
  expect(await within(terminal).findByRole('button', { name: 'Copied' })).toBeTruthy()
  expect(within(terminal).getByText('Copied', { selector: '[aria-live="polite"]' })).toBeTruthy()
})

test('docs header shows the floating paths and an install pill that copies the install commands', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const Docs = (await import('./Docs.tsx')).default
  const { container } = render(<Docs />)
  const hero = container.querySelector<HTMLElement>('.docs-hero')!
  expect(screen.getByRole('heading', { level: 1 }).closest('.docs-hero')).not.toBeNull()
  expect(hero.querySelector('.hero-bg svg')).not.toBeNull()
  const terminal = within(hero.querySelector<HTMLElement>('.install-pill')!)
  expect(hero.querySelector('.install-pill')!.getAttribute('aria-label')).toBe('Quick start install commands')
  fireEvent.click(terminal.getByRole('button', { name: 'Copy install commands' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(INSTALL))
  expect(await terminal.findByRole('button', { name: 'Copied' })).toBeTruthy()
})

test('renders the separate documentation page with section navigation', async () => {
  const Docs = (await import('./Docs.tsx')).default
  const { container } = render(<Docs />)

  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Make the prompt')
  for (const id of ['start', 'workflow', 'examples', 'context', 'review', 'skills', 'controls', 'status', 'privacy', 'updates', 'faq']) {
    expect(container.querySelector(`section#${id}`), id).not.toBeNull()
  }
  expect(screen.getByRole('navigation', { name: 'On this page' })).toBeTruthy()
  expect(within(screen.getByRole('navigation', { name: 'Site' })).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page')
  expect(container.querySelector('.install-pill')).not.toBeNull()
  expect(container.querySelectorAll('.skill-doc-card')).toHaveLength(10)
  expect(container.querySelectorAll('#faq .faq-item')).toHaveLength(8)
  expect(screen.getByText('REAL EXAMPLE · FILL-IN')).toBeTruthy()
  expect(container.querySelector('.docs-code')).toBeNull()
})

test('scroll reveals stay revealed after the section leaves view', () => {
  let observeEntries: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {}
  const unobserved: Element[] = []
  class TestIntersectionObserver {
    constructor(callback: typeof observeEntries) { observeEntries = callback }
    observe() {}
    unobserve(target: Element) { unobserved.push(target) }
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
  const { container } = render(<App />)
  const section = container.querySelector('#how')!

  observeEntries([{ target: section, isIntersecting: true }])
  expect(section.classList.contains('in')).toBe(true)
  expect(unobserved).toContain(section)
  observeEntries([{ target: section, isIntersecting: false }])
  expect(section.classList.contains('in')).toBe(true)
})

test('hero line timing loops without a snap and freezes under reduced motion', async () => {
  const { lineState } = await import('@/lib/hero-lines')
  for (const id of [0, 17, 35]) {
    const duration = (20 + ((id * 7) % 10)) * 1000
    const a = lineState(id, 1, 5000), b = lineState(id, 1, 5000 + duration)
    expect(b.from).toBeCloseTo(a.from)
    expect(b.length).toBeCloseTo(a.length)
    expect(a.from + a.length).toBeLessThanOrEqual(1)
  }
  expect(lineState(3, -1, 12345, true)).toEqual({ from: 0, length: 0.3, opacity: 0.3 })
})

test('documentation section list opens and closes as a native disclosure', async () => {
  const Docs = (await import('./Docs.tsx')).default
  render(<Docs />)
  const disclosure = document.querySelector<HTMLDetailsElement>('.docs-menu')!
  expect(disclosure.open).toBe(true)
  fireEvent.click(disclosure.querySelector('summary')!)
  expect(disclosure.open).toBe(false)
})

test('landing page: docs link under the hero, numbered sections in order, no diagrams', () => {
  const { container } = render(<App />)
  expect(within(container.querySelector<HTMLElement>('.hero')!).getByRole('link', { name: 'Read the docs' }).getAttribute('href')).toBe('/docs/')
  expect([...container.querySelectorAll('main > section')].map((s) => s.id || s.className)).toEqual(['hero', 'how', 'features', 'skills', 'faq'])
  expect([...container.querySelectorAll('.section-eyebrow')].map((e) => e.textContent!.slice(0, 2))).toEqual(['01', '02', '03', '04'])
  expect(container.querySelector('img[src^="/diagrams/"]')).toBeNull()
})

test('how it works: picking a request lights its path and switches the card, and arrow keys move between tabs', () => {
  const { container } = render(<App />)
  const how = container.querySelector<HTMLElement>('#how')!
  const tabs = within(how).getAllByRole('tab')
  const lit = () => how.querySelector('.gate-path.is-lit h3')!.textContent
  expect(tabs.map((t) => t.textContent)).toEqual(['fix the login thing', 'fix the clipboard so it clears after 30 seconds', 'rename getUser to fetchUser in src/api.ts', 'set the plan price'])
  expect(how.querySelectorAll('.gate-path')).toHaveLength(3)
  expect(how.querySelectorAll('.gate-path.is-lit')).toHaveLength(1)
  expect(tabs[1].getAttribute('aria-selected')).toBe('true')
  expect(lit()).toBe('Fill it in')
  expect(screen.getByRole('tabpanel').textContent).toContain('Real run')
  fireEvent.click(tabs[0])
  expect(lit()).toBe('Ask')
  expect(screen.getByRole('tabpanel').textContent).toContain('Which did you mean?')
  expect(screen.getByRole('tabpanel').textContent).toContain('Example')
  fireEvent.click(tabs[2])
  expect(lit()).toBe('Keep it')
  fireEvent.click(tabs[3])
  expect(lit()).toBe('Ask')
  expect(screen.getByRole('tabpanel').textContent).toContain('[ASK: plan price]')
  fireEvent.keyDown(tabs[3], { key: 'ArrowRight' })
  expect(tabs[0].getAttribute('aria-selected')).toBe('true')
  expect(document.activeElement).toBe(tabs[0])
})

test('what it adds: the card flips between the line you type and the brief from the real run', () => {
  const { container } = render(<App />)
  const features = container.querySelector<HTMLElement>('#features')!
  const [typed, sends] = within(features).getAllByRole('button')
  const before = features.querySelector('.flip-before')!, after = features.querySelector('.flip-after')!
  expect(sends.getAttribute('aria-pressed')).toBe('true')
  expect(before.classList.contains('is-hidden')).toBe(true)
  const rows = [...after.querySelectorAll('li')]
  expect(rows.map((r) => r.querySelector('b')!.textContent)).toEqual(['Goal', 'Where', 'Also update', 'Keep', 'Hooks', 'Check'])
  expect(rows[1].querySelector('.sr-only')!.textContent).toContain('apps/admin/src/lib/clipboard.ts:2')
  fireEvent.click(typed)
  expect(typed.getAttribute('aria-pressed')).toBe('true')
  expect(before.classList.contains('is-hidden')).toBe(false)
  expect(after.classList.contains('is-hidden')).toBe(true)
  expect(before.textContent).toContain('fix the clipboard so it clears after 30 seconds')
})

test('features: nine pills, five on the top row and four below', () => {
  const { container } = render(<App />)
  const rows = [...container.querySelectorAll('#features .feature-pills > ul')]
  expect(rows.map((r) => r.children.length)).toEqual([5, 4])
  const text = container.querySelector('#features .feature-pills')!.textContent!
  for (const s of ['88 anti-patterns', 'Knows the phase', 'Safety checks', 'Grounded in research']) expect(text).toContain(s)
  expect(text).not.toContain('52 anti-patterns')
  expect(container.querySelector('#skills h2')!.textContent).toContain('Ten skills')
})

test('skills section shows all ten skills as grid tiles, the first one featured', () => {
  const { container } = render(<App />)
  const tiles = container.querySelectorAll('#skills .skill-grid > .skill-tile')
  expect(tiles).toHaveLength(10)
  expect(tiles[0].classList.contains('is-featured')).toBe(true)
  expect(container.querySelectorAll('#skills .is-featured')).toHaveLength(1)
  tiles.forEach((tile) => {
    expect(tile.querySelector('.skill-phase')!.textContent).toMatch(/^[A-Z]+$/)
    expect(tile.querySelector('h3 a')!.getAttribute('href')).toBe('/docs/#skills')
    const command = tile.querySelector('.skill-cmd code')!.textContent!.replace(/^\$ /, '')
    expect(command).toMatch(/^\/sharpen:sharpen-[a-z]+$/)
    expect(tile.querySelector('.skill-copy')!.getAttribute('aria-label')).toBe(`Copy ${command}`)
  })
  expect(container.querySelector('#skills h2')!.textContent).toContain('Use one, or all of them.')
  expect(container.querySelector('#skills .skills-nav, #skills .skill-chat')).toBeNull()
})

test('footer shows a decorative half logo on both pages', async () => {
  const { container } = render(<App />)
  const mark = container.querySelector('.site-footer .footer-mark')!
  expect(mark.getAttribute('aria-hidden')).toBe('true')
  expect(mark.querySelector('img')!.getAttribute('src')).toBe('/logo.svg')
  cleanup()
  const Docs = (await import('./Docs.tsx')).default
  expect(render(<Docs />).container.querySelector('.site-footer .footer-mark')).not.toBeNull()
})
