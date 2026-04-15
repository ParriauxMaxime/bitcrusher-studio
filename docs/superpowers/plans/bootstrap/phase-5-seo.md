# Phase 5 — SEO & Structured Data

**Outcome:** Every prerendered route carries correct `<title>`, `<meta description>`, OG tags, canonical URL, `hreflang` alternates, and page-appropriate JSON-LD. OG images are generated per project × locale at build time. `sitemap.xml` and `robots.txt` are written to `dist/`.

**Prereq:** Phase 4 complete.

---

### Task 5.1: JSON-LD builders — test first

**Files:**
- Create: `tests/seo/json-ld.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import {
	organizationLd,
	personLd,
	creativeWorkLd,
	webSiteLd,
} from "@/lib/seo/json-ld";

describe("json-ld builders", () => {
	it("organization has Bitcrusher Studio name and url", () => {
		const ld = organizationLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("Organization");
		expect(ld.name).toBe("Bitcrusher Studio");
		expect(ld.url).toBe("https://bitcrusher-studio.com");
	});

	it("person has artist name", () => {
		const ld = personLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("Person");
		expect(ld.name).toContain("Ferreira-Casti");
	});

	it("creativeWork includes title, year, roles", () => {
		const ld = creativeWorkLd(
			"https://bitcrusher-studio.com",
			"fr",
			{
				slug: "space-piercer",
				title: "Space Piercer",
				order: 1,
				featured: true,
				year: 2022,
				roles: ["sound_design"],
				tags: [],
				cover: "/media/projects/space-piercer/cover.jpg",
				audio: [],
				links: [],
				collaborators: [],
				body: "…",
				locale: "fr",
			},
		);
		expect(ld["@type"]).toBe("CreativeWork");
		expect(ld.name).toBe("Space Piercer");
		expect(ld.dateCreated).toBe("2022");
	});

	it("webSite includes search action stub with site name", () => {
		const ld = webSiteLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("WebSite");
		expect(ld.name).toBe("Bitcrusher Studio");
	});
});
```

- [ ] **Step 2: Run — must fail**

```bash
npm run test -- tests/seo
```

Expected: FAIL.

---

### Task 5.2: Implement JSON-LD builders

**Files:**
- Create: `src/lib/seo/json-ld.ts`

- [ ] **Step 1: Write**

```ts
import type { LocaleEnum, Project } from "@/content/types";

export interface JsonLd {
	"@context": "https://schema.org";
	"@type": string;
	[key: string]: unknown;
}

export const organizationLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "Organization",
	"@id": `${origin}/#organization`,
	name: "Bitcrusher Studio",
	url: origin,
	founder: {
		"@type": "Person",
		name: "Quentin Ferreira-Castiço",
	},
	email: "contact@bitcrusher-studio.com",
});

export const personLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "Person",
	"@id": `${origin}/#person`,
	name: "Quentin Ferreira-Castiço",
	jobTitle: "Sound Designer",
	alumniOf: [
		{ "@type": "EducationalOrganization", name: "ACFA Multimédia" },
		{
			"@type": "EducationalOrganization",
			name: "Université de Strasbourg",
		},
	],
	sameAs: [
		"https://soundcloud.com/user-836588138",
		"https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4",
		"https://www.linkedin.com/in/quentin-ferreira-castiço",
	],
});

export const webSiteLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "WebSite",
	"@id": `${origin}/#website`,
	name: "Bitcrusher Studio",
	url: origin,
	publisher: { "@id": `${origin}/#organization` },
});

