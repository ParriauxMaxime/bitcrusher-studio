import { css } from "@emotion/react";
import { ALL_LOCALES } from "@/content/types";
import { tokens } from "@/theme/tokens";

const SPLASH_TITLE = "Bitcrusher Studio — Sound Designer";
const SPLASH_DESCRIPTION =
	"Musique & Sound Design pour post-production audiovisuelle et jeux vidéo · Music & Sound Design for audiovisual post-production and video games";

const styles = {
	container: css`
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 32px;
	`,
	card: css`
		display: flex;
		flex-direction: column;
		gap: 24px;
		text-align: center;
		max-width: 520px;
	`,
	brand: css`
		font-family: "Instrument Serif", Georgia, serif;
		font-style: italic;
		font-size: 42px;
		color: ${tokens.text.heading};
		letter-spacing: -0.02em;
	`,
	tagline: css`
		color: ${tokens.text.muted};
		font-size: 14px;
		line-height: 1.6;
	`,
	links: css`
		display: flex;
		gap: 16px;
		justify-content: center;
		a {
			font-family: "JetBrains Mono", ui-monospace, monospace;
			font-size: 12px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: ${tokens.text.body};
			text-decoration: none;
			padding: 10px 16px;
			border: 1px solid ${tokens.surface.border};
			border-radius: 4px;
			&:hover {
				color: ${tokens.accent};
				border-color: ${tokens.accent};
			}
		}
	`,
};

const TAGLINES: Record<string, string> = {
	fr: "Musique & Sound Design pour post-production audiovisuelle et jeux vidéo",
	en: "Music & Sound Design for audiovisual post-production and video games",
	es: "Música y Diseño de Sonido para postproducción audiovisual y videojuegos",
};

export const RootSplash = () => (
	<>
		<title>{SPLASH_TITLE}</title>
		<meta name="description" content={SPLASH_DESCRIPTION} />
		<div css={styles.container}>
			<div css={styles.card}>
				<h1 css={styles.brand}>
					Bitcrusher <em>Studio</em>
				</h1>
				<p css={styles.tagline}>
					{TAGLINES.fr}
					<br />
					{TAGLINES.en}
					<br />
					{TAGLINES.es}
				</p>
				<nav css={styles.links} aria-label="Language">
					{ALL_LOCALES.map((loc) => (
						<a key={loc} href={`/${loc}/`} hrefLang={loc}>
							{loc === "fr" ? "Français" : loc === "en" ? "English" : "Español"}
						</a>
					))}
				</nav>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: inline redirect
					dangerouslySetInnerHTML={{
						__html: `
(function(){
  try {
    var lang = (navigator.language || 'fr').toLowerCase();
    var pick = lang.startsWith('en') ? 'en' : lang.startsWith('es') ? 'es' : 'fr';
    if (location.pathname === '/' || location.pathname === '') {
      location.replace('/' + pick + '/');
    }
  } catch(e) {}
})();
`,
					}}
				/>
			</div>
		</div>
	</>
);
