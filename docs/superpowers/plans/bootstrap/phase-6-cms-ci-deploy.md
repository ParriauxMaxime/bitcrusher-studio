# Phase 6 — CMS, CI & Deploy

**Outcome:** Sveltia CMS admin at `/admin/` with GitHub OAuth proxied by a Cloudflare Worker; GitHub Actions lints → typechecks → tests → builds → deploys to GH Pages; axe-core a11y smoke green on both themes; SSG meta smoke green.

**Prereq:** Phase 5 complete.

---

### Task 6.1: Sveltia admin shell

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`

- [ ] **Step 1: `public/admin/index.html`**

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Bitcrusher Studio — Admin</title>
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	</head>
	<body>
		<script type="module" src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
	</body>
</html>
```

- [ ] **Step 2: `public/admin/config.yml`**

```yaml
backend:
  name: github
  repo: parriauxmaxime/bitcrusher-studio
  branch: main
  base_url: https://bitcrusher-oauth.<your-subdomain>.workers.dev
  auth_endpoint: auth

media_folder: public/media
public_folder: /media

i18n:
  structure: multiple_folders
  locales: [fr, en, es]
  default_locale: fr

collections:
  - name: site
    label: Site copy
    files:
      - name: fr
        label: Français
        file: content/site/fr.yml
        format: yaml
        fields: &site_fields
          - { name: nav, widget: object, fields: [
              { name: home, widget: string },
              { name: about, widget: string },
              { name: works, widget: string }
            ]}
          - { name: footer, widget: object, fields: [
              { name: email, widget: string },
              { name: copyright, widget: string },
              { name: socials, widget: list, fields: [
                  { name: kind, widget: select, options: [soundcloud, youtube, linkedin] },
                  { name: url, widget: string },
                  { name: label, widget: string }
                ]}
            ]}
          - { name: seo, widget: object, fields: [
              { name: site_name, widget: string },
              { name: tagline, widget: string }
            ]}
      - name: en
        label: English
        file: content/site/en.yml
        format: yaml
        fields: *site_fields
      - name: es
        label: Español
        file: content/site/es.yml
        format: yaml
        fields: *site_fields

  - name: pages
    label: Pages
    i18n: true
    folder: content/pages
    path: "{{locale}}/{{slug}}"
    extension: md
    format: frontmatter
    create: true
    fields:
      - { name: title, widget: string, i18n: true }
      - { name: description, widget: string, i18n: true }
      - { name: og_image, widget: image, required: false, i18n: duplicate }
      - { name: body, widget: markdown, i18n: true }

  - name: projects
    label: Projects
    i18n: true
    folder: content/projects
    path: "{{locale}}/{{slug}}"
    extension: md
    format: frontmatter
    create: true
    fields:
      - { name: slug, widget: string, i18n: duplicate }
      - { name: title, widget: string, i18n: true }
      - { name: order, widget: number, i18n: duplicate }
      - { name: featured, widget: boolean, default: false, i18n: duplicate }
      - { name: year, widget: number, i18n: duplicate }
      - { name: roles, widget: select, multiple: true, i18n: duplicate,
          options: [sound_design, music_composition, mixing, mastering, integration] }
      - { name: tags, widget: list, default: [], i18n: duplicate }
      - { name: cover, widget: image, i18n: duplicate }
      - { name: audio, widget: list, default: [], i18n: duplicate, fields: [
          { name: kind, widget: select, options: [file, soundcloud, youtube] },
          { name: src, widget: string, required: false },
          { name: url, widget: string, required: false },
          { name: title, widget: string }
        ]}
      - { name: links, widget: list, default: [], i18n: duplicate, fields: [
          { name: label, widget: string },
          { name: url, widget: string }
        ]}
      - { name: collaborators, widget: list, default: [], i18n: duplicate }
      - { name: body, widget: markdown, i18n: true }
```

- [ ] **Step 3: Commit**

```bash
git add public/admin/
git commit -m "✨ feat: Sveltia CMS admin shell + config"
```

---

### Task 6.2: OAuth Worker template (docs + script)

**Files:**
- Create: `infra/oauth-worker/worker.ts`
- Create: `infra/oauth-worker/wrangler.toml`
- Create: `infra/oauth-worker/README.md`

- [ ] **Step 1: `infra/oauth-worker/worker.ts`**

```ts
export interface Env {
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	ALLOWED_ORIGIN: string; // e.g. "https://bitcrusher-studio.com"
}

const corsHeaders = (origin: string): HeadersInit => ({
	"Access-Control-Allow-Origin": origin,
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
});

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);
		const cors = corsHeaders(env.ALLOWED_ORIGIN);

		if (req.method === "OPTIONS") {
			return new Response(null, { headers: cors });
		}

		if (url.pathname === "/auth") {
			const state = crypto.randomUUID();
			const authUrl = new URL("https://github.com/login/oauth/authorize");
			authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
			authUrl.searchParams.set("scope", "repo,user");
			authUrl.searchParams.set("state", state);
			authUrl.searchParams.set(
				"redirect_uri",
				`${url.origin}/callback`,
			);
			return Response.redirect(authUrl.toString(), 302);
		}

		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			if (!code) return new Response("Missing code", { status: 400 });
			const r = await fetch("https://github.com/login/oauth/access_token", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code,
				}),
			});
			const data = (await r.json()) as { access_token?: string };
			if (!data.access_token)
				return new Response("Token exchange failed", { status: 500 });

			// Sveltia expects a postMessage to the opener window.
			const html = `<!doctype html><html><body><script>
