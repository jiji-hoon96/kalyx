import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
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
				statements: 90,
				branches: 85,
				functions: 90,
				lines: 90,
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
