#!/usr/bin/env node
// scripts/bundle-diff.mjs
//
// Surfaces the *byte-level* bundle delta and remaining ceiling margin so a PR
// author sees, before merge, exactly how much of the configured budget a
// change consumes. Even a small feature can silently break the CI gate when
// headroom is tight, so this script makes that cost visible per PR.
//
// Measurement reuses getGzipBytes() from check-bundle-size.js, so base-vs-head
// numbers share the exact same zlib defaults as the CI gate and the tsup
// post-build hook (no shell-gzip drift, B-R1 single-source principle).
//
// Base sizes are injected in BYTES via env (the CI workflow checks out the base
// ref, builds, and measures with this same primitive):
//   BUNDLE_BASE_ESM, BUNDLE_BASE_CJS,
//   BUNDLE_BASE_HEADLESS_ESM, BUNDLE_BASE_HEADLESS_CJS
// When absent, the script prints head sizes + margin only (no delta).
//
// When $GITHUB_OUTPUT is set, appends a ready-to-render markdown table under
// the `comment` key (heredoc-delimited) for the PR-comment step to read back.

import { appendFileSync } from "fs";
import { getGzipBytes, BUNDLES } from "./check-bundle-size.js";

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
	appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delim}\n${value}\n${delim}\n`);
}

const rows = [];
let anyOverBudget = false;
let anyGrowth = false;

for (const { label, path, baseEnv, ceilingKB } of BUNDLES) {
	const head = getGzipBytes(path);
	const baseRaw = process.env[baseEnv];
	const base = baseRaw != null && baseRaw !== "" ? parseInt(baseRaw, 10) : null;
	const delta = base != null && !Number.isNaN(base) ? head - base : null;
	const margin = ceilingKB * 1024 - head;

	if (margin < 0) anyOverBudget = true;
	if (delta != null && delta > 0) anyGrowth = true;

	rows.push({ label, path, head, delta, margin, ceilingKB });
}

// ── Console report ──────────────────────────────────────────────
console.log("\n📊 Bundle Diff (gzip, vs base)");
console.log("─".repeat(60));
for (const { label, head, delta, margin, ceilingKB } of rows) {
	console.log(`  [${label}] head ${fmtKB(head)} (${fmtBytes(head)})`);
	console.log(`        delta ${fmtDelta(delta)} | margin ${fmtBytes(margin)} to ${ceilingKB}KB`);
}
console.log("─".repeat(60));
console.log(
	anyOverBudget
		? "  ❌ over an entry budget"
		: anyGrowth
			? "  ⚠️  grows the bundle — confirm the margin is intended"
			: "  ✅ no growth",
);
console.log("─".repeat(60));

// ── PR-comment markdown ─────────────────────────────────────────
const tableRows = rows
	.map(({ label, path, head, delta, margin, ceilingKB }) => {
		const entry = `\`${path.replace("packages/react/", "")}\``;
		return `| **${label}** (${entry}) | ${fmtKB(head)} | ${fmtDelta(delta)} | ${fmtBytes(margin)} to ${ceilingKB}KB |`;
	})
	.join("\n");

const summary = anyOverBudget
	? "❌ **Over an entry-specific bundle budget.** Run `pnpm bundle-diff` locally and trim before merge."
	: anyGrowth
		? "⚠️ This PR **grows** at least one bundle. The working margins are small — confirm the cost is intended."
		: "✅ No bundle growth vs base.";

const body = [
	"#### 📊 Bundle diff (gzip, vs base)",
	"",
	"| Bundle | head | Δ vs base | budget margin |",
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
