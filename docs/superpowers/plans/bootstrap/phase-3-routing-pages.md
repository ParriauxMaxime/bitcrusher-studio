# Phase 3 — Routing & Pages

**Outcome:** `src/routes.ts` declares every `(locale, page)` combination; Rsbuild prerender plugin emits 13 HTML files under `dist/` (1 splash + `{fr,en,es} × {home, about, works, not-found}`); root splash client-detects language and redirects; header + footer consume i18next + site copy.

**Prereq:** Phase 2 complete.

---

### Task 3.1: Route registry

**Files:**
- Create: `src/routes.ts`

- [ ] **Step 1: Write `src/routes.ts`**

```ts
import { ALL_LOCALES, type LocaleEnum } from "@/content/types";

export const RouteKindEnum = {
	root_splash: "root_splash",
	home: "home",
	about: "about",
	works: "works",
	not_found: "not_found",
} as const;
export type RouteKindEnum =
	(typeof RouteKindEnum)[keyof typeof RouteKindEnum];

export interface RouteSpec {
	path: string;
	kind: RouteKindEnum;
	locale?: LocaleEnum;
}

export const ROUTES: RouteSpec[] = [
	{ path: "/", kind: RouteKindEnum.root_splash },
	...ALL_LOCALES.flatMap((locale): RouteSpec[] => [
		{ path: `/${locale}`, kind: RouteKindEnum.home, locale },
		{ path: `/${locale}/about`, kind: RouteKindEnum.about, locale },
		{ path: `/${locale}/works`, kind: RouteKindEnum.works, locale },
		{ path: `/${locale}/404`, kind: RouteKindEnum.not_found, locale },
	]),
];

export const allPrerenderPaths = (): string[] => ROUTES.map((r) => r.path);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes.ts
git commit -m "✨ feat: route registry (locale × page matrix)"
```

---

### Task 3.2: Root splash page

**Files:**
- Create: `src/pages/root-splash/index.tsx`

- [ ] **Step 1: Write `src/pages/root-splash/index.tsx`**

```tsx
import { css } from "@emotion/react";
import { ALL_LOCALES } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	container: css`
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 32px;
	`,
	card: css`
		display: flex;
		flex-direction: column;
		gap: 24px;
		text-align: center;
		max-width: 520px;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 42px;
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
	`,
	tagline: css`
		color: ${tokens.text.muted};
		font-size: 14px;
		line-height: 1.6;
	`,
	links: css`
		display: flex;
		gap: 16px;
		justify-content: center;
		a {
			font-family: "JetBrains Mono", ui-monospace, monospace;
			font-size: 12px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: ${tokens.text.body};
			text-decoration: none;
			padding: 10px 16px;
			border: 1px solid ${tokens.surface.border};
			border-radius: 4px;
			&:hover {
				color: ${tokens.accent};
				border-color: ${tokens.accent};
			}
		}
	`,
};

const TAGLINES: Record<string, string> = {
	fr: "Musique & Sound Design pour post-production audiovisuelle et jeux vidéo",
	en: "Music & Sound Design for audiovisual post-production and video games",
	es: "Música y Diseño de Sonido para postproducción audiovisual y videojuegos",
};

export const RootSplash = () => (
	<div css={styles.container}>
		<div css={styles.card}>
			<h1 css={styles.brand}>
				Bitcrusher <em>Studio</em>
			</h1>
			<p css={styles.tagline}>
				{TAGLINES.fr}
				<br />
				{TAGLINES.en}
				<br />
				{TAGLINES.es}
			</p>
			<nav css={styles.links} aria-label="Language">
				{ALL_LOCALES.map((loc) => (
					<a key={loc} href={`/${loc}/`} hrefLang={loc}>
						{loc === "fr"
							? "Français"
							: loc === "en"
								? "English"
								: "Español"}
					</a>
				))}
			</nav>
		</div>
	</div>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/root-splash/
git commit -m "✨ feat: root splash page (accessible language picker)"
```

---

### Task 3.3: Home / About / Works pages

**Files:**
- Create: `src/pages/home/index.tsx`
- Create: `src/pages/about/index.tsx`
- Create: `src/pages/works/index.tsx`
- Create: `src/pages/not-found/index.tsx`

- [ ] **Step 1: `src/pages/home/index.tsx`**

