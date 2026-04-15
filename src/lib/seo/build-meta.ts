import { ALL_LOCALES, type LocaleEnum } from "@/content/types";

export interface PageMeta {
	title: string;
	description: string;
	canonical: string;
	ogImage: string;
	ogLocale: string;
	alternates: Array<{ hrefLang: string; href: string }>;
	jsonLd: unknown[];
}

const localeToOg = (l: LocaleEnum): string =>
	l === "fr" ? "fr_FR" : l === "en" ? "en_US" : "es_ES";

export interface BuildMetaArgs {
	origin: string;
	path: string;
	locale: LocaleEnum;
	title: string;
	description: string;
	ogImage: string;
	jsonLd: unknown[];
	pathWithoutLocale: string;
}

export const buildMeta = (args: BuildMetaArgs): PageMeta => ({
	title: args.title,
	description: args.description,
	canonical: `${args.origin}${args.path}`,
	ogImage: `${args.origin}${args.ogImage}`,
	ogLocale: localeToOg(args.locale),
	alternates: [
		...ALL_LOCALES.map((l) => ({
			hrefLang: l,
			href: `${args.origin}/${l}${args.pathWithoutLocale}`,
		})),
		{
			hrefLang: "x-default",
			href: `${args.origin}/fr${args.pathWithoutLocale}`,
		},
	],
	jsonLd: args.jsonLd,
});
