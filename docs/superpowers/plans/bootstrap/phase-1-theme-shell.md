# Phase 1 — Theme System & Shell

**Outcome:** Graphite (default) and Mahogany themes live side by side; `?theme=mahogany` or localStorage switches without FOUC; header + footer shell renders; dev-only theme switcher + `⌘⇧T` keybind; tests cover theme setter and key mappings.

**Prereq:** Phase 0 complete.

---

### Task 1.1: Theme tokens (CSS)

**Files:**
- Create: `src/theme/theme.css`

- [ ] **Step 1: Write `src/theme/theme.css`**

```css
:root,
[data-theme="graphite"] {
	--surface-base: linear-gradient(145deg, #2e2e33 0%, #18181c 100%);
	--surface-border: rgba(220, 200, 140, 0.1);
	--text-heading: #f0f0f2;
	--text-body: #b8b8c0;
	--text-muted: #8a8a92;
	--accent: #f5c44a;
	--led-a: #f5c44a;
	--led-b: #ff5a4a;
	--led-c: #50c8b8;
	--led-off: #2a2a2e;
	--knob-hi: #55555a;
	--knob-lo: #1a1a1e;
	--focus-ring: color-mix(in srgb, var(--accent) 80%, transparent);
}

[data-theme="mahogany"] {
	--surface-base:
		radial-gradient(ellipse at 30% 10%, #5a2a25 0%, transparent 50%),
		linear-gradient(145deg, #3a1b18 0%, #1d0d0b 100%);
	--surface-border: rgba(255, 215, 150, 0.12);
	--text-heading: #fbeacc;
	--text-body: #d4b088;
	--text-muted: #c99a5a;
	--accent: #f5c44a;
	--led-a: #f5c44a;
	--led-b: #ff5a4a;
	--led-c: #50c8b8;
	--led-off: #3a1b18;
	--knob-hi: #7a4035;
	--knob-lo: #2a100d;
	--focus-ring: color-mix(in srgb, var(--accent) 80%, transparent);
}

* {
	box-sizing: border-box;
}

html,
body {
	margin: 0;
	padding: 0;
	background: var(--surface-base);
	color: var(--text-body);
	font-family:
		"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
	-webkit-font-smoothing: antialiased;
	min-height: 100vh;
}

:focus-visible {
	outline: 2px solid var(--focus-ring);
	outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		transition-duration: 0.01ms !important;
	}
}
```

- [ ] **Step 2: Import in `main.tsx`**

Modify `src/main.tsx` — add at top:

```tsx
import "./theme/theme.css";
```

- [ ] **Step 3: Commit**

```bash
git add src/theme/theme.css src/main.tsx
git commit -m "🎨 feat: theme tokens (graphite + mahogany)"
```

---

### Task 1.2: TypeScript token mirror

**Files:**
- Create: `src/theme/tokens.ts`

- [ ] **Step 1: Write `src/theme/tokens.ts`**

```ts
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
} as const;
export type ThemeEnum = (typeof ThemeEnum)[keyof typeof ThemeEnum];

export const ALL_THEMES: readonly ThemeEnum[] = [
	ThemeEnum.graphite,
	ThemeEnum.mahogany,
];
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/tokens.ts
git commit -m "🎨 feat: typed token mirror"
```

---

### Task 1.3: `use-theme` hook — write test first

**Files:**
- Create: `tests/theme/use-theme.test.tsx`

- [ ] **Step 1: Switch vitest to jsdom for dom tests** — modify `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
		setupFiles: ["tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
```

- [ ] **Step 2: Create `tests/setup.ts`**

```ts
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
	localStorage.clear();
	document.documentElement.dataset.theme = "graphite";
});

afterEach(() => {
	localStorage.clear();
});
```

- [ ] **Step 3: Install React testing library**

```bash
npm install -D @testing-library/react @testing-library/user-event
```

- [ ] **Step 4: Write failing test `tests/theme/use-theme.test.tsx`**

