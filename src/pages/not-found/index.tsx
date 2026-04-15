import { css } from "@emotion/react";
import type { LocaleEnum } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 96px 0;
		text-align: center;
	`,
	big: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 14px;
		letter-spacing: 0.4em;
		color: ${tokens.accent};
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 48px;
		color: ${tokens.text.heading};
		margin: 16px 0 8px;
	`,
	link: css`
		color: ${tokens.text.body};
		text-decoration: underline;
	`,
};

const MESSAGES: Record<LocaleEnum, { title: string; back: string }> = {
	fr: { title: "Page introuvable", back: "← Retour à l'accueil" },
	en: { title: "Page not found", back: "← Back to home" },
	es: { title: "Página no encontrada", back: "← Volver al inicio" },
};

export interface NotFoundProps {
	locale: LocaleEnum;
}

export const NotFound = ({ locale }: NotFoundProps) => {
	const m = MESSAGES[locale];
	return (
		<div css={styles.wrapper}>
			<div css={styles.big}>404</div>
			<h1 css={styles.h1}>{m.title}</h1>
			<a href={`/${locale}/`} css={styles.link}>
				{m.back}
			</a>
		</div>
	);
};
