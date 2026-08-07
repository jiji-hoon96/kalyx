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

// COVERAGE BOUNDARY — read this before trusting the "compiled N examples" line.
//
// What IS verified: every ts/tsx fence in the documents listed in
// `CHECKED_DOCUMENTS`, type-checked against the real built `.d.ts` files. A
// wrong component name, a misspelt prop, a prop that no longer exists, or a
// value of the wrong type fails the build.
//
// What is NOT verified, in descending order of how likely it is to bite:
//   1. The documents in `UNCHECKED_DOCUMENTS` below, each with its reason.
//   2. ```jsx / ```js fences are not executable languages here, so moving a
//      broken example into a jsx fence silently removes it from verification.
//   3. A `type Foo = {…}` block written inline in the docs is a NEW local
//      declaration, not an import — it compiles forever no matter how far it
//      drifts from the real type. Mirrored type blocks are not protected.
//   4. `// → "..."` result comments are prose to the compiler. Nothing checks
//      that the stated output is what the function actually returns.
//   5. Whether a fence shows the imports a reader would actually need. The
//      preamble below supplies them, which is the price of letting the docs
//      keep short excerpts — see AMBIENT_PREAMBLE.
//
// EN/KO parity is positional and byte-exact per fence, which is why the KO
// translation of a checked page must leave code fences — including comments
// inside them — untouched. Pages whose KO translation has drifted out of
// structural parity are listed in `EN_ONLY_DOCUMENTS` with their fence deltas;
// their EN fences are still compiled.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const EN_DOCS_ROOT = 'apps/docs-site/docs';
const KO_DOCS_ROOT = 'apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current';

// Compiled in EN and KO, with byte-exact fence parity enforced between them.
const CHECKED_DOCUMENTS = [
  'api/core.md',
  'api/react.md',
  'getting-started/installation.md',
  'intro.md',
];

// Compiled in EN only. Every fence here type-checks; what does not hold is
// EN/KO fence parity, so the KO page is not compiled and may have drifted.
// Bringing one of these into CHECKED_DOCUMENTS means reconciling its KO fences.
const EN_ONLY_DOCUMENTS = [
  ['components/datetimepicker.md', 'KO has one fewer executable fence'],
  ['concepts/styling.md', 'KO fence content has drifted from EN'],
  ['concepts/timezone.md', 'KO fence content has drifted from EN'],
  ['recipes/use-cases.md', 'KO fence content has drifted from EN'],
];

// Not compiled, with the reason each one fails. This list is the difference
// between "the documentation is verified" and what this script actually proves,
// so keep it accurate — and prefer fixing an entry to explaining it.
//
// Three of these are real defects awaiting a decision rather than checker
// limitations, and are called out as DEFECT below.
const UNCHECKED_DOCUMENTS = [
  // DEFECT: documents `name` on a picker Root for native form submission. Only
  // `DatePicker.Input` implements that (via a hidden input); MonthPicker,
  // YearPicker, WeekPicker, RangePicker and DateTimePicker have no
  // form-submission support at all, so these sections promise a feature that
  // does not exist. Fixing needs a product call: implement `name` on those
  // Inputs, or delete the sections.
  ['components/monthpicker.md', 'DEFECT: `name` on Root — no form-submission support on MonthPicker'],
  ['components/yearpicker.md', 'DEFECT: `name` on Root — no form-submission support on YearPicker'],
  ['components/weekpicker.md', 'DEFECT: `name` on Root — no form-submission support on WeekPicker'],
  // DEFECT: `classNames={{ button: … }}` on TimePicker.AmPmToggle; the real key
  // set is TimePickerAmPmToggleClassNames, which has no `button`.
  ['recipes/tailwind.md', 'DEFECT: unknown `button` key in TimePickerAmPmToggleClassNames'],
  // Anatomy trees render `<DatePicker.Preset />` and `<RangePicker.Preset />`
  // self-closing, but `children` is required on both.
  ['components/datepicker.md', 'anatomy fences self-close components whose `children` is required'],
  ['components/rangepicker.md', 'anatomy fences self-close components whose `children` is required'],
  // Signature-only fences: `function useX(options?): Return;` has no body. An
  // ambient `declare function` would compile without being checked against the
  // real export, so it is left alone rather than made vacuously green.
  ['hooks/use-date-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-date-time-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-month-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-range-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-time-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-week-picker.md', 'signature-only fence has no implementation'],
  ['hooks/use-year-picker.md', 'signature-only fence has no implementation'],
  // Fences that reference an app-specific value the docs never define.
  ['components/timepicker.md', 'references an undefined `analytics` service'],
  ['concepts/internationalization.md', 'self-closing Root, and a partial labels object'],
  // Deliberately non-compiling by design.
  ['troubleshooting.md', 'fences show broken code beside its fix, so they must not compile'],
  ['concepts/iso-string.md', 'fences contrast a wrong `Date` usage with the right one'],
  ['concepts/accessibility.md', '`{...}` ellipsis placeholders are not parseable TypeScript'],
  ['concepts/composition.md', '`{...}` ellipsis placeholders'],
  ['getting-started/quick-start.mdx', '`{...}` ellipsis placeholders'],
  // Third-party or hypothetical modules that are not installed here.
  ['concepts/adapters.md', 'imports `dayjs` and a hypothetical `./my-adapter`'],
  ['concepts/ssr.md', 'imports a hypothetical `./date-field`'],
  ['guides/adapters.md', 'imports `dayjs` and hypothetical local adapter modules'],
  ['migration.md', 'imports `react-datepicker` on purpose, to show the foreign API'],
  ['recipes/react-hook-form.md', 'imports `react-hook-form` and `zod`'],
  ['recipes/shadcn.md', 'imports `@/components/ui/*` shadcn scaffolding aliases'],
  ['recipes/testing.md', 'test-runner and jest-axe globals do not resolve outside a test file'],
];

