import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@docusaurus/Link": path.resolve(
				__dirname,
				"test/__mocks__/docusaurus-link.tsx"
			),
			"@docusaurus/Translate": path.resolve(
				__dirname,
				"test/__mocks__/docusaurus-translate.tsx"
			),
			"@docusaurus/BrowserOnly": path.resolve(
				__dirname,
				"test/__mocks__/docusaurus-browser-only.tsx"
			),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./test/setup.ts"],
		pool: "forks",
		testTimeout: 10_000,
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html", "json-summary"],
			reportsDirectory: "coverage",
			thresholds: {
				statements: 85,
				branches: 75,
				functions: 85,
				lines: 85,
			},
			include: ["packages/*/src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.test.{ts,tsx}",
				"**/*.spec.{ts,tsx}",
				"**/index.ts",
				"**/*.types.ts",
				"**/test/**",
				"apps/**",
			],
		},
	},
});
