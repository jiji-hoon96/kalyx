import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertRepresentativeExports,
  collectInstalledExternalPackages,
  createConsumerManifest,
  createSmokePrograms,
  discoverPublishablePackages,
  validatePackedInternalDependencies,
  validatePublishablePackages,
} from '../check-package-tarballs.mjs';

const temporaryDirectories = [];
const repoRoot = resolve(import.meta.dirname, '../..');

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
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
    name: '@kalyx/core',
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

    expect(packages.map((entry) => entry.manifest.name)).toEqual(['@kalyx/core']);
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

  it('rejects export maps that cannot be exhaustively smoke-tested', () => {
    const problems = validatePublishablePackages([
      {
        directory: '/packages/conditional',
        manifestPath: '/packages/conditional/package.json',
        manifest: validManifest({
          name: '@kalyx/conditional',
          exports: { import: './dist/index.js', require: './dist/index.cjs' },
        }),
      },
      {
        directory: '/packages/pattern',
        manifestPath: '/packages/pattern/package.json',
        manifest: validManifest({
          name: '@kalyx/pattern',
          exports: { '.': './dist/index.js', './features/*': './dist/features/*.js' },
        }),
      },
    ]);

    expect(problems).toContain('@kalyx/conditional: exports must declare the canonical "." root');
    expect(problems).toContain('@kalyx/pattern: export patterns are not supported: ./features/*');
  });

  it('requires an explicit smoke contract for every finite public specifier', () => {
    const problems = validatePublishablePackages([
      {
        directory: '/packages/new-adapter',
        manifestPath: '/packages/new-adapter/package.json',
        manifest: validManifest({ name: '@kalyx/new-adapter' }),
      },
    ]);

    expect(problems).toContain(
      '@kalyx/new-adapter: missing runtime export contract for @kalyx/new-adapter',
    );
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
    expect(programs.esm).toContain(JSON.stringify('getCalendarDays'));
    expect(programs.cjs).toContain(JSON.stringify('runAdapterConformanceTests'));
  });

  it('rejects a nonempty module that exposes the wrong public symbol', () => {
    expect(() => assertRepresentativeExports('@kalyx/core', { wrongExport: true })).toThrow(
      '@kalyx/core is missing representative export getCalendarDays',
    );
  });

  it('distinguishes the React default and headless entry contracts', () => {
    expect(() => assertRepresentativeExports('@kalyx/react', { DatePicker: {} })).toThrow(
      '@kalyx/react is missing representative export DateFnsAdapter',
    );
    expect(() =>
      assertRepresentativeExports('@kalyx/react/headless', {
        DatePicker: {},
        DateFnsAdapter: {},
      }),
    ).toThrow('@kalyx/react/headless must not export DateFnsAdapter');
  });
});