const EXECUTABLE_LANGUAGES = new Map([
  ['ts', 'ts'],
  ['typescript', 'ts'],
  ['tsx', 'tsx'],
]);

// The docs show excerpts: `<DatePicker value={iso} onChange={setIso}>` without
// the import above it or the `useState` that produced `iso`. Rather than pad
// every example with boilerplate a reader does not need, each fence is compiled
// with the entries below that it actually references and does not already bind.
//
// Every entry resolves to a REAL declaration — the component identifiers are
// imported from the built `.d.ts`, and the stand-in state values carry their
// real types. Nothing here is `any`, and nothing declares a component or prop
// that the library does not export. That is what keeps the check meaningful: a
// fence that misspells a prop or passes a `Date` where an ISO string belongs
// still fails, because the preamble supplied the identifier, not the type.
const AMBIENT_PREAMBLE = [
  // Components and hooks, from the entry point that actually exports them.
  ...[
    'DatePicker',
    'RangePicker',
    'TimePicker',
    'DateTimePicker',
    'MonthPicker',
    'YearPicker',
    'WeekPicker',
    'useDatePicker',
    'useRangePicker',
    'useTimePicker',
    'DateFnsAdapter',
  ].map((id) => [id, `import { ${id} } from '@kalyx/react';`]),
  ...[
    'useMonthPicker',
    'useYearPicker',
    'useWeekPicker',
    'useDateTimePicker',
  ].map((id) => [id, `import { ${id} } from '@kalyx/react/headless';`]),

  // Hook option/return types. The four headless-only pickers are not exported
  // from the default entry, so they must come from `/headless`.
  ...['UseDatePicker', 'UseRangePicker', 'UseTimePicker'].flatMap((base) =>
    ['Options', 'Return'].map((suffix) => [
      `${base}${suffix}`,
      `import type { ${base}${suffix} } from '@kalyx/react';`,
    ]),
  ),
  ...['UseMonthPicker', 'UseYearPicker', 'UseWeekPicker', 'UseDateTimePicker'].flatMap((base) =>
    ['Options', 'Return'].map((suffix) => [
      `${base}${suffix}`,
      `import type { ${base}${suffix} } from '@kalyx/react/headless';`,
    ]),
  ),

  // Core types and helpers a fence may reference without importing.
  ...[
    'ISODateString',
    'DateRange',
    'DateAdapter',
    'CalendarDay',
    'DisabledRule',
    'DatePickerLabels',
    'RangePickerLabels',
    'TimePickerLabels',
    'DateTimePickerLabels',
  ].map((id) => [id, `import type { ${id} } from '@kalyx/core';`]),
  ...['startOfDayInTimezone', 'civilMidnightFromUtcDay', 'calendarDayFromInstant'].map((id) => [
    id,
    `import { ${id} } from '@kalyx/core';`,
  ]),
  ...['useState', 'useEffect'].map((id) => [id, `import { ${id} } from 'react';`]),

  // Stand-in state. The single-value pickers hand back `string | null`, so that
  // is the type these carry — a fence that forgets the null case fails here
  // exactly as it would in a reader's editor.
  ...[
    ['iso', 'string | null'],
    ['value', 'string | null'],
    ['date', 'string | null'],
    ['dt', 'string | null'],
    ['time', 'string | null'],
    ['month', 'string | null'],
    ['year', 'string | null'],
    ['v', 'string | null'],
  ].flatMap(([id, type]) => {
    const setter = `set${id[0].toUpperCase()}${id.slice(1)}`;
    return [
      [id, `declare let ${id}: ${type};`],
      [setter, `declare const ${setter}: (next: ${type}) => void;`],
    ];
  }),
  // RangePicker and WeekPicker take `DateRange | undefined` and hand back a
  // non-null `DateRange` — deliberately not the `| null` the single-value
  // pickers use, so a fence that conflates the two shapes fails.
  ...[
    ['range', 'setRange'],
    ['week', 'setWeek'],
  ].flatMap(([id, setter]) => [
    [id, `declare let ${id}: import('@kalyx/core').DateRange | undefined;`],
    [setter, `declare const ${setter}: (next: import('@kalyx/core').DateRange) => void;`],
  ]),
  ['save', 'declare const save: (next: string | null) => void;'],
];

