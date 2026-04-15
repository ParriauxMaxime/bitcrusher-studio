# Bitcrusher Studio Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap `bitcrusher-studio` — a React + Rsbuild static GH Pages portfolio for Quentin Ferreira-Castiço with SSG, 3 locales (fr/en/es), two themes (Graphite default, Mahogany alternate), Sveltia CMS, hybrid audio player, and a full SEO/a11y pass.

**Architecture:** Flat single-app repo. Rsbuild (rspack-powered) with its prerender plugin emits one HTML per route × locale. Content is markdown + YAML frontmatter validated by zod at build time; CMS edits are form-based via Sveltia. Theme = CSS custom properties toggled via `[data-theme]`. Fully static — no backend.

**Tech Stack:** React 19, TypeScript 5.9+ strict, Emotion `@emotion/react`, Rsbuild, Biome, i18next, react-i18next, ts-pattern, zod, gray-matter, node-web-audio-api, vitest, axe-core, Sveltia CMS.

**Spec:** `docs/superpowers/specs/2026-04-15-bitcrusher-studio-bootstrap-design.md`

---

## Phase Index

Work proceeds phase-by-phase. Each phase file contains its own task list. Complete all tasks in a phase before moving to the next.

| # | Phase | File | Outcome |
|---|---|---|---|
| 0 | Repo scaffold | [phase-0-scaffold.md](./bootstrap/phase-0-scaffold.md) | `npm run dev` opens a blank typed React app; biome + typecheck pass; git initialized. |
| 1 | Theme system & shell | [phase-1-theme-shell.md](./bootstrap/phase-1-theme-shell.md) | Graphite/Mahogany themes switch live; header/footer shell renders; no FOUC. |
| 2 | Content pipeline & i18n | [phase-2-content-i18n.md](./bootstrap/phase-2-content-i18n.md) | zod-typed markdown content emitted to `generated.ts`; i18next wired; schema tests pass. |
| 3 | Routing & pages | [phase-3-routing-pages.md](./bootstrap/phase-3-routing-pages.md) | Home / About / Works render per locale; prerender emits 13 HTML files; root splash redirects. |
| 4 | Audio player | [phase-4-audio-player.md](./bootstrap/phase-4-audio-player.md) | Hybrid player: canvas waveform for mp3, lazy iframe for SoundCloud/YouTube. |
| 5 | SEO & structured data | [phase-5-seo.md](./bootstrap/phase-5-seo.md) | Per-page meta, JSON-LD, hreflang, OG image generator, sitemap, robots. |
| 6 | CMS, CI & deploy | [phase-6-cms-ci-deploy.md](./bootstrap/phase-6-cms-ci-deploy.md) | Sveltia at `/admin/` wired; CI lints/typechecks/tests/builds/deploys to GH Pages; a11y smoke green. |
| 7 | Content migration & docs | [phase-7-content-docs.md](./bootstrap/phase-7-content-docs.md) | 4 featured projects migrated from wayback snapshot; CLAUDE.md + AGENTS.md + README finalized. |

---

## Global Conventions (apply in every task)

- **TDD:** write failing test → run to confirm failure → implement → run to confirm pass → commit. Skip the test-first cycle only for pure config files (tsconfig, biome, rsbuild config, workflows).
- **Commits:** gitmoji prefix (`🎉` init, `✨` feature, `🐛` fix, `♻️` refactor, `📝` docs, `🧪` tests, `⚡` perf, `🔧` config, `🚀` deploy, `🎨` style/UI).
- **TypeScript:** strict. No `any`. No `enum` keyword — use `as const` objects with `Enum` suffix. Prefer `import type { … }`.
- **Files:** kebab-case. Components `component-name.tsx`, hooks `use-hook-name.ts`.
- **Components:** ~100-line smell threshold. Use Emotion `css` prop, colocated.
- **Branching:** 3+ branches → `ts-pattern` `match().exhaustive()` over switch/if-else.
- **Test runner:** `vitest` (jsdom env for DOM tests, node env for build-time scripts).
- **Package manager:** `npm` (matches flopsed convention).

---

## Known Post-Bootstrap Follow-Ups

Deliberately out of the bootstrap plan — own spec/plan cycle each if/when requested:

- **Self-host fonts.** Plan's CSS references Inter / Instrument Serif / JetBrains Mono by family name; browser falls back to system serifs/sans until woff2s are added under `public/fonts/` with `@font-face` declarations. Spec §15.1 flags this.
- **CNAME file.** Add `public/CNAME` once `bitcrusher-studio.com` DNS is pointed at GH Pages.
- **OAuth Worker deployed.** `infra/oauth-worker/README.md` lists the `wrangler` steps; not executed by the plan.
- **EN/ES project translations.** Phase 7 Task 7.2 scaffolds en/es as fr copies with a `TRANSLATION PENDING` comment; Quentin fills via Sveltia.
- **Real audio files.** Phase 7 seeds text-only project files; dropping real mp3s under `public/media/projects/<slug>/` auto-triggers waveform generation.
- **Public theme switcher.** Dev-only today — ~20 LOC footer button once theme is finalized.

## Execution Handoff

After all seven phases complete, run the global verification:

```bash
npm run check && npm run typecheck && npm run test && npm run build
```

All exit 0. `dist/` contains 13 prerendered HTML files. Every page has title, meta description, JSON-LD, one `<h1>`. Axe reports zero critical violations on both themes.
