import { defineConfig } from "tsup";
import {
	assertBundleChecks,
	HEADLESS_REACT_GZIP_CEILING_KB,
	REACT_GZIP_CEILING_KB,
} from "../../scripts/bundle-policy.js";

const USE_CLIENT_DIRECTIVE = '"use client";\n';

export default defineConfig({
	// Two physically separate bundles. `splitting: false` (below) guarantees the
	// headless entry never pulls in date-fns code paths even though both entries
	// share components — the import graph is duplicated rather than chunked, so
	// `@kalyx/react/headless` can drop `@kalyx/adapter-date-fns` entirely.
	entry: {
		index: "src/index.ts",
		headless: "src/headless.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	splitting: false,
	external: ["react", "react-dom", "react/jsx-runtime"],
	esbuildOptions(options) {
		options.jsx = "automatic";
	},
	// `banner` doesn't work for "use client" — esbuild strips top-level directives during
	// bundling. We instead inject the directive after the bundle is written so React
	// Server Component hosts (Next.js App Router etc.) treat the package as a client
	// boundary without the consumer wrapping each import.
	async onSuccess() {
		const { gzipSync } = await import("zlib");
		const { readFileSync, writeFileSync } = await import("fs");
		// Mirror scripts/check-bundle-size.js + .github/workflows/pr-check.yml + release.yml.
		// Default entry raised 12 → 13 → 14 → 15 → 16 → 17 → 20 KB across milestones as
		// features landed (CLAUDE.md §2 records each bump's rationale; 17→20 =
		// timezone/constraint correctness breadth). The headless entry was split off the
		// same number and raised to 22 KB in 2026-08 — it ships strictly more code than
		// index, so an equal ceiling made it bind first on every change. See
		// scripts/bundle-policy.js for the full rationale. Entry-split additionally
		// verifies that headless does not include date-fns.
		const outputs = [
			["ESM index", "dist/index.js", REACT_GZIP_CEILING_KB],
			["CJS index", "dist/index.cjs", REACT_GZIP_CEILING_KB],
			["ESM headless", "dist/headless.js", HEADLESS_REACT_GZIP_CEILING_KB],
			["CJS headless", "dist/headless.cjs", HEADLESS_REACT_GZIP_CEILING_KB],
		] as const;
		const checks: Array<{
			label: string;
			gzipBytes?: number;
			ceilingKB?: number;
			error?: Error;
		}> = [];
		for (const [label, file, ceilingKB] of outputs) {
			try {
				const original = readFileSync(file, "utf8");
				if (!original.startsWith(USE_CLIENT_DIRECTIVE.trim())) {
					writeFileSync(file, USE_CLIENT_DIRECTIVE + original);
				}
				const content = readFileSync(file);
				const gzipBytes = gzipSync(content).length;
				const kb = (gzipBytes / 1024).toFixed(2);
				checks.push({ label, gzipBytes, ceilingKB });
				const icon = gzipBytes <= ceilingKB * 1024 ? "✅" : "⚠️";
				const suffix = ` (목표: ≤${ceilingKB}KB)`;
				console.log(`${icon} [${label}] gzip: ${kb}KB${suffix}`);
			} catch (error) {
				checks.push({
					label,
					error: error instanceof Error ? error : new Error(String(error)),
				});
			}
		}
		assertBundleChecks(checks);
	},
});
