import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
// @ts-expect-error — published types lag behind the runtime API
import { AudioContext } from "node-web-audio-api";

const MEDIA_ROOT = join(process.cwd(), "public/media");
const CACHE_PATH = join(MEDIA_ROOT, ".peaks-cache.json");
const BUCKET_COUNT = 1000;

interface CacheEntry {
	mtimeMs: number;
	size: number;
	hash: string;
}
type Cache = Record<string, CacheEntry>;

const walkAudio = async (
	dir: string,
	out: string[] = [],
): Promise<string[]> => {
	if (!existsSync(dir)) return out;
	for (const name of await readdir(dir)) {
		const full = join(dir, name);
		const s = await stat(full);
		if (s.isDirectory()) {
			await walkAudio(full, out);
		} else if ([".mp3", ".ogg", ".wav", ".m4a"].includes(extname(name))) {
			out.push(full);
		}
	}
	return out;
};

const bucketize = (samples: Float32Array, buckets: number): number[] => {
	const step = Math.floor(samples.length / buckets);
	const peaks: number[] = [];
	for (let i = 0; i < buckets; i++) {
		const start = i * step;
		const end = Math.min(samples.length, start + step);
		let max = 0;
		for (let j = start; j < end; j++) {
			const v = Math.abs(samples[j] ?? 0);
			if (v > max) max = v;
		}
		peaks.push(Number(max.toFixed(4)));
	}
	return peaks;
};

const loadCache = async (): Promise<Cache> => {
	try {
		return JSON.parse(await readFile(CACHE_PATH, "utf8"));
	} catch {
		return {};
	}
};

const run = async () => {
	const cache = await loadCache();
	const files = await walkAudio(MEDIA_ROOT);
	const ctx = new AudioContext({ sampleRate: 44100 });
	let rebuilt = 0;

	for (const file of files) {
		const rel = relative(MEDIA_ROOT, file);
		const s = await stat(file);
		const raw = await readFile(file);
		const hash = createHash("md5").update(raw).digest("hex").slice(0, 12);
		const cached = cache[rel];
		if (cached && cached.mtimeMs === s.mtimeMs && cached.hash === hash)
			continue;

		const audio = await ctx.decodeAudioData(raw.buffer.slice(0));
		const channel = audio.getChannelData(0);
		const peaks = bucketize(channel, BUCKET_COUNT);
		const duration = audio.duration;
		const out = `${file.replace(/\.[^.]+$/, "")}.peaks.json`;
		await writeFile(
			out,
			JSON.stringify({ peaks, duration: Number(duration.toFixed(3)) }),
			"utf8",
		);
		cache[rel] = { mtimeMs: s.mtimeMs, size: s.size, hash };
		rebuilt += 1;
		console.log(
			`[waveforms] ${rel} → ${peaks.length} peaks (${duration.toFixed(2)}s)`,
		);
	}

	await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
	console.log(`[waveforms] done, ${rebuilt} rebuilt, ${files.length} total`);
	process.exit(0);
};

run().catch((e) => {
	console.error("[waveforms] fatal:", e);
	process.exit(1);
});
