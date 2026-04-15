# Bitcrusher Studio — Bootstrap Design

**Date:** 2026-04-15
**Owner:** Maxime (for Quentin Ferreira-Castiço / Bitcrusher Studio)
**Status:** Design — awaiting user review before plan generation

---

## 1. Purpose & Scope

Bootstrap a new static portfolio website (`bitcrusher-studio`) for Quentin Ferreira-Castiço — a sound designer and music composer focused on audiovisual post-production and video games, trading as **Bitcrusher Studio**. The site is hosted on GitHub Pages and replaces a previous WordPress site (fr-FR only, visually dated) captured on the Wayback Machine.

**Scope (in):** fresh React SSG portfolio, 3 locales (fr / en / es-ES), Sveltia CMS wiring for non-technical content updates, two themeable visual identities (Graphite default, Mahogany alternate), custom audio player with SoundCloud/YouTube fallback, full SEO/a11y pass, GH Pages deploy pipeline, `CLAUDE.md` + `AGENTS.md` for future agent sessions.

**Scope (out):** services page (deferred until Quentin requests), blog, contact form backend, analytics, e-commerce, custom backend of any kind, public theme switcher (dev-only for now).

**Handover assumption:** Quentin will maintain content via Sveltia CMS without dev tooling. He should not need to clone the repo to update a project description, upload an audio file, or add a new portfolio entry.

---

## 2. Existing Content (from Wayback snapshot)

Captured at `https://web.archive.org/web/20250201231847/http://bitcrusher-studio.com/`, downloaded to `_wayback/index.html` locally.

- **Artist:** Quentin Ferreira-Castiço — Sound Designer, trained at ACFA Multimédia Montpellier, music licence from Université de Strasbourg (Musiques Actuelles).
- **Studio name:** Bitcrusher Studio.
- **Tagline (fr):** "Musique & Sound Design pour Post Production Audiovisuelle et Jeux Vidéo".
- **Sections in the original:** single-page scroll — Reel, À propos, 4 featured projects (A Sound In The Forest, Space Piercer 2022, Lost In Zbeul, Dawn of Light 2021), Portfolio grid (Jeux Vidéo / Trailers-Films / Musique), Contact.
- **Socials:** `contact@bitcrusher-studio.com`, YouTube playlist `PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4`, LinkedIn `quentin-ferreira-castiço`, SoundCloud `user-836588138`.
- **Languages on the original:** fr-FR only.

All four featured projects and the Portfolio grid items will be migrated as individual project markdown files, one per locale, with Quentin later translating or editing via Sveltia.

---

## 3. Decisions

| Area | Decision | Reason |
|---|---|---|
| Build tool | Rsbuild (rspack-powered) + `@rsbuild/plugin-react` + prerender plugin | SSG is the highest-leverage SEO win on GH Pages; Rsbuild ships prerender built-in. |
| Repo shape | Flat single-app (no monorepo) | One app — workspaces add friction without payoff. |
| Language | TypeScript strict, ES2020 target, ESNext modules, bundler resolution | Matches flopsed base config. |
| Styling | Emotion `@emotion/react` with `css` prop, `jsxImportSource: "@emotion/react"` | Matches flopsed convention; themeable via CSS variables. |
| Lint/format | Biome `^2.x`, tabs, recommended rules | Matches flopsed. |
| Pattern matching | `ts-pattern` for any 3+ branch logic | Matches flopsed convention. |
| State | React state + URL. No Zustand needed (site is mostly static). | YAGNI for a portfolio. |
| i18n | `i18next` + `react-i18next`, **no** `i18next-browser-languagedetector` (SSG routes are authoritative) | Matches flopsed. Detection happens once at root splash; per-route is fixed. |
| Content | Markdown + YAML frontmatter, validated by `zod`, friend-edited via Sveltia | zod gives build-time failure on bad content; Sveltia form UI removes YAML friction. |
| CMS | Sveltia CMS, GitHub OAuth via Cloudflare Worker | Chosen for its i18n UX; OAuth proxy is ~20 lines on the Worker free tier. |
| Themes | Graphite (default) + Mahogany, CSS custom properties + `[data-theme]`, dev-only toggle | Preserves late-ship optionality at ~1 KB cost. |
| Routing | React Router `v7` (data routers), SSG-compatible | Prerender tool enumerates `createStaticHandler`-compatible routes. |
| Pages | `/`, `/{lang}/`, `/{lang}/about`, `/{lang}/works` | Works is a single page with expand-in-place project details. |
| Audio | Hybrid: custom canvas-waveform player for self-hosted `mp3`; SoundCloud/YouTube lazy iframe for URL-only entries | On-brand for a sound designer; degrades to embeds for legacy content. |
| Contact | `mailto:` link + SoundCloud / YouTube / LinkedIn icons in footer | No backend, no third-party dependency. |
| Analytics | None at launch | Privacy-first default; can add Plausible later in one commit if Quentin wants. |
| Testing | Vitest for units + a CI smoke that asserts meta/JSON-LD + axe-core a11y scan on built HTML | Covers what actually matters on a static portfolio. |
| Deploy | GitHub Actions → `actions/deploy-pages@v4` on main | Matches flopsed's `ci.yml`. |

