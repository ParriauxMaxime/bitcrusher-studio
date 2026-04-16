import { useCallback, useEffect, useState } from "react";

export const CRT_LAYERS = [
	"scanlines",
	"glow",
	"aberration",
	"barrel",
	"flicker",
] as const;
export type CrtLayer = (typeof CRT_LAYERS)[number];

export const CRT_LABELS: Record<CrtLayer, string> = {
	scanlines: "Scanlines",
	glow: "Glow",
	aberration: "Chromatic",
	barrel: "Barrel",
	flicker: "Flicker",
};

export type CrtState = Record<CrtLayer, number>;

const STORAGE_PREFIX = "crt-";

const defaultState = (): CrtState => ({
	scanlines: 0,
	glow: 0,
	aberration: 0,
	barrel: 0,
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
	const ba = state.barrel / 100;
	const fl = state.flicker / 100;

	return (
		<>
			{ba > 0 && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					style={{ position: "absolute", width: 0, height: 0 }}
					aria-hidden="true"
				>
					<defs>
						<filter id="crt-barrel">
							<feTurbulence
								type="turbulence"
								baseFrequency={0.01 * ba}
								numOctaves={1}
								result="warp"
							/>
							<feDisplacementMap
								in="SourceGraphic"
								in2="warp"
								scale={8 * ba}
								xChannelSelector="R"
								yChannelSelector="G"
							/>
						</filter>
					</defs>
				</svg>
			)}
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
					ba > 0
						? `#root {
					filter: url(#crt-barrel);
				}`
						: ""
				}
				${
					fl > 0
						? `@keyframes crt-flicker {
					0%, 100% { opacity: 1; }
					3% { opacity: ${1 - 0.03 * fl}; }
					6% { opacity: 1; }
					48% { opacity: 1; }
					50% { opacity: ${1 - 0.05 * fl}; }
					52% { opacity: 1; }
					97% { opacity: 1; }
					98% { opacity: ${1 - 0.02 * fl}; }
				}
				body {
					animation: crt-flicker ${2 + (1 - fl) * 3}s infinite;
				}`
						: ""
				}
			`}</style>
		</>
	);
};