```tsx
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "@/theme/use-theme";

describe("useTheme", () => {
	it("returns graphite by default", () => {
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("graphite");
	});

	it("setTheme updates DOM and localStorage", () => {
		const { result } = renderHook(() => useTheme());
		act(() => {
			result.current.setTheme("mahogany");
		});
		expect(result.current.theme).toBe("mahogany");
		expect(document.documentElement.dataset.theme).toBe("mahogany");
		expect(localStorage.getItem("theme")).toBe("mahogany");
	});

	it("cycleTheme rotates through ALL_THEMES", () => {
		const { result } = renderHook(() => useTheme());
		act(() => result.current.cycleTheme());
		expect(result.current.theme).toBe("mahogany");
		act(() => result.current.cycleTheme());
		expect(result.current.theme).toBe("graphite");
	});

	it("reads initial theme from DOM dataset", () => {
		document.documentElement.dataset.theme = "mahogany";
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("mahogany");
	});
});
```

- [ ] **Step 5: Run test — must fail**

```bash
npm run test -- tests/theme
```

Expected: FAIL "cannot find module `@/theme/use-theme`".

---

### Task 1.4: Implement `use-theme`

**Files:**
- Create: `src/theme/use-theme.ts`

- [ ] **Step 1: Write `src/theme/use-theme.ts`**

```ts
import { useCallback, useSyncExternalStore } from "react";
import { ALL_THEMES, ThemeEnum } from "./tokens";

const STORAGE_KEY = "theme";

const readTheme = (): ThemeEnum => {
	const fromDom = document.documentElement.dataset.theme;
	if (fromDom === ThemeEnum.graphite || fromDom === ThemeEnum.mahogany) {
		return fromDom;
	}
	return ThemeEnum.graphite;
};

const subscribers = new Set<() => void>();
const subscribe = (fn: () => void) => {
	subscribers.add(fn);
	return () => subscribers.delete(fn);
};
const notify = () => {
	for (const fn of subscribers) fn();
};

export interface UseThemeReturn {
	theme: ThemeEnum;
	setTheme: (theme: ThemeEnum) => void;
	cycleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
	const theme = useSyncExternalStore(subscribe, readTheme, readTheme);

	const setTheme = useCallback((next: ThemeEnum) => {
		document.documentElement.dataset.theme = next;
		localStorage.setItem(STORAGE_KEY, next);
		notify();
	}, []);

	const cycleTheme = useCallback(() => {
		const current = readTheme();
		const idx = ALL_THEMES.indexOf(current);
		const next = ALL_THEMES[(idx + 1) % ALL_THEMES.length];
		if (next) setTheme(next);
	}, [setTheme]);

	return { theme, setTheme, cycleTheme };
};
```

- [ ] **Step 2: Run test — must pass**

```bash
npm run test -- tests/theme
```

Expected: 4 passing.

- [ ] **Step 3: Commit**

```bash
git add src/theme/use-theme.ts tests/theme/ tests/setup.ts vitest.config.ts package.json package-lock.json
git commit -m "🎨 feat: useTheme hook with DOM + localStorage sync"
```

---

### Task 1.5: Pre-hydration theme bootstrap (no FOUC)

**Files:**
- Modify: `src/index.html`

- [ ] **Step 1: Add inline script in `<head>`**

```html
<!doctype html>
<html lang="fr" data-theme="graphite">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Bitcrusher Studio</title>
		<script>
			(function () {
				try {
					var urlTheme = new URLSearchParams(location.search).get("theme");
					var stored = localStorage.getItem("theme");
					var chosen = urlTheme || stored;
					if (chosen === "graphite" || chosen === "mahogany") {
						document.documentElement.dataset.theme = chosen;
						if (urlTheme) localStorage.setItem("theme", urlTheme);
					}
				} catch (e) {}
			})();
		</script>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/index.html
git commit -m "⚡ feat: pre-hydration theme bootstrap (no FOUC)"
```

---

