# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## What This Is

Bitcrusher Studio is the portfolio site of **Quentin Ferreira-Castiço** — sound designer and composer for audiovisual post-production and video games. The site is a React SSG hosted on GitHub Pages, with 3 locales (fr / en / es-ES), a Sveltia CMS for non-technical content editing, and two switchable visual themes.

Design spec: `docs/superpowers/specs/2026-04-15-bitcrusher-studio-bootstrap-design.md`.
Implementation plan: `docs/superpowers/plans/2026-04-15-bitcrusher-studio-bootstrap.md`.

## Commands

```bash
npm run dev          # content sync (watch) + rsbuild dev on :3000
npm run build        # prebuild + rsbuild build + sitemap
npm run typecheck    # tsc --noEmit
npm run check        # biome lint + format
npm run check:fix    # auto-fix
npm run test         # vitest (includes a11y smoke on dist/)
```

**CI runs `npm run check`, `npm run typecheck`, `npm run test`, `npm run build`.** All must pass before merge. A pre-commit hook running `npm run check --silent` is recommended locally.

## Stack

- **React 19** + **Emotion** (`@emotion/react`) via `css` prop — `jsxImportSource: "@emotion/react"` in tsconfig.
- **TypeScript strict** with `noUncheckedIndexedAccess` + `noImplicitOverride`. No `any`. No `enum` keyword — use `as const` + `Enum` suffix pattern.
- **Rsbuild** (rspack-powered) + custom postbuild prerender script (`scripts/postbuild.ts` — jsdom + react-dom/server). Emits one HTML per (locale × page) + 1 root splash = 13 files.
- **Biome** — tabs, recommended rules. `npm run check` is the only arbiter of style.
- **ts-pattern** for any 3+ branch logic. Always end with `.exhaustive()` or `.otherwise()`.
- **zod** — every content file validated at build time.
- **i18next** — UI strings only. Content lives in locale-specific markdown files, not in i18next namespaces.
- **Vitest** + jsdom for component/unit tests; built HTML is the a11y smoke target.

## Architecture

```
src/
  pages/             # route components — one directory per route
  components/        # shell/, audio-player/, theme-switcher-dev/
  content/           # zod schemas (types.ts), loader, generated.ts (build-emitted, gitignored)
  i18n/              # resources/{fr,en,es}/{ui,seo}.json + bootstrap
  theme/             # theme.css (CSS vars), tokens.ts (TS mirror), use-theme.ts
  lib/               # seo/ (json-ld, build-meta), audio/ (player-core)
  routes.ts          # single source of truth for SSG enumeration
  root.tsx           # ts-pattern router — one match branch per RouteKindEnum
  main.tsx           # StrictMode + hydrate/createRoot dispatch
content/             # friend-editable, mirrors locale structure
  pages/{fr,en,es}/*.md
  projects/{fr,en,es}/*.md
  site/{fr,en,es}.yml
scripts/
  prebuild.ts               # orchestrator
  sync-content-types.ts     # md → src/content/generated.ts
  generate-waveforms.ts     # mp3 → .peaks.json (mtime+hash cached)
  generate-og-images.ts     # svg template → sharp → png (md5 cached)
  postbuild.ts              # custom prerender script (jsdom + react-dom/server)
  emit-sitemap.ts           # post-build — walks dist/ for URLs
infra/oauth-worker/          # Cloudflare Worker for Sveltia GitHub OAuth
public/admin/                # Sveltia CMS shell + config.yml
```

### Import conventions

- Use `@/…` alias for all in-src imports (`@/theme/tokens`, `@/content/types`, …).
- Content files are loaded via the generated `@/content/generated` module, never at runtime.

## Content Model

Every markdown file has a typed schema in `src/content/types.ts`. Three top-level types:

| File pattern               | Schema                      |
|----------------------------|-----------------------------|
| `content/pages/*/*.md`     | `PageFrontmatterSchema`     |
| `content/projects/*/*.md`  | `ProjectFrontmatterSchema`  |
| `content/site/*.yml`       | `SiteCopySchema`            |