---

## 4. Directory Layout

```
bitcrusher-studio/
├─ .github/workflows/ci.yml           # lint → typecheck → test → build → deploy
├─ public/
│  ├─ admin/                          # Sveltia CMS shell (index.html + config.yml)
│  ├─ fonts/                          # self-hosted variable fonts
│  ├─ media/                          # audio, images, OG assets (friend uploads via Sveltia)
│  │  └─ projects/<slug>/{cover.jpg, theme.mp3, theme.peaks.json, …}
│  ├─ og/                             # generated per-locale × per-project OG PNGs
│  └─ favicon.svg, robots.txt
├─ content/
│  ├─ pages/{fr,en,es}/{home,about}.md
│  ├─ projects/{fr,en,es}/<slug>.md
│  └─ site/{fr,en,es}.yml             # nav labels, footer copy, SEO meta defaults
├─ src/
│  ├─ pages/
│  │  ├─ home/        { index.tsx, hero.tsx, reel.tsx, featured.tsx }
│  │  ├─ about/       { index.tsx }
│  │  ├─ works/       { index.tsx, project-card.tsx, project-modal.tsx }
│  │  ├─ root-splash/ { index.tsx }    # language-detecting splash at /
│  │  └─ not-found/   { index.tsx }
│  ├─ components/
│  │  ├─ shell/       { header.tsx, footer.tsx, skip-link.tsx }
│  │  ├─ audio-player/{ player.tsx, waveform.tsx, embed-sc.tsx, embed-yt.tsx, controls.tsx }
│  │  ├─ language-switcher/
│  │  ├─ theme-switcher-dev/           # dev-only, tree-shaken in prod
│  │  └─ mdx/         { md-prose.tsx }  # typography wrapper for rendered markdown
│  ├─ content/        { loader.ts, types.ts (zod), generated.ts (build-emitted) }
│  ├─ i18n/
│  │  ├─ index.ts
│  │  └─ resources/{fr,en,es}/{ui,seo}.json
│  ├─ theme/          { theme.css, tokens.ts, use-theme.ts }
│  ├─ hooks/          { use-locale.ts, use-media-query.ts, use-reduced-motion.ts }
│  ├─ lib/
│  │  ├─ format.ts
│  │  ├─ seo/         { build-meta.ts, json-ld.ts, hreflang.ts }
│  │  └─ audio/       { peaks.ts, player-core.ts }
│  ├─ routes.ts                        # single source of truth for SSG enumeration
│  ├─ root.tsx                         # HTML shell + providers
│  └─ main.tsx
├─ scripts/
│  ├─ generate-waveforms.ts            # prebuild: mp3 → peaks.json (cached by mtime)
│  ├─ generate-og-images.ts            # prebuild: template + project cover → og/<slug>-<lang>.png
│  └─ sync-content-types.ts            # dev watcher: zod schema → generated.ts
├─ tests/
│  ├─ content.test.ts                  # every md file parses under its zod schema
│  ├─ i18n.test.ts                     # all locales have matching key sets
│  ├─ audio-player.test.ts
│  ├─ theme.test.ts
│  └─ smoke/
│     ├─ ssg-meta.test.ts              # every built HTML has title, description, JSON-LD
│     └─ a11y.test.ts                  # axe-core on every built page
├─ rsbuild.config.ts
├─ biome.json
├─ tsconfig.json
├─ package.json
├─ README.md
├─ CLAUDE.md
├─ AGENTS.md
├─ LICENSE                              # MIT, matches flopsed default
└─ .gitignore                           # node_modules, dist, .superpowers/, .DS_Store, coverage/
```