### Task 1.6: Dev theme switcher component — test first

**Files:**
- Create: `tests/theme/theme-switcher-dev.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";

describe("ThemeSwitcherDev", () => {
	it("shows current theme label", () => {
		render(<ThemeSwitcherDev />);
		expect(screen.getByRole("button")).toHaveTextContent(/graphite/i);
	});

	it("cycles theme on click", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.click(screen.getByRole("button"));
		expect(document.documentElement.dataset.theme).toBe("mahogany");
	});

	it("cycles theme on Cmd+Shift+T", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.keyboard("{Meta>}{Shift>}T{/Shift}{/Meta}");
		expect(document.documentElement.dataset.theme).toBe("mahogany");
	});
});
```

- [ ] **Step 2: Install jest-dom matchers**

```bash
npm install -D @testing-library/jest-dom
```

Then modify `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
	localStorage.clear();
	document.documentElement.dataset.theme = "graphite";
});

afterEach(() => {
	localStorage.clear();
});
```

- [ ] **Step 3: Run test — must fail**

```bash
npm run test -- tests/theme/theme-switcher-dev
```

Expected: FAIL "cannot find module `@/components/theme-switcher-dev/theme-switcher-dev`".

---

### Task 1.7: Implement dev theme switcher

**Files:**
- Create: `src/components/theme-switcher-dev/theme-switcher-dev.tsx`

- [ ] **Step 1: Write component**

```tsx
import { css } from "@emotion/react";
import { useEffect } from "react";
import { tokens } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

const styles = {
	button: css`
		position: fixed;
		bottom: 12px;
		right: 12px;
		z-index: 9999;
		background: ${tokens.surface.border};
		border: 1px solid ${tokens.surface.border};
		color: ${tokens.text.body};
		padding: 6px 10px;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 4px;
		&:hover {
			color: ${tokens.text.heading};
		}
	`,
};

export const ThemeSwitcherDev = () => {
	const { theme, cycleTheme } = useTheme();

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const isCombo =
				(e.metaKey || e.ctrlKey) &&
				e.shiftKey &&
				e.key.toLowerCase() === "t";
			if (isCombo) {
				e.preventDefault();
				cycleTheme();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [cycleTheme]);

	return (
		<button
			type="button"
			onClick={cycleTheme}
			css={styles.button}
			aria-label={`Theme: ${theme}. Click to switch.`}
		>
			theme · {theme}
		</button>
	);
};
```

- [ ] **Step 2: Run test — must pass**

```bash
npm run test -- tests/theme/theme-switcher-dev
```

Expected: 3 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/theme-switcher-dev/ tests/theme/theme-switcher-dev.test.tsx tests/setup.ts package.json package-lock.json
git commit -m "🎨 feat: dev theme switcher + Cmd+Shift+T keybind"
```

---

### Task 1.8: Shell — header & footer (minimal)

**Files:**
- Create: `src/components/shell/header.tsx`
- Create: `src/components/shell/footer.tsx`
- Create: `src/components/shell/skip-link.tsx`

- [ ] **Step 1: `skip-link.tsx`**

```tsx
import { css } from "@emotion/react";
import { tokens } from "@/theme/tokens";

const styles = {
	link: css`
		position: absolute;
		left: -9999px;
		top: 0;
		background: ${tokens.accent};
		color: #000;
		padding: 8px 12px;
		z-index: 10000;
		&:focus {
			left: 8px;
			top: 8px;
		}
	`,
};

export const SkipLink = () => (
	<a href="#main" css={styles.link}>
		Skip to content
	</a>
);
```

- [ ] **Step 2: `header.tsx`**

```tsx
import { css } from "@emotion/react";
import { tokens } from "@/theme/tokens";

