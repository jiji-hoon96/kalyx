#!/usr/bin/env node
// scripts/check-bundle-size.js

import { gzipSync } from "zlib";
import { readFileSync, statSync } from "fs";

const TARGET_KB = 12;
const DIST_PATH = "packages/react/dist/index.js";

function getGzipKB(filePath) {
	const content = readFileSync(filePath);
	const compressed = gzipSync(content);
	return (compressed.length / 1024).toFixed(2);
}

function getRawKB(filePath) {
	return (statSync(filePath).size / 1024).toFixed(2);
}

try {
	const gzipKB = parseFloat(getGzipKB(DIST_PATH));
	const rawKB = parseFloat(getRawKB(DIST_PATH));
	const ok = gzipKB <= TARGET_KB;

	console.log("\n📦 Bundle Size Report");
	console.log("─".repeat(40));
	console.log(`  파일: ${DIST_PATH}`);
	console.log(`  원본: ${rawKB}KB`);
	console.log(`  gzip: ${gzipKB}KB`);
	console.log(`  목표: ≤ ${TARGET_KB}KB (gzip)`);
	console.log(`  상태: ${ok ? "✅ OK" : "❌ 초과!"}`);
	console.log("─".repeat(40));

	if (!ok) {
		console.error(`\n❌ 번들 크기 초과: ${gzipKB}KB > ${TARGET_KB}KB`);
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
