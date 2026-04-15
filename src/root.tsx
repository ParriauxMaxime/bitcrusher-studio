import { css } from "@emotion/react";
import { Footer } from "./components/shell/footer";
import { Header } from "./components/shell/header";
import { SkipLink } from "./components/shell/skip-link";
import { ThemeSwitcherDev } from "./components/theme-switcher-dev/theme-switcher-dev";
import { tokens } from "./theme/tokens";

const styles = {
	main: css`
		padding: 64px 28px;
		max-width: 1080px;
		margin: 0 auto;
		color: ${tokens.text.heading};
		min-height: 60vh;
	`,
};

const isDev = process.env.NODE_ENV !== "production";

export const Root = () => {
	return (
		<>
			<SkipLink />
			<Header
				navLabels={{ home: "Home", about: "About", works: "Works" }}
				langPrefix="/fr"
			/>
			<main id="main" css={styles.main}>
				Bitcrusher Studio — bootstrap.
			</main>
			<Footer
				email="contact@bitcrusher-studio.com"
				copyright="© 2026 Bitcrusher Studio · Tous droits réservés"
				socials={[
					{ label: "SoundCloud", url: "https://soundcloud.com/user-836588138" },
					{
						label: "YouTube",
						url: "https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4",
					},
					{
						label: "LinkedIn",
						url: "https://www.linkedin.com/in/quentin-ferreira-castiço",
					},
				]}
			/>
			{isDev && <ThemeSwitcherDev />}
		</>
	);
};
