#!/usr/bin/env node
// scripts/bundle-diff.mjs
//
// Surfaces the *byte-level* bundle delta and remaining ceiling margin so a PR
// author sees, before merge, exactly how much of the 17KB budget a change
// consumes. The working headroom is CJS-bound (~901 B CJS / ~1033 B
// ESM as of v1.2.0, ceiling 17KB), so a feature that costs "only a few hundred
// bytes" can silently break the CI gate — this script makes that cost visible per PR.
//
// Measurement reuses getGzipBytes() from check-bundle-size.js, so base-vs-head
// numbers share the exact same zlib defaults as the CI gate and the tsup
// post-build hook (no shell-gzip drift, B-R1 single-source principle).
//
// Base sizes are injected in BYTES via env (the CI workflow checks out the base
// ref, builds, and measures with this same primitive):
//   BUNDLE_BASE_ESM, BUNDLE_BASE_CJS
// When absent, the script prints head sizes + margin only (no delta).
//
// When $GITHUB_OUTPUT is set, appends a ready-to-render markdown table under
// the `comment` key (heredoc-delimited) for the PR-comment step to read back.

import { appendFileSync } from "fs";
import { getGzipBytes, BUNDLES, TARGET_BYTES, TARGET_KB } from "./check-bundle-size.js";

const BASE_ENV = {
	ESM: "BUNDLE_BASE_ESM",
	CJS: "BUNDLE_BASE_CJS",
};

function fmtBytes(n) {
	return `${n.toLocaleString("en-US")} B`;
}

function fmtKB(bytes) {
	return `${(bytes / 1024).toFixed(2)}KB`;
}

function fmtDelta(delta) {
	if (delta === null) return "—";
	if (delta === 0) return "±0 B";
	const sign = delta > 0 ? "+" : "−";
	return `${sign}${Math.abs(delta).toLocaleString("en-US")} B`;
}

function emitGithubOutput(key, value) {
	if (!process.env.GITHUB_OUTPUT) return;
	// Multi-line value uses the heredoc delimiter form GitHub Actions requires.
	const delim = `EOF_${key}_${Date.now()}`;
	appendFileSync(
		process.env.GITHUB_OUTPUT,
		`${key}<<${delim}\n${value}\n${delim}\n`,
	);
}

const rows = [];
let anyOverBudget = false;
let anyGrowth = false;

for (const { label, path } of BUNDLES) {
	const head = getGzipBytes(path);
	const baseRaw = process.env[BASE_ENV[label]];
	const base = baseRaw != null && baseRaw !== "" ? parseInt(baseRaw, 10) : null;
	const delta = base != null && !Number.isNaN(base) ? head - base : null;
	const margin = TARGET_BYTES - head;

	if (margin < 0) anyOverBudget = true;
	if (delta != null && delta > 0) anyGrowth = true;

	rows.push({ label, head, delta, margin });
}

// ── Console report ──────────────────────────────────────────────
console.log("\n📊 Bundle Diff (gzip, vs base)");
console.log("─".repeat(60));
for (const { label, head, delta, margin } of rows) {
	console.log(`  [${label}] head ${fmtKB(head)} (${fmtBytes(head)})`);
	console.log(`        delta ${fmtDelta(delta)} | margin ${fmtBytes(margin)} to ${TARGET_KB}KB`);
}
console.log("─".repeat(60));
console.log(
	anyOverBudget
		? `  ❌ over ${TARGET_KB}KB budget`
		: anyGrowth
			? "  ⚠️  grows the bundle — confirm the margin is intended"
			: "  ✅ no growth",
);
console.log("─".repeat(60));

// ── PR-comment markdown ─────────────────────────────────────────
const tableRows = rows
	.map(({ label, head, delta, margin }) => {
		const entry = label === "ESM" ? "`dist/index.js`" : "`dist/index.cjs`";
		return `| **${label}** (${entry}) | ${fmtKB(head)} | ${fmtDelta(delta)} | ${fmtBytes(margin)} |`;
	})
	.join("\n");

const summary = anyOverBudget
	? `❌ **Over the ${TARGET_KB}KB budget.** Run \`pnpm bundle-diff\` locally and trim before merge.`
	: anyGrowth
		? `⚠️ This PR **grows** the bundle. The ${TARGET_KB}KB ceiling is CJS-bound and the working margin is small — confirm the cost is intended.`
		: "✅ No bundle growth vs base.";

const body = [
	"#### 📊 Bundle diff (gzip, vs base)",
	"",
	`| Bundle | head | Δ vs base | margin to ${TARGET_KB}KB |`,
	"|---|---|---|---|",
	tableRows,
	"",
	summary,
].join("\n");

emitGithubOutput("comment", body);

// Informational only — the hard gate stays in check-bundle-size.js. We exit
// non-zero solely when head is genuinely over budget, so the diff job can run
// alongside (not replace) the gate.
if (anyOverBudget) process.exit(1);
