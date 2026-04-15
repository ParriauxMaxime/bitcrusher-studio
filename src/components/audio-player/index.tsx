import { css } from "@emotion/react";
import { match } from "ts-pattern";
import type { AudioSource } from "@/content/types";
import { EmbedPlayer } from "./embed-player";
import { FilePlayer } from "./file-player";

const styles = {
	stack: css`
		display: flex;
		flex-direction: column;
		gap: 12px;
	`,
};

export interface AudioPlayerProps {
	sources: AudioSource[];
}

export const AudioPlayer = ({ sources }: AudioPlayerProps) => {
	if (sources.length === 0) return null;
	return (
		<div css={styles.stack}>
			{sources.map((s, i) =>
				match(s)
					.with({ kind: "file" }, (src) => (
						<FilePlayer key={`${src.src}-${i}`} source={src} />
					))
					.with({ kind: "soundcloud" }, (src) => (
						<EmbedPlayer key={`${src.url}-${i}`} source={src} />
					))
					.with({ kind: "youtube" }, (src) => (
						<EmbedPlayer key={`${src.url}-${i}`} source={src} />
					))
					.exhaustive(),
			)}
		</div>
	);
};
