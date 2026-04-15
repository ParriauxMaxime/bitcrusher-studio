import { css } from "@emotion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AudioSource } from "@/content/types";
import { initialPlayerState, playerReducer } from "@/lib/audio/player-core";
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
			{/* biome-ignore lint/a11y/useMediaCaption: audio-only player; captions not applicable */}
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
