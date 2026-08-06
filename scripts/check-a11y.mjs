#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIRECTORY, '..');
const SEARCH_ROOTS = ['packages/react/src', 'apps/docs-site/src'];
const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/;

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function importsJestAxe(path) {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    false,
  );
  const hasImport = source.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === 'jest-axe',
  );
  if (hasImport) return true;

  let hasRequire = false;
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text === 'jest-axe'
    ) {
      hasRequire = true;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return hasRequire;
}

export function discoverA11yTestFiles(repoRoot = DEFAULT_REPO_ROOT) {
  const files = SEARCH_ROOTS.flatMap((searchRoot) => walk(resolve(repoRoot, searchRoot)))
    .filter((path) => TEST_FILE_PATTERN.test(path))
    .filter(importsJestAxe)
    .map((path) => relative(repoRoot, path))
    .sort();

  if (files.length === 0) throw new Error('No jest-axe test files were found');
  return files;
}

export function runA11yTests(repoRoot = DEFAULT_REPO_ROOT) {
  const files = discoverA11yTestFiles(repoRoot);
  console.log(`Running ${files.length} test files that import jest-axe.`);
  execFileSync(
    process.execPath,
    [resolve(repoRoot, 'node_modules/vitest/vitest.mjs'), 'run', '--reporter=verbose', ...files],
    { cwd: repoRoot, stdio: 'inherit' },
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    runA11yTests();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
