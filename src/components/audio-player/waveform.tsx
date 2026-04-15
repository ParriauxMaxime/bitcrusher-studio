import { css } from "@emotion/react";
import { useEffect, useRef } from "react";

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
	progress: number;
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
