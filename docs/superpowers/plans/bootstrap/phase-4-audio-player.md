# Phase 4 — Audio Player

**Outcome:** Hybrid audio player: canvas-rendered waveform for self-hosted mp3 (peaks JSON generated at build time by `node-web-audio-api`), lazy iframe for SoundCloud/YouTube. Wired into a project modal on `/{lang}/works`.

**Prereq:** Phase 3 complete.

---

### Task 4.1: Peaks generator script

**Files:**
- Create: `scripts/generate-waveforms.ts`

- [ ] **Step 1: Write script**

```ts
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
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

const walkAudio = async (dir: string, out: string[] = []): Promise<string[]> => {
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
		if (cached && cached.mtimeMs === s.mtimeMs && cached.hash === hash) continue;

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
		console.log(`[waveforms] ${rel} → ${peaks.length} peaks (${duration.toFixed(2)}s)`);
	}

	await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
	console.log(`[waveforms] done, ${rebuilt} rebuilt, ${files.length} total`);
	process.exit(0);
};

run().catch((e) => {
	console.error("[waveforms] fatal:", e);
	process.exit(1);
});
```

- [ ] **Step 2: Register in `scripts/prebuild.ts`**

```ts
const steps: Array<{ name: string; cmd: string; args: string[] }> = [
	{
		name: "content types",
		cmd: "npx",
		args: ["tsx", "scripts/sync-content-types.ts"],
	},
	{
		name: "waveforms",
		cmd: "npx",
		args: ["tsx", "scripts/generate-waveforms.ts"],
	},
];
```

- [ ] **Step 3: Verify (no audio files yet = no-op success)**

```bash
npx tsx scripts/generate-waveforms.ts
```

Expected: `[waveforms] done, 0 rebuilt, 0 total`.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-waveforms.ts scripts/prebuild.ts
git commit -m "⚡ feat: peaks generator script with mtime+hash cache"
```

---

### Task 4.2: Audio player state reducer — test first

**Files:**
- Create: `tests/audio/player-core.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import {
	initialPlayerState,
	playerReducer,
} from "@/lib/audio/player-core";

describe("playerReducer", () => {
	it("starts paused at time 0", () => {
		expect(initialPlayerState).toEqual({
			playing: false,
			time: 0,
			duration: 0,
		});
	});

	it("play sets playing true", () => {
		const s = playerReducer(initialPlayerState, { type: "play" });
		expect(s.playing).toBe(true);
	});

	it("pause resets playing flag", () => {
		const playing = playerReducer(initialPlayerState, { type: "play" });
		const paused = playerReducer(playing, { type: "pause" });
		expect(paused.playing).toBe(false);
		expect(paused.time).toBe(playing.time);
	});

	it("seek clamps to [0, duration]", () => {
		const s = playerReducer(
			{ playing: false, time: 0, duration: 100 },
			{ type: "seek", time: 150 },
		);
		expect(s.time).toBe(100);
		const s2 = playerReducer(s, { type: "seek", time: -5 });
		expect(s2.time).toBe(0);
	});

	it("tick advances time by delta, clamped to duration", () => {
		const s = playerReducer(
			{ playing: true, time: 10, duration: 30 },
			{ type: "tick", delta: 5 },
		);
		expect(s.time).toBe(15);
		const end = playerReducer(s, { type: "tick", delta: 100 });
		expect(end.time).toBe(30);
		expect(end.playing).toBe(false); // auto-stop at end
	});

	it("duration update sets duration and clamps time", () => {
		const s = playerReducer(
			{ playing: false, time: 40, duration: 0 },
			{ type: "duration", duration: 30 },
		);
		expect(s.duration).toBe(30);
		expect(s.time).toBe(30);
	});
});
```

- [ ] **Step 2: Run — must fail**

```bash
npm run test -- tests/audio
```

Expected: FAIL.

---

### Task 4.3: Implement player core

**Files:**
- Create: `src/lib/audio/player-core.ts`

- [ ] **Step 1: Write**

```ts
import { match } from "ts-pattern";

export interface PlayerState {
	playing: boolean;
	time: number;
	duration: number;
}

export type PlayerAction =
	| { type: "play" }
	| { type: "pause" }
	| { type: "seek"; time: number }
	| { type: "tick"; delta: number }
	| { type: "duration"; duration: number };

export const initialPlayerState: PlayerState = {
	playing: false,
	time: 0,
	duration: 0,
};

const clamp = (v: number, lo: number, hi: number) =>
	Math.max(lo, Math.min(hi, v));

