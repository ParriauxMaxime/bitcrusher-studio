import { useEffect, useState } from "react";
import { match, P } from "ts-pattern";
import { content } from "@/content/generated";
import { ALL_LOCALES, DEFAULT_LOCALE, type LocaleEnum } from "@/content/types";
import { initI18n } from "@/i18n";
import { About } from "@/pages/about";
import { Home } from "@/pages/home";
import { Layout } from "@/pages/layout";
import { NotFound } from "@/pages/not-found";
import { RootSplash } from "@/pages/root-splash";
import { Works } from "@/pages/works";
import { ROUTES, RouteKindEnum } from "@/routes";

const resolveRoute = () => {
	const path = window.location.pathname.replace(/\/$/, "") || "/";
	const matched = ROUTES.find((r) => r.path === path);
	if (matched) return matched;
	for (const locale of ALL_LOCALES) {
		if (path.startsWith(`/${locale}`)) {
			return { path: `/${locale}/404`, kind: RouteKindEnum.not_found, locale };
		}
	}
	return { path: "/", kind: RouteKindEnum.root_splash };
};

export const Root = () => {
	const [ready, setReady] = useState(false);
	const [route] = useState(() => resolveRoute());

	useEffect(() => {
		const locale = route.locale ?? DEFAULT_LOCALE;
		initI18n(locale).then(() => {
			document.documentElement.lang = locale;
			setReady(true);
		});
	}, [route.locale]);

	if (!ready) return null;

	return match(route)
		.with({ kind: RouteKindEnum.root_splash }, () => <RootSplash />)
		.with(
			{ kind: RouteKindEnum.home, locale: P.select() },
			(locale: LocaleEnum) => {
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
			{ kind: RouteKindEnum.about, locale: P.select() },
			(locale: LocaleEnum) => {
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
			{ kind: RouteKindEnum.works, locale: P.select() },
			(locale: LocaleEnum) => {
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
			{ kind: RouteKindEnum.not_found, locale: P.select() },
			(locale: LocaleEnum) => {
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