export const creativeWorkLd = (
	origin: string,
	locale: LocaleEnum,
	project: Project,
): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "CreativeWork",
	"@id": `${origin}/${locale}/works?project=${project.slug}`,
	name: project.title,
	creator: { "@id": `${origin}/#person` },
	dateCreated: String(project.year),
	inLanguage: locale,
	genre: project.roles,
	keywords: project.tags.join(", "),
	image: `${origin}${project.cover}`,
	associatedMedia: project.audio.map((a) => ({
		"@type": "AudioObject",
		name: a.title,
		contentUrl:
			a.kind === "file"
				? `${origin}${a.src}`
				: a.kind === "soundcloud"
					? a.url
					: a.url,
	})),
});
```

- [ ] **Step 2: Run — must pass**

```bash
npm run test -- tests/seo
```

Expected: 4 passing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/seo/json-ld.ts tests/seo/json-ld.test.ts
git commit -m "✨ feat: JSON-LD builders (organization, person, website, creativeWork)"
```

---

### Task 5.3: Per-page head meta builder

**Files:**
- Create: `src/lib/seo/build-meta.ts`

- [ ] **Step 1: Write**

```ts
import { ALL_LOCALES, type LocaleEnum } from "@/content/types";

export interface PageMeta {
	title: string;
	description: string;
	canonical: string;
	ogImage: string;
	ogLocale: string;
	alternates: Array<{ hrefLang: string; href: string }>;
	jsonLd: unknown[];
}

const localeToOg = (l: LocaleEnum): string =>
	l === "fr" ? "fr_FR" : l === "en" ? "en_US" : "es_ES";

export interface BuildMetaArgs {
	origin: string;
	path: string;
	locale: LocaleEnum;
	title: string;
	description: string;
	ogImage: string;
	jsonLd: unknown[];
	pathWithoutLocale: string;
}

export const buildMeta = (args: BuildMetaArgs): PageMeta => ({
	title: args.title,
	description: args.description,
	canonical: `${args.origin}${args.path}`,
	ogImage: `${args.origin}${args.ogImage}`,
	ogLocale: localeToOg(args.locale),
	alternates: [
		...ALL_LOCALES.map((l) => ({
			hrefLang: l,
			href: `${args.origin}/${l}${args.pathWithoutLocale}`,
		})),
		{
			hrefLang: "x-default",
			href: `${args.origin}/fr${args.pathWithoutLocale}`,
		},
	],
	jsonLd: args.jsonLd,
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/seo/build-meta.ts
git commit -m "✨ feat: per-page meta builder with hreflang alternates"
```

---

### Task 5.4: Wire meta into rendered pages (`<Head>` component)

**Files:**
- Create: `src/components/head.tsx`
- Modify: `src/root.tsx` to render `<Head>` per route

- [ ] **Step 1: `src/components/head.tsx`**

```tsx
import { useEffect } from "react";
import type { PageMeta } from "@/lib/seo/build-meta";

const set = (sel: string, attrs: Record<string, string>) => {
	let el = document.head.querySelector<HTMLElement>(sel);
	if (!el) {
		const [tag, ...rest] = sel.split("[");
		el = document.createElement(tag);
		document.head.appendChild(el);
	}
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
};

const setText = (tag: string, text: string) => {
	let el = document.head.querySelector(tag);
	if (!el) {
		el = document.createElement(tag);
		document.head.appendChild(el);
	}
	el.textContent = text;
};

export const Head = ({ meta }: { meta: PageMeta }) => {
	useEffect(() => {
		setText("title", meta.title);
		set(`meta[name="description"]`, {
			name: "description",
			content: meta.description,
		});
		set(`link[rel="canonical"]`, { rel: "canonical", href: meta.canonical });
		set(`meta[property="og:title"]`, {
			property: "og:title",
			content: meta.title,
		});
		set(`meta[property="og:description"]`, {
			property: "og:description",
			content: meta.description,
		});
		set(`meta[property="og:image"]`, {
			property: "og:image",
			content: meta.ogImage,
		});
		set(`meta[property="og:locale"]`, {
			property: "og:locale",
			content: meta.ogLocale,
		});
		set(`meta[property="og:url"]`, {
			property: "og:url",
			content: meta.canonical,
		});
		set(`meta[name="twitter:card"]`, {
			name: "twitter:card",
			content: "summary_large_image",
		});
		// hreflang
		document.head
			.querySelectorAll('link[rel="alternate"]')
			.forEach((n) => n.remove());
		for (const alt of meta.alternates) {
			const link = document.createElement("link");
			link.setAttribute("rel", "alternate");
			link.setAttribute("hreflang", alt.hrefLang);
			link.setAttribute("href", alt.href);
			document.head.appendChild(link);
		}
		// json-ld
		document.head
			.querySelectorAll('script[type="application/ld+json"][data-dyn]')
			.forEach((n) => n.remove());
		for (const ld of meta.jsonLd) {
			const s = document.createElement("script");
			s.setAttribute("type", "application/ld+json");
			s.setAttribute("data-dyn", "1");
			s.textContent = JSON.stringify(ld);
			document.head.appendChild(s);
		}
	}, [meta]);
	return null;
};
```

