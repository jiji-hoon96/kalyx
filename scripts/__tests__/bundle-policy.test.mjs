import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  assertBundleChecks,
  HEADLESS_REACT_GZIP_CEILING_KB,
  isWithinBudget,
  REACT_GZIP_CEILING_KB,
} from '../bundle-policy.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

describe('React bundle policy', () => {
  it('keeps the approved ceiling at 20KB', () => {
    expect(REACT_GZIP_CEILING_KB).toBe(20);
    expect(HEADLESS_REACT_GZIP_CEILING_KB).toBe(20);
  });

  it('compares raw bytes at the exact boundary without rounding overages down', () => {
    expect(isWithinBudget(20 * 1024, 20)).toBe(true);
    expect(isWithinBudget(20 * 1024 + 1, 20)).toBe(false);
  });

  it('fails a post-build check when any expected artifact could not be processed', () => {
    expect(() =>
      assertBundleChecks([
        { label: 'ESM index', gzipBytes: 1, ceilingKB: 20 },
        { label: 'ESM headless', error: new Error('ENOENT') },
      ]),
    ).toThrow('React bundle checks failed: ESM headless: ENOENT');
  });

  it('is shared by both the CLI gate and the build report', () => {
    const checker = readFileSync(resolve(repoRoot, 'scripts/check-bundle-size.js'), 'utf8');
    const buildConfig = readFileSync(resolve(repoRoot, 'packages/react/tsup.config.ts'), 'utf8');
    const diff = readFileSync(resolve(repoRoot, 'scripts/bundle-diff.mjs'), 'utf8');
    const workflow = readFileSync(resolve(repoRoot, '.github/workflows/pr-check.yml'), 'utf8');

    expect(checker).toMatch(/from ["']\.\/bundle-policy\.js["']/);
    expect(buildConfig).toMatch(/from ["']\.\.\/\.\.\/scripts\/bundle-policy\.js["']/);
    expect(checker).not.toMatch(/TARGET_KB\s*=\s*\d/);
    expect(buildConfig).not.toMatch(/TARGET_KB\s*=\s*\d/);
    expect(buildConfig.match(/REACT_GZIP_CEILING_KB/g)?.length).toBeGreaterThanOrEqual(3);
    expect(checker).toContain('HEADLESS_REACT_GZIP_CEILING_KB');
    expect(checker).toContain('packages/react/dist/headless.js');
    expect(checker).toContain('packages/react/dist/headless.cjs');
    expect(buildConfig).toContain('HEADLESS_REACT_GZIP_CEILING_KB');
    expect(diff).toContain('baseEnv');
    expect(diff).not.toMatch(/label === ["']ESM["']/);
    expect(workflow).toContain('BUNDLE_BASE_HEADLESS_ESM');
    expect(workflow).toContain('BUNDLE_BASE_HEADLESS_CJS');
  });
});
