# Phase 2 — Content Pipeline & i18n

**Outcome:** Markdown content in `content/` is validated by zod and emitted as typed `src/content/generated.ts`; three locale UI resource bundles boot i18next; CI asserts every locale has identical key sets.

**Prereq:** Phase 1 complete.

---

### Task 2.1: Content types (zod schemas)

**Files:**
- Create: `src/content/types.ts`

- [ ] **Step 1: Write `src/content/types.ts`**

```ts
import { z } from "zod";

export const LocaleEnum = {
	fr: "fr",
	en: "en",
	es: "es",
} as const;
export type LocaleEnum = (typeof LocaleEnum)[keyof typeof LocaleEnum];
export const ALL_LOCALES: readonly LocaleEnum[] = [
	LocaleEnum.fr,
	LocaleEnum.en,
	LocaleEnum.es,
];
export const DEFAULT_LOCALE: LocaleEnum = LocaleEnum.fr;

export const ProjectRoleEnum = {
	sound_design: "sound_design",
	music_composition: "music_composition",
	mixing: "mixing",
	mastering: "mastering",
	integration: "integration",
} as const;
export type ProjectRoleEnum =
	(typeof ProjectRoleEnum)[keyof typeof ProjectRoleEnum];

export const AudioSourceSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("file"),
		src: z.string().startsWith("/media/"),
		title: z.string().min(1),
		duration: z.number().positive().optional(),
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
export type AudioSource = z.infer<typeof AudioSourceSchema>;

export const ProjectLinkSchema = z.object({
	label: z.string().min(1),
	url: z.string().url(),
});
export type ProjectLink = z.infer<typeof ProjectLinkSchema>;

export const ProjectFrontmatterSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	order: z.number().int(),
	featured: z.boolean().default(false),
	year: z.number().int().gte(1990).lte(2100),
	roles: z.array(z.nativeEnum(ProjectRoleEnum)).min(1),
	tags: z.array(z.string()).default([]),
	cover: z.string().startsWith("/media/"),
	audio: z.array(AudioSourceSchema).default([]),
	links: z.array(ProjectLinkSchema).default([]),
	collaborators: z.array(z.string()).default([]),
});
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
	body: string;
	locale: LocaleEnum;
}

export const PageFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	og_image: z.string().startsWith("/og/").optional(),
});
export type PageFrontmatter = z.infer<typeof PageFrontmatterSchema>;

export interface Page extends PageFrontmatter {
	slug: string;
	body: string;
	locale: LocaleEnum;
}

export const SiteCopySchema = z.object({
	nav: z.object({
		home: z.string(),
		about: z.string(),
		works: z.string(),
	}),
	footer: z.object({
		email: z.string().email(),
		copyright: z.string(),
		socials: z
			.array(
				z.object({
					kind: z.enum(["soundcloud", "youtube", "linkedin"]),
					url: z.string().url(),
					label: z.string(),
				}),
			)
			.default([]),
	}),
	seo: z.object({
		site_name: z.string(),
		tagline: z.string(),
	}),
});
export type SiteCopy = z.infer<typeof SiteCopySchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/content/types.ts
git commit -m "✨ feat: zod schemas for content (projects, pages, site)"
```

---

### Task 2.2: Sample content files

**Files:**
- Create: `content/site/fr.yml`, `content/site/en.yml`, `content/site/es.yml`
- Create: `content/pages/fr/home.md`, `content/pages/en/home.md`, `content/pages/es/home.md`
- Create: `content/pages/fr/about.md`, `content/pages/en/about.md`, `content/pages/es/about.md`
- Create: `content/projects/fr/space-piercer.md` (stub; full migration in Phase 7)

- [ ] **Step 1: `content/site/fr.yml`**

```yaml
nav:
  home: Accueil
  about: À propos
  works: Projets
footer:
  email: contact@bitcrusher-studio.com
  copyright: © 2026 Bitcrusher Studio · Tous droits réservés
  socials:
    - kind: soundcloud
      url: https://soundcloud.com/user-836588138
      label: SoundCloud
    - kind: youtube
      url: https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4
      label: YouTube
    - kind: linkedin
      url: https://www.linkedin.com/in/quentin-ferreira-castiço
      label: LinkedIn
seo:
  site_name: Bitcrusher Studio
  tagline: Musique & Sound Design pour Post Production Audiovisuelle et Jeux Vidéo
```