---

## 5. Content Model (zod schemas)

### 5.1 Project schema

```ts
// src/content/types.ts
import { z } from "zod";

export const AudioSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("file"),
    src: z.string().startsWith("/media/"),
    title: z.string().min(1),
    duration: z.number().positive().optional(),  // filled by generate-waveforms
  }),
  z.object({
    kind: z.literal("soundcloud"),
    url: z.string().url(),
    title: z.string().min(1),
  }),
  z.object({
    kind: z.literal("youtube"),
    url: z.string().url(),
    title: z.string().min(1),
  }),
]);

export const ProjectRoleEnum = {
  sound_design: "sound_design",
  music_composition: "music_composition",
  mixing: "mixing",
  mastering: "mastering",
  integration: "integration",
} as const;
export type ProjectRoleEnum =
  (typeof ProjectRoleEnum)[keyof typeof ProjectRoleEnum];

export const ProjectFrontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  order: z.number().int(),
  featured: z.boolean().default(false),
  year: z.number().int().gte(1990).lte(2100),
  roles: z.array(z.nativeEnum(ProjectRoleEnum)).min(1),
  tags: z.array(z.string()).default([]),
  cover: z.string().startsWith("/media/"),
  audio: z.array(AudioSchema).default([]),
  links: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .default([]),
  collaborators: z.array(z.string()).default([]),
});

export const PageFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  og_image: z.string().startsWith("/og/").optional(),
});

export const SiteCopySchema = z.object({
  nav: z.object({ home: z.string(), about: z.string(), works: z.string() }),
  footer: z.object({
    email: z.string().email(),
    copyright: z.string(),
    socials: z.array(
      z.object({
        kind: z.enum(["soundcloud", "youtube", "linkedin"]),
        url: z.string().url(),
        label: z.string(),
      }),
    ),
  }),
  seo: z.object({ site_name: z.string(), tagline: z.string() }),
});
```

### 5.2 Build flow

1. `scripts/sync-content-types.ts` parses `content/**/*.md` frontmatter with `gray-matter`, validates with zod, and emits `src/content/generated.ts` exporting typed arrays: `projectsByLocale`, `pagesByLocale`, `siteByLocale`. Runs in **two modes**: one-shot (invoked by `scripts/prebuild.ts`, see §12.1) and `--watch` (invoked by `npm run dev` as a parallel process to Rsbuild).
2. Rsbuild prerender plugin enumerates routes (see §6) from `src/routes.ts`, consuming the generated module.
3. Any schema violation fails the build with the file path + zod error.

### 5.3 Sveltia CMS config

`public/admin/config.yml` mirrors the zod schemas as CMS collections (`pages`, `projects`, `site`), using i18n with three locales. Sveltia renders form fields per type: dropdowns for enums, file upload for media, repeatable blocks for `audio[]` and `links[]`. Auth: GitHub OAuth via a Cloudflare Worker (deploy doc in `CLAUDE.md`).

---

## 6. Routing & SSG

### 6.1 Routes

```ts
// src/routes.ts
export const LOCALES = ["fr", "en", "es"] as const;
export const DEFAULT_LOCALE = "fr";

export const routes = [
  { path: "/", render: "root-splash" },
  ...LOCALES.flatMap((lang) => [
    { path: `/${lang}`, render: "home", lang },
    { path: `/${lang}/about`, render: "about", lang },
    { path: `/${lang}/works`, render: "works", lang },
    { path: `/${lang}/404`, render: "not-found", lang },
  ]),
];
```

Prerender emits:
`/index.html`, `/fr/index.html`, `/fr/about/index.html`, `/fr/works/index.html`, `/en/index.html`, … — 13 files at launch.

### 6.2 Root splash (`/`)

- Zero localized content — only the site logo, a tagline in all three languages, and three large `<a href="/fr/">` / `/en/` / `/es/` links.
- Inline `<script>` in `<head>` reads `navigator.language`, matches prefix (`fr*` → `/fr/`, `en*` → `/en/`, `es*` → `/es/`), else falls through to `/fr/`. Redirect via `window.location.replace`.
- Crawlers without JS follow the visible links; `<link rel="alternate" hreflang="…">` for each locale plus `hreflang="x-default"` pointing at `/fr/`.

