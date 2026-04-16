import { useCallback, useEffect, useState } from "react";

export const CRT_LAYERS = [
	"scanlines",
	"glow",
	"aberration",
	"vignette",
	"flicker",
] as const;
export type CrtLayer = (typeof CRT_LAYERS)[number];

export const CRT_LABELS: Record<CrtLayer, string> = {
	scanlines: "Scanlines",
	glow: "Glow",
	aberration: "Chromatic",
	vignette: "Vignette",
	flicker: "Flicker",
};

export type CrtState = Record<CrtLayer, number>;

const STORAGE_PREFIX = "crt-";

const defaultState = (): CrtState => ({
	scanlines: 42,
	glow: 37,
	aberration: 53,
	vignette: 65,
	flicker: 0,
});

const readState = (): CrtState => {
	const s = defaultState();
	try {
		for (const layer of CRT_LAYERS) {
			const v = localStorage.getItem(`${STORAGE_PREFIX}${layer}`);
			if (v) s[layer] = Math.min(100, Math.max(0, Number.parseInt(v, 10)));
		}
	} catch {
		/* noop */
	}
	return s;
};

const applyVars = (state: CrtState) => {
	for (const layer of CRT_LAYERS) {
		document.documentElement.style.setProperty(
			`--crt-${layer}`,
			String(state[layer] / 100),
		);
	}
};

const subscribers = new Set<() => void>();
const subscribe = (fn: () => void) => {
	subscribers.add(fn);
	return () => {
		subscribers.delete(fn);
	};
};
const notify = () => {
	for (const fn of subscribers) fn();
};

export const useCrt = () => {
	const [state, setState] = useState(readState);

	useEffect(() => {
		applyVars(state);
		const unsub = subscribe(() => setState(readState()));
		return unsub;
	}, [state]);

	const setLayer = useCallback((layer: CrtLayer, value: number) => {
		const clamped = Math.min(100, Math.max(0, value));
		localStorage.setItem(`${STORAGE_PREFIX}${layer}`, String(clamped));
		setState((prev) => {
			const next = { ...prev, [layer]: clamped };
			applyVars(next);
			return next;
		});
		notify();
	}, []);

	return { state, setLayer };
};

const isActive = (s: CrtState): boolean => CRT_LAYERS.some((l) => s[l] > 0);

export const CrtEffects = () => {
	const { state } = useCrt();

	useEffect(() => {
		applyVars(state);
	}, [state]);

	if (!isActive(state)) return null;

	const sc = state.scanlines / 100;
	const gl = state.glow / 100;
	const ab = state.aberration / 100;
	const vi = state.vignette / 100;
	const fl = state.flicker / 100;

	return (
		<style>{`
			${
				sc > 0
					? `body::before {
				content: "";
				position: fixed;
				inset: 0;
				pointer-events: none;
				z-index: 9000;
				background: repeating-linear-gradient(
					to bottom,
					transparent 0px,
					transparent 2px,
					rgba(0, 0, 0, 0.15) 2px,
					rgba(0, 0, 0, 0.15) 4px
				);
				opacity: ${sc};
			}`
					: ""
			}
			${
				gl > 0
					? `#root {
				text-shadow: 0 0 ${4 * gl}px var(--accent);
			}`
					: ""
			}
			${
				ab > 0
					? `h1, h2, h3 {
				text-shadow:
					${-2 * ab}px 0 rgba(255, 45, 123, ${0.5 * ab}),
					${2 * ab}px 0 rgba(0, 240, 255, ${0.5 * ab}) !important;
			}`
					: ""
			}
			${
				vi > 0
					? `.crt-vignette {
				content: "";
				position: fixed;
				inset: 0;
				pointer-events: none;
				z-index: 8999;
				background: radial-gradient(
					ellipse at center,
					transparent ${60 - 20 * vi}%,
					rgba(0, 0, 0, ${0.6 * vi}) 100%
				);
				border-radius: ${2 * vi}%;
			}`
					: ""
			}
			${
				fl > 0
					? `@keyframes crt-flicker {
				0% { opacity: 1; }
				4% { opacity: ${1 - 0.08 * fl}; }
				8% { opacity: 1; }
				18% { opacity: ${1 - 0.04 * fl}; }
				20% { opacity: 1; }
				48% { opacity: 1; }
				50% { opacity: ${1 - 0.12 * fl}; }
				53% { opacity: 1; }
				82% { opacity: 1; }
				84% { opacity: ${1 - 0.06 * fl}; }
				87% { opacity: 1; }
				100% { opacity: 1; }
			}
			body {
				animation: crt-flicker ${1.5 + (1 - fl) * 2}s steps(1) infinite;
			}`
					: ""
			}
		`}</style>
	);
};

/**
 * Vignette overlay — rendered as a div so z-index works properly.
 * Must be placed inside Layout, outside #root stacking context.
 */
export const CrtVignetteOverlay = () => {
	const { state } = useCrt();
	if (state.vignette === 0) return null;
	return (
		<div
			className="crt-vignette"
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: 8999,
				background: `radial-gradient(ellipse at center, transparent ${60 - 20 * (state.vignette / 100)}%, rgba(0, 0, 0, ${0.6 * (state.vignette / 100)}) 100%)`,
				borderRadius: `${2 * (state.vignette / 100)}%`,
			}}
		/>
	);
};