- [ ] **Step 2: `content/site/en.yml`**

```yaml
nav:
  home: Home
  about: About
  works: Works
footer:
  email: contact@bitcrusher-studio.com
  copyright: © 2026 Bitcrusher Studio · All rights reserved
  socials:
    - kind: soundcloud
      url: https://soundcloud.com/user-836588138
      label: SoundCloud
    - kind: youtube
      url: https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4
      label: YouTube
    - kind: linkedin
      url: https://www.linkedin.com/in/quentin-ferreira-castiço
      label: LinkedIn
seo:
  site_name: Bitcrusher Studio
  tagline: Music & Sound Design for Audiovisual Post-Production and Video Games
```

- [ ] **Step 3: `content/site/es.yml`**

```yaml
nav:
  home: Inicio
  about: Sobre mí
  works: Trabajos
footer:
  email: contact@bitcrusher-studio.com
  copyright: © 2026 Bitcrusher Studio · Todos los derechos reservados
  socials:
    - kind: soundcloud
      url: https://soundcloud.com/user-836588138
      label: SoundCloud
    - kind: youtube
      url: https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4
      label: YouTube
    - kind: linkedin
      url: https://www.linkedin.com/in/quentin-ferreira-castiço
      label: LinkedIn
seo:
  site_name: Bitcrusher Studio
  tagline: Música y Diseño de Sonido para Postproducción Audiovisual y Videojuegos
```

- [ ] **Step 4: Home pages — write each with frontmatter**

`content/pages/fr/home.md`:

```markdown
---
title: Bitcrusher Studio — Sound Designer
description: Musique & Sound Design pour Post Production Audiovisuelle et Jeux Vidéo
---

Bitcrusher Studio est le studio de Quentin Ferreira-Castiço, sound designer et compositeur pour la post-production audiovisuelle et les jeux vidéo.
```

`content/pages/en/home.md`:

```markdown
---
title: Bitcrusher Studio — Sound Designer
description: Music & Sound Design for Audiovisual Post-Production and Video Games
---

Bitcrusher Studio is the studio of Quentin Ferreira-Castiço, sound designer and composer for audiovisual post-production and video games.
```

`content/pages/es/home.md`:

```markdown
---
title: Bitcrusher Studio — Diseñador de Sonido
description: Música y Diseño de Sonido para Postproducción Audiovisual y Videojuegos
---

Bitcrusher Studio es el estudio de Quentin Ferreira-Castiço, diseñador de sonido y compositor para postproducción audiovisual y videojuegos.
```

- [ ] **Step 5: About pages**

`content/pages/fr/about.md`:

```markdown
---
title: À propos — Bitcrusher Studio
description: Quentin Ferreira-Castiço, sound designer formé à ACFA Multimédia Montpellier.
---

Je suis Quentin Ferreira-Castiço, sound designer de formation pour la post-production ainsi que pour les jeux vidéo et médias interactifs. Formé à ACFA Multimédia Montpellier, je suis également détenteur d'une licence en musicologie spécialité Musiques Actuelles de l'Université de Strasbourg — formation musicale qui complète mes compétences techniques.
```

`content/pages/en/about.md`:

```markdown
---
title: About — Bitcrusher Studio
description: Quentin Ferreira-Castiço, sound designer trained at ACFA Multimédia Montpellier.
---

I'm Quentin Ferreira-Castiço, a sound designer trained for post-production as well as for video games and interactive media. Educated at ACFA Multimédia Montpellier, I also hold a degree in musicology (Contemporary Music track) from the Université de Strasbourg — musical training that complements my technical skills.
```

`content/pages/es/about.md`:

```markdown
---
title: Sobre mí — Bitcrusher Studio
description: Quentin Ferreira-Castiço, diseñador de sonido formado en ACFA Multimédia Montpellier.
---

Soy Quentin Ferreira-Castiço, diseñador de sonido formado en postproducción y en videojuegos y medios interactivos. Formado en ACFA Multimédia Montpellier, también poseo una licenciatura en musicología, especialidad Músicas Actuales, por la Universidad de Estrasburgo — una formación musical que complementa mis competencias técnicas.
```

- [ ] **Step 6: One project stub (fr only — full migration in Phase 7)**

`content/projects/fr/space-piercer.md`:

