import { useEffect, useState } from 'react'
import { REPO } from './site.ts'

/** Transparent over the hero; turns into a white bar once the page scrolls. `solid` keeps the white bar (docs page). */
export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const stars = useStars()

  useEffect(() => {
    if (solid) return
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [solid])

  return <header className={`site-header${solid ? ' is-solid' : ''}${scrolled ? ' is-scrolled' : ''}`}>
    <div className="site-header-inner">
      <a href="/" className="brand"><img src="/logo.svg" alt="" width="32" height="32" />Sharpen</a>
      <nav aria-label="Site" className="site-links">
        <a className="docs-link" href="/docs/" aria-current={solid ? 'page' : undefined}>Docs</a>
        <a className="gh-pill" href={REPO} aria-label={stars === null ? 'Sharpen on GitHub' : `Sharpen on GitHub, ${stars} stars`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="gh-icon"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>
          <span>GitHub</span>
          {stars !== null && <span className="gh-stars" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></svg>
            {stars}
          </span>}
        </a>
      </nav>
    </div>
  </header>
}

/** Live star count from the public GitHub API; null (hidden) while loading or if the request fails or is rate limited. */
function useStars() {
  const [stars, setStars] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('https://api.github.com/repos/ardfaiyaz/sharpen', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((repo) => {
        if (typeof repo?.stargazers_count === 'number') setStars(new Intl.NumberFormat('en', { notation: 'compact' }).format(repo.stargazers_count).toLowerCase())
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return stars
}
