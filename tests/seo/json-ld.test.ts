import { describe, expect, it } from "vitest";
import {
	creativeWorkLd,
	organizationLd,
	personLd,
	webSiteLd,
} from "@/lib/seo/json-ld";

describe("json-ld builders", () => {
	it("organization has Bitcrusher Studio name and url", () => {
		const ld = organizationLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("Organization");
		expect(ld.name).toBe("Bitcrusher Studio");
		expect(ld.url).toBe("https://bitcrusher-studio.com");
	});

	it("person has artist name", () => {
		const ld = personLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("Person");
		expect(ld.name).toContain("Ferreira-Casti");
	});

	it("creativeWork includes title, year, roles", () => {
		const ld = creativeWorkLd("https://bitcrusher-studio.com", "fr", {
			slug: "space-piercer",
			title: "Space Piercer",
			order: 1,
			featured: true,
			year: 2022,
			roles: ["sound_design"],
			tags: [],
			cover: "/media/projects/space-piercer/cover.jpg",
			images: [],
			audio: [],
			links: [],
			collaborators: [],
			body: "…",
			locale: "fr",
		});
		expect(ld["@type"]).toBe("CreativeWork");
		expect(ld.name).toBe("Space Piercer");
		expect(ld.dateCreated).toBe("2022");
	});

	it("webSite includes search action stub with site name", () => {
		const ld = webSiteLd("https://bitcrusher-studio.com");
		expect(ld["@type"]).toBe("WebSite");
		expect(ld.name).toBe("Bitcrusher Studio");
	});
});
