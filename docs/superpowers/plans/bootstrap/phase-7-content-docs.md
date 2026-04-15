# Phase 7 — Content Migration & Docs

**Outcome:** The 4 featured projects from the Wayback snapshot are ported as fr markdown stubs; en/es project files created as copies (marked for translation); `CLAUDE.md`, `AGENTS.md`, `README.md` finalized; initial content visible at `/fr/works`.

**Prereq:** Phase 6 complete.

---

### Task 7.1: Port featured projects (fr)

**Files:**
- Modify: `content/projects/fr/space-piercer.md` (already exists from Phase 2)
- Create: `content/projects/fr/a-sound-in-the-forest.md`
- Create: `content/projects/fr/lost-in-zbeul.md`
- Create: `content/projects/fr/dawn-of-light.md`

Reference: the Wayback snapshot at `_wayback/index.html` has the source text. The concrete passages extracted during brainstorming are below — use them verbatim.

- [ ] **Step 1: `content/projects/fr/a-sound-in-the-forest.md`**

```markdown
---
slug: a-sound-in-the-forest
title: A Sound In The Forest
order: 2
featured: true
year: 2024
roles: [music_composition]
tags: [mobile, puzzle, onirique]
cover: /media/projects/a-sound-in-the-forest/cover.jpg
audio: []
links:
  - label: Concept art — Viktor Tounissoux
    url: https://www.artstation.com/viktortounissoux
collaborators: [Viktor Tounissoux]
---

Projet professionnel — puzzle game musical en vue isométrique prenant place dans un univers onirique, destiné au marché mobile. Je compose la musique, avec un thème principal et des extraits types de musique In Game.

Rendu 3D du concept art *A Sound in the Forest* réalisé par Viktor Tounissoux.
```

- [ ] **Step 2: `content/projects/fr/lost-in-zbeul.md`**

```markdown
---
slug: lost-in-zbeul
title: Lost In Zbeul — Game Cup 2021
order: 3
featured: true
year: 2021
roles: [sound_design, music_composition]
tags: [trailer, rogue-lite, multijoueur]
cover: /media/projects/lost-in-zbeul/cover.jpg
audio: []
links: []
collaborators: []
---

Trailer réalisé pour la présentation d'un Rogue-Lite multijoueur s'inspirant du jeu de plateau Labyrinthe, pour la Game Cup 2021. Bruitages et musique réalisés par mes soins.
```

- [ ] **Step 3: `content/projects/fr/dawn-of-light.md`**

```markdown
---
slug: dawn-of-light
title: Dawn of Light
order: 4
featured: true
year: 2021
roles: [music_composition, sound_design, integration]
tags: [game, steam]
cover: /media/projects/dawn-of-light/cover.jpg
audio: []
links:
  - label: Steam
    url: https://store.steampowered.com/app/1597950/Dawn_of_Light/
collaborators: [Objectif 3D, ACFA Multimédia]
---

Projet en partenariat avec l'école Objectif 3D et ACFA Multimédia. Composition et intégration de la musique In Game, réalisation musique et sound design du trailer (hors SFX In Game). Playlist de musiques non dynamiques réalisées pour le jeu disponible sur demande.
```

- [ ] **Step 4: Placeholder covers**

```bash
for slug in a-sound-in-the-forest lost-in-zbeul dawn-of-light; do
  mkdir -p "public/media/projects/$slug"
  cp public/media/projects/space-piercer/cover.jpg \
     "public/media/projects/$slug/cover.jpg"
done
```

- [ ] **Step 5: Commit**

```bash
git add content/projects/fr/ public/media/projects/
git commit -m "📝 feat: port 4 featured projects (fr) from Wayback snapshot"
```

---

### Task 7.2: Mirror projects to en/es (TBD translations)

Quentin will translate via Sveltia later. For now we want every project reachable in every locale.

- [ ] **Step 1: Copy fr files into en/es**

```bash
mkdir -p content/projects/en content/projects/es
for slug in space-piercer a-sound-in-the-forest lost-in-zbeul dawn-of-light; do
  cp "content/projects/fr/$slug.md" "content/projects/en/$slug.md"
  cp "content/projects/fr/$slug.md" "content/projects/es/$slug.md"
done
```

- [ ] **Step 2: Manually adjust the title lines in each copied file**

For each of the 8 copied files, prepend a comment line inside the markdown body (after frontmatter) indicating it needs translation:

