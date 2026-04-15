import { describe, expect, it } from "vitest";
import en from "@/i18n/resources/en/ui.json";
import es from "@/i18n/resources/es/ui.json";
import fr from "@/i18n/resources/fr/ui.json";

const collectKeys = (obj: unknown, prefix = ""): string[] => {
	if (typeof obj !== "object" || obj === null) return [];
	const out: string[] = [];
	for (const [k, v] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${k}` : k;
		if (typeof v === "object" && v !== null) {
			out.push(...collectKeys(v, path));
		} else {
			out.push(path);
		}
	}
	return out.sort();
};

describe("i18n locale parity", () => {
	const keysFr = collectKeys(fr);
	const keysEn = collectKeys(en);
	const keysEs = collectKeys(es);

	it("fr and en have the same key set", () => {
		expect(keysEn).toEqual(keysFr);
	});

	it("fr and es have the same key set", () => {
		expect(keysEs).toEqual(keysFr);
	});
});
