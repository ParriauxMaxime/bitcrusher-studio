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
