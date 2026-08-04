# Claude/Codex Correctness Comparison Design

**Date:** 2026-08-03  
**Status:** Approved design, pending maintainer review of this written specification  
**Audited source baseline:** `77ed089be47e708f0ba54abdbd4271ee294d9aeb`  
**Purpose:** Compare two independent implementations of the same Kalyx correctness repair without allowing shared-checkout interference or cross-model contamination.

## 1. Decision

Run Claude and Codex as independent implementations from the same immutable baseline. Each implementation receives the same public acceptance contract and uses a separate Git worktree. Both submit Draft PRs against an audit baseline branch, not directly against `main`.

The two Draft PRs are experiments. They must not both be merged. A separate evaluator applies withheld adversarial tests and a predeclared scorecard, then selects one implementation or constructs a small integration branch from the best verified parts.

## 2. Why This Comparison Exists

The current suite passes 776 Vitest tests and 93 cross-browser E2E tests, but audit reproductions found correctness failures at integration boundaries:

- A New York civil-day value can highlight the next UTC calendar cell.
- A positive-offset first-of-month value can reopen in the previous UTC month.
- Preset, week-selection, component, and headless paths do not share one timezone-normalization boundary.
- Typed input and presets can bypass `disabled` or `filterTime` constraints that individual visual controls enforce.

The experiment therefore evaluates domain modeling and regression protection, not code-generation speed or feature volume.

## 3. Repository and Branch Topology

```text
77ed089be47e708f0ba54abdbd4271ee294d9aeb
└── audit/baseline-77ed089
    ├── fix/claude-correctness
    └── fix/codex-correctness

After both Draft PRs are frozen:

audit/model-comparison
└── optional fix/timezone-constraints-integration
```

Rules:

1. `audit/baseline-77ed089` is immutable after this specification is committed.
2. Claude and Codex use different external worktrees. Neither may use the shared root checkout.
3. Both implementation branches start from the same head of `audit/baseline-77ed089`: the audited source baseline plus this specification-only commit.
4. Both Draft PRs target `audit/baseline-77ed089`.
5. Neither implementation may inspect the other implementation branch or PR until both heads are frozen.
6. No rebasing, cherry-picking, or merging between experiment branches is allowed before scoring.
7. Only the selected or separately integrated implementation may later target `main`.

Recommended worktree paths:

```text
/private/tmp/kalyx-claude-correctness
/private/tmp/kalyx-codex-correctness
/private/tmp/kalyx-model-comparison
```

## 4. First Comparison Scope

The first comparison is intentionally limited to one correctness domain: civil-day/time constraint handling across all selection paths.

### In scope

- Calendar selected/today/range/focus identity with `displayTimezone`.
- Initial and controlled `viewMonth` derivation at timezone month boundaries.
- DatePicker and DateTimePicker preset timezone normalization.
- RangePicker week mode and `useWeekPicker` timezone normalization.
- A single Root-level constraint boundary for calendar click, typed input, preset, and headless state transitions.
- `filterTime` enforcement for typed time, list selection, DateTimePicker composition, and presets.
- Regression tests covering each repaired route.
- Minimal documentation or comments needed to define the repaired contract.

### Explicitly out of scope

- Adapter `format`/`parse` redesign.
- Tree-shaking or package-entry redesign.
- Release workflow and adapter publishing fixes.
- Documentation-site cleanup.
- React 18 support.
- New picker features, Temporal, non-Gregorian calendars, or visual redesign.
- Unrelated refactoring or formatting.

Out-of-scope findings become separate workstreams after this experiment. Mixing them into the first comparison would make correctness and implementation quality harder to compare.

## 5. Public Domain Contract

Both implementers receive this section verbatim.

### 5.1 Value semantics

- Public values remain ISO 8601 UTC strings. This experiment must not introduce a breaking public value type.
- With no `displayTimezone`, existing UTC behavior remains unchanged.
- With `displayTimezone`, a calendar cell represents a civil date in that zone. Selected, today, range, and focused-cell flags must compare civil-date identity rather than reinterpret a UTC-midnight grid cell as an arbitrary instant.
- Converting a chosen civil date/time to its stored UTC instant happens exactly once.
- Reopening a stored value derives the visible civil month in `displayTimezone`, including values whose UTC instant falls in the prior or next UTC month.

### 5.2 Selection-path parity

The following paths must produce equivalent canonical values for equivalent user intent:

- Calendar click.
- Typed input.
- DatePicker/DateTimePicker preset.
- RangePicker week selection.
- Corresponding headless hook action.
- Controlled value update followed by reopen.

No path may double-normalize an already canonical stored instant or bypass required normalization.

### 5.3 Constraint semantics

- `disabled`, min/max bounds, and `filterTime` are state-transition invariants, not merely visual-control behavior.
- Calendar cells and time options still expose disabled UI state, but Root-level transitions must reject invalid values regardless of whether the request came from click, keyboard, typed input, preset, composition, or headless action.
- A rejected transition must not call the public `onChange` callback with the invalid value.
- Existing valid controlled and uncontrolled flows must remain compatible.
- Invalid-input UX redesign is out of scope; preserve current visible behavior unless the minimum correction requires a localized change.

### 5.4 Compatibility constraints

- No breaking public API change.
- No new production dependency without maintainer approval.
- No weakening or removal of existing tests, accessibility behavior, SSR guarantees, or bundle gates.
- Changes must be surgical and restricted to the correctness domain.

