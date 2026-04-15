import { match, P } from "ts-pattern";
import { content } from "./content/generated";
import { ALL_LOCALES, type LocaleEnum } from "./content/types";
import { About } from "./pages/about";
import { Home } from "./pages/home";
import { Layout } from "./pages/layout";
import { NotFound } from "./pages/not-found";
import { RootSplash } from "./pages/root-splash";
import { Works } from "./pages/works";
import { ROUTES, RouteKindEnum } from "./routes";

const resolveRoute = (rawPath: string) => {
	const path = rawPath.replace(/\/$/, "") || "/";
	const matched = ROUTES.find((r) => r.path === path);
	if (matched) return matched;
	for (const locale of ALL_LOCALES) {
		if (path.startsWith(`/${locale}`)) {
			return {
				path: `/${locale}/404`,
				kind: RouteKindEnum.not_found,
				locale,
			};
		}
	}
	return { path: "/", kind: RouteKindEnum.root_splash };
};

export interface RootSSRProps {
	routePath: string;
}

export const RootSSR = ({ routePath }: RootSSRProps) => {
	const route = resolveRoute(routePath);
	return match(route)
		.with({ kind: RouteKindEnum.root_splash }, () => <RootSplash />)
		.with(
			{ kind: RouteKindEnum.home, locale: P.select(P.string) },
			(localeStr) => {
				const locale = localeStr as LocaleEnum;
				const page = content.pages[locale].home;
				if (!page) return <NotFound locale={locale} />;
				const featured = Object.values(content.projects[locale])
					.filter((p) => p.featured)
					.sort((a, b) => a.order - b.order)
					.slice(0, 3);
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<Home locale={locale} page={page} featured={featured} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.about, locale: P.select(P.string) },
			(localeStr) => {
				const locale = localeStr as LocaleEnum;
				const page = content.pages[locale].about;
				if (!page) return <NotFound locale={locale} />;
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<About page={page} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.works, locale: P.select(P.string) },
			(localeStr) => {
				const locale = localeStr as LocaleEnum;
				const projects = Object.values(content.projects[locale]).sort(
					(a, b) => a.order - b.order,
				);
				return (
					<Layout locale={locale} site={content.site[locale]}>
						<Works locale={locale} projects={projects} />
					</Layout>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.not_found, locale: P.select(P.string) },
			(localeStr) => {
				const locale = localeStr as LocaleEnum;
				const site = content.site[locale];
				return (
					<Layout locale={locale} site={site}>
						<NotFound locale={locale} />
					</Layout>
				);
			},
		)
		.exhaustive();
};
