#!/usr/bin/env node
/**
 * Verify the hero WebP artifacts:
 *   - both img/hero-light.webp and img/hero-dark.webp exist
 *   - each is <= 250 KB (the spec's size budget)
 *   - warn if older than 90 days (PR-A1 success criterion)
 *
 * Exits with code 1 on any hard failure, 0 (with stderr warning) on a stale
 * artifact. Used by .github/workflows/pr-check.yml.
 *
 * Exports `evaluate` as pure logic so it can be unit-tested without touching
 * the filesystem.
 */

import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

export const MAX_BYTES = 250 * 1024;
export const MAX_AGE_DAYS = 90;

export const FILES = [
  'img/hero-light.webp',
  'img/hero-dark.webp',
  'apps/docs-site/static/img/og-hero.png',
];

export function evaluate({ exists, sizeBytes, mtimeMs }) {
  const reasons = [];
  const warnings = [];

  if (!exists) {
    reasons.push('file does not exist');
    return { ok: false, reasons, warnings };
  }

  if (sizeBytes > MAX_BYTES) {
    reasons.push(
      `size ${(sizeBytes / 1024).toFixed(1)} KB exceeds 250 KB budget`
    );
  }

  const ageDays = (Date.now() - mtimeMs) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS) {
    warnings.push(
      `older than ${MAX_AGE_DAYS} days (${ageDays.toFixed(0)} days); regenerate via scripts/record-hero.mjs`
    );
  }

  return { ok: reasons.length === 0, reasons, warnings };
}

function main() {
  let hardFail = false;
  for (const rel of FILES) {
    const abs = resolve(REPO_ROOT, rel);
    const exists = existsSync(abs);
    const stat = exists ? statSync(abs) : { size: 0, mtimeMs: 0 };
    const result = evaluate({
      exists,
      sizeBytes: stat.size,
      mtimeMs: stat.mtimeMs,
    });

    if (!result.ok) {
      hardFail = true;
      console.error(`✗ ${rel}: ${result.reasons.join(', ')}`);
    } else {
      console.log(`✓ ${rel}: ${(stat.size / 1024).toFixed(1)} KB`);
      for (const w of result.warnings) {
        console.warn(`  ⚠ ${rel}: ${w}`);
      }
    }
  }
  process.exit(hardFail ? 1 : 0);
}

// Only run main() when invoked as a script (not when imported by the test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
