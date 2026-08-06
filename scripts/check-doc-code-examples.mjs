#!/usr/bin/env node

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const CORE_API_DOCUMENTS = [
  'apps/docs-site/docs/api/core.md',
  'apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/api/core.md',
];

const EXECUTABLE_LANGUAGES = new Map([
  ['ts', 'ts'],
  ['typescript', 'ts'],
  ['tsx', 'tsx'],
]);

export function extractExecutableFences(markdown, sourcePath) {
  const lines = markdown.split(/\r?\n/);
  const snippets = [];
  let openFence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (openFence) {
      const closingMatch = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      const closesFence =
        closingMatch &&
        closingMatch[1][0] === openFence.character &&
        closingMatch[1].length >= openFence.length;

      if (closesFence) {
        if (openFence.extension) {
          snippets.push({
            sourcePath,
            startLine: openFence.line + 1,
            extension: openFence.extension,
            code: lines.slice(openFence.line, index).join('\n'),
          });
        }
        openFence = null;
      }
      continue;
    }

    const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!match) continue;

    const language = match[2].trim().split(/\s+/, 1)[0].toLowerCase();
    openFence = {
      character: match[1][0],
      length: match[1].length,
      line: index + 1,
      extension: EXECUTABLE_LANGUAGES.get(language) ?? null,
    };
  }

  if (openFence?.extension) {
    throw new Error(`${sourcePath}:${openFence.line}: unclosed TypeScript fence`);
  }

  return snippets;
}

export function assertMatchingFenceCounts(documents) {
  for (const document of documents) {
    if (document.snippets.length === 0) {
      throw new Error(`${document.sourcePath} contains no TypeScript or TSX fences`);
    }
  }

  if (documents.length < 2) return;

  const expected = documents[0];
  for (const document of documents.slice(1)) {
    if (document.snippets.length !== expected.snippets.length) {
      throw new Error(
        `executable fence count mismatch: ${expected.sourcePath} has ${expected.snippets.length}, ` +
          `${document.sourcePath} has ${document.snippets.length}`,
      );
    }

    for (let index = 0; index < expected.snippets.length; index += 1) {
      const expectedSnippet = expected.snippets[index];
      const actualSnippet = document.snippets[index];
      const expectedCode = expectedSnippet.code?.replace(/\r\n/g, '\n').trim();
      const actualCode = actualSnippet.code?.replace(/\r\n/g, '\n').trim();

      if (
        expectedSnippet.extension !== actualSnippet.extension ||
        expectedCode !== actualCode
      ) {
        throw new Error(
          `executable fence mismatch: ${expected.sourcePath} and ${document.sourcePath} ` +
            `differ at fence ${index + 1}`,
        );
      }
    }
  }
}

function formatDiagnostic(diagnostic, generatedFiles) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  const snippet = diagnostic.file ? generatedFiles.get(diagnostic.file.fileName) : undefined;

  if (diagnostic.file && diagnostic.start != null && snippet) {
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return `${snippet.sourcePath}:${snippet.startLine + position.line}:${position.character + 1} - ${message}`;
  }

  if (diagnostic.file && diagnostic.start != null) {
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return `${diagnostic.file.fileName}:${position.line + 1}:${position.character + 1} - ${message}`;
  }

  return message;
}

export function compileSnippets(snippets, { repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const cacheRoot = resolve(repoRoot, 'node_modules/.cache');
  mkdirSync(cacheRoot, { recursive: true });
  const temporaryDirectory = mkdtempSync(resolve(cacheRoot, 'kalyx-doc-examples-'));
  const generatedFiles = new Map();

  try {
    const rootNames = snippets.map((snippet, index) => {
      const filename = resolve(temporaryDirectory, `snippet-${index}.${snippet.extension}`);
      writeFileSync(filename, `${snippet.code}\nexport {};\n`, 'utf8');
      generatedFiles.set(filename, snippet);
      return filename;
    });

    const options = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      baseUrl: repoRoot,
      paths: {
        '@kalyx/core': [resolve(repoRoot, 'packages/core/dist/index.d.ts')],
        '@kalyx/adapter-date-fns': [
          resolve(repoRoot, 'packages/adapter-date-fns/dist/index.d.ts'),
        ],
        '@kalyx/react': [resolve(repoRoot, 'packages/react/dist/index.d.ts')],
      },
    };
    const program = ts.createProgram(rootNames, options);

    return ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) => formatDiagnostic(diagnostic, generatedFiles));
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

export function checkCoreApiExamples({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const documents = CORE_API_DOCUMENTS.map((documentPath) => {
    const absolutePath = resolve(repoRoot, documentPath);
    const sourcePath = relative(repoRoot, absolutePath);
    return {
      sourcePath,
      snippets: extractExecutableFences(readFileSync(absolutePath, 'utf8'), sourcePath),
    };
  });

  assertMatchingFenceCounts(documents);
  const snippets = documents.flatMap((document) => document.snippets);
  const diagnostics = compileSnippets(snippets, { repoRoot });

  if (diagnostics.length > 0) {
    throw new Error(`Core API examples failed to compile:\n${diagnostics.join('\n')}`);
  }

  return { documentCount: documents.length, snippetCount: snippets.length };
}

function main() {
  try {
    const result = checkCoreApiExamples();
    console.log(
      `✓ Compiled ${result.snippetCount} TypeScript examples across ${result.documentCount} Core API documents.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main();
}
