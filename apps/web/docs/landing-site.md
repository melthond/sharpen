# Website design guide

How the site looks and moves, and what to check before shipping. For setup and file layout, see the [web README](../README.md).

## Pages

| Route | Structure |
|---|---|
| `/` | One scrolling page: sticky header, full-height hero with the install terminal, **01 How it works** (gate demo), **02 What it adds** (the before/after brief and feature list), **03 Skills** (ten tiles), **04 FAQ**, footer |
| `/docs/` | Guide layout: a section index on the left (a disclosure on narrow screens), the article with eleven numbered sections in the middle, and a sticky table of contents on the right (wide screens only) |

The plugin [README](../../../README.md) stays the full reference. The docs page covers the same topics in a form that's easier to scan.

## Design

- **Colours:** red `#dd4528`, dark red `#b8361d`, charcoal text, warm white surfaces, thin peach-gray borders.
- **Command blocks:** every one uses `src/Terminal.tsx`. It's a white rounded pill with red `$` prompts, long lines wrap, and a 44px copy button uses inline Lucide `Copy`/`Check` paths (no icon package). The scramble effect is hidden from screen readers, and the real commands sit in an sr-only node.
- **Diagrams:** SVG files that scale to the layout width at every breakpoint. They never get cropped.
- **Link preview:** `public/og.svg` is the editable 1200×630 source and `public/og.png` is what Open Graph and Twitter use. Keep their size and tagline matched.

## Motion

- The hero has animated floating paths, an ASCII glitch layer, and a headline that scrambles visually while its accessible text stays intact.
- Sections fade in **once** as they scroll into view (`IntersectionObserver`, then unobserve). They don't fade out again.
- Everything respects `prefers-reduced-motion: reduce`. The ASCII layer turns off entirely, and the paths stop moving.
- All of it is plain React, CSS, Canvas and browser APIs, with no animation library.

The motion is based on [21st.dev's animated hero](https://docs.21st.dev/%40shadcnui-blocks/components/hero-07) and GitOwl's ASCII backdrop and reveal patterns.

## Responsive checklist

Check these at **390px** and **768px**:

- [ ] No horizontal page scroll. The body sets `overflow-x: clip` as a last guard, but wide content still needs its own containment.
- [ ] The hero headline and buttons fit, and the next section doesn't overlap the hero.
- [ ] Diagrams scale to the content width without cropping (`width: 100%`).
- [ ] Terminal text stays inside its pill. Long lines wrap or scroll inside it (`overflow-x: auto`, `overscroll-behavior-inline: contain`).
- [ ] Every tap target (copy button, menu summary, menu items, buttons) is at least 44px.
- [ ] The header's brand, Docs link and GitHub pill don't collide.
- [ ] The skills grid uses two columns at 768px, and the cards don't collide.
- [ ] On `/docs/`, the section index opens and closes at 390px. At 768px the index and article sit side by side, and the table of contents may be hidden.
