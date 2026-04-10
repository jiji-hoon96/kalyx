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
		try {
			const content = readFileSync("dist/index.js");
			const kb = (gzipSync(content).length / 1024).toFixed(2);
			const icon = parseFloat(kb) <= 12 ? "✅" : "⚠️";
			console.log(`\n${icon} 번들 gzip: ${kb}KB (목표: ≤12KB)`);
		} catch {}
	},
});
