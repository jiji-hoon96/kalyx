import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertMatchingFenceCounts,
  buildPreamble,
  collectBoundIdentifiers,
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

  it('supports Docusaurus metadata, tilde fences, and longer closing fences', () => {
    const markdown = [
      '```ts title="TypeScript example"',
      'const first: number = 1;',
      '````',
      '~~~tsx',
      'const second = <span />;',
      '~~~~',
    ].join('\n');

    expect(extractExecutableFences(markdown, 'api.md')).toEqual([
      {
        sourcePath: 'api.md',
        startLine: 2,
        extension: 'ts',
        code: 'const first: number = 1;',
      },
      {
        sourcePath: 'api.md',
        startLine: 5,
        extension: 'tsx',
        code: 'const second = <span />;',
      },
    ]);
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

  it('rejects equal-count locales with different executable content', () => {
    expect(() =>
      assertMatchingFenceCounts([
        {
          sourcePath: 'en.md',
          snippets: [{ extension: 'ts', code: 'const locale = "en";' }],
        },
        {
          sourcePath: 'ko.md',
          snippets: [{ extension: 'ts', code: 'const locale = "ko";' }],
        },
      ]),
    ).toThrow('executable fence mismatch: en.md and ko.md differ at fence 1');
  });

  it('rejects an empty executable document', () => {
    expect(() => assertMatchingFenceCounts([{ sourcePath: 'en.md', snippets: [] }])).toThrow(
      'en.md contains no TypeScript or TSX fences',
    );
  });
});

describe('collectBoundIdentifiers', () => {
  it('finds names bound by imports, declarations, and destructuring', () => {
    const bound = collectBoundIdentifiers(
      [
        "import { DatePicker } from '@kalyx/react';",
        "import type { ISODateString as Iso } from '@kalyx/core';",
        "import React from 'react';",
        'const [iso, setIso] = useState(null);',
        'function handler() {}',
        'type Local = string;',
      ].join('\n'),
    );

    expect(bound).toContain('DatePicker');
    expect(bound).toContain('Iso');
    expect(bound).toContain('React');
    expect(bound).toContain('iso');
    expect(bound).toContain('setIso');
    expect(bound).toContain('handler');
    expect(bound).toContain('Local');
  });

  it('is not truncated by a brace inside a comment in the import clause', () => {
    // Regression: a `}` inside an inline comment used to end the import-clause
    // match early, hiding every name after it and making the preamble re-import
    // one the fence had already imported.
    const bound = collectBoundIdentifiers(
      [
        'import {',
        '  getTimeInTimezone, // UTC iso → { hours, minutes } as seen in tz',
        '  startOfDayInTimezone,',
        "} from '@kalyx/core';",
      ].join('\n'),
    );

    expect(bound).toContain('startOfDayInTimezone');
  });
});

describe('buildPreamble', () => {
  it('supplies the referenced names, with real types rather than any', () => {
    const preamble = buildPreamble('<DatePicker value={iso} onChange={setIso} />;');

    expect(preamble).toContain("import { DatePicker } from '@kalyx/react';");
    expect(preamble).toContain('declare let iso: string | null;');
    expect(preamble).toContain('declare const setIso: (next: string | null) => void;');
    // Nothing is `any` — that is what keeps a supplied identifier from turning
    // the surrounding assertions vacuous.
    expect(preamble.join('\n')).not.toContain('any');
  });

  it('matches a JSX attribute name as a reference, which is imprecise but inert', () => {
    // `value={iso}` names the prop, not a variable, so `declare let value` is
    // surplus. It is unused, so it cannot make a fence pass that should fail —
    // recorded here so the behaviour is deliberate rather than a surprise.
    expect(buildPreamble('<DatePicker value={iso} />;')).toContain(
      'declare let value: string | null;',
    );
  });

  it('omits names the fence already binds, so nothing is declared twice', () => {
    const preamble = buildPreamble(
      ["import { DatePicker } from '@kalyx/react';", 'const iso = null;'].join('\n'),
    );

    expect(preamble).toEqual([]);
  });

  it('ignores names that appear only inside comments', () => {
    expect(buildPreamble('// RangePicker is covered on its own page\nconst x = 1;')).toEqual([]);
  });

  it('does not match a name that is part of a longer identifier', () => {
    expect(buildPreamble('const DatePickerWrapper = 1;')).toEqual([]);
  });
});

describe('compileSnippets', () => {
  it('type-checks a preamble-dependent excerpt against the real props', () => {
    const [diagnostic] = compileSnippets(
      [
        {
          sourcePath: 'apps/docs-site/docs/intro.md',
          startLine: 20,
          extension: 'tsx',
          // No import and no useState: this only compiles via the preamble.
          code: '<DatePicker value={iso} onChangeTypo={setIso}><span /></DatePicker>;',
        },
      ],
      { repoRoot },
    );

    expect(diagnostic).toContain('apps/docs-site/docs/intro.md:20:');
    expect(diagnostic).toContain('onChangeTypo');
  });

  it('reports a preamble-internal error as such instead of mislocating it', () => {
    const diagnostics = compileSnippets(
      [
        {
          sourcePath: 'doc.md',
          startLine: 5,
          extension: 'ts',
          code: 'const bad: number = iso;',
        },
      ],
      { repoRoot },
    );

    // `iso` comes from the preamble and is `string | null`, so this fails on the
    // document line, not inside the generated preamble.
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toContain('doc.md:5:');
  });
});

describe('compileSnippets (self-contained fences)', () => {
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
