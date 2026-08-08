# Latest Main Full Audit and Rescore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-establish Kalyx's repository-wide quality baseline on `main` at `7592ad8`, adversarially verify every documented guarantee, fix reproducible defects test-first, and publish an evidence-backed rescore against the 2026-08-03 rubric.

**Architecture:** Treat the repository as four independently testable surfaces: Core date/time semantics, React rendered and headless state machines, package/consumer boundaries, and documentation/governance. Establish a clean baseline first, derive invariants from source and public documentation, then run targeted counterexample probes; only confirmed defects enter the RED-GREEN fix loop. Finish with the same full repository gates and a report that separates retained fixes, regressions, newly discovered findings, and untested risks.

**Tech Stack:** pnpm 10, TypeScript 5.9, React 19, Vitest 4, fast-check, Playwright, tsup, esbuild, Changesets, Docusaurus, GitHub Actions.

## Global Constraints

- Baseline is fetched `origin/main` at `7592ad8e3c042fc54d412c152b910f28513c23c0`.
- Preserve the user's unrelated dirty checkout; all work occurs in `/private/tmp/kalyx-full-rescore-2026-08-07`.
- Apply the seven dimensions and evidence protocol from `docs/superpowers/specs/2026-08-03-library-evaluation-rubric.md`.
- Do not repeat resolved findings unless a fresh reproduction shows regression or the guarantee is no longer locked by a meaningful test.
- Every defect requires priority P0-P3, exact evidence, reproduction, impact, related files, confidence, and a concrete fix direction.
- Production fixes begin with a failing test and remain minimal; unrelated refactors are excluded.
- Final completion requires fresh full-gate output, not earlier CI or documentation claims.

---

### Task 1: Freeze the baseline and prior-score delta

**Files:**
- Read: `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md`
- Read: `docs/superpowers/specs/2026-08-03-library-evaluation-rubric.md`
- Read: `docs/superpowers/specs/2026-08-03-cross-evaluation-synthesis.md`
- Read: `docs/superpowers/specs/2026-08-04-post-fix-rescore.md`
- Read: `docs/reviews/2026-08-03-claude-codex-correctness-comparison.md`

**Interfaces:**
- Consumes: Git commit `7592ad8` and the historical D1-D7 scorecard.
- Produces: A matrix of old findings classified as retained-fix, regressed, superseded, or still-unverified.

- [ ] **Step 1: Record the fetched SHA, branch status, package versions, and commits since `a71c43a`.**
- [ ] **Step 2: Extract the prior D1-D7 scores and every unresolved P0-P2 item.**
- [ ] **Step 3: Map each historical item to its current source, test, documentation, or workflow evidence.**

### Task 2: Establish repository and release baselines

**Files:**
- Read: `package.json`
- Read: `.github/workflows/pr-check.yml`
- Read: `.github/workflows/e2e-and-docs.yml`
- Read: `.github/workflows/security.yml`
- Read: `.github/workflows/release.yml`
- Read: `scripts/check-bundle-size.js`
- Read: `scripts/check-tree-shaking.js`
- Read: `scripts/check-package-tarballs.mjs`
- Read: `scripts/check-doc-code-examples.mjs`

**Interfaces:**
- Consumes: A frozen dependency graph from `pnpm-lock.yaml`.
- Produces: Exact pass/fail counts, sizes, package contents, and warning inventory for comparison after fixes.

- [ ] **Step 1: Run `pnpm build`, `pnpm test:run`, `pnpm typecheck`, `pnpm lint`, and `pnpm format:check`.**
- [ ] **Step 2: Run docs build/typecheck/example compilation and package tarball checks.**
- [ ] **Step 3: Run bundle, entry-split, tree-shaking, SSR/RSC, CJS/ESM, and representative consumer checks.**
- [ ] **Step 4: Run coverage, Chromium e2e, a11y, changeset, audit, OSV, and license checks where locally reproducible.**

### Task 3: Adversarially audit Core time and calendar invariants

**Files:**
- Modify if defective: `packages/core/src/utils/timezone.ts`
- Modify if defective: `packages/core/src/utils/calendar.ts`
- Test: `packages/core/src/__tests__/timezone.property.test.ts`
- Test: `packages/core/src/__tests__/timezone.test.ts`
- Test: `packages/core/src/__tests__/calendar.property.test.ts`
- Test: `packages/core/src/__tests__/calendar.test.ts`
- Compare: `packages/adapter-{date-fns,dayjs,luxon}/src/**`

**Interfaces:**
- Consumes: ISO instants, civil-day UTC coordinates, IANA zones, `DisabledRule[]`, and adapter methods.
- Produces: Verified round-trip, ordering, boundary, and cross-adapter contract results.

- [ ] **Step 1: Sweep representative and extreme zones across DST, leap day, month/year boundaries, UTC-12 through UTC+14, and fractional offsets.**
- [ ] **Step 2: Verify civil coordinate/instant round trips, gap and overlap policy, `today`, selected/range/focus flags, and week starts.**
- [ ] **Step 3: Probe `before`, `after`, exact date, weekday, filter, min/max, invalid ISO, and fully-disabled views.**
- [ ] **Step 4: Execute the same adapter contract cases against date-fns, dayjs, and Luxon and record semantic differences.**

