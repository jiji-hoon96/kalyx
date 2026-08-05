#!/usr/bin/env node

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIRECTORY, '..');

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
      .map((subpath) => (subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`)),
  );
}

export function createSmokePrograms(packages) {
  const serializedSpecifiers = JSON.stringify(getPublicSpecifiers(packages), null, 2);

  return {
    esm: [
      `const specifiers = ${serializedSpecifiers};`,
      'for (const specifier of specifiers) {',
      '  const imported = await import(specifier);',
      '  if (Object.keys(imported).length === 0) {',
      '    throw new Error(`${specifier} has no ESM exports`);',
      '  }',
      '}',
      'console.log(`ESM tarball imports passed (${specifiers.length} entry points)`);',
      '',
    ].join('\n'),
    cjs: [
      `const specifiers = ${serializedSpecifiers};`,
      'for (const specifier of specifiers) {',
      '  const imported = require(specifier);',
      '  if (Object.keys(imported).length === 0) {',
      '    throw new Error(`${specifier} has no CommonJS exports`);',
      '  }',
      '}',
      'console.log(`CommonJS tarball imports passed (${specifiers.length} entry points)`);',
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

function readInstalledVersion(repoRoot, packageName) {
  const manifestPath = resolve(repoRoot, 'node_modules', packageName, 'package.json');
  return JSON.parse(readFileSync(manifestPath, 'utf8')).version;
}

export function createConsumerManifest(tarballs, { react, reactDom }) {
  const packedDependencies = Object.fromEntries(
    [...tarballs.entries()].map(([name, tarballPath]) => [name, `file:${tarballPath}`]),
  );

  return {
    name: 'kalyx-tarball-smoke-consumer',
    version: '0.0.0',
    private: true,
    type: 'module',
    dependencies: {
      ...packedDependencies,
      react,
      'react-dom': reactDom,
    },
    pnpm: {
      overrides: packedDependencies,
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
    const consumerManifest = createConsumerManifest(tarballs, {
      react: readInstalledVersion(repoRoot, 'react'),
      reactDom: readInstalledVersion(repoRoot, 'react-dom'),
    });

    writeFileSync(
      resolve(consumerDirectory, 'package.json'),
      `${JSON.stringify(consumerManifest, null, 2)}\n`,
      'utf8',
    );

    run('pnpm', ['install', '--prefer-offline', '--ignore-scripts'], { cwd: consumerDirectory });

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
  }
}

function main() {
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
