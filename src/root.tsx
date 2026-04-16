import i18next from "i18next";
import { useEffect, useState } from "react";
import { match, P } from "ts-pattern";
import { Head } from "@/components/head";
import { LocaleSwitcher } from "@/components/locale-switcher/locale-switcher";
import { content } from "@/content/generated";
import { ALL_LOCALES, DEFAULT_LOCALE, type LocaleEnum } from "@/content/types";
import { initI18n } from "@/i18n";
import { buildMeta } from "@/lib/seo/build-meta";
import {
	creativeWorkLd,
	organizationLd,
	personLd,
	webSiteLd,
} from "@/lib/seo/json-ld";
import { Layout } from "@/pages/layout";
import { LocalePage } from "@/pages/locale-page";
import { NotFound } from "@/pages/not-found";
import { RootSplash } from "@/pages/root-splash";
import { BASE_PATH, ROUTES, RouteKindEnum } from "@/routes";

const ORIGIN =
	typeof window !== "undefined" && window.location.origin
		? window.location.origin
		: "https://bitcrusher-studio.com";

const resolveRoute = () => {
	let path = window.location.pathname.replace(/\/$/, "") || "/";
	if (BASE_PATH && path.startsWith(BASE_PATH)) {
		path = path.slice(BASE_PATH.length) || "/";
	}
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
	const [route, setRoute] = useState(() => resolveRoute());

	// Soft redirect from root splash to detected locale
	useEffect(() => {
		if (route.kind !== RouteKindEnum.root_splash) return;
		const lang = (navigator.language || "fr").toLowerCase();
		const pick: LocaleEnum = lang.startsWith("en")
			? "en"
			: lang.startsWith("es")
				? "es"
				: "fr";
		window.history.replaceState(null, "", `${BASE_PATH}/${pick}/`);
		setRoute({ path: `/${pick}`, kind: RouteKindEnum.home, locale: pick });
	}, [route.kind]);

	useEffect(() => {
		const locale = route.locale ?? DEFAULT_LOCALE;
		initI18n(locale).then(() => {
			document.documentElement.lang = locale;
			setReady(true);
		});
	}, [route.locale]);

	const changeLocale = (next: LocaleEnum) => {
		window.history.replaceState(null, "", `${BASE_PATH}/${next}/`);
		document.documentElement.lang = next;
		void i18next.changeLanguage(next);
		setRoute({ path: `/${next}`, kind: RouteKindEnum.home, locale: next });
	};

	if (!ready) return null;

	const currentLocale = route.locale;

	return (
		<>
			{currentLocale && (
				<LocaleSwitcher current={currentLocale} onChange={changeLocale} />
			)}
			{match(route)
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
							(a, b) => b.year - a.year || a.order - b.order,
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
				.exhaustive()}
		</>
	);
};