Edit each `content/projects/en/<slug>.md` and prepend at the top of the body:

```markdown
<!-- TRANSLATION PENDING — EN -->
```

And for `content/projects/es/<slug>.md`:

```markdown
<!-- TRANSLATION PENDING — ES -->
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: sync-content-types loads all 12 projects (4 × 3 locales) without error.

- [ ] **Step 4: Commit**

```bash
git add content/projects/en/ content/projects/es/
git commit -m "📝 feat: scaffold en/es project stubs (pending translation)"
```

---

### Task 7.3: `README.md`

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write**

```markdown
<div align="center">

# Bitcrusher Studio

**Music & Sound Design for Audiovisual Post-Production and Video Games.**

Portfolio site for [Quentin Ferreira-Castiço](https://www.linkedin.com/in/quentin-ferreira-castiço) — _bitcrusher-studio.com_.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Rsbuild](https://img.shields.io/badge/Rsbuild-SSG-f92672)](https://rsbuild.dev/)
[![i18n](https://img.shields.io/badge/i18n-fr%20%C2%B7%20en%20%C2%B7%20es-fd971f)](#)

</div>

---

## Stack

| Layer        | Tech                                         |
|--------------|----------------------------------------------|
| UI           | React 19 + Emotion (`css` prop)              |
| Build        | Rsbuild (rspack) + prerender plugin          |
| Language     | TypeScript strict, ES2020                    |
| Lint / Format| Biome                                        |
| i18n         | i18next + react-i18next (fr / en / es)       |
| Content      | Markdown + YAML, zod-validated               |
| CMS          | Sveltia (via GitHub OAuth + CF Worker)       |
| Audio        | Canvas waveform + HTML5 audio + lazy iframes |
| Deploy       | GitHub Pages via Actions                      |

## Development

```bash
npm install
npm run dev          # parallel: content sync (watch) + rsbuild dev on :3000
npm run build        # prebuild (content, waveforms, OG) → rsbuild build → sitemap
npm run check        # biome lint + format
npm run check:fix    # auto-fix
npm run typecheck    # tsc --noEmit
npm run test         # vitest (includes a11y smoke on dist/)
```

## Structure

```
bitcrusher-studio/
├── content/            # markdown + YAML (edit here or via Sveltia)
├── public/
│   ├── admin/          # Sveltia CMS shell
│   ├── media/          # audio + images (friend-editable)
│   └── og/             # generated OG images
├── src/
│   ├── pages/          # one folder per route component
│   ├── components/     # shell, audio-player, theme-switcher-dev
│   ├── content/        # zod schemas + loader
│   ├── theme/          # CSS vars + hooks
│   ├── i18n/           # resources + bootstrap
│   └── lib/            # seo, audio core
├── scripts/            # prebuild, waveforms, OG, sitemap
└── infra/oauth-worker/ # Cloudflare Worker for Sveltia auth
```

## Themes

Two themes, switchable at runtime:
- **Graphite** — default, carbon/pro-audio-rack vibe
- **Mahogany** — warm mahogany + brass + teal

Dev: press `⌘⇧T` (or `Ctrl⇧T`) or append `?theme=mahogany` / `?theme=graphite` to any URL.

## License

MIT.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "📝 docs: README"
```

---

### Task 7.4: `CLAUDE.md`

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write**

```markdown
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
- **Rsbuild** (rspack-powered) + `rsbuild-plugin-pre-render`. Prerender emits one HTML per (locale × page) + 1 root splash = 13 files.
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

- Dev-only switcher: `src/components/theme-switcher-dev/` — tree-shaken in production via `process.env.NODE_ENV` check.
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "📝 docs: CLAUDE.md — full working guide for future agent sessions"
```

---

### Task 7.5: `AGENTS.md`

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Write**

```markdown
# AGENTS.md

Quick orientation for AI agents working on this codebase. Read `CLAUDE.md` for full context — this file is the TL;DR.

## What is this?

Static portfolio site for Quentin Ferreira-Castiço (Bitcrusher Studio) — sound designer for audiovisual post-production and video games. React 19 + Rsbuild SSG, deployed to GitHub Pages. 3 locales (fr default, en, es). Two switchable themes. Sveltia CMS for friend-edited content.

## Commands

```bash
npm run dev        # :3000
npm run build      # prebuild + rsbuild + sitemap
npm run typecheck
npm run check      # biome
npm run test       # vitest (includes a11y smoke)
```

## Map

```
src/
  pages/              → route components (home, about, works, root-splash, not-found, layout)
  components/         → shell, audio-player, theme-switcher-dev, head
  content/            → zod schemas + loader; generated.ts is the consumed source of truth at runtime
  i18n/               → UI strings (fr/en/es parity enforced in tests)
  theme/              → CSS vars + typed mirror + useTheme hook
  lib/seo/            → JSON-LD + meta builders
  lib/audio/          → player reducer (ts-pattern)
  routes.ts           → single source of truth for SSG + client resolver
  root.tsx            → ts-pattern route switch

content/              → friend-editable markdown + YAML, zod-validated at build
public/admin/         → Sveltia CMS shell
scripts/              → prebuild, waveforms, OG, sitemap
infra/oauth-worker/   → Cloudflare Worker for Sveltia auth
```

## Rules for Agents

### After changing anything in `content/`
Run `npx tsx scripts/sync-content-types.ts` (or `npm run dev` which watches). Zod will fail the build on malformed files.

### After changing `src/content/types.ts`
Mirror the change into `public/admin/config.yml` so Sveltia's form UI matches. Tests will fail if types drift.

### Code style (enforced by Biome)
- Tabs, ~100-line component smell threshold, kebab-case files.
- No `any`. No `enum`. Use `as const` + `Enum` suffix.
- `ts-pattern match()` over switch / if-else (3+ branches). Always `.exhaustive()`.
- Emotion `css` prop, styles colocated in the component file.
- No dead / commented-out code.
- Import alias: `@/…` for all `src` imports.

### Theme additions
Edit `src/theme/theme.css` — add a new `[data-theme="<name>"]` block. Extend `ThemeEnum` + `ALL_THEMES` in `src/theme/tokens.ts`. The dev switcher will pick it up automatically.

### Content model changes
Edit zod schema in `src/content/types.ts`, run `sync-content-types`, update `public/admin/config.yml` to match, update any existing markdown files.

### Commits
Use gitmoji. `🎉` init · `✨` feature · `🐛` fix · `♻️` refactor · `🎨` style · `⚡` perf · `🧪` tests · `📝` docs · `🔧` config · `🚀` deploy · `🌍` i18n.

## Architecture Invariants

- Every markdown / YAML file passes its zod schema or the build fails.
- `src/content/generated.ts` is emitted, not edited.
- Every page has exactly one `<h1>`.
- Every page passes axe-core `wcag2a + wcag2aa` with zero serious/critical violations in both themes.
- Every page has `<title>`, `<meta description>`, `<link rel="canonical">`, `hreflang` alternates, one or more JSON-LD blocks.
- UI strings go through `i18next`. Domain text (project descriptions, page bodies) lives in locale markdown.
- Modules do not import from other modules' internals — only from each module's `index.ts`.

## Docs

- Spec: `docs/superpowers/specs/2026-04-15-bitcrusher-studio-bootstrap-design.md`
- Plan: `docs/superpowers/plans/2026-04-15-bitcrusher-studio-bootstrap.md` (+ `bootstrap/phase-*.md`)
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "📝 docs: AGENTS.md quick-reference for agent sessions"
```

---

### Task 7.6: Phase 7 + Bootstrap sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run build && npm run test
```

All exit 0. `dist/` contains 13 HTML + sitemap.xml + robots.txt + og/*.png + admin/.

- [ ] **Step 2: Confirm success criteria from the spec**

```bash
find dist -name "index.html" | sort | wc -l    # → 13
grep -l '<title>' dist/fr/index.html dist/en/index.html dist/es/index.html
grep -l '<meta name="description"' dist/fr/index.html
cat dist/robots.txt
head -20 dist/sitemap.xml
```

All should produce expected output.

- [ ] **Step 3: Mark bootstrap complete**

```bash
git log --oneline | head -40
```

Bootstrap complete. The site is ready for:
1. Quentin to translate en/es content via Sveltia.
2. Real audio files to be uploaded (custom player will auto-render waveforms).
3. Domain DNS to be pointed at GH Pages + `CNAME` added.
4. OAuth Worker deployment (`infra/oauth-worker/README.md`).

Any future features (blog, services page, public theme switcher, analytics) become their own spec → plan cycle.