- [ ] **Step 2: Integrate `<Head>` in the router**

In `src/root.tsx`, at the top of each matched branch, compute a `PageMeta` and render `<Head meta={…} />` as the first child.

Add to imports:

```tsx
import { Head } from "@/components/head";
import { buildMeta } from "@/lib/seo/build-meta";
import {
	creativeWorkLd,
	organizationLd,
	personLd,
	webSiteLd,
} from "@/lib/seo/json-ld";
```

Add a constant near the top:

```tsx
const ORIGIN =
	typeof window !== "undefined" && window.location.origin
		? window.location.origin
		: "https://bitcrusher-studio.com";
```

Wrap each branch's return — example for `home`:

```tsx
.with(
	{ kind: RouteKindEnum.home, locale: P.select() },
	(locale: LocaleEnum) => {
		const page = content.pages[locale].home;
		if (!page) return <NotFound locale={locale} />;
		const featured = Object.values(content.projects[locale])
			.filter((p) => p.featured)
			.sort((a, b) => a.order - b.order)
			.slice(0, 3);
		const meta = buildMeta({
			origin: ORIGIN,
			path: `/${locale}/`,
			locale,
			title: page.title,
			description: page.description,
			ogImage: page.og_image ?? "/og/default.png",
			pathWithoutLocale: "/",
			jsonLd: [
				organizationLd(ORIGIN),
				personLd(ORIGIN),
				webSiteLd(ORIGIN),
			],
		});
		return (
			<>
				<Head meta={meta} />
				<Layout locale={locale} site={content.site[locale]}>
					<Home locale={locale} page={page} featured={featured} />
				</Layout>
			</>
		);
	},
)
```

Apply the same pattern to the other branches. Full replacement code for the **about** branch:

```tsx
.with(
	{ kind: RouteKindEnum.about, locale: P.select() },
	(locale: LocaleEnum) => {
		const page = content.pages[locale].about;
		if (!page) return <NotFound locale={locale} />;
		const meta = buildMeta({
			origin: ORIGIN,
			path: `/${locale}/about`,
			locale,
			title: page.title,
			description: page.description,
			ogImage: page.og_image ?? `/og/default.png`,
			pathWithoutLocale: "/about",
			jsonLd: [personLd(ORIGIN), organizationLd(ORIGIN)],
		});
		return (
			<>
				<Head meta={meta} />
				<Layout locale={locale} site={content.site[locale]}>
					<About page={page} />
				</Layout>
			</>
		);
	},
)
```

Full replacement code for the **works** branch:

