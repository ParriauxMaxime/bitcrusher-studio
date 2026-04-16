import { css } from "@emotion/react";
import { ALL_LOCALES, type LocaleEnum } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 9999;
		display: flex;
		gap: 6px;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(6px);
		border: 1px solid ${tokens.surface.border};
		border-radius: 999px;
		padding: 4px;
		margin: 0;
	`,
	legend: css`
		display: none;
	`,
	btn: (active: boolean) => css`
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid ${active ? tokens.accent : "transparent"};
		background: ${active ? "rgba(245, 196, 74, 0.15)" : "transparent"};
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: inherit;
		&:hover {
			border-color: ${tokens.accent};
		}
	`,
};

const FLAGS: Record<LocaleEnum, string> = {
	fr: "🇫🇷",
	en: "🇬🇧",
	es: "🇪🇸",
};

const LABELS: Record<LocaleEnum, string> = {
	fr: "Français",
	en: "English",
	es: "Español",
};

export interface LocaleSwitcherProps {
	current: LocaleEnum;
	onChange: (locale: LocaleEnum) => void;
}

export const LocaleSwitcher = ({ current, onChange }: LocaleSwitcherProps) => (
	<fieldset css={styles.wrapper}>
		<legend css={styles.legend}>Language</legend>
		{ALL_LOCALES.map((loc) => (
			<button
				key={loc}
				type="button"
				css={styles.btn(loc === current)}
				onClick={() => onChange(loc)}
				aria-label={LABELS[loc]}
				aria-pressed={loc === current}
				title={LABELS[loc]}
			>
				<span aria-hidden="true">{FLAGS[loc]}</span>
			</button>
		))}
	</fieldset>
);
