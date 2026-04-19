import { defineConfig } from "tsup";

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
	async onSuccess() {
		const { gzipSync } = await import("zlib");
		const { readFileSync } = await import("fs");
		const TARGET_KB = 12;
		for (const [label, file] of [["ESM", "dist/index.js"], ["CJS", "dist/index.cjs"]] as const) {
			try {
				const content = readFileSync(file);
				const kb = (gzipSync(content).length / 1024).toFixed(2);
				const icon = parseFloat(kb) <= TARGET_KB ? "✅" : "⚠️";
				console.log(`${icon} [${label}] gzip: ${kb}KB (목표: ≤${TARGET_KB}KB)`);
			} catch {}
		}
	},
});