### 6.3 Works expand-in-place

Works page prerenders as `/{lang}/works/index.html` with **every project's full content in the DOM** — each card renders as an `<article>` containing title, metadata, body copy, audio source list, and links. A crawler that does not execute JS sees the entire portfolio as static HTML. The "modal" is a UI convenience: clicking a card:
- Pushes `?project=<slug>` to the URL (reflected in address bar, shareable, bookmarkable).
- Reveals a dialog reading from the same markup already in the DOM (via portal + clone, or `<dialog>` element) — no network request, no content duplication.
- Escape / backdrop click / close-button all pop the state back.
- Keyboard: focus trap inside the dialog, focus returned to the clicked card on close.
- Direct load of `/{lang}/works?project=space-piercer` opens the dialog post-hydration.

---

## 7. Theme System

### 7.1 Tokens

```css
/* src/theme/theme.css */
:root,
[data-theme="graphite"] {
  --surface-base: linear-gradient(145deg, #2e2e33 0%, #18181c 100%);
  --surface-border: rgba(220, 200, 140, 0.1);
  --text-heading: #f0f0f2;
  --text-body: #b8b8c0;
  --text-muted: #8a8a92;
  --accent: #f5c44a;       /* brass */
  --led-a: #f5c44a;        /* amber */
  --led-b: #ff5a4a;        /* red peak */
  --led-c: #50c8b8;        /* teal */
  --led-off: #2a2a2e;
  --knob-hi: #55555a;
  --knob-lo: #1a1a1e;
}

[data-theme="mahogany"] {
  --surface-base:
    radial-gradient(ellipse at 30% 10%, #5a2a25 0%, transparent 50%),
    linear-gradient(145deg, #3a1b18 0%, #1d0d0b 100%);
  --surface-border: rgba(255, 215, 150, 0.12);
  --text-heading: #fbeacc;
  --text-body: #d4b088;
  --text-muted: #c99a5a;
  --accent: #f5c44a;
  --led-a: #f5c44a;
  --led-b: #ff5a4a;
  --led-c: #50c8b8;
  --led-off: #3a1b18;
  --knob-hi: #7a4035;
  --knob-lo: #2a100d;
}
```

### 7.2 TypeScript mirror

`src/theme/tokens.ts` exports:
```ts
export const tokens = {
  surface: { base: "var(--surface-base)", border: "var(--surface-border)" },
  text: { heading: "var(--text-heading)", body: "var(--text-body)", muted: "var(--text-muted)" },
  accent: "var(--accent)",
  led: { a: "var(--led-a)", b: "var(--led-b)", c: "var(--led-c)", off: "var(--led-off)" },
  knob: { hi: "var(--knob-hi)", lo: "var(--knob-lo)" },
} as const;
```

### 7.3 Switcher

- Inline `<script>` in `<head>`: `document.documentElement.dataset.theme = localStorage.getItem("theme") || "graphite";` — runs before CSS paint, zero flash.
- `use-theme.ts` exposes `{ theme, setTheme, cycleTheme }`; `setTheme` updates DOM + localStorage.
- `theme-switcher-dev` component: rendered only when `import.meta.env.DEV`; visible pill in the header + `⌘⇧T` / `Ctrl⇧T` keybind. Component file is tree-shaken in prod via `import.meta.env.DEV && <ThemeSwitcherDev />` pattern.
- `?theme=<name>` URL param also accepted on any page, wins over localStorage.

---

## 8. i18n

- Library: `i18next` + `react-i18next`.
- Namespaces: `ui`, `seo`. Namespace files live at `src/i18n/resources/{fr,en,es}/{ui,seo}.json`.
- **No `i18next-browser-languagedetector`** — per-route locale is bound at build time by route metadata, not inferred on the client. The only client-side language detection happens on the root splash (§6.2) and only to choose a one-time redirect.
- `src/i18n/index.ts` bootstraps i18next with all three locales preloaded (total JSON < 20 KB gzip).
- `use-locale.ts` returns the active locale from route context and updates `<html lang>`.
- Test: CI job asserts every key in `fr/*.json` also exists in `en/*.json` and `es/*.json` (and vice versa).
- For markdown-backed content (pages, projects, site copy), the locale is chosen by reading the correct file under `content/**/{fr,en,es}/**`.

