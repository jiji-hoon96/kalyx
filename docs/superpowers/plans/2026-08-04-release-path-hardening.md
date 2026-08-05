# Release Path Hardening Implementation Plan

> **For Codex:** Execute test-first and keep this PR independent of the correctness and documentation branches.

**Goal:** Build and smoke-test the exact tarballs for every publishable package before release.

**Architecture:** Discover publishable manifests from `packages/`, validate their release metadata, pack them into a temporary standalone consumer, and import all public ESM/CJS entry points. Wire that command into fresh-checkout PR CI and release preflight.

**Tech stack:** Node.js ESM, pnpm pack/install, Vitest, GitHub Actions.

---

## Task 1: Specify publishable package discovery and validation

**Files:**

- Create: `scripts/__tests__/check-package-tarballs.test.mjs`
- Create: `scripts/check-package-tarballs.mjs`

1. Test synthetic public/private package discovery, required metadata errors, smoke-program generation, and the real repository package set.
2. Run the focused test and record RED because the checker is absent.
3. Implement only discovery, metadata validation, and program generation.
4. Run the test again; retain the expected repository-level RED for missing dayjs/luxon provenance.

## Task 2: Complete publish metadata

**Files:**

- Modify: `packages/adapter-dayjs/package.json`
- Modify: `packages/adapter-luxon/package.json`

1. Add `publishConfig.provenance: true` without changing versions or dependencies.
2. Run the focused test and require GREEN.

## Task 3: Include every package in the root build

**Files:**

- Modify: `package.json`

1. Replace the partial build chain with a core-first stage followed by the packages-only recursive build, avoiding the core/date-fns workspace cycle on clean declaration builds.
2. Remove all five `dist/` directories, run `pnpm build`, and require all five to be recreated.
3. Keep named helper build scripts for local convenience unless they become misleading.

## Task 4: Implement real pack/install/import smoke behavior

**Files:**

- Modify: `scripts/check-package-tarballs.mjs`
- Modify: `package.json`

1. Pack each discovered package to a temporary directory and inspect its packed manifest before applying overrides.
2. Validate workspace rewrites and canonical finite export maps, then install all Kalyx tarballs in a standalone consumer.
3. Pin the repository pnpm version, link external dependencies from the frozen root install, and perform an offline frozen consumer install.
4. Execute generated ESM and CommonJS representative-export assertions for roots and required subpaths.
5. Guarantee cleanup in `finally` and on termination signals, and surface the failing subprocess clearly.
6. Run `pnpm check-package-tarballs` and require all artifacts to pass.

## Task 5: Gate PRs and releases

**Files:**

- Modify: `.github/workflows/pr-check.yml`
- Modify: `.github/workflows/release.yml`

1. Add a fresh-checkout Package Tarball Smoke job and include it in All Checks Pass.
2. Add the same command after the release build and before publish, and make the root `release` command the single guarded publish entry point.
3. Validate workflow formatting and inspect ordering.

## Task 6: Full verification and independent review

1. Run focused tests, root build, tarball smoke, typecheck, lint, full tests, bundle gate, docs builds, and E2E.
2. Run `git diff --check`, inspect scope and history, and verify no version/changeset mutation.
3. Request independent review focused on package discovery, temp cleanup, dependency isolation, ESM/CJS/subpath coverage, provenance, and CI ordering.
4. Address findings, rerun affected checks, push, and open a focused PR with a Claude verification checklist.
