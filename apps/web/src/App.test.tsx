// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.tsx'

const INSTALL = '/plugin marketplace add ardfaiyaz/sharpen\n/plugin install sharpen@sharpen'

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
  expect(header.getByRole('link', { name: 'Sharpen on GitHub' }).getAttribute('href')).toBe('https://github.com/ardfaiyaz/sharpen')
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

test('how it works: picking a request switches the gate result, and arrow keys move between tabs', () => {
  const { container } = render(<App />)
  const tabs = within(container.querySelector<HTMLElement>('#how')!).getAllByRole('tab')
  expect(tabs).toHaveLength(4)
  expect(screen.getByRole('tabpanel').textContent).toContain('Which did you mean?')
  expect(screen.getByRole('tabpanel').textContent).toContain('Illustration')
  expect(container.querySelector('.gate-note, .gate-footnote')).toBeNull()
  expect(container.querySelector('#how')!.textContent).not.toContain('One action and a real location')
  fireEvent.click(tabs[1])
  expect(screen.getByRole('tabpanel').textContent).toContain('Real run')
  expect(screen.getByRole('tabpanel').textContent).not.toContain('Illustration')
  fireEvent.click(tabs[3])
  expect(tabs[3].getAttribute('aria-selected')).toBe('true')
  expect(screen.getByRole('tabpanel').textContent).toContain('[ASK: plan price]')
  fireEvent.keyDown(tabs[3], { key: 'ArrowRight' })
  expect(tabs[0].getAttribute('aria-selected')).toBe('true')
  expect(document.activeElement).toBe(tabs[0])
})

test('features reflect the current plugin: 88 anti-patterns, phases, safety checks, research sources', () => {
  const { container } = render(<App />)
  const text = container.querySelector('#features .feature-list')!.textContent!
  for (const s of ['88 anti-patterns', 'Knows the phase', 'Safety checks', 'Grounded in research']) expect(text).toContain(s)
  expect(text).not.toContain('52 anti-patterns')
  expect(container.querySelector('#skills h2')!.textContent).toContain('Ten skills')
})

test('skills section shows ten cards, each with a centered phase sticker, a command pill and an example chat', () => {
  const { container } = render(<App />)
  const cards = container.querySelectorAll('#skills .skill-card')
  expect(cards).toHaveLength(10)
  cards.forEach((card) => {
    expect(card.querySelector('.skill-sticker > span > span')!.textContent).toMatch(/^PHASE[A-Z]+$/)
    expect(card.querySelector('.install-pill .sr-only')!.textContent).toMatch(/^\/sharpen:sharpen-/)
    expect(card.querySelector('.skill-chat .chat-you')!.textContent).toContain('/sharpen:sharpen-')
    expect(card.querySelectorAll('.chat-card dl > div')).toHaveLength(3)
  })
  expect(container.querySelector('#skills h2')!.textContent).toContain('Use one, or all of them.')
})

test('skills nav marks the clicked skill and scrolls to its card', () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView
  const { container } = render(<App />)
  const nav = within(screen.getByRole('navigation', { name: 'Companion skills' }))
  const buttons = nav.getAllByRole('button')
  expect(buttons).toHaveLength(10)
  expect(buttons[0].getAttribute('aria-current')).toBe('true')
  fireEvent.click(nav.getByRole('button', { name: 'sharpen-split' }))
  expect(buttons[3].getAttribute('aria-current')).toBe('true')
  expect(buttons[0].getAttribute('aria-current')).toBeNull()
  expect(scrollIntoView.mock.contexts[0]).toBe(container.querySelector('#skill-sharpen-split'))
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
