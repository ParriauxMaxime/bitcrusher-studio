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

| Layer         | Tech                                                            |
|---------------|-----------------------------------------------------------------|
| UI            | React 19 + Emotion (`css` prop)                                 |
| Build         | Rsbuild (rspack) + custom postbuild prerender (jsdom)           |
| Language      | TypeScript strict, ES2020                                       |
| Lint / Format | Biome                                                           |
| i18n          | i18next + react-i18next (fr / en / es)                          |
| Content       | Markdown + YAML, zod-validated                                  |
| CMS           | Sveltia (via GitHub OAuth + CF Worker)                          |
| Audio         | Canvas waveform + HTML5 audio + lazy iframes                    |
| Deploy        | GitHub Pages via Actions                                        |

## Development

```bash
npm install
npm run dev          # parallel: content sync (watch) + rsbuild dev on :3000
npm run build        # prebuild (content, waveforms, OG) → rsbuild build → postbuild (prerender) → sitemap
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
│   ├── components/     # shell, audio-player, theme-switcher-dev, head
│   ├── content/        # zod schemas + loader
│   ├── theme/          # CSS vars + hooks
│   ├── i18n/           # resources + bootstrap
│   └── lib/            # seo, audio core
├── scripts/            # prebuild, waveforms, OG, sitemap, postbuild
└── infra/oauth-worker/ # Cloudflare Worker for Sveltia auth
```

## Themes

Two themes, switchable at runtime:
- **Graphite** — default, carbon/pro-audio-rack vibe
- **Mahogany** — warm mahogany + brass + teal

Dev: press `⌘⇧T` (or `Ctrl⇧T`) or append `?theme=mahogany` / `?theme=graphite` to any URL.

## License

MIT.