---

## 9. Audio Player

### 9.1 Unified API

```ts
type AudioSource =
  | { kind: "file";       src: string; title: string; peaks?: string }
  | { kind: "soundcloud"; url: string; title: string }
  | { kind: "youtube";    url: string; title: string };

<AudioPlayer sources={project.audio} />
```

The component renders a tab/segmented control if multiple sources; each tab renders either `<FilePlayer />` or `<EmbedPlayer />`.

### 9.2 File player

- Uses a canvas-rendered waveform from a peaks JSON file (`Array<[min, max]>`, ~1000 buckets for a 3-minute track = ~12 KB gzipped).
- Peaks generated at build time by `scripts/generate-waveforms.ts` using `node-web-audio-api` (pure JS, no native system deps — keeps CI simple). Cached by `mp3 path → mtime + size` map stored at `public/media/.peaks-cache.json`. Duration extracted during the same pass and written back into the markdown frontmatter (idempotent: a no-op if already present).
- Play / pause / seek / time / volume / loop toggle. Fully keyboard accessible with ARIA roles.
- Respects `prefers-reduced-motion` — disables the playhead animation when set.

### 9.3 Embed player

- `<iframe loading="lazy">` only mounted after the user clicks play — avoids shipping SoundCloud/YouTube's JS on initial page load.
- Fallback link beneath: "Open in SoundCloud ↗" in case the iframe is blocked.

---

## 10. SEO

### 10.1 Per-page meta

Every prerendered route emits:
- `<title>` and `<meta name="description">` from the page/project frontmatter, localized.
- `<meta property="og:*">` and `<meta name="twitter:*">` with per-locale OG image.
- `<link rel="canonical">` pointing at the current URL.
- `<link rel="alternate" hreflang="…">` for every locale of the same resource + `hreflang="x-default"`.

### 10.2 Structured data

JSON-LD per page type:
- Home: `Organization` + `Person` (artist) + `WebSite` (with `potentialAction: SearchAction` if we add search later — not now).
- About: `ProfilePage` + `Person`.
- Works: `CollectionPage` referencing each project; **plus** a `CreativeWork` JSON-LD block inlined per project (inside each `<article>`) with `creator`, `dateCreated`, `genre`, `associatedMedia`. Because every project's markup lives in the prerendered HTML (§6.3), each `CreativeWork` is directly indexable.

Built by `src/lib/seo/json-ld.ts` from the typed content module — no duplication, single source of truth.

### 10.3 OG image generation

Prebuild script composites a template SVG with the project title + theme accent + cover image → PNG per project × locale. Skips if the combined mtime hasn't changed.

### 10.4 Sitemap + robots.txt

Emitted by an Rsbuild post-build hook that walks the prerendered HTML directory and lists every `index.html`. Includes lastmod from git commit of the source content file.

---

## 11. Accessibility

Baseline (all enforced in CI via axe-core on built HTML):

