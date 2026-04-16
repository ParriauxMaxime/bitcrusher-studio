import { css } from "@emotion/react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Waveform } from "@/components/audio-player/waveform";
import type { AudioSource } from "@/content/types";
import { initialPlayerState, playerReducer } from "@/lib/audio/player-core";
import { tokens } from "@/theme/tokens";

const styles = {
	container: css`
		display: flex;
		gap: 1px;
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		overflow: hidden;
		background: ${tokens.surface.border};
		@media (max-width: 640px) {
			flex-direction: column;
		}
	`,
	trackList: css`
		flex: 0 0 40%;
		background: rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		max-height: 200px;
		overflow-y: auto;
	`,
	trackItem: (active: boolean) => css`
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 12px;
		cursor: pointer;
		border: none;
		background: ${active ? "rgba(0, 0, 0, 0.3)" : "transparent"};
		color: ${active ? tokens.text.heading : tokens.text.body};
		font: inherit;
		text-align: left;
		border-left: 2px solid ${active ? tokens.accent : "transparent"};
		width: 100%;
		&:hover {
			background: rgba(0, 0, 0, 0.2);
		}
	`,
	trackIcon: css`
		color: ${tokens.accent};
		font-size: 14px;
		flex-shrink: 0;
		width: 18px;
		text-align: center;
	`,
	trackTitle: css`
		font-size: 12px;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	`,
	trackDuration: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		color: ${tokens.text.muted};
		letter-spacing: 0.05em;
	`,
	player: css`
		flex: 1;
		background: rgba(0, 0, 0, 0.15);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	`,
	playerTitle: css`
		font-size: 13px;
		color: ${tokens.text.heading};
		font-weight: 500;
	`,
	controls: css`
		display: flex;
		align-items: center;
		gap: 8px;
	`,
	playBtn: css`
		background: ${tokens.accent};
		color: #000;
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		cursor: pointer;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	`,
	time: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		color: ${tokens.text.muted};
		letter-spacing: 0.05em;
	`,
	volume: css`
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 6px;
	`,
	volumeLabel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		color: ${tokens.text.muted};
		letter-spacing: 0.05em;
		text-transform: uppercase;
	`,
	volumeSlider: css`
		width: 60px;
		appearance: none;
		height: 3px;
		border-radius: 2px;
		background: ${tokens.surface.border};
		outline: none;
		&::-webkit-slider-thumb {
			appearance: none;
			width: 10px;
			height: 10px;
			border-radius: 50%;
			background: ${tokens.accent};
			cursor: pointer;
			border: none;
		}
		&::-moz-range-thumb {
			width: 10px;
			height: 10px;
			border-radius: 50%;
			background: ${tokens.accent};
			cursor: pointer;
			border: none;
		}
	`,
	playerRight: css`
		display: flex;
		gap: 14px;
		align-items: flex-start;
	`,
	playerMain: css`
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	`,
};

const fmt = (s: number) => {
	const m = Math.floor(s / 60);
	const sec = Math.floor(s % 60);
	return `${m}:${sec.toString().padStart(2, "0")}`;
};

const VU_DOTS = 9;
const VU_DOT_COLORS = [
	tokens.led.c,
	tokens.led.c,
	tokens.led.c,
	tokens.led.c,
	tokens.led.a,
	tokens.led.a,
	tokens.led.a,
	tokens.led.b,
	tokens.led.b,
];

const VuColumn = ({ level }: { level: number }) => {
	const litCount = Math.round(level * VU_DOTS);
	return (
		<div
			css={css`
				display: flex;
				flex-direction: column-reverse;
				gap: 4px;
			`}
		>
			{Array.from({ length: VU_DOTS }, (_, i) => {
				const lit = i < litCount;
				const color = VU_DOT_COLORS[i] ?? tokens.led.off;
				return (
					<div
						key={i}
						css={css`
							width: 10px;
							height: 10px;
							border-radius: 50%;
							background: ${
								lit
									? `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), ${color} 50%, rgba(0,0,0,0.3) 100%)`
									: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), ${tokens.led.off} 60%, rgba(0,0,0,0.4) 100%)`
							};
							box-shadow: ${
								lit
									? `0 0 8px 2px ${color}, inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)`
									: `inset 0 -1px 2px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)`
							};
							transition: background 0.06s, box-shadow 0.06s;
						`}
					/>
				);
			})}
		</div>
	);
};