```tsx
.with(
	{ kind: RouteKindEnum.works, locale: P.select() },
	(locale: LocaleEnum) => {
		const projects = Object.values(content.projects[locale]).sort(
			(a, b) => a.order - b.order,
		);
		const site = content.site[locale];
		const meta = buildMeta({
			origin: ORIGIN,
			path: `/${locale}/works`,
			locale,
			title: `${site.nav.works} — ${site.seo.site_name}`,
			description: site.seo.tagline,
			ogImage: `/og/default.png`,
			pathWithoutLocale: "/works",
			jsonLd: [
				organizationLd(ORIGIN),
				...projects.map((p) => creativeWorkLd(ORIGIN, locale, p)),
			],
		});
		return (
			<>
				<Head meta={meta} />
				<Layout locale={locale} site={site}>
					<Works locale={locale} projects={projects} />
				</Layout>
			</>
		);
	},
)
```

Full replacement code for the **not_found** branch:

```tsx
.with(
	{ kind: RouteKindEnum.not_found, locale: P.select() },
	(locale: LocaleEnum) => {
		const site = content.site[locale];
		const meta = buildMeta({
			origin: ORIGIN,
			path: `/${locale}/404`,
			locale,
			title: `404 — ${site.seo.site_name}`,
			description: site.seo.tagline,
			ogImage: `/og/default.png`,
			pathWithoutLocale: "/404",
			jsonLd: [],
		});
		return (
			<>
				<Head meta={meta} />
				<Layout locale={locale} site={site}>
					<NotFound locale={locale} />
				</Layout>
			</>
		);
	},
)
```

- [ ] **Step 3: Commit**

```bash
git add src/components/head.tsx src/root.tsx
git commit -m "✨ feat: per-page Head component (meta + hreflang + JSON-LD)"
```

---

### Task 5.5: OG image generator script

**Files:**
- Create: `scripts/generate-og-images.ts`

- [ ] **Step 1: Write**

```ts
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { loadAllContent } from "../src/content/loader";
import { ALL_LOCALES } from "../src/content/types";

const OG_DIR = join(process.cwd(), "public/og");
const CACHE = join(OG_DIR, ".cache.json");

const template = (title: string, subtitle: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2e2e33"/>
      <stop offset="1" stop-color="#18181c"/>
    </linearGradient>
  </defs>
  <text x="80" y="160" font-family="JetBrains Mono, monospace" font-size="24" fill="#f5c44a" letter-spacing="6">BITCRUSHER STUDIO</text>
  <text x="80" y="340" font-family="Georgia, serif" font-style="italic" font-size="96" fill="#f0f0f2">${title.slice(0, 40)}</text>
  <text x="80" y="420" font-family="Inter, sans-serif" font-size="28" fill="#b8b8c0">${subtitle.slice(0, 80)}</text>
  <rect x="80" y="540" width="1040" height="2" fill="#f5c44a" opacity="0.4"/>
</svg>
`;

interface CacheMap {
	[key: string]: string;
}

const run = async () => {
	await mkdir(OG_DIR, { recursive: true });
	let cache: CacheMap = {};
	if (existsSync(CACHE)) cache = JSON.parse(await readFile(CACHE, "utf8"));

	const content = await loadAllContent();
	let rebuilt = 0;
	const queue: Array<{ key: string; title: string; subtitle: string }> = [];

	queue.push({
		key: "default",
		title: "Bitcrusher Studio",
		subtitle: "Sound Design · Music · Composition",
	});
	for (const locale of ALL_LOCALES) {
		const homePage = content.pages[locale].home;
		if (homePage)
			queue.push({
				key: `home-${locale}`,
				title: homePage.title,
				subtitle: homePage.description,
			});
		for (const project of Object.values(content.projects[locale])) {
			queue.push({
				key: `${locale}-${project.slug}`,
				title: project.title,
				subtitle: `${project.year} · ${project.roles.join(" · ")}`,
			});
		}
	}

	for (const { key, title, subtitle } of queue) {
		const svg = template(title, subtitle);
		const hash = createHash("md5").update(svg).digest("hex").slice(0, 12);
		if (cache[key] === hash) continue;
		const out = join(OG_DIR, `${key}.png`);
		await sharp(Buffer.from(svg)).png().toFile(out);
		cache[key] = hash;
		rebuilt += 1;
		console.log(`[og] ${key}.png`);
	}
	await writeFile(CACHE, JSON.stringify(cache, null, 2), "utf8");
	console.log(`[og] done, ${rebuilt} rebuilt, ${queue.length} total`);
};

