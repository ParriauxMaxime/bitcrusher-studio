import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { loadAllContent } from "../src/content/loader";
import { ALL_LOCALES } from "../src/content/types";

const OG_DIR = join(process.cwd(), "public/og");
const CACHE = join(OG_DIR, ".cache.json");

const xmlEscape = (s: string): string =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

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
  <text x="80" y="340" font-family="Georgia, serif" font-style="italic" font-size="96" fill="#f0f0f2">${xmlEscape(title.slice(0, 40))}</text>
  <text x="80" y="420" font-family="Inter, sans-serif" font-size="28" fill="#b8b8c0">${xmlEscape(subtitle.slice(0, 80))}</text>
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
