#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
