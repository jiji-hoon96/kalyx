import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertMatchingFenceCounts,
  compileSnippets,
  extractExecutableFences,
} from '../check-doc-code-examples.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');

describe('extractExecutableFences', () => {
  it('extracts TypeScript and TSX with source locations and extensions', () => {
    const markdown = [
      '# API',
      '',
      '```ts',
      "import { minDate } from '@kalyx/core';",
      '```',
      '',
      '```tsx',
      "import { DatePicker } from '@kalyx/react';",
      '<DatePicker><span /></DatePicker>;',
      '```',
    ].join('\n');

    expect(extractExecutableFences(markdown, 'docs/api/core.md')).toEqual([
      {
        sourcePath: 'docs/api/core.md',
        startLine: 4,
        extension: 'ts',
        code: "import { minDate } from '@kalyx/core';",
      },
      {
        sourcePath: 'docs/api/core.md',
        startLine: 8,
        extension: 'tsx',
        code: "import { DatePicker } from '@kalyx/react';\n<DatePicker><span /></DatePicker>;",
      },
    ]);
  });

  it('accepts the typescript fence alias', () => {
    const snippets = extractExecutableFences('```typescript\nconst value: number = 1;\n```', 'api.md');

    expect(snippets).toHaveLength(1);
    expect(snippets[0].extension).toBe('ts');
  });

  it('rejects an unclosed executable fence', () => {
    expect(() => extractExecutableFences('before\n```ts\nconst value = 1;', 'api.md')).toThrow(
      'api.md:2: unclosed TypeScript fence',
    );
  });
});

describe('assertMatchingFenceCounts', () => {
  it('rejects locale drift', () => {
    expect(() =>
      assertMatchingFenceCounts([
        { sourcePath: 'en.md', snippets: [{}, {}] },
        { sourcePath: 'ko.md', snippets: [{}] },
      ]),
    ).toThrow('executable fence count mismatch: en.md has 2, ko.md has 1');
  });

  it('rejects an empty executable document', () => {
    expect(() => assertMatchingFenceCounts([{ sourcePath: 'en.md', snippets: [] }])).toThrow(
      'en.md contains no TypeScript or TSX fences',
    );
  });
});

describe('compileSnippets', () => {
  it('compiles real core, adapter, and React imports including JSX', () => {
    const diagnostics = compileSnippets(
      [
        {
          sourcePath: 'valid.ts',
          startLine: 1,
          extension: 'ts',
          code: [
            "import type { DateAdapter } from '@kalyx/core';",
            "import { DateFnsAdapter } from '@kalyx/adapter-date-fns';",
            'const adapter: DateAdapter = DateFnsAdapter;',
          ].join('\n'),
        },
        {
          sourcePath: 'valid.tsx',
          startLine: 1,
          extension: 'tsx',
          code: [
            "import { DatePicker } from '@kalyx/react';",
            'const picker = <DatePicker><span /></DatePicker>;',
            'void picker;',
          ].join('\n'),
        },
      ],
      { repoRoot },
    );

    expect(diagnostics).toEqual([]);
  });

  it('reports a real nonexistent package export at the Markdown location', () => {
    const diagnostics = compileSnippets(
      [
        {
          sourcePath: 'apps/docs-site/docs/api/core.md',
          startLine: 76,
          extension: 'ts',
          code: "import { DateFnsAdapter } from '@kalyx/core';",
        },
      ],
      { repoRoot },
    );

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toContain('apps/docs-site/docs/api/core.md:76:');
    expect(diagnostics[0]).toContain('has no exported member');
    expect(diagnostics[0]).toContain('DateFnsAdapter');
  });
});