```markdown
---
slug: space-piercer
title: Space Piercer
order: 1
featured: true
year: 2022
roles: [sound_design]
tags: [shooter, sf, collaboration]
cover: /media/projects/space-piercer/cover.jpg
audio: []
links:
  - label: Steam
    url: https://store.steampowered.com/app/1904410/Space_Piercer/
collaborators: [Objectif 3D, ACFA Multimédia]
---

Projet réalisé en collaboration avec l'école Objectif 3D lors de mon année de spécialisation à ACFA Multimédia. Shooter à la 3ème personne dans un univers SF et Cartoon — sound design en collaboration avec un autre sound designer.
```

- [ ] **Step 7: Placeholder cover asset**

```bash
mkdir -p public/media/projects/space-piercer
# 1x1 transparent PNG placeholder so cover path resolves
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01[N\x95\x1e\x00\x00\x00\x00IEND\xaeB`\x82' > public/media/projects/space-piercer/cover.jpg
```

- [ ] **Step 8: Commit**

```bash
git add content/ public/media/
git commit -m "📝 feat: seed content (site copy + home + about + one project stub)"
```

---

### Task 2.3: Content loader — test first

**Files:**
- Create: `tests/content/loader.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import { loadAllContent } from "@/content/loader";

describe("loadAllContent", () => {
	it("loads pages for every locale", async () => {
		const content = await loadAllContent();
		expect(content.pages.fr.home).toBeDefined();
		expect(content.pages.en.home).toBeDefined();
		expect(content.pages.es.home).toBeDefined();
		expect(content.pages.fr.about).toBeDefined();
	});

	it("loads site copy for every locale", async () => {
		const content = await loadAllContent();
		expect(content.site.fr.nav.home).toBe("Accueil");
		expect(content.site.en.nav.home).toBe("Home");
		expect(content.site.es.nav.home).toBe("Inicio");
	});

	it("loads projects indexed by locale and slug", async () => {
		const content = await loadAllContent();
		const sp = content.projects.fr["space-piercer"];
		expect(sp?.title).toBe("Space Piercer");
		expect(sp?.year).toBe(2022);
		expect(sp?.roles).toContain("sound_design");
	});

	it("throws a descriptive error when a file is malformed", async () => {
		const { validateProjectMarkdown } = await import("@/content/loader");
		const malformed = `---\nslug: Bad Slug\n---\nbody`;
		expect(() =>
			validateProjectMarkdown(malformed, "test.md"),
		).toThrow(/slug/i);
	});
});
```

- [ ] **Step 2: Run test — must fail**

```bash
npm run test -- tests/content
```

Expected: FAIL.

---

### Task 2.4: Implement content loader

**Files:**
- Create: `src/content/loader.ts`

- [ ] **Step 1: Install `yaml` for site copy**

```bash
npm install yaml
```

- [ ] **Step 2: Write `src/content/loader.ts`**

```ts
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import {
	ALL_LOCALES,
	type LocaleEnum,
	type Page,
	PageFrontmatterSchema,
	type Project,
	ProjectFrontmatterSchema,
	type SiteCopy,
	SiteCopySchema,
} from "./types";

const CONTENT_ROOT = join(process.cwd(), "content");

export interface ContentBundle {
	pages: Record<LocaleEnum, Record<string, Page>>;
	projects: Record<LocaleEnum, Record<string, Project>>;
	site: Record<LocaleEnum, SiteCopy>;
}

export const validateProjectMarkdown = (
	raw: string,
	filePath: string,
): { frontmatter: Project; body: string } => {
	const parsed = matter(raw);
	const result = ProjectFrontmatterSchema.safeParse(parsed.data);
	if (!result.success) {
		throw new Error(
			`[content] invalid project ${filePath}: ${result.error.message}`,
		);
	}
	return {
		frontmatter: { ...result.data, body: parsed.content.trim(), locale: "fr" },
		body: parsed.content.trim(),
	};
};

const loadPages = async (
	locale: LocaleEnum,
): Promise<Record<string, Page>> => {
	const dir = join(CONTENT_ROOT, "pages", locale);
	const files = await readdir(dir);
	const out: Record<string, Page> = {};
	for (const name of files) {
		if (extname(name) !== ".md") continue;
		const slug = basename(name, ".md");
		const raw = await readFile(join(dir, name), "utf8");
		const parsed = matter(raw);
		const result = PageFrontmatterSchema.safeParse(parsed.data);
		if (!result.success) {
			throw new Error(
				`[content] invalid page ${locale}/${name}: ${result.error.message}`,
			);
		}
		out[slug] = {
			...result.data,
			slug,
			body: parsed.content.trim(),
			locale,
		};
	}
	return out;
};

