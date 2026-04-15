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
