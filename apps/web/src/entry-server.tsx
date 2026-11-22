import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import Docs from './Docs.tsx'

// Build-time only: scripts/prerender.mjs writes this HTML into each page so crawlers get the content without running JS.
export function render(path: string) {
  const Page = path === '/docs/' ? Docs : App
  return renderToString(<StrictMode><Page /></StrictMode>)
}
