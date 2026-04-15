import { ALL_LOCALES } from "@/content/types";

export const RootSplash = () => (
	<>
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: inline redirect
			dangerouslySetInnerHTML={{
				__html: `
(function(){
  try {
    var lang = (navigator.language || 'fr').toLowerCase();
    var pick = lang.startsWith('en') ? 'en' : lang.startsWith('es') ? 'es' : 'fr';
    location.replace('/' + pick + '/');
  } catch(e) {}
})();
`,
			}}
		/>
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
						style={{ display: "flex", gap: "12px", justifyContent: "center" }}
					>
						{ALL_LOCALES.map((loc) => (
							<a
								key={loc}
								href={`/${loc}/`}
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