const styles = {
	header: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 28px;
		border-bottom: 1px solid ${tokens.surface.border};
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-size: 22px;
		font-style: italic;
		color: ${tokens.text.heading};
		letter-spacing: -0.01em;
	`,
	nav: css`
		display: flex;
		gap: 22px;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: ${tokens.text.muted};
		a {
			color: inherit;
			text-decoration: none;
			&:hover {
				color: ${tokens.text.heading};
			}
		}
	`,
};

export interface HeaderProps {
	navLabels: { home: string; about: string; works: string };
	langPrefix: string;
}

export const Header = ({ navLabels, langPrefix }: HeaderProps) => (
	<header css={styles.header}>
		<a href={langPrefix} css={styles.brand}>
			Bitcrusher <em>Studio</em>
		</a>
		<nav css={styles.nav} aria-label="Primary">
			<a href={langPrefix}>{navLabels.home}</a>
			<a href={`${langPrefix}/about`}>{navLabels.about}</a>
			<a href={`${langPrefix}/works`}>{navLabels.works}</a>
		</nav>
	</header>
);
```

- [ ] **Step 3: `footer.tsx`**

```tsx
import { css } from "@emotion/react";
import { tokens } from "@/theme/tokens";

const styles = {
	footer: css`
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 36px 28px;
		border-top: 1px solid ${tokens.surface.border};
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		color: ${tokens.text.muted};
		letter-spacing: 0.12em;
	`,
	row: css`
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
		align-items: center;
		a {
			color: ${tokens.text.body};
			text-decoration: none;
			&:hover {
				color: ${tokens.accent};
			}
		}
	`,
};

export interface Social {
	label: string;
	url: string;
}

export interface FooterProps {
	email: string;
	copyright: string;
	socials: Social[];
}

export const Footer = ({ email, copyright, socials }: FooterProps) => (
	<footer css={styles.footer}>
		<div css={styles.row}>
			<a href={`mailto:${email}`}>{email}</a>
			{socials.map((s) => (
				<a
					key={s.url}
					href={s.url}
					target="_blank"
					rel="noreferrer noopener"
				>
					{s.label.toUpperCase()}
				</a>
			))}
		</div>
		<div>{copyright}</div>
	</footer>
);
```

- [ ] **Step 4: Wire shell into `root.tsx`**

```tsx
import { css } from "@emotion/react";
import { Footer } from "./components/shell/footer";
import { Header } from "./components/shell/header";
import { SkipLink } from "./components/shell/skip-link";
import { ThemeSwitcherDev } from "./components/theme-switcher-dev/theme-switcher-dev";
import { tokens } from "./theme/tokens";

const styles = {
	main: css`
		padding: 64px 28px;
		max-width: 1080px;
		margin: 0 auto;
		color: ${tokens.text.heading};
		min-height: 60vh;
	`,
};

// biome-ignore lint/nursery/noProcessEnv: build-time flag
const isDev = process.env.NODE_ENV !== "production";

export const Root = () => {
	return (
		<>
			<SkipLink />
			<Header
				navLabels={{ home: "Home", about: "About", works: "Works" }}
				langPrefix="/fr"
			/>
			<main id="main" css={styles.main}>
				Bitcrusher Studio — bootstrap.
			</main>
			<Footer
				email="contact@bitcrusher-studio.com"
				copyright="© 2026 Bitcrusher Studio · Tous droits réservés"
				socials={[
					{ label: "SoundCloud", url: "https://soundcloud.com/user-836588138" },
					{
						label: "YouTube",
						url: "https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4",
					},
					{
						label: "LinkedIn",
						url: "https://www.linkedin.com/in/quentin-ferreira-castiço",
					},
				]}
			/>
			{isDev && <ThemeSwitcherDev />}
		</>
	);
};
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev:rsbuild
```

Open :3000. Expected: header (brand + nav), main text, footer (email + socials), theme switcher bottom-right. Click it — background shifts to mahogany. Reload — setting persists. Stop server.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "🎨 feat: shell (header + footer + skip link) wired with dev theme switcher"
```

---

### Task 1.9: Phase 1 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run test
```

All exit 0.

Phase 1 complete. Proceed to `phase-2-content-i18n.md`.
