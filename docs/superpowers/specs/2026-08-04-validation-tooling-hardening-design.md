# Validation Tooling Hardening Design

## Problem

Three validation surfaces currently overstate their protection:

1. `pnpm check-a11y` uses Vitest's removed `--testPathPattern` option and fails before collecting tests.
2. `check-tree-shaking` is not run in CI, catches individual bundling errors without failing, and its measured output contradicts documentation that says consumers pay only for imported pickers.
3. The built headless ESM/CJS files are printed during build but are not subject to an absolute gzip ceiling.

Baseline measurements on `a71c43a` are 18.30/18.43 KB for the default ESM/CJS files, 19.57/19.71 KB for headless, and 23.78 KB for every single-picker consumer scenario. The implementation must preserve these facts rather than infer per-picker savings that the harness does not observe.

## Design

### Accessibility selection

Add a Node wrapper that discovers test files containing a `jest-axe` import under the React package and docs site. It invokes the repository-local Vitest binary with the exact sorted file list. Discovery is content-based, so accessibility tests do not depend on filename conventions, and an empty discovery is an error rather than a false green.

### Consumer tree-shaking report

Keep the current consumer-style esbuild scenarios, but make scenario failures fatal and require a result for every declared scenario. Run the command in a dedicated PR validation job after a clean build. The job is evidence/reporting, not a per-picker reduction claim: current root-entry topology bundles the same implementation for each rendered picker.

Remove claims that unused picker implementations are proven to disappear. Keep factual statements about `sideEffects: false`, the full-entry artifact ceiling, and the measured consumer harness, with explicit wording that consumers should inspect their own production bundle.

### Headless size budget

Define a separate `HEADLESS_REACT_GZIP_CEILING_KB` policy, initially 20 KB, and apply it to both `dist/headless.js` and `dist/headless.cjs` in the CLI gate and tsup post-build gate. Expand the PR bundle diff and GitHub output to report base/head deltas and entry-specific margins for all four default/headless ESM/CJS artifacts.

## CI contract

A `validation-tools` PR job performs frozen install, root build, accessibility selection, and consumer tree-shaking. `all-pass` depends on it. Existing `bundle-size` CI invokes the expanded default + headless hard gate.

## Acceptance criteria

1. `pnpm check-a11y` executes every test file importing `jest-axe` and fails if none are found.
2. A failed or missing tree-shaking scenario makes the command non-zero, and the full report runs in PR CI.
3. EN/KO public copy no longer promises per-picker tree-shaking unsupported by the current 23.78 KB measurements.
4. Default and headless ESM/CJS artifacts each fail above their explicit ceiling.
5. Focused tests, full tests, build, typecheck, lint, bundle gates, accessibility selection, and tree-shaking report pass.
