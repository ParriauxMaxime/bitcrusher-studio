import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProjectCard } from "@/components/project-card/project-card";
import type { LocaleEnum, Page, Project, SiteCopy } from "@/content/types";
import { ProjectModal } from "@/pages/works/project-modal";
import { tokens } from "@/theme/tokens";

const styles = {
	hero: css`
		padding: 120px 28px 64px;
		max-width: 1080px;
		margin: 0 auto;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(56px, 10vw, 120px);
		color: ${tokens.text.heading};
		line-height: 0.95;
		letter-spacing: -0.03em;
		margin: 0 0 28px;
	`,
	tagline: css`
		color: ${tokens.text.body};
		font-size: clamp(16px, 1.6vw, 20px);
		line-height: 1.55;
		max-width: 640px;
	`,
	section: css`
		padding: 80px 28px;
		max-width: 1080px;
		margin: 0 auto;
		border-top: 1px solid ${tokens.surface.border};
	`,
	sectionLabel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0 0 24px;
	`,
	aboutTitle: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 28px;
	`,
	aboutBody: css`
		font-size: 16px;
		line-height: 1.75;
		color: ${tokens.text.body};
		max-width: 720px;
		white-space: pre-wrap;
	`,
	worksTitle: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 5vw, 56px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		margin: 0 0 40px;
	`,
	grid: css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	`,
};

export interface LocalePageProps {
	locale: LocaleEnum;
	home: Page;
	about: Page;
	projects: Project[];
	site: SiteCopy;
}

export const LocalePage = ({
	locale: _locale,
	home,
	about,
	projects,
	site,
}: LocalePageProps) => {
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

	const close = () => {
		setActiveSlug(null);
		const url = new URL(window.location.href);
		url.searchParams.delete("project");
		window.history.replaceState({}, "", url.toString());
	};

	const activeProject = projects.find((p) => p.slug === activeSlug) ?? null;

	return (
		<>
			<section css={styles.hero} id="hero">
				<h1 css={styles.brand}>
					Bitcrusher <em>Studio</em>
				</h1>
				<p css={styles.tagline}>{home.body || site.seo.tagline}</p>
			</section>

			<section css={styles.section} id="about" aria-labelledby="about-heading">
				<h2 id="about-heading" css={styles.aboutTitle}>
					{about.title}
				</h2>
				<div css={styles.aboutBody}>{about.body}</div>
			</section>

			<section css={styles.section} id="works" aria-labelledby="works-heading">
				<div css={styles.sectionLabel}>{t("works.title")}</div>
				<h2 id="works-heading" css={styles.worksTitle}>
					{site.nav.works}
				</h2>
				{projects.length === 0 ? (
					<p>{t("works.empty")}</p>
				) : (
					<div css={styles.grid}>
						{projects.map((p) => (
							<ProjectCard
								key={p.slug}
								project={p}
								variant="button"
								onSelect={open}
							/>
						))}
					</div>
				)}
			</section>

			{activeProject && (
				<ProjectModal project={activeProject} onClose={close} />
			)}
		</>
	);
};
