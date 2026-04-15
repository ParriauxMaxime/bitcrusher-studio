import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProjectCard } from "@/components/project-card/project-card";
import type { LocaleEnum, Project } from "@/content/types";
import { tokens } from "@/theme/tokens";
import { ProjectModal } from "./project-modal";

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

export const Works = ({ locale: _locale, projects }: WorksProps) => {
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
					<ProjectCard
						key={p.slug}
						project={p}
						variant="button"
						onSelect={open}
					/>
				))}
			</div>
			{(() => {
				const active = projects.find((p) => p.slug === activeSlug);
				if (!active) return null;
				return (
					<ProjectModal
						project={active}
						onClose={() => {
							setActiveSlug(null);
							const url = new URL(window.location.href);
							url.searchParams.delete("project");
							window.history.replaceState({}, "", url.toString());
						}}
					/>
				);
			})()}
		</section>
	);
};
