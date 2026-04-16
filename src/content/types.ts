import { z } from "zod";

export const LocaleEnum = {
	fr: "fr",
	en: "en",
	es: "es",
} as const;
export type LocaleEnum = (typeof LocaleEnum)[keyof typeof LocaleEnum];
export const ALL_LOCALES: readonly LocaleEnum[] = [
	LocaleEnum.fr,
	LocaleEnum.en,
	LocaleEnum.es,
];
export const DEFAULT_LOCALE: LocaleEnum = LocaleEnum.fr;

export const ProjectRoleEnum = {
	sound_design: "sound_design",
	music_composition: "music_composition",
	mixing: "mixing",
	mastering: "mastering",
	integration: "integration",
} as const;
export type ProjectRoleEnum =
	(typeof ProjectRoleEnum)[keyof typeof ProjectRoleEnum];

export const AudioSourceSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("file"),
		src: z.string().startsWith("/media/"),
		title: z.string().min(1),
		duration: z.number().positive().optional(),
	}),
	z.object({
		kind: z.literal("soundcloud"),
		url: z.string().url(),
		title: z.string().min(1),
	}),
	z.object({
		kind: z.literal("youtube"),
		url: z.string().url(),
		title: z.string().min(1),
	}),
]);
export type AudioSource = z.infer<typeof AudioSourceSchema>;

export const ProjectLinkSchema = z.object({
	label: z.string().min(1),
	url: z.string().url(),
});
export type ProjectLink = z.infer<typeof ProjectLinkSchema>;

export const ProjectFrontmatterSchema = z.object({
	slug: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	order: z.number().int(),
	featured: z.boolean().default(false),
	year: z.number().int().gte(1990).lte(2100),
	roles: z.array(z.nativeEnum(ProjectRoleEnum)).min(1),
	tags: z.array(z.string()).default([]),
	cover: z.string().startsWith("/media/"),
	images: z.array(z.string().startsWith("/media/")).default([]),
	audio: z.array(AudioSourceSchema).default([]),
	links: z.array(ProjectLinkSchema).default([]),
	collaborators: z.array(z.string()).default([]),
});
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
	body: string;
	locale: LocaleEnum;
}

export const PageFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	og_image: z.string().startsWith("/og/").optional(),
});
export type PageFrontmatter = z.infer<typeof PageFrontmatterSchema>;

export interface Page extends PageFrontmatter {
	slug: string;
	body: string;
	locale: LocaleEnum;
}

export const SiteCopySchema = z.object({
	hero: z
		.object({
			avatar: z.string().default("/media/avatar.svg"),
		})
		.default({}),
	footer: z.object({
		email: z.string().email(),
		copyright: z.string(),
		socials: z
			.array(
				z.object({
					kind: z.enum(["soundcloud", "youtube", "linkedin", "malt"]),
					url: z.string().url(),
					label: z.string(),
				}),
			)
			.default([]),
	}),
	seo: z.object({
		site_name: z.string(),
		tagline: z.string(),
	}),
	theme: z
		.object({
			default: z.string().default("vapor"),
			crt: z
				.object({
					scanlines: z.number().default(42),
					glow: z.number().default(37),
					aberration: z.number().default(53),
					vignette: z.number().default(65),
					flicker: z.number().default(0),
				})
				.default({}),
		})
		.default({}),
});
export type SiteCopy = z.infer<typeof SiteCopySchema>;