const loadProjects = async (
	locale: LocaleEnum,
): Promise<Record<string, Project>> => {
	const dir = join(CONTENT_ROOT, "projects", locale);
	let files: string[] = [];
	try {
		files = await readdir(dir);
	} catch {
		return {};
	}
	const out: Record<string, Project> = {};
	for (const name of files) {
		if (extname(name) !== ".md") continue;
		const raw = await readFile(join(dir, name), "utf8");
		const { frontmatter, body } = validateProjectMarkdown(raw, name);
		out[frontmatter.slug] = { ...frontmatter, body, locale };
	}
	return out;
};

const loadSite = async (locale: LocaleEnum): Promise<SiteCopy> => {
	const raw = await readFile(
		join(CONTENT_ROOT, "site", `${locale}.yml`),
		"utf8",
	);
	const data = parseYaml(raw);
	const result = SiteCopySchema.safeParse(data);
	if (!result.success) {
		throw new Error(
			`[content] invalid site/${locale}.yml: ${result.error.message}`,
		);
	}
	return result.data;
};

export const loadAllContent = async (): Promise<ContentBundle> => {
	const bundle: ContentBundle = {
		pages: {} as ContentBundle["pages"],
		projects: {} as ContentBundle["projects"],
		site: {} as ContentBundle["site"],
	};
	for (const locale of ALL_LOCALES) {
		bundle.pages[locale] = await loadPages(locale);
		bundle.projects[locale] = await loadProjects(locale);
		bundle.site[locale] = await loadSite(locale);
	}
	return bundle;
};
```

- [ ] **Step 3: Run test — must pass**

```bash
npm run test -- tests/content
```

Expected: 4 passing.

- [ ] **Step 4: Commit**

```bash
git add src/content/loader.ts tests/content/ package.json package-lock.json
git commit -m "✨ feat: content loader with zod validation"
```

---

### Task 2.5: `sync-content-types.ts` script

**Files:**
- Create: `scripts/sync-content-types.ts`

- [ ] **Step 1: Write script**

```ts
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { watch } from "node:fs";
import { loadAllContent } from "../src/content/loader";

const OUT = join(process.cwd(), "src/content/generated.ts");

const run = async () => {
	const bundle = await loadAllContent();
	const source = `// GENERATED — do not edit. Run \`npm run dev:content\` or \`npm run build\`.
import type { ContentBundle } from "./loader";

export const content: ContentBundle = ${JSON.stringify(bundle, null, 2)} as unknown as ContentBundle;
`;
	await writeFile(OUT, source, "utf8");
	console.log(`[content] wrote ${OUT} (${source.length} bytes)`);
};

const isWatch = process.argv.includes("--watch");

(async () => {
	await run();
	if (!isWatch) return;
	console.log("[content] watching content/ …");
	let timer: NodeJS.Timeout | null = null;
	watch(
		join(process.cwd(), "content"),
		{ recursive: true },
		() => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				run().catch((e) => console.error("[content] error:", e));
			}, 80);
		},
	);
})().catch((e) => {
	console.error("[content] fatal:", e);
	process.exit(1);
});
```

- [ ] **Step 2: Run once**

```bash
npx tsx scripts/sync-content-types.ts
```

Expected: `src/content/generated.ts` created.

- [ ] **Step 3: Add `.gitignore` entry confirmation**

`src/content/generated.ts` is already in `.gitignore` from Phase 0 — verify:

```bash
git check-ignore src/content/generated.ts
```

Expected: the path is echoed back (= ignored).

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-content-types.ts
git commit -m "✨ feat: sync-content-types script (one-shot + --watch)"
```

---

### Task 2.6: `prebuild.ts` stub

**Files:**
- Create: `scripts/prebuild.ts`

- [ ] **Step 1: Write script**

```ts
import { spawnSync } from "node:child_process";

const steps: Array<{ name: string; cmd: string; args: string[] }> = [
	{
		name: "content types",
		cmd: "npx",
		args: ["tsx", "scripts/sync-content-types.ts"],
	},
	// generate-waveforms, generate-og-images — added in Phase 4 / 5
];

for (const step of steps) {
	console.log(`[prebuild] ${step.name}`);
	const r = spawnSync(step.cmd, step.args, { stdio: "inherit" });
	if (r.status !== 0) {
		console.error(`[prebuild] step "${step.name}" failed with code ${r.status}`);
		process.exit(r.status ?? 1);
	}
}
```