```tsx
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import type { LocaleEnum, Page, Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	hero: css`
		padding: 96px 0 48px;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(48px, 8vw, 96px);
		color: ${tokens.text.heading};
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 24px;
	`,
	lede: css`
		color: ${tokens.text.body};
		font-size: 18px;
		line-height: 1.6;
		max-width: 620px;
	`,
	featured: css`
		margin-top: 80px;
	`,
	h2: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0 0 24px;
	`,
	grid: css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	`,
	card: css`
		border: 1px solid ${tokens.surface.border};
		padding: 20px;
		border-radius: 6px;
		text-decoration: none;
		color: ${tokens.text.heading};
		display: flex;
		flex-direction: column;
		gap: 6px;
		&:hover {
			border-color: ${tokens.accent};
		}
	`,
	cardMeta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
	`,
};

export interface HomeProps {
	locale: LocaleEnum;
	page: Page;
	featured: Project[];
}

export const Home = ({ locale, page, featured }: HomeProps) => {
	const { t } = useTranslation();
	return (
		<>
			<section css={styles.hero}>
				<h1 css={styles.brand}>
					Bitcrusher <em>Studio</em>
				</h1>
				<p css={styles.lede}>{page.body}</p>
			</section>
			<section css={styles.featured} aria-labelledby="featured-heading">
				<h2 id="featured-heading" css={styles.h2}>
					{t("home.featured_title")}
				</h2>
				<div css={styles.grid}>
					{featured.map((p) => (
						<a
							key={p.slug}
							href={`/${locale}/works?project=${p.slug}`}
							css={styles.card}
						>
							<div css={styles.cardMeta}>
								{p.year} · {p.roles.join(" · ")}
							</div>
							<div>{p.title}</div>
						</a>
					))}
				</div>
			</section>
		</>
	);
};
```

- [ ] **Step 2: `src/pages/about/index.tsx`**

```tsx
import { css } from "@emotion/react";
import type { Page } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 64px 0;
		max-width: 720px;
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 24px;
	`,
	prose: css`
		font-size: 16px;
		line-height: 1.75;
		color: ${tokens.text.body};
		white-space: pre-wrap;
	`,
};

export interface AboutProps {
	page: Page;
}

export const About = ({ page }: AboutProps) => (
	<article css={styles.wrapper}>
		<h1 css={styles.h1}>{page.title}</h1>
		<div css={styles.prose}>{page.body}</div>
	</article>
);
```

- [ ] **Step 3: `src/pages/works/index.tsx`** (cards + query-param modal — modal details in Phase 4)

```tsx
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LocaleEnum, Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 64px 0;
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 40px;
	`,
	grid: css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	`,
	article: css`
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		padding: 24px;
		cursor: pointer;
		color: ${tokens.text.heading};
		background: none;
		text-align: left;
		font: inherit;
		&:hover {
			border-color: ${tokens.accent};
		}
	`,
	meta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin-bottom: 10px;
	`,
	title: css`
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 8px;
	`,
	body: css`
		font-size: 13px;
		color: ${tokens.text.body};
		line-height: 1.55;
	`,
};

export interface WorksProps {
	locale: LocaleEnum;
	projects: Project[];
}

export const Works = ({ locale, projects }: WorksProps) => {
	const { t } = useTranslation();
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setActiveSlug(params.get("project"));
	}, []);

	const open = (slug: string) => {
		setActiveSlug(slug);
		const url = new URL(window.location.href);
		url.searchParams.set("project", slug);
		window.history.replaceState({}, "", url.toString());
	};

	if (projects.length === 0) {
		return (
			<section css={styles.wrapper}>
				<h1 css={styles.h1}>{t("works.title")}</h1>
				<p css={styles.body}>{t("works.empty")}</p>
			</section>
		);
	}

	return (
		<section css={styles.wrapper}>
			<h1 css={styles.h1}>{t("works.title")}</h1>
			<div css={styles.grid}>
				{projects.map((p) => (
					<article key={p.slug}>
						<button
							type="button"
							css={styles.article}
							onClick={() => open(p.slug)}
							aria-expanded={activeSlug === p.slug}
						>
							<div css={styles.meta}>
								{p.year} · {p.roles.join(" · ")}
							</div>
							<h2 css={styles.title}>{p.title}</h2>
							<div css={styles.body}>{p.body}</div>
						</button>
					</article>
				))}
			</div>
			{/* Modal component is wired in Phase 4 (Audio) and Phase 5 (SEO inlines JSON-LD per article). */}
			{/* For now, activeSlug is stored but not visually surfaced beyond `aria-expanded`. */}
			<span data-active-slug={activeSlug ?? ""} hidden />
			{/* locale is referenced so static analysis doesn't complain about unused arg */}
			<span data-locale={locale} hidden />
		</section>
	);
};
```

- [ ] **Step 4: `src/pages/not-found/index.tsx`**

```tsx
import { css } from "@emotion/react";
import type { LocaleEnum } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 96px 0;
		text-align: center;
	`,
	big: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 14px;
		letter-spacing: 0.4em;
		color: ${tokens.accent};
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 48px;
		color: ${tokens.text.heading};
		margin: 16px 0 8px;
	`,
	link: css`
		color: ${tokens.text.body};
		text-decoration: underline;
	`,
};

