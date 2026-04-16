import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const basePath = process.env.BASE_PATH ?? "";

export default defineConfig({
	plugins: [pluginReact()],
	source: {
		entry: {
			index: "./src/main.tsx",
		},
	},
	html: {
		template: "./src/index.html",
		tags: basePath
			? [
					{
						tag: "base",
						attrs: { href: `${basePath}/` },
						head: true,
						append: false,
					},
				]
			: [],
	},
	server: {
		port: 3000,
	},
	output: {
		distPath: { root: "dist" },
		assetPrefix: basePath ? `${basePath}/` : "/",
	},
	tools: {
		swc: {
			jsc: {
				transform: {
					react: {
						runtime: "automatic",
						importSource: "@emotion/react",
					},
				},
			},
		},
	},
});
