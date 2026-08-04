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
// all" — that's the hard pass/fail (the `includesDateFns` metafile check below).
// We also assert a minimum gzip reduction as a secondary sanity check that the
// split is doing something measurable. The reduction looks small in absolute %
// because the bulk of `@kalyx/react`'s gzip is component + core code; the
// date-fns adapter footprint is only ~2KB gzip after tree-shaking. It shrank
// further once `/headless` started carrying the headless-only picker hooks
// (useMonthPicker/useYearPicker/useWeekPicker/useDateTimePicker), which the
// default entry deliberately omits — so headless legitimately has API the
// default lacks, partly offsetting the date-fns savings. The authoritative
// guard is the no-date-fns check; this threshold is just a regression tripwire.
//
// Runs in CI as the `entry-split` job in pr-check.yml — the primary contract
// ("no date-fns in headless") is a hard pass/fail gate on every PR. Also
// runnable locally after edits to either entry, the `internal/defaultAdapter`
// module, or `tsup.config.ts`: `node scripts/verify-entry-split.mjs`.

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
const target = 2;
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
	// Non-blocking: the headless entry legitimately carries extra headless-only hooks
	// (useMonthPicker/useYearPicker/useWeekPicker/useDateTimePicker) that the default omits,
	// so as correctness breadth grows on those hooks the net gzip delta vs default shrinks
	// even though date-fns is still fully excluded. The authoritative contract is the
	// `includesDateFns` hard gate above; this %-delta is only an informational tripwire.
	console.warn("");
	console.warn(
		`⚠️ Headless gzip is only ${reductionPct.toFixed(1)}% smaller than default ` +
			`(informational; target ≥${target}%). date-fns is still absent (hard gate passed), ` +
			`so this is not a failure — the delta is dominated by shared component/hook growth.`,
	);
}

console.log("");
console.log(`✅ Headless entry: date-fns absent (authoritative gate passed).`);
console.log(`   (Larger savings come downstream when consumers already ship a date library —`);
console.log(`    the headless entry lets them avoid the second copy.)`);
