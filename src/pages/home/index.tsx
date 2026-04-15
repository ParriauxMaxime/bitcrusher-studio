import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import type { LocaleEnum, Page, Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	hero: css`
		padding: 96px 0 48px;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(48px, 8vw, 96px);
		color: ${tokens.text.heading};
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 24px;
	`,
	lede: css`
		color: ${tokens.text.body};
		font-size: 18px;
		line-height: 1.6;
		max-width: 620px;
	`,
	featured: css`
		margin-top: 80px;
	`,
	h2: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0 0 24px;
	`,
	grid: css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	`,
	card: css`
		border: 1px solid ${tokens.surface.border};
		padding: 20px;
		border-radius: 6px;
		text-decoration: none;
		color: ${tokens.text.heading};
		display: flex;
		flex-direction: column;
		gap: 6px;
		&:hover {
			border-color: ${tokens.accent};
		}
	`,
	cardMeta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
	`,
};

export interface HomeProps {
	locale: LocaleEnum;
	page: Page;
	featured: Project[];
}

export const Home = ({ locale, page, featured }: HomeProps) => {
	const { t } = useTranslation();
	return (
		<>
			<section css={styles.hero}>
				<h1 css={styles.brand}>
					Bitcrusher <em>Studio</em>
				</h1>
				<p css={styles.lede}>{page.body}</p>
			</section>
			<section css={styles.featured} aria-labelledby="featured-heading">
				<h2 id="featured-heading" css={styles.h2}>
					{t("home.featured_title")}
				</h2>
				<div css={styles.grid}>
					{featured.map((p) => (
						<a
							key={p.slug}
							href={`/${locale}/works?project=${p.slug}`}
							css={styles.card}
						>
							<div css={styles.cardMeta}>
								{p.year} · {p.roles.join(" · ")}
							</div>
							<div>{p.title}</div>
						</a>
					))}
				</div>
			</section>
		</>
	);
};
