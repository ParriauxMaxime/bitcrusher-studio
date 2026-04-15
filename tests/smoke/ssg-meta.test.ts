import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";
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

describe.skipIf(!existsSync(DIST))("SSG meta smoke", () => {
	const files = walk(DIST);

	it("produces at least 7 prerendered pages", () => {
		expect(files.length).toBeGreaterThanOrEqual(7);
	});

	// Root / is a redirect-only shell (no SEO meta needed — users are bounced to /{locale}/).
	const ROOT_INDEX = join(DIST, "index.html");

	for (const file of files) {
		if (file === ROOT_INDEX) continue;
		it(`${file.replace(DIST, "")} has title and meta description`, () => {
			const html = parse(readFileSync(file, "utf8"));
			expect(html.querySelector("title")?.text).toBeTruthy();
			expect(
				html.querySelector('meta[name="description"]')?.getAttribute("content"),
			).toBeTruthy();
		});
	}
});
