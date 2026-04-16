import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { Footer } from "@/components/shell/footer";
import { SkipLink } from "@/components/shell/skip-link";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";
import type { SiteCopy } from "@/content/types";
import { CrtEffects } from "@/theme/crt-effects";
import { tokens } from "@/theme/tokens";

const styles = {
	main: css`
		color: ${tokens.text.heading};
		min-height: 60vh;
	`,
};

const isDev = process.env.NODE_ENV !== "production";

export interface LayoutProps {
	site: SiteCopy;
	children: ReactNode;
}

export const Layout = ({ site, children }: LayoutProps) => (
	<>
		<SkipLink />
		<CrtEffects />
		<main id="main" css={styles.main}>
			{children}
		</main>
		<Footer
			email={site.footer.email}
			copyright={site.footer.copyright}
			socials={site.footer.socials.map((s) => ({
				label: s.label,
				url: s.url,
			}))}
		/>
		{isDev && <ThemeSwitcherDev />}
	</>
);