const VuMeter = ({ levels }: { levels: [number, number] }) => (
	<div
		css={css`
			display: flex;
			gap: 4px;
			align-items: flex-end;
			padding: 8px 4px;
		`}
	>
		<VuColumn level={levels[0]} />
		<VuColumn level={levels[1]} />
	</div>
);

interface Peaks {
	peaks: number[];
	duration: number;
}

export interface MusicSetProps {
	sources: Array<Extract<AudioSource, { kind: "file" }>>;
}

const VOLUME_KEY = "audio-volume";

export const MusicSet = ({ sources }: MusicSetProps) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
	const [peaks, setPeaks] = useState<Peaks | null>(null);
	const [volume, setVolume] = useState<number>(() => {
		try {
			const stored = localStorage.getItem(VOLUME_KEY);
			return stored !== null ? parseFloat(stored) : 0.8;
		} catch {
			return 0.8;
		}
	});
	const [vuLevels, setVuLevels] = useState<[number, number]>([0, 0]);

	const audioRef = useRef<HTMLAudioElement>(null);
	const ctxRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
	const rafRef = useRef<number>(0);
	const wasPlayingRef = useRef(false);

	const activeSource = sources[activeIndex];

	// Fetch peaks when active track changes
	useEffect(() => {
		if (!activeSource) return;
		const peaksUrl = activeSource.src.replace(/\.[^.]+$/, ".peaks.json");
		setPeaks(null);
		fetch(peaksUrl)
			.then((r) => (r.ok ? r.json() : null))
			.then((data: Peaks | null) => {
				if (data) {
					setPeaks(data);
					dispatch({ type: "duration", duration: data.duration });
				}
			})
			.catch(() => {});
	}, [activeSource]);

	// Sync play/pause with audio element
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (state.playing) void a.play();
		else a.pause();
	}, [state.playing]);

	// Sync seek with audio element
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (Math.abs(a.currentTime - state.time) > 0.5) {
			a.currentTime = state.time;
		}
	}, [state.time]);

	// Sync volume with audio element
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		a.volume = volume;
	}, [volume]);

	const ensureAnalyser = useCallback(() => {
		if (ctxRef.current || !audioRef.current) return;
		const ctx = new AudioContext();
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 256;
		const source = ctx.createMediaElementSource(audioRef.current);
		source.connect(analyser);
		analyser.connect(ctx.destination);
		ctxRef.current = ctx;
		analyserRef.current = analyser;
		sourceRef.current = source;
	}, []);

	const updateVu = useCallback(() => {
		if (!analyserRef.current) return;
		const data = new Uint8Array(analyserRef.current.frequencyBinCount);
		analyserRef.current.getByteFrequencyData(data);
		let sumL = 0;
		let sumR = 0;
		for (let i = 0; i < 16; i++) sumL += (data[i] ?? 0) ** 2;
		for (let i = 16; i < 32; i++) sumR += (data[i] ?? 0) ** 2;
		const rawL = Math.sqrt(sumL / 16) / 255;
		const rawR = Math.sqrt(sumR / 16) / 255;
		const left = Math.min(1, rawL ** 0.55 * 1.5);
		const right = Math.min(1, rawR ** 0.55 * 1.5);
		setVuLevels([left, right]);
		rafRef.current = requestAnimationFrame(updateVu);
	}, []);

	// Start/stop rAF with play state
	useEffect(() => {
		if (state.playing) {
			ensureAnalyser();
			void ctxRef.current?.resume();
			rafRef.current = requestAnimationFrame(updateVu);
		} else {
			cancelAnimationFrame(rafRef.current);
			setVuLevels([0, 0]);
		}
		return () => cancelAnimationFrame(rafRef.current);
	}, [state.playing, ensureAnalyser, updateVu]);

	const handleTrackClick = (index: number) => {
		wasPlayingRef.current = state.playing;
		if (index === activeIndex) {
			dispatch({ type: state.playing ? "pause" : "play" });
			return;
		}
		// Pause current, switch track, reset time
		dispatch({ type: "pause" });
		dispatch({ type: "seek", time: 0 });
		dispatch({ type: "duration", duration: 0 });
		setActiveIndex(index);
		// We'll auto-play after the source is loaded via onLoadedMetadata
		wasPlayingRef.current = true;
	};

	const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
		const a = e.currentTarget;
		dispatch({ type: "duration", duration: a.duration });
		if (wasPlayingRef.current) {
			wasPlayingRef.current = false;
			dispatch({ type: "play" });
		}
	};

	const toggle = () => dispatch({ type: state.playing ? "pause" : "play" });

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = parseFloat(e.target.value);
		setVolume(v);
		try {
			localStorage.setItem(VOLUME_KEY, String(v));
		} catch {
			// ignore
		}
	};

	if (!activeSource) return null;

	return (
		<div css={styles.container}>
			{/* Track list */}
			<ul
				css={[
					styles.trackList,
					css`
						list-style: none;
						padding: 0;
						margin: 0;
					`,
				]}
				aria-label="Track list"
			>
				{sources.map((s, i) => {
					const active = i === activeIndex;
					return (
						<li key={s.src}>
							<button
								type="button"
								css={styles.trackItem(active)}
								onClick={() => handleTrackClick(i)}
								aria-label={`Play ${s.title}`}
								aria-current={active}
							>
								<span css={styles.trackIcon} aria-hidden="true">
									{active && state.playing ? "❚❚" : "▶"}
								</span>
								<span css={styles.trackTitle}>{s.title}</span>
								{s.duration !== undefined && (
									<span css={styles.trackDuration}>{fmt(s.duration)}</span>
								)}
							</button>
						</li>
					);
				})}
			</ul>

			{/* Player */}
			<div css={styles.player}>
				<div css={styles.playerTitle}>{activeSource.title}</div>
				<div css={styles.playerRight}>
					<div css={styles.playerMain}>
						{peaks && (
							<Waveform
								peaks={peaks.peaks}
								progress={state.duration > 0 ? state.time / state.duration : 0}
								onSeek={(ratio) =>
									dispatch({ type: "seek", time: ratio * state.duration })
								}
							/>
						)}
						<div css={styles.controls}>
							<button
								type="button"
								css={styles.playBtn}
								onClick={toggle}
								aria-label={state.playing ? "Pause" : "Play"}
							>
								{state.playing ? "❚❚" : "▶"}
							</button>
							<span css={styles.time}>
								{fmt(state.time)} / {fmt(state.duration)}
							</span>
							<div css={styles.volume}>
								<span css={styles.volumeLabel}>VOL</span>
								<input
									type="range"
									css={styles.volumeSlider}
									min={0}
									max={1}
									step={0.01}
									value={volume}
									onChange={handleVolumeChange}
									aria-label="Volume"
								/>
							</div>
						</div>
					</div>
					<VuMeter levels={vuLevels} />
				</div>
			</div>

			{/* biome-ignore lint/a11y/useMediaCaption: audio-only player; captions not applicable */}
			<audio
				ref={audioRef}
				src={activeSource.src}
				preload="metadata"
				onTimeUpdate={(e) =>
					dispatch({
						type: "seek",
						time: (e.target as HTMLAudioElement).currentTime,
					})
				}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={() => dispatch({ type: "pause" })}
			/>
		</div>
	);
};
