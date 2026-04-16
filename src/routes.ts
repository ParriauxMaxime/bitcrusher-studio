import { ALL_LOCALES, type LocaleEnum } from "@/content/types";

const detectBase = (): string => {
	if (typeof window !== "undefined") {
		return window.location.pathname.startsWith("/bitcrusher-studio")
			? "/bitcrusher-studio"
			: "";
	}
	if (typeof process !== "undefined" && process.env?.BASE_PATH) {
		return process.env.BASE_PATH;
	}
	return "";
};
export const BASE_PATH = detectBase();

export const RouteKindEnum = {
	root_splash: "root_splash",
	home: "home",
	not_found: "not_found",
} as const;
export type RouteKindEnum = (typeof RouteKindEnum)[keyof typeof RouteKindEnum];

export interface RouteSpec {
	path: string;
	kind: RouteKindEnum;
	locale?: LocaleEnum;
}

export const ROUTES: RouteSpec[] = [
	{ path: "/", kind: RouteKindEnum.root_splash },
	...ALL_LOCALES.flatMap((locale): RouteSpec[] => [
		{ path: `/${locale}`, kind: RouteKindEnum.home, locale },
		{ path: `/${locale}/404`, kind: RouteKindEnum.not_found, locale },
	]),
];

export const allPrerenderPaths = (): string[] => ROUTES.map((r) => r.path);