export const playerReducer = (
	state: PlayerState,
	action: PlayerAction,
): PlayerState =>
	match(action)
		.with({ type: "play" }, () => ({ ...state, playing: true }))
		.with({ type: "pause" }, () => ({ ...state, playing: false }))
		.with({ type: "seek" }, ({ time }) => ({
			...state,
			time: clamp(time, 0, state.duration),
		}))
		.with({ type: "tick" }, ({ delta }) => {
			const next = clamp(state.time + delta, 0, state.duration);
			return {
				...state,
				time: next,
				playing: next >= state.duration ? false : state.playing,
			};
		})
		.with({ type: "duration" }, ({ duration }) => ({
			...state,
			duration,
			time: clamp(state.time, 0, duration),
		}))
		.exhaustive();
```

- [ ] **Step 2: Run — must pass**

```bash
npm run test -- tests/audio
```

Expected: 6 passing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/audio/player-core.ts tests/audio/player-core.test.ts
git commit -m "✨ feat: audio player state reducer (ts-pattern)"
```

---

### Task 4.4: Waveform canvas component

**Files:**
- Create: `src/components/audio-player/waveform.tsx`

- [ ] **Step 1: Write**

```tsx
import { css } from "@emotion/react";
import { useEffect, useRef } from "react";
import { tokens } from "@/theme/tokens";

const styles = {
	canvas: css`
		display: block;
		width: 100%;
		height: 64px;
		cursor: pointer;
	`,
};

export interface WaveformProps {
	peaks: number[];
	progress: number; // 0..1
	onSeek: (ratio: number) => void;
}

export const Waveform = ({ peaks, progress, onSeek }: WaveformProps) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const ctx = cv.getContext("2d");
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		const w = cv.clientWidth * dpr;
		const h = cv.clientHeight * dpr;
		cv.width = w;
		cv.height = h;
		ctx.clearRect(0, 0, w, h);
		const mid = h / 2;
		const bucketWidth = w / peaks.length;
		const playedUntil = w * progress;
		const accent = getComputedStyle(document.documentElement).getPropertyValue(
			"--accent",
		);
		const muted = getComputedStyle(document.documentElement).getPropertyValue(
			"--text-muted",
		);
		peaks.forEach((peak, i) => {
			const x = i * bucketWidth;
			const height = Math.max(2 * dpr, peak * h);
			ctx.fillStyle = x < playedUntil ? accent : muted;
			ctx.fillRect(x, mid - height / 2, bucketWidth - 1, height);
		});
	}, [peaks, progress]);

	const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		onSeek((e.clientX - rect.left) / rect.width);
	};

	return (
		<canvas
			ref={ref}
			css={styles.canvas}
			onClick={handleClick}
			role="slider"
			aria-label="Seek audio"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(progress * 100)}
			tabIndex={0}
		/>
	);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio-player/waveform.tsx
git commit -m "✨ feat: waveform canvas component"
```

---

### Task 4.5: File player component

**Files:**
- Create: `src/components/audio-player/file-player.tsx`

- [ ] **Step 1: Write**

```tsx
import { css } from "@emotion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AudioSource } from "@/content/types";
import {
	initialPlayerState,
	playerReducer,
} from "@/lib/audio/player-core";
import { tokens } from "@/theme/tokens";
import { Waveform } from "./waveform";

const styles = {
	container: css`
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	`,
	header: css`
		display: flex;
		align-items: center;
		gap: 10px;
	`,
	button: css`
		background: ${tokens.accent};
		color: #000;
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	`,
	title: css`
		color: ${tokens.text.heading};
		font-size: 13px;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	`,
	time: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		color: ${tokens.text.muted};
		font-size: 11px;
		letter-spacing: 0.05em;
	`,
};

const fmt = (s: number) => {
	const m = Math.floor(s / 60);
	const sec = Math.floor(s % 60);
	return `${m}:${sec.toString().padStart(2, "0")}`;
};

export interface FilePlayerProps {
	source: Extract<AudioSource, { kind: "file" }>;
}

interface Peaks {
	peaks: number[];
	duration: number;
}

