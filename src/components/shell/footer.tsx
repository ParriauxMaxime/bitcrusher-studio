import { css } from "@emotion/react";
import { tokens } from "@/theme/tokens";

const styles = {
	footer: css`
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 36px 28px;
		border-top: 1px solid ${tokens.surface.border};
		font-family: "JetBrains Mono", ui-monospace, monospace;
		font-size: 11px;
		color: ${tokens.text.muted};
		letter-spacing: 0.12em;
	`,
	row: css`
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
		align-items: center;
		a {
			color: ${tokens.text.body};
			text-decoration: none;
			&:hover {
				color: ${tokens.accent};
			}
		}
	`,
};

export interface Social {
	label: string;
	url: string;
}

export interface FooterProps {
	email: string;
	copyright: string;
	socials: Social[];
}

export const Footer = ({ email, copyright, socials }: FooterProps) => (
	<footer css={styles.footer}>
		<div css={styles.row}>
			<a href={`mailto:${email}`}>{email}</a>
			{socials.map((s) => (
				<a key={s.url} href={s.url} target="_blank" rel="noreferrer noopener">
					{s.label.toUpperCase()}
				</a>
			))}
		</div>
		<div>{copyright}</div>
	</footer>
);
