#!/usr/bin/env node

import {
  mkdirSync,
  mkdtempSync,
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { satisfies } from 'semver';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIRECTORY, '..');
const REPRESENTATIVE_EXPORTS = {
  '@kalyx/adapter-date-fns': 'DateFnsAdapter',
  '@kalyx/adapter-dayjs': 'DayjsAdapter',
  '@kalyx/adapter-luxon': 'LuxonAdapter',
  '@kalyx/core': 'getCalendarDays',
  '@kalyx/core/test-helpers': 'runAdapterConformanceTests',
  '@kalyx/react': 'DatePicker',
  '@kalyx/react/headless': 'DatePicker',
};
const DEPENDENCY_FIELDS = ['dependencies', 'optionalDependencies', 'peerDependencies'];
let activeTemporaryDirectory = null;

export function discoverPublishablePackages(packagesDirectory) {
  return readdirSync(packagesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = join(packagesDirectory, entry.name);
      const manifestPath = join(directory, 'package.json');
      let manifest;

      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      } catch (error) {
        if (error?.code === 'ENOENT') return null;
        throw error;
      }

      return { directory, manifestPath, manifest };
    })
    .filter((entry) => entry && entry.manifest.private !== true)
    .sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

export function validatePublishablePackages(packages) {
  const problems = [];

  for (const { manifest, manifestPath } of packages) {
    const label = manifest.name || manifestPath;
    if (!manifest.name) problems.push(`${label}: missing name`);
    if (!manifest.version) problems.push(`${label}: missing version`);
    if (!manifest.scripts?.build) problems.push(`${label}: missing scripts.build`);
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      problems.push(`${label}: files must be a non-empty array`);
    }
    if (
      !manifest.exports ||
      typeof manifest.exports !== 'object' ||
      Array.isArray(manifest.exports) ||
      Object.keys(manifest.exports).length === 0
    ) {
      problems.push(`${label}: exports must be a non-empty object`);
    } else {
      if (!Object.hasOwn(manifest.exports, '.')) {
        problems.push(`${label}: exports must declare the canonical "." root`);
      }
      for (const exportKey of Object.keys(manifest.exports)) {
        if (exportKey.includes('*')) {
          problems.push(`${label}: export patterns are not supported: ${exportKey}`);
        } else if (exportKey !== '.' && !exportKey.startsWith('./')) {
          problems.push(`${label}: unsupported export key: ${exportKey}`);
        }
      }
    }
    if (manifest.publishConfig?.access !== 'public') {
      problems.push(`${label}: publishConfig.access must be public`);
    }
    if (manifest.publishConfig?.provenance !== true) {
      problems.push(`${label}: publishConfig.provenance must be true`);
    }
  }

  return problems;
}