### Task 4: Adversarially audit rendered pickers and headless hooks

**Files:**
- Modify if defective: `packages/react/src/components/{DatePicker,RangePicker,WeekPicker,MonthPicker,YearPicker,TimePicker,DateTimePicker}/**`
- Modify if defective: `packages/react/src/hooks/use{Date,Range,Week,Month,Year,Time,DateTime}Picker.ts`
- Test: colocated `*.test.tsx` files under `packages/react/src/components` and `packages/react/src/hooks`

**Interfaces:**
- Consumes: controlled/uncontrolled props, programmatic context setters, typed input, presets, calendar/list selection, disabled constraints, and timezone settings.
- Produces: Verified final commit guards, callback counts/values, state transitions, open/close effects, and controlled/uncontrolled behavior for all seven pickers and hooks.

- [ ] **Step 1: Enumerate every public mutation path and callback contract for all components and hooks.**
- [ ] **Step 2: Probe valid, invalid, cleared, controlled, uncontrolled, prop-switched, timezone-changed, and programmatic mutations.**
- [ ] **Step 3: Verify rejected commits cause no state mutation, callback, or unintended close.**
- [ ] **Step 4: Compare rendered and headless semantics for the same input matrix.**

### Task 5: Audit accessibility, forms, and server boundaries

**Files:**
- Modify if defective: `packages/react/src/components/**`
- Modify if defective: `packages/react/src/hooks/usePopover.ts`
- Test: picker tests, `packages/react/src/components/_shared/grid-keyboard.test.ts`, and `e2e/**`
- Read: `packages/react/src/index.ts`, `packages/react/src/headless.ts`, and package export metadata.

**Interfaces:**
- Consumes: keyboard events, focus, RTL direction, ARIA state, native forms, SSR, RSC, ESM, and CJS consumers.
- Produces: Verified keyboard reachability, focus restoration, form payloads, hydration/import behavior, and role/name/state contracts.

- [ ] **Step 1: Probe arrows, Home/End, Page keys, Enter/Space, Escape, disabled targets, month changes, RTL inversion, and focus restoration.**
- [ ] **Step 2: Verify ARIA roles, labels, selected/disabled/current states, live announcements, and axe coverage in open states.**
- [ ] **Step 3: Verify which Root/Input combinations submit native form values and ensure docs match that exact scope.**
- [ ] **Step 4: Build and execute Node ESM/CJS, SSR, RSC-safe, and browser consumer imports from packed tarballs.**

### Task 6: Audit packaging, docs, release, and security truthfulness

**Files:**
- Modify if defective: `packages/*/package.json`
- Modify if defective: `apps/docs-site/docs/**`
- Modify if defective: `apps/docs-site/i18n/ko/**`
- Modify if defective: `.github/workflows/**`
- Modify if defective: `RELEASING.md`, `SECURITY.md`, `README.md`, `README.ko.md`, and package changelogs.

**Interfaces:**
- Consumes: built artifacts, published export maps, public API declarations, English/Korean prose, Changesets, provenance, and CI policy.
- Produces: A source-to-doc/API parity matrix and a release/security gap inventory.

- [ ] **Step 1: Compare every public export and prop contract with English and Korean docs and compile all checked examples.**
- [ ] **Step 2: Inspect packed tarballs for exports, declarations, licenses, source leakage, dependency ranges, side effects, and installability.**
- [ ] **Step 3: Measure per-picker and all-picker consumer bundles and verify eliminated pickers are absent from metafiles.**
- [ ] **Step 4: Verify Changesets, cross-package semver, release OIDC/provenance, pinning, security scans, licenses, and required workflow coverage.**

### Task 7: Reproduce and fix confirmed defects

**Files:**
- Create or modify only the exact domain test and production files identified by Tasks 3-6.
- Create: `.changeset/<descriptive-name>.md` for publishable package behavior changes.

**Interfaces:**
- Consumes: A deterministic failing counterexample.
- Produces: A minimal compatible fix and a durable regression test.

- [ ] **Step 1: Add the smallest failing regression test and run its focused command to confirm RED for the intended reason.**
- [ ] **Step 2: Trace the mutation/data path to the first incorrect boundary and implement the smallest fix there.**
- [ ] **Step 3: Re-run the focused test to confirm GREEN, then run the affected package suite.**
- [ ] **Step 4: Add a patch Changeset when runtime or published metadata behavior changes.**

### Task 8: Full verification and final rescore

**Files:**
- Create: `docs/reviews/2026-08-07-main-full-audit-rescore.md`
- Update: `docs/superpowers/plans/2026-08-07-main-full-audit-rescore.md`

**Interfaces:**
- Consumes: Baseline evidence, adversarial probes, confirmed fixes, and final gate output.
- Produces: The requested P0-P3 report and D1-D7 score delta.

- [ ] **Step 1: Re-run every baseline gate from Task 2 on the final tree and record exact outputs.**
- [ ] **Step 2: Write findings with priority, evidence, reproduction, impact, files, confidence, fix direction, and status.**
- [ ] **Step 3: Score D1-D7 with one-line evidence and compare against the 2026-08-04 scorecard.**
- [ ] **Step 4: Separate retained improvements, regressions, new defects, fixed items, untested guarantees, and follow-up work.**
