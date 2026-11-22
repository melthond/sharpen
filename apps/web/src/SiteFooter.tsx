import { REPO } from './site.ts'

/** Shared by both pages. The oversized logo is cropped to its top half (hair to blindfold) and rises from the bottom edge. */
export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <a className="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />Sharpen</a>
        <p>The prompt you meant, before any work starts.</p>
      </div>
      <nav aria-label="Footer">
        <a href="/docs/">Docs</a>
        <a href={REPO}>GitHub</a>
        <a href={`${REPO}/issues`}>Report an issue</a>
      </nav>
      <p className="footer-legal">MIT licensed · by ardfaiyaz</p>
    </div>
    <div className="footer-mark" aria-hidden="true"><img src="/logo.svg" alt="" /></div>
  </footer>
}

export function ArrowLink({ href, children }: { href: string; children: string }) {
  return <a className="arrow-link" href={href}>
    {children}
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </a>
}
