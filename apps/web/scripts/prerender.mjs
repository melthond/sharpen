// Runs after `vite build` and the SSR build: fills each page's #root with real HTML and gives /docs/ its own meta.
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const SITE = 'https://sharpen-web-psi.vercel.app'
const { render } = await import(pathToFileURL('dist-ssr/entry-server.js').href)
const template = readFileSync('dist/index.html', 'utf8')

const DOCS = {
  title: 'Sharpen docs: install, review card, skills and commands',
  description: 'How to install Sharpen for Claude Code, what it reads, how the review card works, and which of the ten companion skills to use.',
}

function page(path, meta) {
  let html = template.replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`)
  if (meta) {
    const url = SITE + path
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
      .replace(/(<meta (?:name|property)="(?:og:|twitter:)?title" content=")[^"]*/g, `$1${meta.title}`)
      .replace(/(<meta (?:name|property)="(?:og:|twitter:)?description" content=")[^"]*/g, `$1${meta.description}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org', '@graph': [
          { '@type': 'TechArticle', headline: meta.title, description: meta.description, url, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#app` } },
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Sharpen', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Docs', item: url },
          ] },
        ],
      })}</script>`)
  }
  return html
}

const home = page('/')
const docs = page('/docs/', DOCS)

// Self-check: content is in the HTML, and /docs/ no longer claims to be the homepage.
assert.ok(!home.includes('<div id="root"></div>') && home.includes('fix the login thing'), 'home was not prerendered')
assert.ok(docs.includes('Make the prompt'), 'docs was not prerendered')
assert.ok(docs.includes(`<link rel="canonical" href="${SITE}/docs/"`) && docs.includes(`<title>${DOCS.title}</title>`), 'docs meta not replaced')

writeFileSync('dist/index.html', home)
mkdirSync('dist/docs', { recursive: true })
writeFileSync('dist/docs/index.html', docs)
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerendered / and /docs/')
