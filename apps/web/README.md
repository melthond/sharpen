# Sharpen website

The source of [sharpen-site.vercel.app](https://sharpen-site.vercel.app): the landing page at `/` and the docs page at `/docs/`. It's built with React 19, Vite, Tailwind CSS 4 and TypeScript. This app has its own dependencies. The plugin itself still has none.

## Run it

```bash
cd apps/web
npm ci
npm run dev        # local dev server
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Vitest unit tests |
| `npm run lint` | Oxlint |
| `npm run typecheck` | `tsc` |
| `npm run build` | Type-check, client build, SSR build, then `scripts/prerender.mjs` writes real HTML for `/` and `/docs/` |
| `npm run preview` | Serve the built site |

CI (`.github/workflows/web.yml`) runs lint, test and build on every change to `apps/web/`. Vercel deploys from `main`.

## Where things live

| Path | What |
|---|---|
| `src/main.tsx` | Picks the landing page (`App.tsx`) or the docs page (`Docs.tsx`) by pathname, and hydrates the prerendered HTML |
| `src/App.tsx` | Landing page: hero, How it works, What it adds, skills, FAQ |
| `src/Docs.tsx` | Docs page: eleven numbered sections with a side index and a table of contents |
| `src/skills.ts` | Skill copy for both pages (`SKILLS` for the landing tiles, `SKILL_DOCS` for the docs cards) |
| `src/Faq.tsx` | The FAQ, shared by both pages |
| `src/site.ts` | The repo URL and install commands |
| `src/Terminal.tsx` | Every command block |
| `public/` | `llms.txt`, `sitemap.xml`, `robots.txt`, the Open Graph image, icons and diagrams |
| `vercel.json` | Redirects `/docs` to `/docs/` |

**Keep the copy in sync with the plugin.** If a skill, command, badge or file changes in the plugin, update the [README](../../README.md), `src/skills.ts`, `src/Docs.tsx` and `public/llms.txt` together.

For design, motion and the responsive checklist, see [`docs/landing-site.md`](docs/landing-site.md).
