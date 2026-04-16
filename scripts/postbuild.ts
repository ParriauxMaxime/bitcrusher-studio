import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import i18next from "i18next";
import { JSDOM } from "jsdom";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { initReactI18next } from "react-i18next";
import enUi from "../src/i18n/resources/en/ui.json";
import esUi from "../src/i18n/resources/es/ui.json";
import frUi from "../src/i18n/resources/fr/ui.json";
// Import RootSSR at top level so @emotion/react loads before jsdom globals are set,
// ensuring isBrowser=false (SSR mode) in Emotion's module-level initialisation.
import { RootSSR } from "../src/root-ssr";
import { ROUTES } from "../src/routes";

const DIST = join(process.cwd(), "dist");

const setupJsdomGlobals = (url: string): void => {
	const dom = new JSDOM("<!doctype html><html><body></body></html>", { url });
	const g = globalThis as unknown as {
		window: typeof dom.window;
		document: Document;
		navigator: Navigator;
		location: Location;
	};
	g.window = dom.window;
	g.document = dom.window.document;
	g.navigator = dom.window.navigator;
	g.location = dom.window.location;
	dom.window.document.documentElement.dataset.theme = "graphite";
};

const initI18nSync = async (locale: "fr" | "en" | "es"): Promise<void> => {
	if (!i18next.isInitialized) {
		await i18next.use(initReactI18next).init({
			lng: locale,
			fallbackLng: "fr",
			defaultNS: "ui",
			ns: ["ui"],
			resources: {
				fr: { ui: frUi },
				en: { ui: enUi },
				es: { ui: esUi },
			},
			interpolation: { escapeValue: false },
		});
	} else {
		await i18next.changeLanguage(locale);
	}
};

// Satisfy TypeScript: RootSSR returns ReactElement
const renderSSR: (props: { routePath: string }) => ReactElement =
	RootSSR as (props: { routePath: string }) => ReactElement;

const renderRoute = async (routePath: string): Promise<string> => {
	const url = `http://localhost${routePath === "/" ? "/" : routePath}`;
	setupJsdomGlobals(url);

	const route = ROUTES.find((r) => r.path === routePath);
	const locale = ((route as { locale?: string } | undefined)?.locale ?? "fr") as
		| "fr"
		| "en"
		| "es";
	await initI18nSync(locale);

	return renderToString(renderSSR({ routePath }));
};

/** Hoist <title> and <meta name="description"> from body HTML into <head>. */
const hoistHeadTags = (template: string, bodyHtml: string): string => {
	let out = template;

	// Extract and hoist <title>
	const titleMatch = bodyHtml.match(/<title>([^<]*)<\/title>/);
	if (titleMatch) {
		out = out.replace(
			/<title>[^<]*<\/title>/,
			`<title>${titleMatch[1]}</title>`,
		);
	}

	// Extract all self-closing tags that belong in <head>:
	// <meta .../>, <link .../>, <script type="application/ld+json">...</script>
	const headTags: string[] = [];

	// All <meta> tags (og:*, twitter:*, description) — match with or without self-closing
	const metaRe = /<meta\s[^>]*\/?>/g;
	for (const m of bodyHtml.matchAll(metaRe)) {
		headTags.push(m[0]);
	}

	// All <link rel="..."> tags (canonical, alternate/hreflang)
	const linkRe = /<link\s[^>]*\/?>/g;
	for (const m of bodyHtml.matchAll(linkRe)) {
		headTags.push(m[0]);
	}

	// JSON-LD script blocks
	const ldRe = /<script type="application\/ld\+json">[^<]*<\/script>/g;
	for (const m of bodyHtml.matchAll(ldRe)) {
		headTags.push(m[0]);
	}

	if (headTags.length > 0) {
		out = out.replace("</head>", `${headTags.join("\n")}\n</head>`);
	}

	return out;
};

const writeHtml = async (
	routePath: string,
	template: string,
): Promise<void> => {
	const bodyHtml = await renderRoute(routePath);
	const withBody = template.replace(
		/<div id="root">[\s\S]*?<\/div>/,
		`<div id="root">${bodyHtml}</div>`,
	);
	const final = hoistHeadTags(withBody, bodyHtml);
	const outDir = routePath === "/" ? DIST : join(DIST, routePath);
	await mkdir(outDir, { recursive: true });
	const outFile = join(outDir, "index.html");
	await writeFile(outFile, final, "utf8");
	console.log(`[postbuild] wrote ${outFile} (${bodyHtml.length}b body)`);
};

const main = async (): Promise<void> => {
	const template = await readFile(join(DIST, "index.html"), "utf8");
	for (const route of ROUTES) {
		await writeHtml(route.path, template);
	}
	console.log(`[postbuild] prerendered ${ROUTES.length} routes`);
};

main().catch((e) => {
	console.error("[postbuild] fatal:", e);
	process.exit(1);
});
