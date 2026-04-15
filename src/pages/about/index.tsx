import { css } from "@emotion/react";
import type { Page } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 64px 0;
		max-width: 720px;
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 24px;
	`,
	prose: css`
		font-size: 16px;
		line-height: 1.75;
		color: ${tokens.text.body};
		white-space: pre-wrap;
	`,
};

export interface AboutProps {
	page: Page;
}

export const About = ({ page }: AboutProps) => (
	<article css={styles.wrapper}>
		<h1 css={styles.h1}>{page.title}</h1>
		<div css={styles.prose}>{page.body}</div>
	</article>
);
