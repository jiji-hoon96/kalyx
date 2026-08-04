import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { REACT_GZIP_CEILING_KB } from '../bundle-policy.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

describe('React bundle policy', () => {
  it('keeps the approved ceiling at 20KB', () => {
    expect(REACT_GZIP_CEILING_KB).toBe(20);
  });

  it('is shared by both the CLI gate and the build report', () => {
    const checker = readFileSync(resolve(repoRoot, 'scripts/check-bundle-size.js'), 'utf8');
    const buildConfig = readFileSync(resolve(repoRoot, 'packages/react/tsup.config.ts'), 'utf8');

    expect(checker).toMatch(/from ["']\.\/bundle-policy\.js["']/);
    expect(buildConfig).toMatch(/from ["']\.\.\/\.\.\/scripts\/bundle-policy\.js["']/);
    expect(checker).not.toMatch(/TARGET_KB\s*=\s*\d/);
    expect(buildConfig).not.toMatch(/TARGET_KB\s*=\s*\d/);
    expect(checker.match(/REACT_GZIP_CEILING_KB/g)).toHaveLength(2);
    expect(buildConfig.match(/REACT_GZIP_CEILING_KB/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
