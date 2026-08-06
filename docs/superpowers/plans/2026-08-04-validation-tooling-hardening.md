# Validation Tooling Hardening Plan

**Goal:** Turn accessibility, consumer tree-shaking, and headless bundle checks into honest, failing CI signals.

## Task 1: Lock the contracts with failing tests

- Add discovery tests for content-based `jest-axe` test selection and empty-suite rejection.
- Add tree-shaking result completeness/failure tests.
- Extend bundle policy tests to require a separate headless ceiling and both headless formats in the CLI/build gates.
- Add documentation tests that reject unsupported pay-only-for-imports claims.

## Task 2: Repair accessibility execution

- Add `scripts/check-a11y.mjs` with deterministic discovery and subprocess failure propagation.
- Point the root command at the wrapper.
- Build required workspace packages before invoking it in CI.

## Task 3: Make consumer tree-shaking observable and honest

- Refactor the script into testable scenario execution and fatal result validation.
- Add it to a dedicated PR job and the aggregate gate.
- Replace unsupported EN/KO tree-shaking promises with measured, qualified language.

## Task 4: Gate headless artifacts

- Add the headless 20 KB policy constant.
- Measure and fail both headless formats in the CLI and tsup post-build checks.
- Preserve the existing default-entry PR delta report.

## Task 5: Verify and review

- Run focused RED/GREEN tests after each implementation slice.
- Run build, accessibility, tree-shaking, bundle, typecheck, lint, and full tests.
- Request an independent deep review before pushing the branch and opening a focused PR.
