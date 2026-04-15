import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import {
	ALL_LOCALES,
	type LocaleEnum,
	type Page,
	PageFrontmatterSchema,
	type Project,
	ProjectFrontmatterSchema,
	type SiteCopy,
	SiteCopySchema,
} from "./types";

const CONTENT_ROOT = join(process.cwd(), "content");

export interface ContentBundle {
	pages: Record<LocaleEnum, Record<string, Page>>;
	projects: Record<LocaleEnum, Record<string, Project>>;
	site: Record<LocaleEnum, SiteCopy>;
}

export const validateProjectMarkdown = (
	raw: string,
	filePath: string,
): { frontmatter: Project; body: string } => {
	const parsed = matter(raw);
	const result = ProjectFrontmatterSchema.safeParse(parsed.data);
	if (!result.success) {
		throw new Error(
			`[content] invalid project ${filePath}: ${result.error.message}`,
		);
	}
	return {
		frontmatter: { ...result.data, body: parsed.content.trim(), locale: "fr" },
		body: parsed.content.trim(),
	};
};

const loadPages = async (locale: LocaleEnum): Promise<Record<string, Page>> => {
	const dir = join(CONTENT_ROOT, "pages", locale);
	const files = await readdir(dir);
	const out: Record<string, Page> = {};
	for (const name of files) {
		if (extname(name) !== ".md") continue;
		const slug = basename(name, ".md");
		const raw = await readFile(join(dir, name), "utf8");
		const parsed = matter(raw);
		const result = PageFrontmatterSchema.safeParse(parsed.data);
		if (!result.success) {
			throw new Error(
				`[content] invalid page ${locale}/${name}: ${result.error.message}`,
			);
		}
		out[slug] = {
			...result.data,
			slug,
			body: parsed.content.trim(),
			locale,
		};
	}
	return out;
};

const loadProjects = async (
	locale: LocaleEnum,
): Promise<Record<string, Project>> => {
	const dir = join(CONTENT_ROOT, "projects", locale);
	let files: string[] = [];
	try {
		files = await readdir(dir);
	} catch {
		return {};
	}
	const out: Record<string, Project> = {};
	for (const name of files) {
		if (extname(name) !== ".md") continue;
		const raw = await readFile(join(dir, name), "utf8");
		const { frontmatter, body } = validateProjectMarkdown(raw, name);
		out[frontmatter.slug] = { ...frontmatter, body, locale };
	}
	return out;
};

const loadSite = async (locale: LocaleEnum): Promise<SiteCopy> => {
	const raw = await readFile(
		join(CONTENT_ROOT, "site", `${locale}.yml`),
		"utf8",
	);
	const data = parseYaml(raw);
	const result = SiteCopySchema.safeParse(data);
	if (!result.success) {
		throw new Error(
			`[content] invalid site/${locale}.yml: ${result.error.message}`,
		);
	}
	return result.data;
};

export const loadAllContent = async (): Promise<ContentBundle> => {
	const bundle: ContentBundle = {
		pages: {} as ContentBundle["pages"],
		projects: {} as ContentBundle["projects"],
		site: {} as ContentBundle["site"],
	};
	for (const locale of ALL_LOCALES) {
		bundle.pages[locale] = await loadPages(locale);
		bundle.projects[locale] = await loadProjects(locale);
		bundle.site[locale] = await loadSite(locale);
	}
	return bundle;
};