function getPublicSpecifiers(packages) {
  return packages.flatMap(({ manifest }) =>
    Object.keys(manifest.exports)
      .filter((subpath) => subpath === '.' || subpath.startsWith('./'))
      .map((subpath) => {
        const specifier = subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`;
        return {
          specifier,
          expectedExport: REPRESENTATIVE_EXPORTS[specifier] ?? null,
        };
      }),
  );
}

export function assertRepresentativeExport(specifier, imported) {
  const expectedExport = REPRESENTATIVE_EXPORTS[specifier];
  if (expectedExport && !(expectedExport in imported)) {
    throw new Error(`${specifier} is missing representative export ${expectedExport}`);
  }
  if (!expectedExport && Object.keys(imported).length === 0) {
    throw new Error(`${specifier} has no runtime exports`);
  }
}

export function createSmokePrograms(packages) {
  const serializedEntries = JSON.stringify(getPublicSpecifiers(packages), null, 2);

  return {
    esm: [
      `const entries = ${serializedEntries};`,
      'for (const { specifier, expectedExport } of entries) {',
      '  const imported = await import(specifier);',
      '  if (expectedExport && !(expectedExport in imported)) {',
      '    throw new Error(`${specifier} is missing representative export ${expectedExport}`);',
      '  }',
      '  if (!expectedExport && Object.keys(imported).length === 0) {',
      '    throw new Error(`${specifier} has no ESM runtime exports`);',
      '  }',
      '}',
      'console.log(`ESM tarball imports passed (${entries.length} entry points)`);',
      '',
    ].join('\n'),
    cjs: [
      `const entries = ${serializedEntries};`,
      'for (const { specifier, expectedExport } of entries) {',
      '  const imported = require(specifier);',
      '  if (expectedExport && !(expectedExport in imported)) {',
      '    throw new Error(`${specifier} is missing representative export ${expectedExport}`);',
      '  }',
      '  if (!expectedExport && Object.keys(imported).length === 0) {',
      '    throw new Error(`${specifier} has no CommonJS runtime exports`);',
      '  }',
      '}',
      'console.log(`CommonJS tarball imports passed (${entries.length} entry points)`);',
      '',
    ].join('\n'),
  };
}

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: 'inherit',
    ...options,
  });
}

function packPackage(packageEntry, tarballDirectory) {
  const before = new Set(readdirSync(tarballDirectory));
  run('pnpm', ['pack', '--pack-destination', tarballDirectory], {
    cwd: packageEntry.directory,
  });
  const created = readdirSync(tarballDirectory).filter(
    (filename) => filename.endsWith('.tgz') && !before.has(filename),
  );

  if (created.length !== 1) {
    throw new Error(
      `${packageEntry.manifest.name}: expected pnpm pack to create one tarball, created ${created.length}`,
    );
  }

  return join(tarballDirectory, created[0]);
}

function readPackedManifest(tarballPath) {
  const contents = execFileSync('tar', ['-xOf', tarballPath, 'package/package.json'], {
    encoding: 'utf8',
  });
  return JSON.parse(contents);
}

export function validatePackedInternalDependencies(packages, packedManifests) {
  const problems = [];
  const versions = new Map(packages.map(({ manifest }) => [manifest.name, manifest.version]));

  for (const { manifest: sourceManifest } of packages) {
    const packedManifest = packedManifests.get(sourceManifest.name);
    if (!packedManifest) {
      problems.push(`${sourceManifest.name}: packed manifest is missing`);
      continue;
    }
    if (
      packedManifest.name !== sourceManifest.name ||
      packedManifest.version !== sourceManifest.version
    ) {
      problems.push(`${sourceManifest.name}: packed name or version differs from source manifest`);
    }

    for (const field of DEPENDENCY_FIELDS) {
      for (const dependencyName of Object.keys(sourceManifest[field] ?? {})) {
        if (
          versions.has(dependencyName) &&
          !Object.hasOwn(packedManifest[field] ?? {}, dependencyName)
        ) {
          problems.push(
            `${sourceManifest.name}: packed ${field} is missing internal dependency ${dependencyName}`,
          );
        }
      }
      for (const [dependencyName, packedRange] of Object.entries(packedManifest[field] ?? {})) {
        if (String(packedRange).startsWith('workspace:')) {
          problems.push(
            `${sourceManifest.name}: packed ${field}.${dependencyName} still uses ${packedRange}`,
          );
          continue;
        }

        const targetVersion = versions.get(dependencyName);
        if (!targetVersion) continue;
        if (!satisfies(targetVersion, packedRange, { includePrerelease: true })) {
          problems.push(
            `${sourceManifest.name}: packed ${field}.${dependencyName} range ${packedRange} ` +
              `does not accept ${targetVersion}`,
          );
        }

        const sourceRange = sourceManifest[field]?.[dependencyName];
        if (sourceRange === 'workspace:*' && packedRange !== targetVersion) {
          problems.push(
            `${sourceManifest.name}: workspace:* dependency ${dependencyName} must pack as exact ` +
              `${targetVersion}, got ${packedRange}`,
          );
        }
      }
    }
  }

  return problems;
}

function resolveInstalledManifest(startDirectory, packageName, installationRoot) {
  const segments = packageName.split('/');
  let cursor = realpathSync(startDirectory);
  const root = realpathSync(installationRoot);

  while (cursor.startsWith(root)) {
    const candidate = resolve(cursor, 'node_modules', ...segments, 'package.json');
    if (existsSync(candidate)) {
      const manifestPath = realpathSync(candidate);
      return {
        directory: dirname(manifestPath),
        manifest: JSON.parse(readFileSync(manifestPath, 'utf8')),
      };
    }
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }

  throw new Error(`Installed dependency ${packageName} is not resolvable from ${startDirectory}`);
}

export function collectInstalledExternalPackages(packages) {
  if (packages.length === 0) return {};
  const installationRoot = resolve(packages[0].directory, '../..');
  const internalNames = new Set(packages.map(({ manifest }) => manifest.name));
  const installedPackages = new Map();
  const queue = packages.flatMap((packageEntry) =>
    DEPENDENCY_FIELDS.flatMap((field) =>
      Object.keys(packageEntry.manifest[field] ?? {})
        .filter((name) => !internalNames.has(name))
        .map((name) => ({
          name,
          startDirectory: packageEntry.directory,
          optional: field === 'optionalDependencies',
        })),
    ),
  );

  while (queue.length > 0) {
    const dependency = queue.shift();
    let installed;
    try {
      installed = resolveInstalledManifest(
        dependency.startDirectory,
        dependency.name,
        installationRoot,
      );
    } catch (error) {
      if (dependency.optional) continue;
      throw error;
    }

    const previous = installedPackages.get(dependency.name);
    if (previous && previous.version !== installed.manifest.version) {
      throw new Error(
        `External dependency ${dependency.name} resolves to both ${previous.version} and ${installed.manifest.version}`,
      );
    }
    if (previous) continue;
    installedPackages.set(dependency.name, {
      version: installed.manifest.version,
      directory: installed.directory,
    });

    for (const field of DEPENDENCY_FIELDS) {
      for (const childName of Object.keys(installed.manifest[field] ?? {})) {
        if (!internalNames.has(childName)) {
          queue.push({
            name: childName,
            startDirectory: installed.directory,
            optional: field === 'optionalDependencies',
          });
        }
      }
    }
  }

  return Object.fromEntries(
    [...installedPackages.entries()].sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function createConsumerManifest(
  tarballs,
  { packageManager, externalPackages, peerDependencyNames },
) {
  const packedDependencies = Object.fromEntries(
    [...tarballs.entries()].map(([name, tarballPath]) => [name, `file:${tarballPath}`]),
  );
  const installedExternalPackages =
    externalPackages instanceof Map ? Object.fromEntries(externalPackages) : externalPackages;
  const linkedExternalPackages = Object.fromEntries(
    Object.entries(installedExternalPackages).map(([name, installed]) => [
      name,
      `link:${installed.directory}`,
    ]),
  );
  const peerDependencies = Object.fromEntries(
    [...peerDependencyNames].map((name) => [name, linkedExternalPackages[name]]),
  );

  return {
    name: 'kalyx-tarball-smoke-consumer',
    version: '0.0.0',
    private: true,
    type: 'module',
    packageManager,
    dependencies: {
      ...packedDependencies,
      ...peerDependencies,
    },
    pnpm: {
      overrides: {
        ...packedDependencies,
        ...linkedExternalPackages,
      },
    },
  };
}

export function runTarballSmoke({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const packages = discoverPublishablePackages(resolve(repoRoot, 'packages'));
  const problems = validatePublishablePackages(packages);
  if (problems.length > 0) {
    throw new Error(`Publishable package metadata is invalid:\n${problems.join('\n')}`);
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'kalyx-tarball-smoke-'));
  activeTemporaryDirectory = temporaryDirectory;

  try {
    const tarballDirectory = resolve(temporaryDirectory, 'tarballs');
    const consumerDirectory = resolve(temporaryDirectory, 'consumer');
    mkdirSync(tarballDirectory);
    mkdirSync(consumerDirectory);

    const tarballs = new Map(
      packages.map((packageEntry) => [
        packageEntry.manifest.name,
        packPackage(packageEntry, tarballDirectory),
      ]),
    );
    const packedManifests = new Map(
      [...tarballs.entries()].map(([name, tarballPath]) => [name, readPackedManifest(tarballPath)]),
    );
    const packedProblems = validatePackedInternalDependencies(packages, packedManifests);
    if (packedProblems.length > 0) {
      throw new Error(
        `Packed internal dependency metadata is invalid:\n${packedProblems.join('\n')}`,
      );
    }
    const rootManifest = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'));
    const externalPackages = collectInstalledExternalPackages(packages);
    const internalNames = new Set(packages.map(({ manifest }) => manifest.name));
    const peerDependencyNames = new Set(
      packages.flatMap(({ manifest }) =>
        Object.keys(manifest.peerDependencies ?? {}).filter((name) => !internalNames.has(name)),
      ),
    );
    const consumerManifest = createConsumerManifest(tarballs, {
      packageManager: rootManifest.packageManager,
      externalPackages,
      peerDependencyNames,
    });

    writeFileSync(
      resolve(consumerDirectory, 'package.json'),
      `${JSON.stringify(consumerManifest, null, 2)}\n`,
      'utf8',
    );

    run('pnpm', ['install', '--lockfile-only', '--offline', '--ignore-scripts'], {
      cwd: consumerDirectory,
    });
    run('pnpm', ['install', '--offline', '--frozen-lockfile', '--ignore-scripts'], {
      cwd: consumerDirectory,
    });

    const programs = createSmokePrograms(packages);
    writeFileSync(resolve(consumerDirectory, 'smoke.mjs'), programs.esm, 'utf8');
    writeFileSync(resolve(consumerDirectory, 'smoke.cjs'), programs.cjs, 'utf8');
    run(process.execPath, ['smoke.mjs'], { cwd: consumerDirectory });
    run(process.execPath, ['smoke.cjs'], { cwd: consumerDirectory });

    return {
      packageCount: packages.length,
      entryPointCount: packages.reduce(
        (count, packageEntry) => count + Object.keys(packageEntry.manifest.exports).length,
        0,
      ),
    };
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
    if (activeTemporaryDirectory === temporaryDirectory) activeTemporaryDirectory = null;
  }
}

function installSignalCleanup() {
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      if (activeTemporaryDirectory) {
        rmSync(activeTemporaryDirectory, { recursive: true, force: true });
        activeTemporaryDirectory = null;
      }
      process.kill(process.pid, signal);
    });
  }
}

function main() {
  installSignalCleanup();
  try {
    const result = runTarballSmoke();
    console.log(
      `Tarball smoke passed for ${result.packageCount} packages and ${result.entryPointCount} entry points.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main();
}
