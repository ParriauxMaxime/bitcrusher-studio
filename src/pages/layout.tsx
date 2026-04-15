import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { SkipLink } from "@/components/shell/skip-link";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";
import type { LocaleEnum, SiteCopy } from "@/content/types";
import { tokens } from "@/theme/tokens";

const styles = {
	main: css`
		padding: 0 28px;
		max-width: 1080px;
		margin: 0 auto;
		color: ${tokens.text.heading};
		min-height: 60vh;
	`,
};

const isDev = process.env.NODE_ENV !== "production";

export interface LayoutProps {
	locale: LocaleEnum;
	site: SiteCopy;
	children: ReactNode;
}

export const Layout = ({ locale, site, children }: LayoutProps) => (
	<>
		<SkipLink />
		<Header navLabels={site.nav} langPrefix={`/${locale}`} />
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