const MESSAGES: Record<LocaleEnum, { title: string; back: string }> = {
	fr: { title: "Page introuvable", back: "← Retour à l'accueil" },
	en: { title: "Page not found", back: "← Back to home" },
	es: { title: "Página no encontrada", back: "← Volver al inicio" },
};

export interface NotFoundProps {
	locale: LocaleEnum;
}

export const NotFound = ({ locale }: NotFoundProps) => {
	const m = MESSAGES[locale];
	return (
		<div css={styles.wrapper}>
			<div css={styles.big}>404</div>
			<h1 css={styles.h1}>{m.title}</h1>
			<a href={`/${locale}/`} css={styles.link}>
				{m.back}
			</a>
		</div>
	);
};
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/
git commit -m "✨ feat: home / about / works / not-found page components"
```

---

### Task 3.4: Locale-aware shell integration

**Files:**
- Create: `src/pages/layout.tsx` (wraps header + page + footer + dev switcher)

- [ ] **Step 1: Write `src/pages/layout.tsx`**

```tsx
import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { SkipLink } from "@/components/shell/skip-link";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";
import type { LocaleEnum, SiteCopy } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	main: css`
		padding: 0 28px;
		max-width: 1080px;
		margin: 0 auto;
		color: ${tokens.text.heading};
		min-height: 60vh;
	`,
};

// biome-ignore lint/nursery/noProcessEnv: build-time flag
const isDev = process.env.NODE_ENV !== "production";

export interface LayoutProps {
	locale: LocaleEnum;
	site: SiteCopy;
	children: ReactNode;
}

export const Layout = ({ locale, site, children }: LayoutProps) => (
	<>
		<SkipLink />
		<Header navLabels={site.nav} langPrefix={`/${locale}`} />
		<main id="main" css={styles.main}>
			{children}
		</main>
		<Footer
			email={site.footer.email}
			copyright={site.footer.copyright}
			socials={site.footer.socials.map((s) => ({
				label: s.label,
				url: s.url,
			}))}
		/>
		{isDev && <ThemeSwitcherDev />}
	</>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/layout.tsx
git commit -m "✨ feat: locale-aware layout wrapper"
```

---

### Task 3.5: App router (dev — runtime route resolution)

**Files:**
- Rewrite: `src/root.tsx`

- [ ] **Step 1: Rewrite `src/root.tsx`**

```tsx
import { useEffect, useState } from "react";
import { match, P } from "ts-pattern";
import { content } from "@/content/generated";
import {
	ALL_LOCALES,
	DEFAULT_LOCALE,
	type LocaleEnum,
} from "@/content/types";
import { initI18n } from "@/i18n";
import { About } from "@/pages/about";
import { Home } from "@/pages/home";
import { Layout } from "@/pages/layout";
import { NotFound } from "@/pages/not-found";
import { RootSplash } from "@/pages/root-splash";
import { Works } from "@/pages/works";
import { RouteKindEnum, ROUTES } from "@/routes";

const resolveRoute = () => {
	const path = window.location.pathname.replace(/\/$/, "") || "/";
	const match = ROUTES.find((r) => r.path === path);
	if (match) return match;
	// Any /{locale}/… path that didn't match → locale 404
	for (const locale of ALL_LOCALES) {
		if (path.startsWith(`/${locale}`)) {
			return { path: `/${locale}/404`, kind: RouteKindEnum.not_found, locale };
		}
	}
	return { path: "/", kind: RouteKindEnum.root_splash };
};

export const Root = () => {
	const [ready, setReady] = useState(false);
	const [route, setRoute] = useState(() => resolveRoute());

	useEffect(() => {
		const locale = route.locale ?? DEFAULT_LOCALE;
		initI18n(locale).then(() => {
			document.documentElement.lang = locale;
			setReady(true);
		});
	}, [route.locale]);

	if (!ready) return null;

	return match(route)
		.with({ kind: RouteKindEnum.root_splash }, () => <RootSplash />)
		.with(
			{ kind: RouteKindEnum.home, locale: P.select() },
			(locale: LocaleEnum) => {
				const page = content.pages[locale].home;
				if (!page) return <NotFound locale={locale} />;
				const featured = Object.values(content.projects[locale])
					.filter((p) => p.featured)
					.sort((a, b) => a.order - b.order)
					.slice(0, 3);
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<Home locale={locale} page={page} featured={featured} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.about, locale: P.select() },
			(locale: LocaleEnum) => {
				const page = content.pages[locale].about;
				if (!page) return <NotFound locale={locale} />;
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<About page={page} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.works, locale: P.select() },
			(locale: LocaleEnum) => {
				const projects = Object.values(content.projects[locale]).sort(
					(a, b) => a.order - b.order,
				);
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<Works locale={locale} projects={projects} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.not_found, locale: P.select() },
			(locale: LocaleEnum) => {
				const site = content.site[locale];
				return (
					<Layout locale={locale} site={site}>
						<NotFound locale={locale} />
					</Layout>
				);
			},
		)
		.exhaustive();
};
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Visit `/fr`, `/en`, `/es`, `/fr/about`, `/fr/works`, `/`. All render.

- [ ] **Step 3: Commit**

```bash
git add src/root.tsx
git commit -m "✨ feat: client route resolver with ts-pattern"
```

---

### Task 3.6: Prerender config

**Files:**
- Modify: `rsbuild.config.ts`

- [ ] **Step 1: Install the prerender plugin**

```bash
npm install -D rsbuild-plugin-pre-render
```

Note: the canonical Rsbuild prerender plugin is community-published as `rsbuild-plugin-pre-render`. If the install fails, use Rsbuild's built-in `html.inject` + `output.copy` as a fallback and invoke a custom post-build script. Plan assumes the plugin works.

- [ ] **Step 2: Modify `rsbuild.config.ts`**

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginPreRender } from "rsbuild-plugin-pre-render";
import { allPrerenderPaths } from "./src/routes";

