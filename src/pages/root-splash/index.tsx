import { ALL_LOCALES } from "@/content/types";
import { BASE_PATH } from "@/routes";

const siteOrigin =
	typeof window !== "undefined"
		? `${window.location.origin}${BASE_PATH}`
		: (process.env.SITE_ORIGIN ?? "https://bitcrusher-studio.com");
const ogImage = `${siteOrigin}/og/default.png`;

export const RootSplash = () => (
	<>
		<title>Bitcrusher Studio — Sound Design &amp; Music</title>
		<meta
			name="description"
			content="Sound Design · Music · Composition for Audiovisual Post-Production and Video Games"
		/>
		<meta property="og:title" content="Bitcrusher Studio" />
		<meta
			property="og:description"
			content="Sound Design · Music · Composition"
		/>
		<meta property="og:image" content={ogImage} />
		<meta property="og:type" content="website" />
		<meta name="twitter:card" content="summary_large_image" />
		<noscript>
			<div
				style={{
					minHeight: "100vh",
					display: "grid",
					placeItems: "center",
					padding: "32px",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						textAlign: "center",
						maxWidth: "420px",
					}}
				>
					<h1
						style={{
							fontFamily: "'Instrument Serif', Georgia, serif",
							fontStyle: "italic",
							fontSize: "28px",
							margin: 0,
						}}
					>
						Bitcrusher <em>Studio</em>
					</h1>
					<p
						style={{
							fontSize: "13px",
							fontFamily: "monospace",
							letterSpacing: "0.1em",
						}}
					>
						Choose your language
					</p>
					<nav
						aria-label="Language"
						style={{
							display: "flex",
							gap: "12px",
							justifyContent: "center",
						}}
					>
						{ALL_LOCALES.map((loc) => (
							<a
								key={loc}
								href={`${BASE_PATH}/${loc}/`}
								hrefLang={loc}
								style={{
									fontSize: "11px",
									textDecoration: "none",
									padding: "8px 14px",
									border: "1px solid currentColor",
									borderRadius: "4px",
								}}
							>
								{loc === "fr"
									? "Français"
									: loc === "en"
										? "English"
										: "Español"}
							</a>
						))}
					</nav>
				</div>
			</div>
		</noscript>
	</>
);