- Semantic landmarks: one `<header>`, `<main>`, `<footer>` per page; nav under `<nav>`; each project card is an `<article>`.
- Single `<h1>` per page; heading order strictly descending.
- Skip link to `<main>` as the first interactive element.
- Focus styles: visible `:focus-visible` ring using `--accent`, never `outline: none` without replacement.
- Modal: focus trap, `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the project title, `Esc` closes, focus returns to trigger.
- Audio player: `aria-label` on all controls, `role="slider"` on seek bar, keyboard arrows adjust.
- Color contrast: every text/background combination checked at AA minimum against both themes. Graphite + brass accent on dark fails AA for small amber-on-graphite body text (~3.1:1); brass is reserved for headings + accents, never body copy. Documented in `theme/tokens.ts` comments.
- Reduced motion: scroll-snap animations, waveform loading pulse, and theme transitions all disabled under `@media (prefers-reduced-motion: reduce)`.
- `lang` attribute per page; direction is always LTR (all three locales).

---

## 12. Build, CI, Deploy

### 12.1 `package.json` scripts

```
dev        rsbuild dev --open
build      tsx scripts/prebuild.ts && rsbuild build
check      biome check .
check:fix  biome check --fix .
typecheck  tsc --noEmit -p tsconfig.json
test       vitest run
test:a11y  vitest run tests/smoke/a11y.test.ts
```

`scripts/prebuild.ts` runs `sync-content-types` → `generate-waveforms` → `generate-og-images` in sequence.

### 12.2 CI (`.github/workflows/ci.yml`)

Mirrors flopsed's pattern — four jobs: `lint`, `typecheck`, `test`, `build`, with `deploy` gated on `build + main branch`. Uses `actions/setup-node@v4` with node 20, `actions/upload-pages-artifact@v3` pointing at `dist/`, `actions/deploy-pages@v4` final step. `concurrency: { group: pages, cancel-in-progress: true }`.

### 12.3 Branding + OAuth

- Custom domain: assume `bitcrusher-studio.com` (user owns the current one). Add `public/CNAME`. If domain is not yet pointed at Pages, fall back to `<username>.github.io/bitcrusher-studio/` — Rsbuild `output.assetPrefix` is a single env var to switch.
- Cloudflare Worker for Sveltia OAuth: 20-line worker, free tier covers usage. Env vars `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`. Deployment doc lives in `CLAUDE.md`.

---

## 13. Testing

| Test | Tool | What it proves |
|---|---|---|
| `content.test.ts` | vitest | Every md file parses under its zod schema. |
| `i18n.test.ts` | vitest | UI namespace key sets match across all locales. |
| `audio-player.test.ts` | vitest + jsdom | Player reducer handles play/pause/seek; source dispatch picks right component. |
| `theme.test.ts` | vitest + jsdom | `setTheme` writes DOM + localStorage; `cycleTheme` iterates list. |
| `smoke/ssg-meta.test.ts` | vitest (built HTML) | Every prerendered HTML has `<title>`, `<meta name="description">`, JSON-LD, and exactly one `<h1>`. |
| `smoke/a11y.test.ts` | vitest + axe-core | Zero critical or serious axe violations on any built page, for both themes. |

No e2e / Playwright for MVP.

---

## 14. Docs Delivered

- `README.md` — badges, short pitch, stack table, scripts, contributing (one-liner: run `npm i`, `npm run dev`).
- `CLAUDE.md` — follows flopsed's density: stack, conventions, architecture, content model, theme system, i18n rules, CMS OAuth setup, handover notes for Quentin, gitmoji convention.
- `AGENTS.md` — quick orientation, directory map, key commands, rules for agents (no `any`, no `enum`, kebab-case, Emotion `css` prop, `~100-line smell` threshold, ts-pattern), where specs/plans live.

---

## 15. Open Questions (to resolve before or during implementation)

1. **Fonts.** Propose: Inter (variable, UI), Instrument Serif or Fraunces (display italics for title emphasis), JetBrains Mono (micro-type). Self-hosted woff2 to avoid Google Fonts GDPR concerns. Confirmable post-design.
2. **Domain.** Does `bitcrusher-studio.com` still resolve to Quentin? If yes, add `CNAME`; if DNS is pending, use the Pages subpath and switch later.
3. **OG image art direction.** Quick template to propose during implementation — base: dark graphite surface + artist name + project title in brass serif italic + waveform flourish.
4. **Initial content migration.** Scope: port the 4 featured projects + Portfolio grid items as markdown stubs (fr first, en/es as TBD until Quentin fills), migrate the `À propos` paragraph verbatim, embed reel video link.

None of these block spec approval — they're resolved inside the implementation plan or during the first session with Quentin.

---

## 16. Success Criteria

The bootstrap is done when:

1. `npm install && npm run build` produces a `dist/` with 13 prerendered HTML files (1 splash + 12 locale pages), each with valid `<title>`, meta, OG tags, JSON-LD.
2. `npm run check`, `npm run typecheck`, `npm run test` all exit 0.
3. `npm run test:a11y` exits 0 with zero critical/serious violations against both themes.
4. Deploying to GH Pages (local push to a test fork is sufficient) serves the splash; `?theme=mahogany` on any locale page flips the palette with no FOUC; language switcher in the header routes correctly.
5. Sveltia admin loads at `/admin/`, authenticates via the Cloudflare Worker, and successfully commits an edit to a project file.
6. `CLAUDE.md` and `AGENTS.md` exist and are sufficient for a fresh agent session to resume work without reading this spec.