run().catch((e) => {
	console.error("[og] fatal:", e);
	process.exit(1);
});
```

- [ ] **Step 2: Register in prebuild**

Modify `scripts/prebuild.ts`:

```ts
const steps: Array<{ name: string; cmd: string; args: string[] }> = [
	{
		name: "content types",
		cmd: "npx",
		args: ["tsx", "scripts/sync-content-types.ts"],
	},
	{
		name: "waveforms",
		cmd: "npx",
		args: ["tsx", "scripts/generate-waveforms.ts"],
	},
	{
		name: "og images",
		cmd: "npx",
		args: ["tsx", "scripts/generate-og-images.ts"],
	},
];
```

- [ ] **Step 3: Run**

```bash
npx tsx scripts/generate-og-images.ts
ls public/og/
```

Expected: `default.png`, `home-fr.png`, `home-en.png`, `home-es.png`, `fr-space-piercer.png`, `.cache.json`.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-og-images.ts scripts/prebuild.ts public/og/ .gitignore
git commit -m "🎨 feat: OG image generator (SVG template → sharp → PNG)"
```

Note: add `public/og/.cache.json` to `.gitignore`:

```
public/og/.cache.json
```

---

### Task 5.6: Sitemap + robots post-build

**Files:**
- Create: `scripts/emit-sitemap.ts`
- Modify: `scripts/prebuild.ts` — no: this is POST-build, add to build script instead.

- [ ] **Step 1: Write `scripts/emit-sitemap.ts`**

```ts
import { readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = join(process.cwd(), "dist");
const ORIGIN = process.env.SITE_ORIGIN ?? "https://bitcrusher-studio.com";

const walk = async (dir: string, out: string[] = []): Promise<string[]> => {
	for (const name of await readdir(dir)) {
		const full = join(dir, name);
		const s = await stat(full);
		if (s.isDirectory()) await walk(full, out);
		else if (name === "index.html") out.push(full);
	}
	return out;
};

const run = async () => {
	if (!existsSync(DIST)) {
		console.error("[sitemap] dist/ missing — run build first");
		process.exit(1);
	}
	const files = await walk(DIST);
	const urls = files
		.map((f) => {
			const rel = relative(DIST, f).replace(/index\.html$/, "");
			return `${ORIGIN}/${rel}`;
		})
		.sort();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

	await writeFile(join(DIST, "sitemap.xml"), xml, "utf8");

	const robots = `User-agent: *
Allow: /
Sitemap: ${ORIGIN}/sitemap.xml
`;
	await writeFile(join(DIST, "robots.txt"), robots, "utf8");
	console.log(`[sitemap] ${urls.length} urls written`);
};

run().catch((e) => {
	console.error("[sitemap] fatal:", e);
	process.exit(1);
});
```

- [ ] **Step 2: Modify `package.json` build script**

```json
"build": "tsx scripts/prebuild.ts && rsbuild build && tsx scripts/emit-sitemap.ts",
```

- [ ] **Step 3: Build + verify**

```bash
npm run build
cat dist/robots.txt
head dist/sitemap.xml
```

Expected: both files exist, sitemap lists 13 URLs.

- [ ] **Step 4: Commit**

```bash
git add scripts/emit-sitemap.ts package.json
git commit -m "🚀 feat: sitemap.xml + robots.txt post-build emission"
```

---

### Task 5.7: Phase 5 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run test && npm run build
```

All exit 0. `dist/` has 13 HTML + sitemap.xml + robots.txt + og/*.png.

Phase 5 complete. Proceed to `phase-6-cms-ci-deploy.md`.