export default defineConfig({
	plugins: [
		pluginReact(),
		pluginPreRender({
			routes: allPrerenderPaths(),
		}),
	],
	source: {
		entry: {
			index: "./src/main.tsx",
		},
	},
	html: {
		template: "./src/index.html",
	},
	server: {
		port: 3000,
	},
	output: {
		distPath: { root: "dist" },
	},
	tools: {
		swc: {
			jsc: {
				transform: {
					react: {
						runtime: "automatic",
						importSource: "@emotion/react",
					},
				},
			},
		},
	},
});
```

- [ ] **Step 3: Prepare main entry for SSR — modify `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Root } from "./root";
import "./theme/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

if (container.hasChildNodes()) {
	hydrateRoot(
		container,
		<StrictMode>
			<Root />
		</StrictMode>,
	);
} else {
	createRoot(container).render(
		<StrictMode>
			<Root />
		</StrictMode>,
	);
}
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: `dist/` now contains `fr/index.html`, `en/index.html`, `es/index.html`, `fr/about/index.html`, etc. Verify:

```bash
find dist -name index.html | sort
```

Expected 13 files (or fail back to plugin fallback and retry — log any errors and adjust).

- [ ] **Step 5: Commit**

```bash
git add rsbuild.config.ts src/main.tsx package.json package-lock.json
git commit -m "⚡ feat: prerender plugin enumerates locale × page routes"
```

---

### Task 3.7: Splash redirect script

**Files:**
- Modify: `src/pages/root-splash/index.tsx`

- [ ] **Step 1: Add client-side language redirect**

Append an inline `<script>` rendered at the top of the splash that reads `navigator.language`. Because the splash HTML is what the prerender emits for `/`, we inject via a one-off `<script>` tag inside the component:

Modify `src/pages/root-splash/index.tsx` — at the bottom of the `<div css={styles.card}>` block, before closing `</div>`:

```tsx
<script
	// biome-ignore lint/security/noDangerouslySetInnerHtml: inline redirect
	dangerouslySetInnerHTML={{
		__html: `
(function(){
  try {
    var lang = (navigator.language || 'fr').toLowerCase();
    var pick = lang.startsWith('en') ? 'en' : lang.startsWith('es') ? 'es' : 'fr';
    if (location.pathname === '/' || location.pathname === '') {
      location.replace('/' + pick + '/');
    }
  } catch(e) {}
})();
`,
	}}
/>
```

- [ ] **Step 2: Verify**

```bash
npm run build
grep -c "navigator.language" dist/index.html
```

Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/root-splash/index.tsx
git commit -m "⚡ feat: splash client-side language detection redirect"
```

---

### Task 3.8: Phase 3 sign-off

- [ ] **Step 1: Count prerendered files**

```bash
find dist -name index.html | sort | wc -l
```

Expected: `13`.

- [ ] **Step 2: Smoke**

```bash
npm run check && npm run typecheck && npm run test && npm run build
```

All exit 0.

Phase 3 complete. Proceed to `phase-4-audio-player.md`.
