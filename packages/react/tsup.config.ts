import { defineConfig } from "tsup";

const USE_CLIENT_DIRECTIVE = '"use client";\n';

export default defineConfig({
	entry: ["src/index.ts"],
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
		const TARGET_KB = 13;
		const outputs = [["ESM", "dist/index.js"], ["CJS", "dist/index.cjs"]] as const;
		for (const [label, file] of outputs) {
			try {
				const original = readFileSync(file, "utf8");
				if (!original.startsWith(USE_CLIENT_DIRECTIVE.trim())) {
					writeFileSync(file, USE_CLIENT_DIRECTIVE + original);
				}
				const content = readFileSync(file);
				const kb = (gzipSync(content).length / 1024).toFixed(2);
				const icon = parseFloat(kb) <= TARGET_KB ? "✅" : "⚠️";
				console.log(`${icon} [${label}] gzip: ${kb}KB (목표: ≤${TARGET_KB}KB)`);
			} catch {}
		}
	},
});
