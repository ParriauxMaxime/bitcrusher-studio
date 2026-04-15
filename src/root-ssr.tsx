import { match, P } from "ts-pattern";
import { Head } from "./components/head";
import { content } from "./content/generated";
import { ALL_LOCALES, type LocaleEnum } from "./content/types";
import { buildMeta } from "./lib/seo/build-meta";
import {
	creativeWorkLd,
	organizationLd,
	personLd,
	webSiteLd,
} from "./lib/seo/json-ld";
import { Layout } from "./pages/layout";
import { LocalePage } from "./pages/locale-page";
import { NotFound } from "./pages/not-found";
import { RootSplash } from "./pages/root-splash";
import { ROUTES, RouteKindEnum } from "./routes";

const ORIGIN =
	typeof window !== "undefined" && window.location.origin
		? window.location.origin
		: "https://bitcrusher-studio.com";

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
			(rawLocale: string) => {
				const locale = rawLocale as LocaleEnum;
				const home = content.pages[locale].home;
				const about = content.pages[locale].about;
				const site = content.site[locale];
				if (!home || !about) return <NotFound locale={locale} />;
				const projects = Object.values(content.projects[locale]).sort(
					(a, b) => a.order - b.order,
				);
				const meta = buildMeta({
					origin: ORIGIN,
					path: `/${locale}/`,
					locale,
					title: home.title,
					description: home.description,
					ogImage: home.og_image ?? "/og/default.png",
					pathWithoutLocale: "/",
					jsonLd: [
						organizationLd(ORIGIN),
						personLd(ORIGIN),
						webSiteLd(ORIGIN),
						...projects.map((p) => creativeWorkLd(ORIGIN, locale, p)),
					],
				});
				return (
					<>
						<Head meta={meta} />
						<Layout site={site}>
							<LocalePage
								locale={locale}
								home={home}
								about={about}
								projects={projects}
								site={site}
							/>
						</Layout>
					</>
				);
			},
		)
		.with(
			{ kind: RouteKindEnum.not_found, locale: P.select(P.string) },
			(rawLocale: string) => {
				const locale = rawLocale as LocaleEnum;
				const site = content.site[locale];
				const meta = buildMeta({
					origin: ORIGIN,
					path: `/${locale}/404`,
					locale,
					title: `404 — ${site.seo.site_name}`,
					description: site.seo.tagline,
					ogImage: "/og/default.png",
					pathWithoutLocale: "/404",
					jsonLd: [],
				});
				return (
					<>
						<Head meta={meta} />
						<Layout site={site}>
							<NotFound locale={locale} />
						</Layout>
					</>
				);
			},
		)
		.exhaustive();
};
