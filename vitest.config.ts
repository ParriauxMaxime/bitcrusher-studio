import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
		setupFiles: ["tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
