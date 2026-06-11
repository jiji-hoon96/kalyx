#!/usr/bin/env node
/**
 * Verify every examples/* StackBlitz GitHub-embed URL returns HTTP 200.
 * Manual-run; not wired into CI yet (planned: nightly job per parent spec).
 *
 * Exits 0 if all URLs OK, 1 if any returned >= 400.
 */

const EXAMPLES = [
  'datepicker-basic',
  'datepicker-rhf',
  'rangepicker-presets',
  'timepicker-12h',
  'datetimepicker-timezone',
  'datepicker-tailwind',
  'datepicker-shadcn',
];

let fail = 0;
for (const id of EXAMPLES) {
  const url = `https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/${id}`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status >= 400) {
      console.error(`✗ ${id}: HTTP ${res.status}`);
      fail++;
    } else {
      console.log(`✓ ${id}: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`✗ ${id}: ${err instanceof Error ? err.message : String(err)}`);
    fail++;
  }
}

process.exit(fail > 0 ? 1 : 0);
