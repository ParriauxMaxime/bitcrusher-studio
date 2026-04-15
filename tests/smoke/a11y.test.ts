import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import axe from "axe-core";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const DIST = join(process.cwd(), "dist");

const EXCLUDED_DIRS = new Set(["admin"]);

const walk = (dir: string, out: string[] = []): string[] => {
	for (const name of readdirSync(dir)) {
		if (EXCLUDED_DIRS.has(name)) continue;
		const full = join(dir, name);
		const s = statSync(full);
		if (s.isDirectory()) walk(full, out);
		else if (name === "index.html") out.push(full);
	}
	return out;
};

const runAxe = async (
	html: string,
	theme: "graphite" | "mahogany",
): Promise<axe.Result[]> => {
	const dom = new JSDOM(html, { runScripts: "dangerously" });
	dom.window.document.documentElement.dataset.theme = theme;
	// Inject axe-core source into the JSDOM window so it runs in the right context
	const script = dom.window.document.createElement("script");
	script.textContent = axe.source;
	dom.window.document.head.appendChild(script);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const windowAxe = (dom.window as unknown as { axe: typeof axe }).axe;
	const results = await windowAxe.run(dom.window.document, {
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