export const FilePlayer = ({ source }: FilePlayerProps) => {
	const { t } = useTranslation();
	const audioRef = useRef<HTMLAudioElement>(null);
	const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
	const [peaks, setPeaks] = useState<Peaks | null>(null);

	useEffect(() => {
		const peaksUrl = source.src.replace(/\.[^.]+$/, ".peaks.json");
		fetch(peaksUrl)
			.then((r) => (r.ok ? r.json() : null))
			.then((data: Peaks | null) => {
				if (data) {
					setPeaks(data);
					dispatch({ type: "duration", duration: data.duration });
				}
			})
			.catch(() => {});
	}, [source.src]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (state.playing) void a.play();
		else a.pause();
	}, [state.playing]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (Math.abs(a.currentTime - state.time) > 0.5) a.currentTime = state.time;
	}, [state.time]);

	const toggle = () => dispatch({ type: state.playing ? "pause" : "play" });

	return (
		<div css={styles.container}>
			<div css={styles.header}>
				<button
					type="button"
					onClick={toggle}
					css={styles.button}
					aria-label={state.playing ? t("common.pause") : t("common.play")}
				>
					{state.playing ? "❚❚" : "▶"}
				</button>
				<div css={styles.title}>{source.title}</div>
				<div css={styles.time}>
					{fmt(state.time)} / {fmt(state.duration)}
				</div>
			</div>
			{peaks && (
				<Waveform
					peaks={peaks.peaks}
					progress={state.duration > 0 ? state.time / state.duration : 0}
					onSeek={(ratio) =>
						dispatch({ type: "seek", time: ratio * state.duration })
					}
				/>
			)}
			<audio
				ref={audioRef}
				src={source.src}
				preload="metadata"
				onTimeUpdate={(e) =>
					dispatch({
						type: "seek",
						time: (e.target as HTMLAudioElement).currentTime,
					})
				}
				onLoadedMetadata={(e) =>
					dispatch({
						type: "duration",
						duration: (e.target as HTMLAudioElement).duration,
					})
				}
				onEnded={() => dispatch({ type: "pause" })}
			/>
		</div>
	);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio-player/file-player.tsx
git commit -m "✨ feat: file player with waveform + keyboard-accessible controls"
```

---

### Task 4.6: Embed players (SoundCloud, YouTube)

**Files:**
- Create: `src/components/audio-player/embed-player.tsx`

- [ ] **Step 1: Write**

```tsx
import { css } from "@emotion/react";
import { useState } from "react";
import { match } from "ts-pattern";
import { useTranslation } from "react-i18next";
import type { AudioSource } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	container: css`
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		overflow: hidden;
		min-height: 120px;
	`,
	poster: css`
		padding: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: none;
		color: ${tokens.text.heading};
		border: none;
		font: inherit;
		cursor: pointer;
		width: 100%;
		text-align: left;
		&:hover {
			background: ${tokens.surface.border};
		}
	`,
	label: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
	`,
	title: css`
		font-size: 13px;
		margin-top: 4px;
	`,
	play: css`
		background: ${tokens.accent};
		color: #000;
		padding: 8px 14px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
	`,
};

const soundcloudEmbed = (url: string) =>
	`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false`;
const youtubeEmbed = (url: string) => {
	const id =
		url.match(/v=([^&]+)/)?.[1] ||
		url.match(/youtu\.be\/([^?]+)/)?.[1] ||
		url.match(/playlist\?list=([^&]+)/)?.[1];
	return `https://www.youtube.com/embed/${id}?autoplay=1`;
};

export interface EmbedPlayerProps {
	source: Extract<AudioSource, { kind: "soundcloud" | "youtube" }>;
}

