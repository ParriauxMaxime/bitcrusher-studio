import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, type LocaleEnum } from "@/content/types";
import en from "./resources/en/ui.json";
import es from "./resources/es/ui.json";
import fr from "./resources/fr/ui.json";

export const initI18n = async (locale: LocaleEnum = DEFAULT_LOCALE) => {
	await i18next.use(initReactI18next).init({
		lng: locale,
		fallbackLng: DEFAULT_LOCALE,
		defaultNS: "ui",
		ns: ["ui"],
		resources: {
			fr: { ui: fr },
			en: { ui: en },
			es: { ui: es },
		},
		interpolation: { escapeValue: false },
	});
	return i18next;
};
