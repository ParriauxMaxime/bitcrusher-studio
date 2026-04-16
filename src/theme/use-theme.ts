import { useCallback, useSyncExternalStore } from "react";
import { content } from "@/content/generated";
import { ALL_THEMES, ThemeEnum } from "./tokens";

const DEFAULT_THEME =
	(content.site.fr.theme?.default as ThemeEnum) ?? ThemeEnum.vapor;

const STORAGE_KEY = "theme";

const readTheme = (): ThemeEnum => {
	const fromDom = document.documentElement.dataset.theme;
	if (
		fromDom === ThemeEnum.graphite ||
		fromDom === ThemeEnum.mahogany ||
		fromDom === ThemeEnum.synthwave ||
		fromDom === ThemeEnum.vapor
	) {
		return fromDom;
	}
	return DEFAULT_THEME;
};

const subscribers = new Set<() => void>();
const subscribe = (fn: () => void) => {
	subscribers.add(fn);
	return () => subscribers.delete(fn);
};
const notify = () => {
	for (const fn of subscribers) fn();
};

export interface UseThemeReturn {
	theme: ThemeEnum;
	setTheme: (theme: ThemeEnum) => void;
	cycleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
	const theme = useSyncExternalStore(subscribe, readTheme, readTheme);

	const setTheme = useCallback((next: ThemeEnum) => {
		document.documentElement.dataset.theme = next;
		localStorage.setItem(STORAGE_KEY, next);
		notify();
	}, []);

	const cycleTheme = useCallback(() => {
		const current = readTheme();
		const idx = ALL_THEMES.indexOf(current);
		const next = ALL_THEMES[(idx + 1) % ALL_THEMES.length];
		if (next) setTheme(next);
	}, [setTheme]);

	return { theme, setTheme, cycleTheme };
};
