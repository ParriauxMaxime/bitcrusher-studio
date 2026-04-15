import { css } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import type { AudioSource } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	container: css`
		border: 1px solid ${tokens.surface.border};
		border-radius: 6px;
		overflow: hidden;
		min-height: 120px;
	`,
	poster: css`
		padding: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: none;
		color: ${tokens.text.heading};
		border: none;
		font: inherit;
		cursor: pointer;
		width: 100%;
		text-align: left;
		&:hover {
			background: ${tokens.surface.border};
		}
	`,
	label: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
	`,
	title: css`
		font-size: 13px;
		margin-top: 4px;
	`,
	play: css`
		background: ${tokens.accent};
		color: #000;
		padding: 8px 14px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
	`,
};

const soundcloudEmbed = (url: string) =>
	`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false`;
const youtubeEmbed = (url: string) => {
	const id =
		url.match(/v=([^&]+)/)?.[1] ||
		url.match(/youtu\.be\/([^?]+)/)?.[1] ||
		url.match(/playlist\?list=([^&]+)/)?.[1];
	return `https://www.youtube.com/embed/${id}?autoplay=1`;
};

export interface EmbedPlayerProps {
	source: Extract<AudioSource, { kind: "soundcloud" | "youtube" }>;
}

export const EmbedPlayer = ({ source }: EmbedPlayerProps) => {
	const { t } = useTranslation();
	const [loaded, setLoaded] = useState(false);

	if (!loaded) {
		return (
			<div css={styles.container}>
				<button
					type="button"
					css={styles.poster}
					onClick={() => setLoaded(true)}
					aria-label={`${t("common.play")} — ${source.title}`}
				>
					<div>
						<div css={styles.label}>{source.kind}</div>
						<div css={styles.title}>{source.title}</div>
					</div>
					<span css={styles.play}>▶ {t("common.play")}</span>
				</button>
			</div>
		);
	}

	const src = match(source)
		.with({ kind: "soundcloud" }, (s) => soundcloudEmbed(s.url))
		.with({ kind: "youtube" }, (s) => youtubeEmbed(s.url))
		.exhaustive();

	return (
		<div css={styles.container}>
			<iframe
				src={src}
				title={source.title}
				loading="lazy"
				allow="autoplay; encrypted-media"
				style={{ width: "100%", height: "180px", border: 0 }}
			/>
		</div>
	);
};