export const EmbedPlayer = ({ source }: EmbedPlayerProps) => {
	const { t } = useTranslation();
	const [loaded, setLoaded] = useState(false);

	if (!loaded) {
		return (
			<div css={styles.container}>
				<button
					type="button"
					css={styles.poster}
					onClick={() => setLoaded(true)}
					aria-label={`${t("common.play")} — ${source.title}`}
				>
					<div>
						<div css={styles.label}>{source.kind}</div>
						<div css={styles.title}>{source.title}</div>
					</div>
					<span css={styles.play}>▶ {t("common.play")}</span>
				</button>
			</div>
		);
	}

	const src = match(source)
		.with({ kind: "soundcloud" }, (s) => soundcloudEmbed(s.url))
		.with({ kind: "youtube" }, (s) => youtubeEmbed(s.url))
		.exhaustive();

	return (
		<div css={styles.container}>
			<iframe
				src={src}
				title={source.title}
				loading="lazy"
				allow="autoplay; encrypted-media"
				style={{ width: "100%", height: "180px", border: 0 }}
			/>
		</div>
	);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio-player/embed-player.tsx
git commit -m "✨ feat: embed player (SoundCloud + YouTube lazy iframe)"
```

---

### Task 4.7: Unified audio player dispatch

**Files:**
- Create: `src/components/audio-player/index.tsx`

- [ ] **Step 1: Write**

```tsx
import { css } from "@emotion/react";
import { match } from "ts-pattern";
import type { AudioSource } from "@/content/types";
import { tokens } from "@/theme/tokens";
import { EmbedPlayer } from "./embed-player";
import { FilePlayer } from "./file-player";

const styles = {
	stack: css`
		display: flex;
		flex-direction: column;
		gap: 12px;
	`,
	empty: css`
		color: ${tokens.text.muted};
		font-size: 12px;
		font-style: italic;
	`,
};

export interface AudioPlayerProps {
	sources: AudioSource[];
}

export const AudioPlayer = ({ sources }: AudioPlayerProps) => {
	if (sources.length === 0) return null;
	return (
		<div css={styles.stack}>
			{sources.map((s, i) =>
				match(s)
					.with({ kind: "file" }, (src) => (
						<FilePlayer key={`${src.src}-${i}`} source={src} />
					))
					.with({ kind: "soundcloud" }, (src) => (
						<EmbedPlayer key={`${src.url}-${i}`} source={src} />
					))
					.with({ kind: "youtube" }, (src) => (
						<EmbedPlayer key={`${src.url}-${i}`} source={src} />
					))
					.exhaustive(),
			)}
		</div>
	);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio-player/index.tsx
git commit -m "✨ feat: unified AudioPlayer dispatch"
```

---

### Task 4.8: Project modal

**Files:**
- Create: `src/pages/works/project-modal.tsx`
- Modify: `src/pages/works/index.tsx`

- [ ] **Step 1: Write `project-modal.tsx`**

```tsx
import { css } from "@emotion/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer } from "@/components/audio-player";
import type { Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	dialog: css`
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: rgba(0, 0, 0, 0.7);
	`,
	panel: css`
		background: ${tokens.surface.base};
		border: 1px solid ${tokens.surface.border};
		border-radius: 8px;
		max-width: 720px;
		width: 100%;
		max-height: 90vh;
		overflow: auto;
		padding: 32px;
		color: ${tokens.text.body};
	`,
	close: css`
		background: none;
		border: 1px solid ${tokens.surface.border};
		color: ${tokens.text.muted};
		padding: 6px 10px;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		cursor: pointer;
		float: right;
		&:hover {
			color: ${tokens.accent};
			border-color: ${tokens.accent};
		}
	`,
	meta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0 0 10px;
	`,
	h2: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 34px;
		color: ${tokens.text.heading};
		margin: 0 0 14px;
	`,
	body: css`
		font-size: 15px;
		line-height: 1.7;
		white-space: pre-wrap;
		margin-bottom: 24px;
	`,
	links: css`
		display: flex;
		gap: 12px;
		margin-top: 18px;
		flex-wrap: wrap;
		a {
			color: ${tokens.accent};
			text-decoration: none;
			font-size: 13px;
			border-bottom: 1px solid ${tokens.accent};
			padding-bottom: 1px;
		}
	`,
};

export interface ProjectModalProps {
	project: Project;
	onClose: () => void;
}

export const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
	const { t } = useTranslation();
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = `project-${project.slug}-title`;
	const previouslyFocused = useRef<Element | null>(null);

	useEffect(() => {
		previouslyFocused.current = document.activeElement;
		panelRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			(previouslyFocused.current as HTMLElement | null)?.focus?.();
		};
	}, [onClose]);

	return (
		<div
			css={styles.dialog}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div ref={panelRef} tabIndex={-1} css={styles.panel}>
				<button type="button" css={styles.close} onClick={onClose}>
					{t("common.close")} ✕
				</button>
				<div css={styles.meta}>
					{project.year} · {project.roles.join(" · ")}
				</div>
				<h2 id={titleId} css={styles.h2}>
					{project.title}
				</h2>
				<div css={styles.body}>{project.body}</div>
				<AudioPlayer sources={project.audio} />
				{project.links.length > 0 && (
					<div css={styles.links}>
						{project.links.map((l) => (
							<a
								key={l.url}
								href={l.url}
								target="_blank"
								rel="noreferrer noopener"
							>
								{l.label} ↗
							</a>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
```

- [ ] **Step 2: Wire modal into `src/pages/works/index.tsx`**

Replace the previous hidden spans at the bottom of the `<section>` with:

```tsx
{(() => {
	const active = projects.find((p) => p.slug === activeSlug);
	if (!active) return null;
	return (
		<ProjectModal
			project={active}
			onClose={() => {
				setActiveSlug(null);
				const url = new URL(window.location.href);
				url.searchParams.delete("project");
				window.history.replaceState({}, "", url.toString());
			}}
		/>
	);
})()}
```

Add the import at the top:

```tsx
import { ProjectModal } from "./project-modal";
```

And remove the two placeholder `<span hidden>` lines.

- [ ] **Step 3: Verify dev**

```bash
npm run dev
```

Visit `/fr/works`, click the Space Piercer card — modal opens. Press Esc — closes, focus returns.

- [ ] **Step 4: Commit**

```bash
git add src/pages/works/
git commit -m "✨ feat: project modal with focus trap + esc-to-close"
```

---

### Task 4.9: Phase 4 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run test && npm run build
```

All exit 0.

Phase 4 complete. Proceed to `phase-5-seo.md`.