window.opener.postMessage(
  'authorization:github:success:${JSON.stringify({ token: data.access_token })}',
  '${env.ALLOWED_ORIGIN}'
);
window.close();
</script></body></html>`;
			return new Response(html, {
				headers: { "Content-Type": "text/html", ...cors },
			});
		}

		return new Response("Not found", { status: 404, headers: cors });
	},
};
```

- [ ] **Step 2: `infra/oauth-worker/wrangler.toml`**

```toml
name = "bitcrusher-oauth"
main = "worker.ts"
compatibility_date = "2024-11-01"

# Secrets set via:
# wrangler secret put GITHUB_CLIENT_ID
# wrangler secret put GITHUB_CLIENT_SECRET

[vars]
ALLOWED_ORIGIN = "https://bitcrusher-studio.com"
```

- [ ] **Step 3: `infra/oauth-worker/README.md`**

```markdown
# OAuth Worker — Sveltia ↔ GitHub

Minimal Cloudflare Worker that exchanges a GitHub OAuth code for an access token, posting it back to the Sveltia admin window.

## Setup

1. Create a GitHub OAuth app (Settings → Developer settings → OAuth Apps) with Authorization callback URL `https://bitcrusher-oauth.<subdomain>.workers.dev/callback`.
2. `cd infra/oauth-worker && npm install -g wrangler`
3. `wrangler login`
4. `wrangler secret put GITHUB_CLIENT_ID`
5. `wrangler secret put GITHUB_CLIENT_SECRET`
6. Update `ALLOWED_ORIGIN` in `wrangler.toml` if the production domain changes.
7. `wrangler deploy`
8. Update `public/admin/config.yml` `backend.base_url` to the deployed Worker URL.
```

- [ ] **Step 4: Commit**

```bash
git add infra/
git commit -m "📝 docs: OAuth Worker template for Sveltia CMS"
```

---

### Task 6.3: SSG meta smoke test

**Files:**
- Create: `tests/smoke/ssg-meta.test.ts`

- [ ] **Step 1: Install parser + writing**

```bash
npm install -D node-html-parser
```

- [ ] **Step 2: Write test**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";
import { describe, expect, it } from "vitest";

const DIST = join(process.cwd(), "dist");

const walk = (dir: string, out: string[] = []): string[] => {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const s = statSync(full);
		if (s.isDirectory()) walk(full, out);
		else if (name === "index.html") out.push(full);
	}
	return out;
};

describe.skipIf(!existsSync(DIST))("SSG meta smoke", () => {
	const files = walk(DIST);

	it("produces at least 13 prerendered pages", () => {
		expect(files.length).toBeGreaterThanOrEqual(13);
	});

	for (const file of walk(DIST)) {
		it(`${file.replace(DIST, "")} has title and meta description`, () => {
			const html = parse(readFileSync(file, "utf8"));
			expect(html.querySelector("title")?.text).toBeTruthy();
			expect(
				html.querySelector('meta[name="description"]')?.getAttribute("content"),
			).toBeTruthy();
		});
	}
});
```

- [ ] **Step 3: Build + run**

```bash
npm run build && npm run test -- tests/smoke/ssg-meta
```

Expected: all pass. If a file lacks a `<title>`, fix the SEO wiring in Phase 5 before moving on.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke/ssg-meta.test.ts package.json package-lock.json
git commit -m "🧪 feat: SSG meta smoke test across all prerendered pages"
```

---

### Task 6.4: Axe-core a11y smoke

**Files:**
- Create: `tests/smoke/a11y.test.ts`

- [ ] **Step 1: Write test**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

const DIST = join(process.cwd(), "dist");

const walk = (dir: string, out: string[] = []): string[] => {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const s = statSync(full);
		if (s.isDirectory()) walk(full, out);
		else if (name === "index.html") out.push(full);
	}
	return out;
};

const runAxe = async (html: string, theme: "graphite" | "mahogany") => {
	const dom = new JSDOM(html, { runScripts: "outside-only" });
	dom.window.document.documentElement.dataset.theme = theme;
	// @ts-expect-error — axe expects a browser window
	const results = await axe.run(dom.window.document.documentElement, {
		runOnly: ["wcag2a", "wcag2aa"],
	});
	return results.violations.filter(
		(v) => v.impact === "serious" || v.impact === "critical",
	);
};

describe.skipIf(!existsSync(DIST))("axe-core a11y smoke", () => {
	for (const file of walk(DIST)) {
		const relFile = file.replace(DIST, "");
		for (const theme of ["graphite", "mahogany"] as const) {
			it(`${relFile} has no critical/serious violations (${theme})`, async () => {
				const html = readFileSync(file, "utf8");
				const violations = await runAxe(html, theme);
				if (violations.length) {
					console.error(
						violations.map((v) => `${v.id} — ${v.description}`).join("\n"),
					);
				}
				expect(violations).toHaveLength(0);
			});
		}
	}
});
```

- [ ] **Step 2: Run**

```bash
npm run build && npm run test -- tests/smoke/a11y
```

Expected: zero critical/serious across all pages. If any fail, fix inline (likely color-contrast or missing labels).

- [ ] **Step 3: Commit**

```bash
git add tests/smoke/a11y.test.ts
git commit -m "🧪 feat: axe-core a11y smoke across pages × themes"
```

---

### Task 6.5: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write workflow**

```yaml
name: CI & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsx scripts/sync-content-types.ts
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [build]
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "🚀 feat: CI pipeline (lint → typecheck → test → build → deploy)"
```

---

### Task 6.6: Phase 6 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run build && npm run test
```

All exit 0. Note: Sveltia is verified once a real GH repo + Worker exist; CI validates everything else now.

Phase 6 complete. Proceed to `phase-7-content-docs.md`.
