import { describe, expect, it } from "vitest";
import { loadAllContent } from "@/content/loader";

describe("loadAllContent", () => {
	it("loads pages for every locale", async () => {
		const content = await loadAllContent();
		expect(content.pages.fr.home).toBeDefined();
		expect(content.pages.en.home).toBeDefined();
		expect(content.pages.es.home).toBeDefined();
		expect(content.pages.fr.about).toBeDefined();
	});

	it("loads site copy for every locale", async () => {
		const content = await loadAllContent();
		expect(content.site.fr.footer.email).toBe("contact@bitcrusher-studio.com");
		expect(content.site.en.footer.email).toBe("contact@bitcrusher-studio.com");
		expect(content.site.es.footer.email).toBe("contact@bitcrusher-studio.com");
	});

	it("loads projects indexed by locale and slug", async () => {
		const content = await loadAllContent();
		const sp = content.projects.fr["space-piercer"];
		expect(sp?.title).toBe("Space Piercer");
		expect(sp?.year).toBe(2022);
		expect(sp?.roles).toContain("sound_design");
	});

	it("throws a descriptive error when a file is malformed", async () => {
		const { validateProjectMarkdown } = await import("@/content/loader");
		const malformed = `---\nslug: Bad Slug\n---\nbody`;
		expect(() => validateProjectMarkdown(malformed, "test.md")).toThrow(
			/slug/i,
		);
	});
});