## 6. Public Acceptance Checks

Each implementation must add visible regression tests for at least these categories:

1. A negative-offset zone reopens and highlights the intended civil day.
2. A positive-offset zone reopens a first-of-month value in the intended civil month.
3. Preset selection in a positive-offset zone does not shift by a second normalization.
4. Week selection returns the intended civil week in positive and negative offsets.
5. Component and headless paths return the same canonical range.
6. Typed disabled dates do not commit or call `onChange`.
7. Disabled presets do not commit or call `onChange`.
8. Typed or preset times rejected by `filterTime` do not commit or call `onChange`.
9. Existing no-timezone behavior remains unchanged.
10. Controlled external value changes still update the visible month and selection.

Required verification commands, run after a clean build:

```bash
pnpm build
pnpm test:run
pnpm test:coverage
pnpm typecheck
pnpm lint
pnpm format:check
pnpm check-bundle
pnpm check-tree-shaking
pnpm test:e2e
```

The clean-checkout prerequisite is explicit: `pnpm test:run` currently cannot resolve workspace package entries before `pnpm build` creates `dist`.

## 7. Withheld Evaluation

The evaluator keeps exact adversarial fixtures and judge tests outside the baseline and both implementation worktrees until both Draft PR heads are frozen. Implementers know the invariant categories but not the exact withheld cases.

Withheld coverage should include:

- Positive, negative, zero, and fractional UTC offsets.
- DST gap and overlap dates.
- Civil month/year boundaries.
- Controlled prop updates while a picker is open.
- Equivalent actions through click, keyboard, typed input, preset, and headless APIs.
- Disabled/filter predicates that reject only a subset of a day or hour.
- Callback call counts and rejected-transition state stability.
- SSR render and hydration stability around timezone-derived initial state.
- Bundle delta and accidental public-export changes.

The exact zones, dates, predicates, and test source are not committed to either experiment branch. The evaluator records their hash and result summary in `audit/model-comparison` after both implementations are frozen.

## 8. Scoring

| Dimension | Weight | Evidence |
|---|---:|---|
| Withheld correctness | 35% | Pass rate and severity of failures in adversarial tests |
| Regression-test quality | 20% | Failure before fix, path coverage, semantic assertions |
| Public API compatibility | 15% | Type/export diff and consumer smoke tests |
| Simplicity and change scope | 10% | Diff size, cohesion, duplicated normalization logic |
| Bundle/performance impact | 10% | ESM/CJS gzip delta and consumer benchmark |
| Documentation clarity | 5% | Accuracy of changed contract comments/docs |
| Security/release impact | 5% | New dependencies, unsafe parsing/state behavior |

Tie-break order:

1. Fewer high-severity withheld failures.
2. Clearer single ownership of normalization and constraints.
3. Smaller compatible implementation.
4. Lower bundle increase.

Automatic disqualification:

- Weakening or deleting a relevant existing test to make the suite pass.
- Breaking the public ISO-string contract.
- Silently dropping timezone or constraint behavior.
- Reading or copying the competing implementation before both heads freeze.
- Introducing unrelated product features or broad refactors.

## 9. Evidence Required in Each Draft PR

Each implementer must provide:

- Root-cause explanation.
- Explicit representation and normalization invariants.
- File-level change summary.
- Tests added and the bug each would have caught.
- Full verification command results.
- Bundle sizes and delta from baseline.
- Known limitations and remaining out-of-scope findings.
- Confirmation that no competing branch or PR was inspected.

PR titles:

```text
fix(experiment/claude): unify timezone and constraint transitions
fix(experiment/codex): unify timezone and constraint transitions
```

Both PRs remain Draft and carry an `experiment-do-not-merge` label until scoring is complete.

## 10. Evaluation and Integration Flow

1. Freeze both branch heads and record their SHAs.
2. Run public verification independently on both SHAs.
3. Apply the same withheld judge suite to both SHAs.
4. Score without reading model identity where practical; use implementation labels A/B in the score sheet.
5. Review diffs only after automated results are recorded.
6. Select one implementation if it satisfies the contract cleanly.
7. If neither is sufficient, write a short integration design using the verified strengths of each; do not merge both branches wholesale.
8. Create one final PR against `main` and rerun the complete release gate from a clean checkout.
9. Close the losing Draft PRs with a link to the comparison report; preserve them for auditability.

## 11. Failure and Collision Handling

- The shared root checkout is considered unsafe for experiment work because a parallel process already changed its active branch during audit setup.
- An implementer that discovers a dirty or switched worktree stops and reports it; it does not reset, stash, or revert another process's files.
- If `main` advances, the experiment continues on the frozen baseline. Upstream changes are considered only after comparison scoring.
- If baseline setup fails, record whether the failure occurs before or after the required clean build. Do not attribute missing `dist` imports to an implementation.
- Network-dependent tools and browser downloads are setup prerequisites, not product-test failures; record them separately.

## 12. Success Criteria

The comparison is complete only when:

- Both implementations started from the same immutable baseline.
- Both Draft PR heads are frozen and independently reproducible.
- Public and withheld results are recorded for both.
- The scorecard is completed with evidence.
- Exactly one integration path is selected.
- The final candidate has no known P0/P1 failure in this experiment's scope.
- The final candidate passes the clean build, full unit/coverage, type, lint, bundle, and three-browser E2E gates.

Promotion remains out of scope until the separate release, documentation, dependency-security, and honest-bundle-measurement workstreams also pass their gates.
