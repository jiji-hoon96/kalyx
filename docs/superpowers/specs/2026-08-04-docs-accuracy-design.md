# Documentation Accuracy and Executable Examples Design

> **Date:** 2026-08-04
> **Base:** `main` at `a71c43a`
> **Branch:** `fix/codex-docs-accuracy-2026-08`

## Goal

Make the public Core API documentation and package metadata match the shipped package graph, and prevent future TypeScript examples in the English or Korean Core API pages from compiling against nonexistent exports.

## Problems

1. Both Core API pages import `DateFnsAdapter` from `@kalyx/core`, although core intentionally exports only the `DateAdapter` contract and the implementation lives in `@kalyx/adapter-date-fns`.
2. The calendar and disabled-rule examples repeat the same invalid import, so copying the documented code fails at compile time or runtime.
3. Documentation builds render fenced code as text and therefore cannot detect invalid TypeScript imports.
4. `@kalyx/react` package metadata still claims a 16 KB ceiling even though the repository's enforced policy is 20 KB.
5. Core and adapter installation text does not consistently distinguish core-only utilities from examples that require a concrete adapter.

## Architecture

### Executable Markdown Examples

Add `scripts/check-doc-code-examples.mjs`. It reads these source documents directly:

- `apps/docs-site/docs/api/core.md`
- `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/api/core.md`

The script extracts every fenced `ts`/`typescript`/`tsx` block, records its source path and starting line, writes each block as its own virtual module, and compiles the blocks together with the TypeScript compiler API using strict, no-emit, bundler-style module resolution and the React JSX transform. Each snippet is isolated by appending `export {}` so type declarations and local variable names in separate examples cannot collide.

The compiler resolves workspace packages through explicit paths to built declarations:

- `@kalyx/core` → `packages/core/dist/index.d.ts`
- `@kalyx/adapter-date-fns` → `packages/adapter-date-fns/dist/index.d.ts`
- `@kalyx/react` → `packages/react/dist/index.d.ts`

The check fails when:

- either locale contains no TypeScript or TSX fences;
- EN and KO contain different executable-fence counts, languages, or code;
- a fence is unclosed;
- any actual TypeScript diagnostic is produced.

Diagnostics identify the Markdown source path, fence start line, and line inside the fence. The script always removes temporary files.

The root command is `pnpm check-doc-examples`. PR CI runs it in the existing Docs Site Build job after core and adapter-date-fns builds and before Docusaurus build.

### Testability

The parser and validation helpers are exported without executing the CLI when imported. Vitest tests exercise real Markdown strings and compiler behavior:

- valid TypeScript and TSX fences are extracted with correct start lines and extensions;
- an unclosed fence is rejected;
- a real nonexistent Kalyx export produces a diagnostic;
- valid core plus adapter imports compile;
- locale count or executable-content mismatch is rejected.

Tests use the real TypeScript compiler, not mocked diagnostics.

## Documentation Corrections

Both Core API pages receive identical code changes:

- retain `pnpm add @kalyx/core` for utility-only use;
- add `pnpm add @kalyx/adapter-date-fns date-fns` when following adapter-backed examples;
- import `DateFnsAdapter` from `@kalyx/adapter-date-fns`;
- add explicit imports to every TypeScript example so each fence is independently compilable;
- preserve translated prose independently while keeping executable code structurally equivalent.

`packages/core/README.md` will clarify the optional adapter installation command. Adapter READMEs will state that direct core usage requires `@kalyx/core`, while `@kalyx/react/headless` users receive core through React's dependency graph.

## Metadata Corrections

Update `packages/react/package.json` description from the stale `≤16 KB gzipped` claim to the enforced `≤20 KB gzipped` ceiling and describe all seven date/time surfaces rather than only four named pickers. No package version, dependency, export, or runtime field changes.

## Scope

### Included

- EN/KO Core API example corrections.
- Real TypeScript compilation of all Core API TypeScript fences.
- CI and root-script integration.
- Core/adapter installation clarification.
- Stale React package description correction.

### Excluded

- General translation rewrites.
- Competitor comparison or promotional copy changes.
- Runtime source changes.
- Changesets or releases; this PR changes private docs tooling and metadata wording only.
- Tarball smoke tests, adapter provenance, accessibility runner, tree-shaking gates, and headless size limits.

## Verification

- Parser/compiler tests must demonstrate RED on the missing script and GREEN after implementation.
- Before correcting the docs, `pnpm check-doc-examples` must fail on the invalid `DateFnsAdapter` core import.
- After EN/KO corrections, the command must compile every fence with zero diagnostics.
- Root typecheck, lint, tests, both documentation builds, package build, bundle gate, and E2E remain green.
- An independent reviewer checks the docs against actual exports and verifies EN/KO executable parity.

## Success Criteria

1. Copying any TypeScript fence from either Core API page produces type-correct code against the current workspace declarations.
2. `DateFnsAdapter` is never documented as an `@kalyx/core` export.
3. EN/KO executable fences cannot drift silently in count, language, or code.
4. PR CI blocks invalid Core API TypeScript examples.
5. Installation and package-size metadata match the actual package graph and 20 KB policy.
