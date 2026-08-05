export const REACT_GZIP_CEILING_KB = 20;
export const HEADLESS_REACT_GZIP_CEILING_KB = 20;

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
