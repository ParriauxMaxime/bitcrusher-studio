import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LocaleEnum, Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	wrapper: css`
		padding: 64px 0;
	`,
	h1: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 40px;
	`,
	grid: css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	`,
	article: css`
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		padding: 24px;
		cursor: pointer;
		color: ${tokens.text.heading};
		background: none;
		text-align: left;
		font: inherit;
		&:hover {
			border-color: ${tokens.accent};
		}
	`,
	meta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin-bottom: 10px;
	`,
	title: css`
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 8px;
	`,
	body: css`
		font-size: 13px;
		color: ${tokens.text.body};
		line-height: 1.55;
	`,
};

export interface WorksProps {
	locale: LocaleEnum;
	projects: Project[];
}

export const Works = ({ locale, projects }: WorksProps) => {
	const { t } = useTranslation();
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setActiveSlug(params.get("project"));
	}, []);

	const open = (slug: string) => {
		setActiveSlug(slug);
		const url = new URL(window.location.href);
		url.searchParams.set("project", slug);
		window.history.replaceState({}, "", url.toString());
	};

	if (projects.length === 0) {
		return (
			<section css={styles.wrapper}>
				<h1 css={styles.h1}>{t("works.title")}</h1>
				<p css={styles.body}>{t("works.empty")}</p>
			</section>
		);
	}

	return (
		<section css={styles.wrapper}>
			<h1 css={styles.h1}>{t("works.title")}</h1>
			<div css={styles.grid}>
				{projects.map((p) => (
					<article key={p.slug}>
						<button
							type="button"
							css={styles.article}
							onClick={() => open(p.slug)}
							aria-expanded={activeSlug === p.slug}
						>
							<div css={styles.meta}>
								{p.year} · {p.roles.join(" · ")}
							</div>
							<h2 css={styles.title}>{p.title}</h2>
							<div css={styles.body}>{p.body}</div>
						</button>
					</article>
				))}
			</div>
			<span data-active-slug={activeSlug ?? ""} hidden />
			<span data-locale={locale} hidden />
		</section>
	);
};
