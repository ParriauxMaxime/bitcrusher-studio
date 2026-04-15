import { watch } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
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
	watch(join(process.cwd(), "content"), { recursive: true }, () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			run().catch((e) => console.error("[content] error:", e));
		}, 80);
	});
})().catch((e) => {
	console.error("[content] fatal:", e);
	process.exit(1);
});
