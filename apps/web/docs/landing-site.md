# Sharpen website guide

## Routes and page structure

The home route `/` remains a single scrolling landing page. It contains the sticky header, viewport-height hero and review-card preview, four product steps, three plugin diagrams, six feature cards, the nine-card companion-skills bento, the install terminal, and the footer. The separate `/docs/` route is a user-requested field guide; it does not split the landing page into multiple routes.

The docs page follows the GitOwl guide-page hierarchy: a compact left section index, a central article with numbered sections, and a sticky right-hand table of contents on wide screens. The side index becomes a native disclosure on narrow screens. The guide covers setup and updates, the gate and prompt lifecycle, examples across bug/feature/refactor/question/operations requests, context gathering, prompt structure, review choices, all nine companion skills with sample invocations, controls, status badges, privacy, troubleshooting, and limitations. The full plugin README remains the canonical deep reference.

`src/main.jsx` selects the landing or docs page by pathname. `vercel.json` serves the Vite entry point at `/docs` and `/docs/`, and `public/sitemap.xml` lists both URLs.

## Design and motion

The Sharpen palette uses red `#dd4528`, dark red `#b8361d`, charcoal text, warm white surfaces, and thin peach-gray borders. The hero uses a native 2D canvas with an animated red ASCII wave, grid-like field, and pointer ripple. Headline text gets a visual-only ASCII scramble; its accessible text remains intact. Feature cards use a pointer-tracked radial spotlight and a small border lift. Scroll reveals and entrance timing use CSS and `IntersectionObserver`; sections and docs blocks fade out after leaving view and animate in again when they re-enter while scrolling back.

The motion references are [21st.dev's animated grid hero](https://docs.21st.dev/%40shadcnui-blocks/components/hero-07), the [21st.dev spotlight-card guide](https://news.21st.dev/blog/react-spotlight-effect-components), and GitOwl's native canvas ASCII backdrop, ASCII text morph, editorial documentation layout, and viewport-aware reveal patterns. The implementation uses plain React, CSS, Canvas, and browser APIs; it adds no npm dependency. The hero canvas pauses when hidden or off-screen, and every motion has a `prefers-reduced-motion: reduce` fallback.

Every command block uses the shared `src/Terminal.tsx` component: a white rounded pill with red `$` prompts, the character-morph scramble (replayed each time the pill scrolls into view, hidden from assistive technology while the real commands stay in an sr-only node), long commands that wrap inside the pill, and a 44px icon-only copy/check control (Lucide's `Copy` and `Check` paths, inline, so the project needs no icon package). Diagrams remain as scalable SVG files and fit the available layout width at every breakpoint rather than cropping inside a horizontal scroll strip.

## Responsive review checklist

At **390px** wide, check:

- The page has no horizontal scrollbar; the hero headline and its CTA buttons fit within the viewport.
- The three SVG diagrams scale to the content width and remain fully in view.
- The `All skills` navigation disclosure opens and closes; its menu stays inside the viewport. The Docs link is visible in the mobile header.
- The terminal commands remain readable; if a line exceeds the box, it scrolls inside the terminal rather than widening the page.
- The terminal copy icon, menu summary, menu items, and CTA buttons are at least 44px high/wide.
- On `/docs/`, the section index disclosure opens and closes, article content stays in one column, and install commands use the same light macOS terminal as the landing page.

At **768px** wide, check:

- The page has no horizontal scrollbar; the hero remains centered and the next section does not overlap its viewport-height area.
- The SVG diagrams scale inside their section widths without cropping.
- Navigation links, Docs, the skills disclosure, and GitHub button do not collide; the dropdown stays within the viewport.
- The terminal text stays within the terminal box, with local horizontal scrolling only when needed.
- All visible navigation and install controls remain at least 44px high/wide.
- The skills bento uses two columns and card content does not collide.
- On `/docs/`, the left index and article fit side by side; the right table of contents may be hidden below its desktop breakpoint, and the install terminal matches the landing page terminal.

The app sets `overflow-x: clip` at the body as a last guard, but individual wide content still needs local containment. The hero canvas is absolutely contained by `.hero { overflow: hidden; }`. The dropdown retains its desktop `right: 0` anchor and 15rem minimum width; at narrow widths it switches to fixed positioning and `width: min(15rem, calc(100vw - 1.5rem))`. SVGs scale with `width: 100%`; terminal `<pre>` elements use `overflow-x: auto` and `overscroll-behavior-inline: contain` so long commands scroll inside the terminal.

## Link-preview image

`public/og.svg` is the editable 1200×630 source and `public/og.png` is the raster image used by Open Graph, Twitter, and SoftwareApplication metadata. Keep their dimensions and tagline aligned when updating the artwork.
