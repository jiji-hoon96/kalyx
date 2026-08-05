# Documentation Accuracy Implementation Plan

> **For Codex:** Execute this plan test-first. Preserve runtime behavior; this PR changes documentation, validation tooling, CI wiring, and metadata wording only.

**Goal:** Make every executable Core API example in the English and Korean docs compile against the packages the repository actually ships, and make CI prevent documentation/API drift.

**Architecture:** A small Node ESM script extracts `ts`, `typescript`, and `tsx` Markdown fences, writes each fence as an isolated temporary module, and compiles them together with the real TypeScript compiler. The existing Docs Site Build job runs the check after building the declarations used by the examples.

**Tech stack:** Node.js ESM, TypeScript compiler API, Vitest, pnpm, GitHub Actions, Docusaurus Markdown.

---

## Task 1: Specify the Markdown extractor and compiler contract

**Files:**

- Create: `scripts/__tests__/check-doc-code-examples.test.mjs`
- Create: `scripts/check-doc-code-examples.mjs`

1. Add tests for `ts`/`tsx` extraction, source line tracking, unclosed executable fences, EN/KO fence-count mismatch, valid workspace-package imports, and an invalid `DateFnsAdapter` import from `@kalyx/core`.
2. Run `pnpm vitest run scripts/__tests__/check-doc-code-examples.test.mjs` and record the expected RED result because the implementation module does not exist.
3. Implement the smallest parser, parity validator, TypeScript compiler wrapper, diagnostic formatter, temporary-file cleanup, and direct CLI entry point that satisfy the tests.
4. Run the focused test again and require GREEN.
5. Commit the tested validation tool independently.

## Task 2: Demonstrate the current documentation failure

**Files:**

- Modify: `package.json`

1. Add the root `check-doc-examples` script.
2. Build `@kalyx/core`, `@kalyx/adapter-date-fns`, and `@kalyx/react` declarations.
3. Run `pnpm check-doc-examples` before editing either document and record the expected RED diagnostics for the invalid documented imports and missing snippet imports.

## Task 3: Correct both executable Core API documents

**Files:**

- Modify: `apps/docs-site/docs/api/core.md`
- Modify: `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/api/core.md`

1. Add the adapter installation command used by the examples.
2. Import `DateFnsAdapter` only from `@kalyx/adapter-date-fns`.
3. Add explicit imports to every executable fence, including `DatePicker` in the TSX accessibility example, so every fence compiles independently.
4. Keep EN and KO executable blocks structurally equivalent.
5. Run `pnpm check-doc-examples` and require zero diagnostics.
6. Commit both locale corrections together.

## Task 4: Clarify install and package metadata

**Files:**

- Modify: `packages/core/README.md`
- Modify: adapter package READMEs that present direct-install instructions
- Modify: `packages/react/package.json`

1. Explain the optional concrete-adapter install for direct core use.
2. Clarify when adapter users must install `@kalyx/core` directly and when it arrives through `@kalyx/react`.
3. Replace the stale React `16 KB` metadata claim with the enforced `20 KB` ceiling and describe all seven date/time surfaces.
4. Run package JSON parsing and literal consistency checks.
5. Commit metadata and installation clarification separately.

## Task 5: Enforce examples in PR CI

**Files:**

- Modify: `.github/workflows/pr-check.yml`

1. Add `pnpm check-doc-examples` to Docs Site Build after core, adapter, and React builds and before Docusaurus build.
2. Validate the workflow syntax with the repository's available tooling and inspect the exact diff.
3. Commit CI integration separately.

## Task 6: Full verification and independent review

1. Run focused validator tests and `pnpm check-doc-examples`.
2. Run `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, `pnpm build`, `pnpm check:bundle`, both documentation builds, and the repository E2E command.
3. Inspect `git diff --check`, changed-file scope, and final commit history.
4. Request an independent review focused on compiler correctness, Markdown edge cases, package-export accuracy, EN/KO parity, and CI ordering.
5. Address verified findings, rerun affected checks, push the branch, and open one focused PR with a Claude verification checklist.