describe('validatePackedInternalDependencies', () => {
  const packages = [
    { manifest: validManifest({ name: '@kalyx/core', version: '1.4.1' }) },
    {
      manifest: validManifest({
        name: '@kalyx/adapter-example',
        version: '1.0.0',
        dependencies: { '@kalyx/core': 'workspace:*' },
      }),
    },
  ];

  it('accepts the exact rewrite of workspace:*', () => {
    const packed = new Map([
      ['@kalyx/core', { name: '@kalyx/core', version: '1.4.1' }],
      [
        '@kalyx/adapter-example',
        {
          name: '@kalyx/adapter-example',
          version: '1.0.0',
          dependencies: { '@kalyx/core': '1.4.1' },
        },
      ],
    ]);

    expect(validatePackedInternalDependencies(packages, packed)).toEqual([]);
  });

  it('rejects remaining workspace protocols and incompatible or nonexact rewrites', () => {
    const remainingWorkspace = new Map([
      ['@kalyx/core', { name: '@kalyx/core', version: '1.4.1' }],
      [
        '@kalyx/adapter-example',
        {
          name: '@kalyx/adapter-example',
          version: '1.0.0',
          dependencies: { '@kalyx/core': 'workspace:*' },
        },
      ],
    ]);
    const incompatible = new Map([
      ['@kalyx/core', { name: '@kalyx/core', version: '1.4.1' }],
      [
        '@kalyx/adapter-example',
        {
          name: '@kalyx/adapter-example',
          version: '1.0.0',
          dependencies: { '@kalyx/core': '^999.0.0' },
        },
      ],
    ]);
    const nonexact = new Map([
      ['@kalyx/core', { name: '@kalyx/core', version: '1.4.1' }],
      [
        '@kalyx/adapter-example',
        {
          name: '@kalyx/adapter-example',
          version: '1.0.0',
          dependencies: { '@kalyx/core': '^1.4.1' },
        },
      ],
    ]);
    const missing = new Map([
      ['@kalyx/core', { name: '@kalyx/core', version: '1.4.1' }],
      ['@kalyx/adapter-example', { name: '@kalyx/adapter-example', version: '1.0.0' }],
    ]);

    expect(validatePackedInternalDependencies(packages, remainingWorkspace)).toContain(
      '@kalyx/adapter-example: packed dependencies.@kalyx/core still uses workspace:*',
    );
    expect(validatePackedInternalDependencies(packages, incompatible)).toContain(
      '@kalyx/adapter-example: packed dependencies.@kalyx/core range ^999.0.0 does not accept 1.4.1',
    );
    expect(validatePackedInternalDependencies(packages, nonexact)).toContain(
      '@kalyx/adapter-example: workspace:* dependency @kalyx/core must pack as exact 1.4.1, got ^1.4.1',
    );
    expect(validatePackedInternalDependencies(packages, missing)).toContain(
      '@kalyx/adapter-example: packed dependencies is missing internal dependency @kalyx/core',
    );
  });
});

describe('createConsumerManifest', () => {
  it('forces transitive Kalyx dependencies to the packed local artifacts', () => {
    const tarballs = new Map([
      ['@kalyx/core', '/tmp/kalyx-core.tgz'],
      ['@kalyx/react', '/tmp/kalyx-react.tgz'],
    ]);

    const manifest = createConsumerManifest(tarballs, {
      packageManager: 'pnpm@10.10.0',
      externalPackages: new Map([
        ['@floating-ui/react', { version: '0.27.19', directory: '/store/floating-react' }],
        ['react', { version: '19.2.7', directory: '/store/react' }],
        ['react-dom', { version: '19.2.7', directory: '/store/react-dom' }],
      ]),
      peerDependencyNames: new Set(['react', 'react-dom']),
    });

    expect(manifest.dependencies).toMatchObject({
      '@kalyx/core': 'file:/tmp/kalyx-core.tgz',
      '@kalyx/react': 'file:/tmp/kalyx-react.tgz',
      react: 'link:/store/react',
      'react-dom': 'link:/store/react-dom',
    });
    expect(manifest.packageManager).toBe('pnpm@10.10.0');
    expect(manifest.pnpm.overrides).toEqual({
      '@kalyx/core': 'file:/tmp/kalyx-core.tgz',
      '@kalyx/react': 'file:/tmp/kalyx-react.tgz',
      '@floating-ui/react': 'link:/store/floating-react',
      react: 'link:/store/react',
      'react-dom': 'link:/store/react-dom',
    });
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

    const externalPackages = collectInstalledExternalPackages(packages);
    expect(externalPackages).toMatchObject({
      '@floating-ui/react': { version: expect.any(String), directory: expect.any(String) },
      'date-fns': { version: expect.any(String), directory: expect.any(String) },
      dayjs: { version: expect.any(String), directory: expect.any(String) },
      luxon: { version: expect.any(String), directory: expect.any(String) },
      react: { version: expect.any(String), directory: expect.any(String) },
      'react-dom': { version: expect.any(String), directory: expect.any(String) },
    });
  });
});
