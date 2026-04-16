import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { EmbedPlayer } from "@/components/audio-player/embed-player";
import type { CarouselItem } from "@/components/carousel/carousel";
import { Carousel } from "@/components/carousel/carousel";
import { MusicSet } from "@/components/music-set";
import { Reveal } from "@/components/reveal/reveal";
import type {
	AudioSource,
	LocaleEnum,
	Page,
	Project,
	SiteCopy,
} from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	hero: css`
		padding: 120px 28px 80px;
		max-width: 1080px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: clamp(24px, 4vw, 56px);
	`,
	heroLayout: css`
		display: flex;
		align-items: center;
		gap: 48px;
		flex-wrap: wrap;
		flex-direction: row-reverse;
		@media (max-width: 640px) {
			flex-direction: column;
			text-align: center;
		}
	`,
	avatar: css`
		flex: 0 0 auto;
		width: clamp(140px, 18vw, 220px);
		height: auto;
		border-radius: 50%;
		border: 1px solid ${tokens.surface.border};
	`,
	heroContent: css`
		flex: 1 1 320px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(56px, 10vw, 120px);
		color: ${tokens.text.heading};
		line-height: 0.95;
		letter-spacing: -0.03em;
		margin: 0 0 8px;
	`,
	taglineLarge: css`
		color: ${tokens.text.body};
		font-size: clamp(18px, 1.9vw, 24px);
		line-height: 1.45;
		max-width: 560px;
		margin: 0;
	`,
	section: css`
		padding: 80px 28px;
		max-width: 1080px;
		margin: 0 auto;
		border-top: 1px solid ${tokens.surface.border};
	`,
	aboutBody: css`
		font-size: 18px;
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
		margin: 0 0 16px;
	`,
	projectList: css`
		display: flex;
		flex-direction: column;
		gap: 0;
	`,
	projectArticle: css`
		padding: 56px 0;
		border-top: 1px dashed ${tokens.surface.border};
		display: flex;
		flex-direction: column;
		gap: 24px;
		&:first-of-type {
			border-top: none;
			padding-top: 24px;
		}
	`,
	projectChannel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin-bottom: 12px;
	`,
	projectTitle: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: clamp(36px, 6vw, 64px);
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
		line-height: 1.05;
		margin: 0;
		em {
			color: ${tokens.accent};
			font-style: italic;
			font-weight: 400;
		}
	`,
	projectMeta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		letter-spacing: 0.1em;
		color: ${tokens.text.body};
	`,
	projectBody: css`
		font-size: 16px;
		line-height: 1.7;
		color: ${tokens.text.body};
		max-width: 720px;
		white-space: pre-wrap;
		margin: 4px 0 0;
	`,
	linkList: css`
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		margin-top: 8px;
		a {
			color: ${tokens.accent};
			text-decoration: none;
			font-family: "JetBrains Mono", ui-monospace, monospace;
			font-size: 11px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			padding-bottom: 2px;
			position: relative;
			&::after {
				content: "";
				position: absolute;
				bottom: 0;
				left: 0;
				width: 0;
				height: 1px;
				background: ${tokens.accent};
				transition: width 0.3s ease;
			}
			&:hover::after {
				width: 100%;
			}
		}
	`,
};

const splitTitle = (title: string): { head: string; tail: string } => {
	const parts = title.trim().split(" ");
	if (parts.length < 2) return { head: "", tail: title };
	const tail = parts.pop() ?? "";
	return { head: parts.join(" "), tail };
};

const channelLabel = (project: Project): string => {
	const role = project.roles[0] ?? "sound_design";
	return `CH_${String(project.order).padStart(2, "0")} · ${role.replace(/_/g, " ").toUpperCase()}`;
};

const metaLabel = (project: Project): string => {
	const right = project.collaborators.length
		? project.collaborators.join(" × ")
		: (project.roles[0] ?? "").replace(/_/g, " ");
	return `${project.year} — ${right.toUpperCase()}`;
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
	home: _home,
	about,
	projects,
	site,
}: LocalePageProps) => {
	const { t } = useTranslation();

	return (
		<>
			<section css={styles.hero} id="hero">
				<div css={styles.heroLayout}>
					<img
						css={styles.avatar}
						src="/media/avatar.png"
						alt="Quentin Ferreira-Castiço"
						width={220}
						height={220}
					/>
					<div css={styles.heroContent}>
						<h1 css={styles.brand}>
							Bitcrusher <em>Studio</em>
						</h1>
						<p css={styles.taglineLarge}>{site.seo.tagline}</p>
					</div>
				</div>
				<div css={styles.aboutBody}>{about.body}</div>
			</section>

			<section css={styles.section} id="works">
				{projects.length === 0 ? (
					<p>{t("works.empty")}</p>
				) : (
					<div css={styles.projectList}>
						{projects.map((p) => {
							const { head, tail } = splitTitle(p.title);
							return (
								<article
									key={p.slug}
									id={`project-${p.slug}`}
									css={styles.projectArticle}
								>
									<Reveal>
										<h3 css={styles.projectTitle}>
											{head ? `${head} ` : ""}
											<em>{tail}</em>
										</h3>
									</Reveal>
									<Reveal delay={1}>
										<div css={styles.projectMeta}>{metaLabel(p)}</div>
										<div css={styles.projectBody}>{p.body}</div>
									</Reveal>
									{(() => {
										const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
										const mediaItems: CarouselItem[] = (p.images ?? []).map(
											(src): CarouselItem =>
												VIDEO_EXT.test(src)
													? {
															kind: "video" as const,
															src,
															title: p.title,
															poster: p.cover,
														}
													: { kind: "image" as const, src, alt: p.title },
										);
										const videoItems: CarouselItem[] = p.audio
											.filter((a) => a.kind === "youtube")
											.map(
												(a): CarouselItem => ({
													kind: "youtube" as const,
													url: a.url,
													title: a.title,
												}),
											);
										const carouselItems = [...mediaItems, ...videoItems];
										return carouselItems.length > 0 ? (
											<Reveal delay={2}>
												<Carousel items={carouselItems} />
											</Reveal>
										) : null;
									})()}
									{(() => {
										const fileAudio = p.audio.filter(
											(a): a is Extract<AudioSource, { kind: "file" }> =>
												a.kind === "file",
										);
										const embedAudio = p.audio.filter(
											(a): a is Extract<AudioSource, { kind: "soundcloud" }> =>
												a.kind === "soundcloud",
										);
										return (
											<>
												{fileAudio.length > 0 && (
													<Reveal delay={2}>
														<MusicSet sources={fileAudio} />
													</Reveal>
												)}
												{embedAudio.map((a) => (
													<EmbedPlayer key={a.url} source={a} />
												))}
											</>
										);
									})()}
									{p.links.length > 0 && (
										<div css={styles.linkList}>
											{p.links.map((l) => (
												<a
													key={l.url}
													href={l.url}
													target="_blank"
													rel="noreferrer noopener"
												>
													{l.label} ↗
												</a>
											))}
										</div>
									)}
								</article>
							);
						})}
					</div>
				)}
			</section>
		</>
	);
};
