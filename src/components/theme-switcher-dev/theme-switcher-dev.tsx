import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { CRT_LABELS, CRT_LAYERS, useCrt } from "@/theme/crt-effects";
import { ALL_THEMES, type ThemeEnum, tokens } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

const THEME_LABELS: Record<ThemeEnum, string> = {
	graphite: "Graphite",
	mahogany: "Mahogany",
	synthwave: "Synthwave",
	vapor: "Vapor",
};

const THEME_GRADIENTS: Record<ThemeEnum, string> = {
	graphite: "linear-gradient(145deg, #2e2e33, #18181c)",
	mahogany: "linear-gradient(145deg, #3a1b18, #1d0d0b)",
	synthwave: "linear-gradient(145deg, #1a0a2e, #0d0518)",
	vapor: "linear-gradient(145deg, #1b2838, #171a21)",
};

const THEME_ACCENTS: Record<ThemeEnum, string> = {
	graphite: "#f5c44a",
	mahogany: "#f5c44a",
	synthwave: "#ff2d7b",
	vapor: "#66c0f4",
};

const styles = {
	wrapper: css`
		position: fixed;
		bottom: 12px;
		right: 12px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	`,
	pill: css`
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		border: 1px solid ${tokens.surface.border};
		color: ${tokens.text.body};
		padding: 6px 12px;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 999px;
		&:hover {
			color: ${tokens.text.heading};
			border-color: ${tokens.accent};
		}
	`,
	panel: css`
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(12px);
		border: 1px solid ${tokens.surface.border};
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 220px;
	`,
	label: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0;
	`,
	swatches: css`
		display: flex;
		gap: 8px;
	`,
	swatch: (active: boolean, gradient: string, accent: string) => css`
		width: 60px;
		height: 36px;
		border-radius: 6px;
		background: ${gradient};
		border: 2px solid ${active ? accent : "transparent"};
		cursor: pointer;
		position: relative;
		overflow: hidden;
		padding: 0;
		&:hover {
			border-color: ${accent};
		}
		&::after {
			content: "";
			position: absolute;
			bottom: 4px;
			left: 50%;
			transform: translateX(-50%);
			width: 16px;
			height: 2px;
			background: ${accent};
			opacity: ${active ? 1 : 0.4};
			border-radius: 1px;
		}
	`,
	swatchLabel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 7px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
		position: absolute;
		top: 4px;
		left: 0;
		right: 0;
		text-align: center;
	`,
	sliderLabel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 8px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		min-width: 56px;
	`,
	sliderRow: css`
		display: flex;
		align-items: center;
		gap: 10px;
	`,
	slider: css`
		flex: 1;
		appearance: none;
		height: 4px;
		border-radius: 2px;
		background: ${tokens.surface.border};
		outline: none;
		&::-webkit-slider-thumb {
			appearance: none;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: ${tokens.accent};
			cursor: pointer;
			border: none;
		}
		&::-moz-range-thumb {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: ${tokens.accent};
			cursor: pointer;
			border: none;
		}
	`,
	sliderValue: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		color: ${tokens.text.muted};
		min-width: 32px;
		text-align: right;
	`,
};

export const ThemeSwitcherDev = () => {
	const { theme, setTheme, cycleTheme } = useTheme();
	const { state: crt, setLayer } = useCrt();
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const onClick = (e: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [open]);

	// Cmd+Shift+T still cycles themes
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const isCombo =
				(e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t";
			if (isCombo) {
				e.preventDefault();
				cycleTheme();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [cycleTheme]);

	return (
		<div ref={wrapperRef} css={styles.wrapper}>
			{open && (
				<div css={styles.panel}>
					<div css={styles.label}>Theme</div>
					<div css={styles.swatches}>
						{ALL_THEMES.map((t) => (
							<button
								key={t}
								type="button"
								css={styles.swatch(
									t === theme,
									THEME_GRADIENTS[t],
									THEME_ACCENTS[t],
								)}
								onClick={() => setTheme(t)}
								aria-label={THEME_LABELS[t]}
								aria-pressed={t === theme}
								title={THEME_LABELS[t]}
							>
								<span css={styles.swatchLabel}>{THEME_LABELS[t]}</span>
							</button>
						))}
					</div>
					<div css={styles.label}>CRT Effects</div>
					{CRT_LAYERS.map((layer) => (
						<div key={layer} css={styles.sliderRow}>
							<span css={styles.sliderLabel}>{CRT_LABELS[layer]}</span>
							<input
								type="range"
								min={0}
								max={100}
								value={crt[layer]}
								onChange={(e) => setLayer(layer, Number(e.target.value))}
								css={styles.slider}
								aria-label={`${CRT_LABELS[layer]} intensity`}
							/>
							<span css={styles.sliderValue}>{crt[layer]}%</span>
						</div>
					))}
				</div>
			)}
			<button
				type="button"
				css={styles.pill}
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-label={`Theme: ${theme}. Click to configure.`}
			>
				&#9881; {theme}
			</button>
		</div>
	);
};
