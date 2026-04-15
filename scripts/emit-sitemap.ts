import { existsSync } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
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
