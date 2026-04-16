import { useCallback, useEffect, useState } from "react";

const CRT_STORAGE_KEY = "crt-intensity";

const readCrt = (): number => {
	try {
		const v = localStorage.getItem(CRT_STORAGE_KEY);
		return v ? Math.min(100, Math.max(0, Number.parseInt(v, 10))) : 0;
	} catch {
		return 0;
	}
};

const subscribers = new Set<() => void>();
const subscribeCrt = (fn: () => void) => {
	subscribers.add(fn);
	return () => subscribers.delete(fn);
};
const notifyCrt = () => {
	for (const fn of subscribers) fn();
};

export const setCrtIntensity = (value: number) => {
	const clamped = Math.min(100, Math.max(0, value));
	document.documentElement.style.setProperty("--crt", String(clamped / 100));
	localStorage.setItem(CRT_STORAGE_KEY, String(clamped));
	notifyCrt();
};

export const useCrt = () => {
	const [intensity, setIntensity] = useState(readCrt);

	useEffect(() => {
		// Apply on mount
		setCrtIntensity(intensity);
		const unsub = subscribeCrt(() => {
			setIntensity(readCrt());
		});
		return unsub;
	}, [intensity]);

	const set = useCallback((value: number) => {
		setCrtIntensity(value);
		setIntensity(value);
	}, []);

	return { intensity, setIntensity: set };
};

export const CrtEffects = () => {
	const { intensity } = useCrt();
	const t = intensity / 100; // 0–1

	useEffect(() => {
		document.documentElement.style.setProperty("--crt", String(t));
	}, [t]);

	if (t === 0) return null;

	return (
		<>
			{/* SVG filter for barrel distortion */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				style={{ position: "absolute", width: 0, height: 0 }}
				aria-hidden="true"
			>
				<defs>
					<filter id="crt-barrel">
						<feTurbulence
							type="turbulence"
							baseFrequency={0.01 * t}
							numOctaves={1}
							result="warp"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							in2="warp"
							scale={8 * t}
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
				</defs>
			</svg>
			{/* Inline styles for intensity-dependent effects */}
			<style>{`
				/* Chromatic aberration on headings */
				h1, h2, h3 {
					text-shadow:
						${-2 * t}px 0 rgba(255, 45, 123, ${0.5 * t}),
						${2 * t}px 0 rgba(0, 240, 255, ${0.5 * t}) !important;
				}
				/* Barrel distortion on main content */
				#root {
					filter: url(#crt-barrel);
				}
				/* Flicker animation */
				@keyframes crt-flicker {
					0%, 100% { opacity: 1; }
					3% { opacity: ${1 - 0.03 * t}; }
					6% { opacity: 1; }
					48% { opacity: 1; }
					50% { opacity: ${1 - 0.05 * t}; }
					52% { opacity: 1; }
					97% { opacity: 1; }
					98% { opacity: ${1 - 0.02 * t}; }
				}
				body {
					animation: crt-flicker ${2 + (1 - t) * 3}s infinite;
				}
			`}</style>
		</>
	);
};
