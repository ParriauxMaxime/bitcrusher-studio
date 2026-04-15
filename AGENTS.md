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
