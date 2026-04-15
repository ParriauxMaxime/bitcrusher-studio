import type { LocaleEnum, Project } from "@/content/types";

export interface JsonLd {
	"@context": "https://schema.org";
	"@type": string;
	[key: string]: unknown;
}

export const organizationLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "Organization",
	"@id": `${origin}/#organization`,
	name: "Bitcrusher Studio",
	url: origin,
	founder: {
		"@type": "Person",
		name: "Quentin Ferreira-Castiço",
	},
	email: "contact@bitcrusher-studio.com",
});

export const personLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "Person",
	"@id": `${origin}/#person`,
	name: "Quentin Ferreira-Castiço",
	jobTitle: "Sound Designer",
	alumniOf: [
		{ "@type": "EducationalOrganization", name: "ACFA Multimédia" },
		{
			"@type": "EducationalOrganization",
			name: "Université de Strasbourg",
		},
	],
	sameAs: [
		"https://soundcloud.com/user-836588138",
		"https://youtube.com/playlist?list=PLL6AYm1TFMrcIqQv9stuyjAoS_-UK4zD4",
		"https://www.linkedin.com/in/quentin-ferreira-castiço",
	],
});

export const webSiteLd = (origin: string): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "WebSite",
	"@id": `${origin}/#website`,
	name: "Bitcrusher Studio",
	url: origin,
	publisher: { "@id": `${origin}/#organization` },
});

export const creativeWorkLd = (
	origin: string,
	locale: LocaleEnum,
	project: Project,
): JsonLd => ({
	"@context": "https://schema.org",
	"@type": "CreativeWork",
	"@id": `${origin}/${locale}/works?project=${project.slug}`,
	name: project.title,
	creator: { "@id": `${origin}/#person` },
	dateCreated: String(project.year),
	inLanguage: locale,
	genre: project.roles,
	keywords: project.tags.join(", "),
	image: `${origin}${project.cover}`,
	associatedMedia: project.audio.map((a) => ({
		"@type": "AudioObject",
		name: a.title,
		contentUrl:
			a.kind === "file"
				? `${origin}${a.src}`
				: a.kind === "soundcloud"
					? a.url
					: a.url,
	})),
});
