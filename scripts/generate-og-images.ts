import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadAllContent } from "../src/content/loader";
import { ALL_LOCALES } from "../src/content/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OG_DIR = join(process.cwd(), "public/og");
const CACHE = join(OG_DIR, ".cache.json");
const FONT_PATH = join(__dirname, "instrument-serif-italic.ttf");

const xmlEscape = (s: string): string =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

const vuLed = (x: number, y: number, color: string, lit: boolean): string =>
	lit
		? `<circle cx="${x}" cy="${y}" r="14" fill="${color}" opacity="0.08"/><circle cx="${x}" cy="${y}" r="8" fill="${color}" opacity="0.9"/>`
		: `<circle cx="${x}" cy="${y}" r="8" fill="#2a3a4a"/>`;

const vuColumn = (x: number, level: number): string => {
	const colors = [
		"#5ba32b",
		"#5ba32b",
		"#5ba32b",
		"#5ba32b",
		"#e8b62a",
		"#e8b62a",
		"#e8b62a",
		"#ff5a4a",
		"#ff5a4a",
	];
	return colors
		.map((c, i) => vuLed(x, 540 - i * 22, c, i < level))
		.join("\n    ");
};

const template = (title: string, subtitle: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2838"/>
      <stop offset="1" stop-color="#171a21"/>
    </linearGradient>
    <style>
      @font-face {
        font-family: 'Instrument Serif';
        font-style: italic;
        font-weight: 400;
        src: url(data:font/truetype;base64,FONT_BASE64) format('truetype');
      }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>

  <!-- Scanlines overlay -->
  <defs>
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="transparent"/>
      <rect y="2" width="4" height="2" fill="rgba(0,0,0,0.25)"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#scanlines)"/>

  <!-- Vignette -->
  <radialGradient id="vig" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="transparent"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.5)"/>
  </radialGradient>
  <rect width="1200" height="630" fill="url(#vig)"/>

  <!-- Organic glow filter (blurred + noise-distorted) -->
  <filter id="glow" x="-15%" y="-15%" width="130%" height="130%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
    <feDisplacementMap in="blur" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="warped"/>
    <feMerge>
      <feMergeNode in="warped"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Brand glow (diffuse, multi-layer) -->
  <text x="80" y="300" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="160" font-weight="400" fill="#66c0f4" opacity="0.2" filter="url(#glow)">Bitcrusher Studio</text>
  <text x="80" y="300" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="160" font-weight="400" fill="#e5e5e5">Bitcrusher <tspan fill="#66c0f4">Studio</tspan></text>

  <!-- Chromatic aberration on brand -->
  <text x="77" y="300" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="160" font-weight="400" fill="rgba(255,90,74,0.12)">Bitcrusher Studio</text>
  <text x="83" y="300" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="160" font-weight="400" fill="rgba(102,192,244,0.12)">Bitcrusher Studio</text>

  <!-- Tagline -->
  <text x="80" y="400" font-family="Inter, sans-serif" font-size="36" fill="#acb2b8">${xmlEscape(subtitle.slice(0, 70))}</text>

  <!-- VU meter decoration (right side) -->
  <g>
    ${vuColumn(1090, 7)}
    ${vuColumn(1130, 8)}
  </g>
</svg>
`;

interface CacheMap {
	[key: string]: string;
}

const run = async () => {
	await mkdir(OG_DIR, { recursive: true });
	const fontB64 = (await readFile(FONT_PATH)).toString("base64");
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

	for (const { key, title, subtitle } of queue) {
		const svg = template(title, subtitle).replace("FONT_BASE64", fontB64);
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
