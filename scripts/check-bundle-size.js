#!/usr/bin/env node
// scripts/check-bundle-size.js

import { gzipSync } from "zlib";
import { readFileSync, statSync } from "fs";

// Bundle target. 12KB → 13KB after the v1.0-rc audit added user-facing
// features (IME composition handling, popover focus-out, `name`/hidden-input
// form integration, WAI-ARIA grid coordinates, and keyboard skip-disabled).
// 13KB → 14KB once full WAI-ARIA grid keyboard navigation (Arrow / Home /
// End / PageUp / PageDown / Enter / Space + roving tabIndex + auto-refocus)
// landed across the four 3×4 picker grids (DatePicker.MonthGrid / YearGrid,
// MonthPicker.Grid, YearPicker.Grid). Still ~3× smaller than
// react-datepicker (~40KB).
const TARGET_KB = 14;

const BUNDLES = [
	{ label: "ESM", path: "packages/react/dist/index.js" },
	{ label: "CJS", path: "packages/react/dist/index.cjs" },
];

function getGzipKB(filePath) {
	const content = readFileSync(filePath);
	const compressed = gzipSync(content);
	return (compressed.length / 1024).toFixed(2);
}

function getRawKB(filePath) {
	return (statSync(filePath).size / 1024).toFixed(2);
}

try {
	console.log("\n📦 Bundle Size Report");
	console.log("─".repeat(48));

	let allOk = true;

	for (const { label, path } of BUNDLES) {
		const gzipKB = parseFloat(getGzipKB(path));
		const rawKB = parseFloat(getRawKB(path));
		const ok = gzipKB <= TARGET_KB;
		if (!ok) allOk = false;

		console.log(`  [${label}] ${path}`);
		console.log(`    원본: ${rawKB}KB | gzip: ${gzipKB}KB | ${ok ? "✅" : "❌ 초과!"}`);
	}

	console.log("─".repeat(48));
	console.log(`  목표: ≤ ${TARGET_KB}KB (gzip)`);
	console.log(`  결과: ${allOk ? "✅ PASS" : "❌ FAIL"}`);
	console.log("─".repeat(48));

	if (!allOk) {
		console.error("\n❌ 번들 크기 초과!");
		console.error(
			"   분석: npx source-map-explorer packages/react/dist/index.js",
		);
		process.exit(1);
	}
} catch (err) {
	console.error("❌ 측정 실패:", err.message);
	console.error("   먼저 빌드하세요: pnpm build");
	process.exit(1);
}
