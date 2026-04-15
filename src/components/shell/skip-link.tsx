import { css } from "@emotion/react";
import { tokens } from "@/theme/tokens";

const styles = {
	link: css`
		position: absolute;
		left: -9999px;
		top: 0;
		background: ${tokens.accent};
		color: #000;
		padding: 8px 12px;
		z-index: 10000;
		&:focus {
			left: 8px;
			top: 8px;
		}
	`,
};

export const SkipLink = () => (
	<a href="#main" css={styles.link}>
		Skip to content
	</a>
);
