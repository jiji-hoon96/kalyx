import { defineConfig } from "tsup";

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
		// Raised from 12 → 13 → 14 → 15 → 16 → 17 KB across milestones as features landed
		// (CLAUDE.md §2 records each bump's rationale; 16→17 = B10 announce() parity, A-G1).
		// Only the default `index` entry is checked against the public size budget;
		// the headless entry is intentionally smaller and measured separately by
		// scripts/verify-entry-split.mjs.
		const TARGET_KB = 17;
		const outputs = [
			["ESM index", "dist/index.js", true],
			["CJS index", "dist/index.cjs", true],
			["ESM headless", "dist/headless.js", false],
			["CJS headless", "dist/headless.cjs", false],
		] as const;
		for (const [label, file, enforceBudget] of outputs) {
			try {
				const original = readFileSync(file, "utf8");
				if (!original.startsWith(USE_CLIENT_DIRECTIVE.trim())) {
					writeFileSync(file, USE_CLIENT_DIRECTIVE + original);
				}
				const content = readFileSync(file);
				const kb = (gzipSync(content).length / 1024).toFixed(2);
				const icon = !enforceBudget || parseFloat(kb) <= TARGET_KB ? "✅" : "⚠️";
				const suffix = enforceBudget ? ` (목표: ≤${TARGET_KB}KB)` : "";
				console.log(`${icon} [${label}] gzip: ${kb}KB${suffix}`);
			} catch {}
		}
	},
});
