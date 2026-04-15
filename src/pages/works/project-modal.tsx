import { css } from "@emotion/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer } from "@/components/audio-player";
import type { Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	dialog: css`
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: rgba(0, 0, 0, 0.7);
	`,
	panel: css`
		background: ${tokens.surface.base};
		border: 1px solid ${tokens.surface.border};
		border-radius: 8px;
		max-width: 720px;
		width: 100%;
		max-height: 90vh;
		overflow: auto;
		padding: 40px;
		color: ${tokens.text.body};
		position: relative;
		&::before {
			content: "";
			position: absolute;
			inset: 8px;
			border: 1px solid ${tokens.surface.border};
			pointer-events: none;
			border-radius: 4px;
		}
	`,
	channel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.25em;
		color: ${tokens.text.muted};
		text-transform: uppercase;
		margin-bottom: 6px;
	`,
	close: css`
		background: none;
		border: 1px solid ${tokens.surface.border};
		color: ${tokens.text.muted};
		padding: 6px 10px;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		cursor: pointer;
		float: right;
		&:hover {
			color: ${tokens.accent};
			border-color: ${tokens.accent};
		}
	`,
	meta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: ${tokens.text.muted};
		margin: 0 0 10px;
	`,
	h2: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 34px;
		color: ${tokens.text.heading};
		margin: 0 0 14px;
		em {
			color: ${tokens.accent};
			font-style: italic;
			font-weight: 400;
		}
	`,
	body: css`
		font-size: 15px;
		line-height: 1.7;
		white-space: pre-wrap;
		margin-bottom: 24px;
	`,
	links: css`
		display: flex;
		gap: 12px;
		margin-top: 18px;
		flex-wrap: wrap;
		a {
			color: ${tokens.accent};
			text-decoration: none;
			font-size: 13px;
			border-bottom: 1px solid ${tokens.accent};
			padding-bottom: 1px;
		}
	`,
};

export interface ProjectModalProps {
	project: Project;
	onClose: () => void;
}

export const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
	const { t } = useTranslation();
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = `project-${project.slug}-title`;
	const previouslyFocused = useRef<Element | null>(null);

	useEffect(() => {
		previouslyFocused.current = document.activeElement;
		panelRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			(previouslyFocused.current as HTMLElement | null)?.focus?.();
		};
	}, [onClose]);

	return (
		<div
			css={styles.dialog}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div ref={panelRef} tabIndex={-1} css={styles.panel}>
				<button type="button" css={styles.close} onClick={onClose}>
					{t("common.close")} ✕
				</button>
				<div css={styles.channel}>
					CH_{String(project.order).padStart(2, "0")} ·{" "}
					{(project.roles[0] ?? "").replace(/_/g, " ").toUpperCase()}
				</div>
				<div css={styles.meta}>
					{project.year} · {project.roles.join(" · ")}
				</div>
				{(() => {
					const parts = project.title.trim().split(" ");
					const tail = parts.pop() ?? "";
					const head = parts.join(" ");
					return (
						<h2 id={titleId} css={styles.h2}>
							{head ? `${head} ` : ""}
							<em>{tail}</em>
						</h2>
					);
				})()}
				<div css={styles.body}>{project.body}</div>
				<AudioPlayer sources={project.audio} />
				{project.links.length > 0 && (
					<div css={styles.links}>
						{project.links.map((l) => (
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
			</div>
		</div>
	);
};
