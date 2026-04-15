import type { PageMeta } from "@/lib/seo/build-meta";

export interface HeadProps {
	meta: PageMeta;
}

export const Head = ({ meta }: HeadProps) => (
	<>
		<title>{meta.title}</title>
		<meta name="description" content={meta.description} />
		<link rel="canonical" href={meta.canonical} />
		<meta property="og:title" content={meta.title} />
		<meta property="og:description" content={meta.description} />
		<meta property="og:image" content={meta.ogImage} />
		<meta property="og:locale" content={meta.ogLocale} />
		<meta property="og:url" content={meta.canonical} />
		<meta name="twitter:card" content="summary_large_image" />
		{meta.alternates.map((alt) => (
			<link
				key={alt.hrefLang}
				rel="alternate"
				hrefLang={alt.hrefLang}
				href={alt.href}
			/>
		))}
		{meta.jsonLd.map((ld, i) => (
			<script
				key={`ld-${i}`}
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload
				dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
			/>
		))}
	</>
);
