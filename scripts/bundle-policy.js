// The two public entries carry different amounts of code, so they get different
// budgets. `index` exposes 7 components + 3 hooks; `headless` exposes the same 7
// components plus all 7 hooks and `DateTimePicker.Presets`. They were originally
// given the same number, which meant the entry shipping strictly more code had
// strictly less headroom — index sat ~1.5 KB under the line while headless ran
// out at under 200 B, so headless became the binding constraint on every change
// even when index was nowhere near its limit.
//
// 2026-08: headless 20 → 22 KB, to give the larger entry headroom proportional
// to the smaller one rather than a number it inherited by accident. The default
// entry — what `import from '@kalyx/react'` costs, and the figure quoted publicly
// — is deliberately unchanged at 20 KB.
export const REACT_GZIP_CEILING_KB = 20;
export const HEADLESS_REACT_GZIP_CEILING_KB = 22;

export function isWithinBudget(gzipBytes, ceilingKB) {
  return gzipBytes <= ceilingKB * 1024;
}

export function assertBundleChecks(checks) {
  const failures = checks.flatMap(({ label, gzipBytes, ceilingKB, error }) => {
    if (error) return [`${label}: ${error.message}`];
    if (!isWithinBudget(gzipBytes, ceilingKB)) {
      return [`${label}: ${(gzipBytes / 1024).toFixed(2)}KB exceeds ${ceilingKB}KB`];
    }
    return [];
  });
  if (failures.length > 0) {
    throw new Error(`React bundle checks failed: ${failures.join('; ')}`);
  }
}