**Project frontmatter fields:** `slug`, `title`, `order`, `featured`, `year`, `roles` (multi-select), `tags`, `cover`, `audio` (discriminated union: `file` / `soundcloud` / `youtube`), `links`, `collaborators`.

**Schema change protocol:** edit `types.ts`, then run `npx tsx scripts/sync-content-types.ts` and mirror the change into `public/admin/config.yml` so Sveltia's form UI matches.

## Themes

CSS custom properties in `src/theme/theme.css`, with `[data-theme="graphite"]` (default) and `[data-theme="mahogany"]` blocks. Consume via `tokens` from `@/theme/tokens` (which re-exports `var(--…)` strings).

- Dev-only switcher: `src/components/theme-switcher-dev/` — tree-shaken in production via `process.env.NODE_ENV` check in `src/pages/layout.tsx`.
- User-facing switcher is intentionally **not shipped** at launch. Adding one = ~20 LOC footer component.
- Pre-hydration inline script in `src/index.html` reads URL/localStorage and sets `data-theme` before paint to prevent FOUC.

## i18n

- Three locales: `fr` (default), `en`, `es`. Declared in `src/content/types.ts` as `LocaleEnum`.
- UI strings: `src/i18n/resources/{fr,en,es}/ui.json`. Parity enforced by `tests/i18n/parity.test.ts`.
- Content strings: locale-specific markdown files. Each project has one file per locale.
- No runtime language detector — the one detection happens on the root `/` splash and only to issue a redirect.

## Routing

All routes declared in `src/routes.ts`:

```
/                → root-splash (language picker + auto-redirect)
/{locale}/       → home
/{locale}/about  → about
/{locale}/works  → works (expand-in-place via ?project=<slug>)
/{locale}/404    → not-found
```

Every route is prerendered. On client: route resolution is a `ts-pattern` match in `src/root.tsx`.

## Audio

- Self-hosted mp3: `FilePlayer` with canvas waveform (peaks generated at build). Put files under `public/media/projects/<slug>/` and reference `/media/projects/<slug>/<name>.mp3` in the project's `audio[]` frontmatter.
- SoundCloud / YouTube: `EmbedPlayer` with lazy iframe — no third-party JS loaded until user clicks play.
- Unified dispatch in `src/components/audio-player/index.tsx`.

## SEO

Every page carries title, description, canonical, OG tags, Twitter card, hreflang alternates (3 locales + x-default), and page-appropriate JSON-LD. All built by `src/lib/seo/` from content + routes.

OG images auto-generated per project × locale at build time (`scripts/generate-og-images.ts`). Template lives in the script; adjust colors to match themes.

## CMS (Sveltia)

- Admin shell: `public/admin/index.html` loads Sveltia from unpkg.
- Config: `public/admin/config.yml` mirrors the zod schemas as form widgets.
- Auth: GitHub OAuth via the Cloudflare Worker at `infra/oauth-worker/`. See that directory's README for deployment steps.

**Handover note:** Quentin uses `/admin/` on the production domain, not a local dev server. All his edits go through Sveltia's form UI and land as regular git commits via the OAuth worker.

## Deploy

- GH Actions: `lint → typecheck → test → build → deploy` (see `.github/workflows/ci.yml`).
- Pages artifact = `dist/`. Deploys only on push to `main`.
- Custom domain: `bitcrusher-studio.com` — add `public/CNAME` when DNS is pointed.

## Conventions

- **kebab-case** file names. Components `component-name.tsx`, hooks `use-hook-name.ts`.
- **Emotion `css` prop**, styles colocated, ~100-line smell threshold per component file.
- **No `any`**. Prefer `import type { … }` for type-only imports.
- **ts-pattern `match()`** over switch / if-else chains (3+ branches). Always `.exhaustive()`.
- **Enum pattern:** `const FooEnum = { a: "a", b: "b" } as const;` + `type FooEnum = (typeof FooEnum)[keyof typeof FooEnum]`. Name always ends in `Enum`.
- **No dead code**, no commented-out blocks.

## Gitmoji

`🎉` init · `✨` feature · `🐛` fix · `♻️` refactor · `🎨` style/UI · `⚡` perf · `🧪` tests · `📝` docs · `🔧` config · `🚀` deploy · `🌍` i18n
