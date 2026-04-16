export const tokens = {
	surface: {
		base: "var(--surface-base)",
		border: "var(--surface-border)",
	},
	text: {
		heading: "var(--text-heading)",
		body: "var(--text-body)",
		muted: "var(--text-muted)",
	},
	accent: "var(--accent)",
	led: {
		a: "var(--led-a)",
		b: "var(--led-b)",
		c: "var(--led-c)",
		off: "var(--led-off)",
	},
	knob: {
		hi: "var(--knob-hi)",
		lo: "var(--knob-lo)",
	},
	focus: "var(--focus-ring)",
} as const;

export const ThemeEnum = {
	graphite: "graphite",
	mahogany: "mahogany",
	synthwave: "synthwave",
	vapor: "vapor",
} as const;
export type ThemeEnum = (typeof ThemeEnum)[keyof typeof ThemeEnum];

export const ALL_THEMES: readonly ThemeEnum[] = [
	ThemeEnum.graphite,
	ThemeEnum.mahogany,
	ThemeEnum.synthwave,
	ThemeEnum.vapor,
];