- [ ] **Step 2: Verify build runs end-to-end**

```bash
npm run build
```

Expected: prebuild runs, rsbuild builds, `dist/index.html` produced.

- [ ] **Step 3: Commit**

```bash
git add scripts/prebuild.ts
git commit -m "🔧 feat: prebuild orchestrator (extensible)"
```

---

### Task 2.7: i18next bootstrap — test first

**Files:**
- Create: `src/i18n/resources/fr/ui.json`
- Create: `src/i18n/resources/en/ui.json`
- Create: `src/i18n/resources/es/ui.json`
- Create: `tests/i18n/parity.test.ts`

- [ ] **Step 1: `src/i18n/resources/fr/ui.json`**

```json
{
	"common": {
		"language": "Langue",
		"theme": "Thème",
		"open_external": "Ouvrir en externe",
		"play": "Lecture",
		"pause": "Pause",
		"close": "Fermer"
	},
	"home": {
		"featured_title": "Projets marquants",
		"view_all": "Voir tous les projets"
	},
	"works": {
		"title": "Projets",
		"empty": "Aucun projet pour le moment."
	}
}
```

- [ ] **Step 2: `src/i18n/resources/en/ui.json`**

```json
{
	"common": {
		"language": "Language",
		"theme": "Theme",
		"open_external": "Open externally",
		"play": "Play",
		"pause": "Pause",
		"close": "Close"
	},
	"home": {
		"featured_title": "Featured Works",
		"view_all": "View all works"
	},
	"works": {
		"title": "Works",
		"empty": "No works yet."
	}
}
```

- [ ] **Step 3: `src/i18n/resources/es/ui.json`**

```json
{
	"common": {
		"language": "Idioma",
		"theme": "Tema",
		"open_external": "Abrir externamente",
		"play": "Reproducir",
		"pause": "Pausar",
		"close": "Cerrar"
	},
	"home": {
		"featured_title": "Trabajos destacados",
		"view_all": "Ver todos los trabajos"
	},
	"works": {
		"title": "Trabajos",
		"empty": "Aún no hay trabajos."
	}
}
```

- [ ] **Step 4: Write parity test `tests/i18n/parity.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import fr from "@/i18n/resources/fr/ui.json";
import en from "@/i18n/resources/en/ui.json";
import es from "@/i18n/resources/es/ui.json";

const collectKeys = (obj: unknown, prefix = ""): string[] => {
	if (typeof obj !== "object" || obj === null) return [];
	const out: string[] = [];
	for (const [k, v] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${k}` : k;
		if (typeof v === "object" && v !== null) {
			out.push(...collectKeys(v, path));
		} else {
			out.push(path);
		}
	}
	return out.sort();
};

describe("i18n locale parity", () => {
	const keysFr = collectKeys(fr);
	const keysEn = collectKeys(en);
	const keysEs = collectKeys(es);

	it("fr and en have the same key set", () => {
		expect(keysEn).toEqual(keysFr);
	});

	it("fr and es have the same key set", () => {
		expect(keysEs).toEqual(keysFr);
	});
});
```

- [ ] **Step 5: Run — must pass (resources match)**

```bash
npm run test -- tests/i18n
```

Expected: 2 passing.

- [ ] **Step 6: Implement `src/i18n/index.ts`**

```ts
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en/ui.json";
import es from "./resources/es/ui.json";
import fr from "./resources/fr/ui.json";
import { DEFAULT_LOCALE, type LocaleEnum } from "@/content/types";

export const initI18n = async (locale: LocaleEnum = DEFAULT_LOCALE) => {
	await i18next.use(initReactI18next).init({
		lng: locale,
		fallbackLng: DEFAULT_LOCALE,
		defaultNS: "ui",
		ns: ["ui"],
		resources: {
			fr: { ui: fr },
			en: { ui: en },
			es: { ui: es },
		},
		interpolation: { escapeValue: false },
	});
	return i18next;
};
```

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ tests/i18n/
git commit -m "🌍 feat: i18next bootstrap + 3-locale UI resources + parity test"
```

---

### Task 2.8: Phase 2 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run test && npm run build
```

All exit 0. `dist/` contains `index.html`.

Phase 2 complete. Proceed to `phase-3-routing-pages.md`.
