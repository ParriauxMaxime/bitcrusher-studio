import { css } from "@emotion/react";
import type { Project } from "@/content/types";
import { tokens } from "@/theme/tokens";

const height = "320px";

const styles = {
	shell: css`
		position: relative;
		display: block;
		height: ${height};
		padding: 20px;
		border-radius: 4px;
		background: ${tokens.surface.base};
		color: ${tokens.text.heading};
		text-decoration: none;
		font: inherit;
		text-align: left;
		border: none;
		cursor: pointer;
		overflow: hidden;
		width: 100%;
		transition: transform 0.2s ease;
		&:hover {
			transform: translateY(-2px);
		}
		&::before {
			content: "";
			position: absolute;
			inset: 8px;
			border: 1px solid ${tokens.surface.border};
			pointer-events: none;
			border-radius: 2px;
		}
	`,
	ledRow: css`
		display: flex;
		gap: 4px;
		margin-bottom: 14px;
		position: relative;
	`,
	led: (kind: "c" | "a" | "b" | "off") => css`
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: ${
			kind === "off"
				? tokens.led.off
				: kind === "c"
					? tokens.led.c
					: kind === "a"
						? tokens.led.a
						: tokens.led.b
		};
		box-shadow: ${
			kind === "off"
				? "inset 0 1px 1px rgba(0,0,0,.5)"
				: `0 0 8px ${
						kind === "c"
							? tokens.led.c
							: kind === "a"
								? tokens.led.a
								: tokens.led.b
					}, inset 0 1px 1px rgba(255,255,255,.3)`
		};
	`,
	channel: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.25em;
		color: ${tokens.text.muted};
		text-transform: uppercase;
		position: relative;
	`,
	title: css`
		font-family: "Inter", system-ui, -apple-system, sans-serif;
		font-size: 34px;
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1;
		margin: 6px 0 4px;
		color: ${tokens.text.heading};
		position: relative;
		em {
			color: ${tokens.accent};
			font-style: normal;
			font-weight: 400;
		}
	`,
	meta: css`
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 10px;
		color: ${tokens.text.body};
		letter-spacing: 0.08em;
		position: relative;
		margin-top: 8px;
	`,
	body: css`
		font-family: "Inter", system-ui, sans-serif;
		font-size: 11px;
		color: ${tokens.text.muted};
		max-width: 300px;
		line-height: 1.55;
		position: relative;
		margin-top: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	`,
	knobs: css`
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 9px;
		letter-spacing: 0.18em;
		color: ${tokens.text.muted};
		text-transform: uppercase;
		border-top: 1px solid ${tokens.surface.border};
		padding-top: 10px;
	`,
	knob: css`
		display: inline-block;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: radial-gradient(
			circle at 30% 30%,
			${tokens.knob.hi},
			${tokens.knob.lo}
		);
		border: 1px solid ${tokens.surface.border};
		position: relative;
		vertical-align: middle;
		margin-right: 6px;
		&::after {
			content: "";
			position: absolute;
			top: 2px;
			left: 50%;
			width: 2px;
			height: 4px;
			background: ${tokens.accent};
			transform: translateX(-50%);
		}
	`,
};

export interface ProjectCardProps {
	project: Project;
	variant: "link" | "button";
	href?: string;
	onSelect?: (slug: string) => void;
}

const splitTitle = (title: string): { head: string; tail: string } => {
	const parts = title.trim().split(" ");
	if (parts.length < 2) return { head: "", tail: title };
	const tail = parts.pop() ?? "";
	return { head: parts.join(" "), tail };
};

const LED_PATTERN = ["c", "c", "c", "a", "a", "b", "off", "off"] as const;

const channelLabel = (order: number, role: string): string =>
	`CH_${String(order).padStart(2, "0")} · ${role.replace(/_/g, " ").toUpperCase()}`;

const metaLabel = (project: Project): string => {
	const right = project.collaborators.length
		? project.collaborators.join(" × ")
		: (project.roles[0] ?? "").replace(/_/g, " ");
	return `${project.year} — ${right.toUpperCase()}`;
};

const cardContent = (project: Project) => {
	const { head, tail } = splitTitle(project.title);
	const role = project.roles[0] ?? "sound_design";
	const firstLink = project.links[0];
	return (
		<>
			<div css={styles.ledRow}>
				{LED_PATTERN.map((kind, i) => (
					<span key={`led-${String(i)}`} css={styles.led(kind)} />
				))}
			</div>
			<div css={styles.channel}>{channelLabel(project.order, role)}</div>
			<div css={styles.title}>
				{head ? `${head} ` : ""}
				<em>{tail}</em>
			</div>
			<div css={styles.meta}>{metaLabel(project)}</div>
			<div css={styles.body}>{project.body}</div>
			<div css={styles.knobs}>
				<span>
					<span css={styles.knob} />
					GAIN
				</span>
				<span>
					<span css={styles.knob} />
					TONE
				</span>
				<span>
					<span css={styles.knob} />
					MIX
				</span>
				<span>{firstLink ? `${firstLink.label.toUpperCase()} ↗` : ""}</span>
			</div>
		</>
	);
};

export const ProjectCard = ({
	project,
	variant,
	href,
	onSelect,
}: ProjectCardProps) => {
	if (variant === "link") {
		return (
			<a css={styles.shell} href={href}>
				{cardContent(project)}
			</a>
		);
	}
	return (
		<button
			type="button"
			css={styles.shell}
			onClick={() => onSelect?.(project.slug)}
			aria-label={`Open project ${project.title}`}
		>
			{cardContent(project)}
		</button>
	);
};