// Identifiers the fence itself brings into scope. Anything found here is left
// out of the preamble, so a self-contained fence compiles on its own terms and
// never collides with a supplied declaration.
// Comments are stripped before any of the scanning below. The docs annotate
// import clauses inline, and a comment such as `// → { hours, minutes }` puts a
// stray `}` inside what looks like an import clause — which silently truncated
// the clause scan and made the preamble re-import a name the fence had already
// imported.
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, '');
}

export function collectBoundIdentifiers(source) {
  const code = stripComments(source);
  const bound = new Set();

  for (const match of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) bound.add(name);
    }
  }
  for (const match of code.matchAll(/import\s+(?:type\s+)?(\w+)\s*(?:,|from)/g)) {
    bound.add(match[1]);
  }
  for (const match of code.matchAll(
    /\b(?:const|let|var|function|class|type|interface|enum)\s+(\w+)/g,
  )) {
    bound.add(match[1]);
  }
  // Destructuring: `const [iso, setIso] = useState(…)`, `const { field } = …`.
  for (const match of code.matchAll(/\b(?:const|let|var)\s*[[{]([^\]}]*)[\]}]/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/[:=]/)[0].trim().replace(/^\.\.\./, '');
      if (/^\w+$/.test(name)) bound.add(name);
    }
  }

  return bound;
}

export function buildPreamble(source) {
  const bound = collectBoundIdentifiers(source);
  // Scan for references in the comment-free code too, so a name mentioned only
  // in prose inside a comment does not drag an import into the preamble.
  const code = stripComments(source);
  const lines = [];

  for (const [id, statement] of AMBIENT_PREAMBLE) {
    if (bound.has(id)) continue;
    if (!new RegExp(`(?<![\\w$])${id}(?![\\w$])`).test(code)) continue;
    if (!lines.includes(statement)) lines.push(statement);
  }

  return lines;
}

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
  const entry = diagnostic.file ? generatedFiles.get(diagnostic.file.fileName) : undefined;

  if (diagnostic.file && diagnostic.start != null && entry) {
    const { snippet, preambleLength } = entry;
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

    // A diagnostic inside the generated preamble has no location in the
    // Markdown, so say so rather than pointing at an unrelated doc line.
    if (position.line < preambleLength) {
      return `${snippet.sourcePath} (generated preamble line ${position.line + 1}) - ${message}`;
    }

    const documentLine = snippet.startLine + position.line - preambleLength;
    return `${snippet.sourcePath}:${documentLine}:${position.character + 1} - ${message}`;
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
      const preamble = buildPreamble(snippet.code);
      const body = preamble.length > 0 ? `${preamble.join('\n')}\n${snippet.code}` : snippet.code;
      writeFileSync(filename, `${body}\nexport {};\n`, 'utf8');
      generatedFiles.set(filename, { snippet, preambleLength: preamble.length });
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
        '@kalyx/react/headless': [resolve(repoRoot, 'packages/react/dist/headless.d.ts')],
        '@kalyx/adapter-dayjs': [resolve(repoRoot, 'packages/adapter-dayjs/dist/index.d.ts')],
        '@kalyx/adapter-luxon': [resolve(repoRoot, 'packages/adapter-luxon/dist/index.d.ts')],
        '@kalyx/core/test-helpers': [resolve(repoRoot, 'packages/core/dist/test-helpers/index.d.ts')],
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

function readDocument(repoRoot, documentPath) {
  const absolutePath = resolve(repoRoot, documentPath);
  const sourcePath = relative(repoRoot, absolutePath);
  return {
    sourcePath,
    snippets: extractExecutableFences(readFileSync(absolutePath, 'utf8'), sourcePath),
  };
}

export function checkDocumentExamples({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const problems = [];
  const documents = [];

  for (const relativePath of CHECKED_DOCUMENTS) {
    const pair = [
      readDocument(repoRoot, `${EN_DOCS_ROOT}/${relativePath}`),
      readDocument(repoRoot, `${KO_DOCS_ROOT}/${relativePath}`),
    ];
    try {
      assertMatchingFenceCounts(pair);
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
    }
    documents.push(...pair);
  }

  for (const [relativePath] of EN_ONLY_DOCUMENTS) {
    documents.push(readDocument(repoRoot, `${EN_DOCS_ROOT}/${relativePath}`));
  }

  const snippets = documents.flatMap((document) => document.snippets);
  problems.push(...compileSnippets(snippets, { repoRoot }));

  if (problems.length > 0) {
    throw new Error(`Documentation examples failed to compile:\n${problems.join('\n')}`);
  }

  return {
    documentCount: documents.length,
    snippetCount: snippets.length,
    uncheckedCount: UNCHECKED_DOCUMENTS.length,
  };
}

function main() {
  try {
    const result = checkDocumentExamples();
    console.log(
      `✓ Compiled ${result.snippetCount} TypeScript examples across ${result.documentCount} documents ` +
        `(${result.uncheckedCount} pages deliberately unchecked — see UNCHECKED_DOCUMENTS).`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main();
}
