import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createSmokePrograms,
  discoverPublishablePackages,
  validatePublishablePackages,
} from '../check-package-tarballs.mjs';

const temporaryDirectories = [];
const repoRoot = resolve(import.meta.dirname, '../..');

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function createPackages(manifests) {
  const root = await mkdtemp(join(tmpdir(), 'kalyx-package-discovery-'));
  temporaryDirectories.push(root);

  for (const [directoryName, manifest] of Object.entries(manifests)) {
    const directory = join(root, directoryName);
    mkdirSync(directory);
    writeFileSync(join(directory, 'package.json'), `${JSON.stringify(manifest)}\n`, 'utf8');
  }

  return root;
}

function validManifest(overrides = {}) {
  return {
    name: '@kalyx/example',
    version: '1.0.0',
    scripts: { build: 'tsup' },
    files: ['dist'],
    exports: { '.': './dist/index.js' },
    publishConfig: { access: 'public', provenance: true },
    ...overrides,
  };
}

describe('discoverPublishablePackages', () => {
  it('includes public packages and excludes private packages', async () => {
    const packagesDirectory = await createPackages({
      public: validManifest(),
      private: validManifest({ name: '@kalyx/private', private: true }),
    });

    const packages = discoverPublishablePackages(packagesDirectory);

    expect(packages.map((entry) => entry.manifest.name)).toEqual(['@kalyx/example']);
  });
});

describe('validatePublishablePackages', () => {
  it('reports every missing release invariant', () => {
    const problems = validatePublishablePackages([
      {
        directory: '/packages/broken',
        manifestPath: '/packages/broken/package.json',
        manifest: { name: '@kalyx/broken', version: '1.0.0' },
      },
    ]);

    expect(problems).toEqual([
      '@kalyx/broken: missing scripts.build',
      '@kalyx/broken: files must be a non-empty array',
      '@kalyx/broken: exports must be a non-empty object',
      '@kalyx/broken: publishConfig.access must be public',
      '@kalyx/broken: publishConfig.provenance must be true',
    ]);
  });
});

describe('createSmokePrograms', () => {
  it('imports every root and declared subpath in both module systems', () => {
    const packages = [
      {
        manifest: validManifest({
          name: '@kalyx/core',
          exports: { '.': {}, './test-helpers': {} },
        }),
      },
      {
        manifest: validManifest({
          name: '@kalyx/react',
          exports: { '.': {}, './headless': {} },
        }),
      },
    ];

    const programs = createSmokePrograms(packages);

    for (const specifier of [
      '@kalyx/core',
      '@kalyx/core/test-helpers',
      '@kalyx/react',
      '@kalyx/react/headless',
    ]) {
      expect(programs.esm).toContain(JSON.stringify(specifier));
      expect(programs.cjs).toContain(JSON.stringify(specifier));
    }
  });
});

describe('repository publishable packages', () => {
  it('contains the complete valid five-package release set', () => {
    const packages = discoverPublishablePackages(resolve(repoRoot, 'packages'));

    expect(packages.map((entry) => entry.manifest.name)).toEqual([
      '@kalyx/adapter-date-fns',
      '@kalyx/adapter-dayjs',
      '@kalyx/adapter-luxon',
      '@kalyx/core',
      '@kalyx/react',
    ]);
    expect(validatePublishablePackages(packages)).toEqual([]);
  });
});
