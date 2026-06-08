#!/usr/bin/env node
// scripts/verify-entry-split.mjs
//
// Measures the gzip footprint of the two `@kalyx/react` entry points to verify
// that `/headless` actually drops the date-fns code path. Each entry is bundled
// via esbuild with React/ReactDOM marked external (the shape downstream bundlers
// see); date-fns is bundled in so the measurement reflects what users actually
// ship.
//
// The primary contract is "the headless bundle must not contain date-fns at
// all" — that's the hard pass/fail. We also assert a minimum gzip reduction
// (currently 5%) as a sanity check that the entry split is doing something
// measurable. The reduction will look small in absolute % because the bulk of
// `@kalyx/react`'s gzip is component + core code; the date-fns adapter footprint
// is only ~2KB gzip after tree-shaking. Teams already shipping a date library
// still benefit from skipping that ~2KB and avoiding the duplicate parse cost.
//
// Manual verification only — not wired into CI. Run after edits to either
// entry, the `internal/defaultAdapter` module, or `tsup.config.ts`.

import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { rmSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const reactPkg = resolve(repoRoot, "packages/react");
const tmp = resolve(repoRoot, ".tmp/verify-entry-split");

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const entries = [
	{ label: "default  (@kalyx/react)", input: resolve(reactPkg, "src/index.ts"), outfile: resolve(tmp, "default.js") },
	{ label: "headless (@kalyx/react/headless)", input: resolve(reactPkg, "src/headless.ts"), outfile: resolve(tmp, "headless.js") },
];

async function measure({ label, input, outfile }) {
	const result = await build({
		entryPoints: [input],
		bundle: true,
		format: "esm",
		platform: "browser",
		target: "es2022",
		minify: true,
		treeShaking: true,
		splitting: false,
		external: ["react", "react-dom", "react/jsx-runtime"],
		outfile,
		write: true,
		logLevel: "silent",
		jsx: "automatic",
		metafile: true,
	});
	const { readFileSync } = await import("node:fs");
	const content = readFileSync(outfile);
	const rawKb = content.length / 1024;
	const gzipKb = gzipSync(content).length / 1024;
	const includesDateFns = Object.keys(result.metafile.inputs).some((k) =>
		k.includes("date-fns") || k.includes("adapter-date-fns"),
	);
	return { label, rawKb, gzipKb, includesDateFns };
}

const results = [];
for (const e of entries) {
	// eslint-disable-next-line no-await-in-loop
	results.push(await measure(e));
}

console.log("");
console.log("📦 Entry-split bundle report");
console.log("─".repeat(60));
for (const r of results) {
	const dateFnsTag = r.includesDateFns ? "(includes date-fns)" : "(no date-fns)";
	console.log(
		`  ${r.label.padEnd(34)}  raw: ${r.rawKb.toFixed(2)}KB  gzip: ${r.gzipKb.toFixed(2)}KB  ${dateFnsTag}`,
	);
}

const [def, hl] = results;
const reductionPct = ((def.gzipKb - hl.gzipKb) / def.gzipKb) * 100;
const target = 5;
console.log("─".repeat(60));
console.log(
	`  headless vs default: -${(def.gzipKb - hl.gzipKb).toFixed(2)}KB gzip (${reductionPct.toFixed(1)}% smaller)`,
);

if (hl.includesDateFns) {
	console.error("");
	console.error(
		`❌ Headless bundle still includes date-fns — splitting leak. Check the import graph of src/headless.ts.`,
	);
	process.exit(1);
}

if (reductionPct < target) {
	console.error("");
	console.error(
		`❌ Headless gzip is only ${reductionPct.toFixed(1)}% smaller than default. ` +
			`Sanity-check threshold: ≥${target}%. If this fails the entry split likely regressed.`,
	);
	process.exit(1);
}

console.log("");
console.log(`✅ Headless entry: date-fns absent + ≥${target}% gzip reduction sanity check passed.`);
console.log(`   (Larger savings come downstream when consumers already ship a date library —`);
console.log(`    the headless entry lets them avoid the second copy.)`);
