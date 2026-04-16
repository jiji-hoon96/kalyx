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
				statements: 70,
				branches: 70,
				functions: 75,
				lines: 70,
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
