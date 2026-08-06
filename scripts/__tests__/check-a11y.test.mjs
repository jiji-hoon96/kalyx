import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { discoverA11yTestFiles } from '../check-a11y.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'kalyx-a11y-discovery-'));
  temporaryDirectories.push(root);
  for (const [relativePath, contents] of Object.entries(files)) {
    const path = join(root, relativePath);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, contents);
  }
  return root;
}

describe('discoverA11yTestFiles', () => {
  it('returns only sorted test files that import jest-axe', async () => {
    const root = await fixture({
      'packages/react/src/B.test.tsx': "import { axe } from 'jest-axe';",
      'apps/docs-site/src/A.test.tsx': 'import { axe } from "jest-axe";',
      'packages/react/src/ordinary.test.tsx': "import { it } from 'vitest';",
      'packages/react/src/not-a-test.tsx': "import { axe } from 'jest-axe';",
      'packages/react/src/commented.test.tsx': "// import { axe } from 'jest-axe';",
    });

    expect(discoverA11yTestFiles(root)).toEqual([
      'apps/docs-site/src/A.test.tsx',
      'packages/react/src/B.test.tsx',
    ]);
  });

  it('recognizes a real side-effect import', async () => {
    const root = await fixture({
      'packages/react/src/side-effect.test.ts': "import 'jest-axe';",
    });

    expect(discoverA11yTestFiles(root)).toEqual(['packages/react/src/side-effect.test.ts']);
  });

  it('recognizes CommonJS require in a supported test extension', async () => {
    const root = await fixture({
      'packages/react/src/commonjs.test.cjs': "const { axe } = require('jest-axe');",
    });

    expect(discoverA11yTestFiles(root)).toEqual(['packages/react/src/commonjs.test.cjs']);
  });

  it('fails instead of reporting a false green when no axe tests exist', async () => {
    const root = await fixture({
      'packages/react/src/ordinary.test.ts': "import { it } from 'vitest';",
    });

    expect(() => discoverA11yTestFiles(root)).toThrow('No jest-axe test files were found');
  });
});
