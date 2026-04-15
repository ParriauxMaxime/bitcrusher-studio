import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact()],
	source: {
		entry: {
			index: "./src/main.tsx",
		},
	},
	html: {
		template: "./src/index.html",
	},
	server: {
		port: 3000,
	},
	output: {
		distPath: { root: "dist" },
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
