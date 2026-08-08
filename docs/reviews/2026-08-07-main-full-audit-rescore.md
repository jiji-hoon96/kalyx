# Kalyx latest-main full audit and rescore

Date: 2026-08-07  
Audited base: `origin/main` at `68a780c5cd97cf0accceee3b294e263c0fd48e54`
Audit branch: `audit/full-rescore-2026-08-07`  
Scope: whole repository and published packages, not a PR diff review

## Executive result

The project is materially stronger than the 2026-08-04 rescore. The previous
headline defects around positive-offset civil midnight, negative-offset selected
cells, timezone-aware month/year constraints, month navigation focus, package
semver ranges, tree-shaking, provenance coverage, and PR security scans remain
fixed on current `main`.

The latest base already included #207's malformed external-value fix and its
147 regression cases; this audit retained and re-verified that work rather than
reporting it again. Seven different correctness or delivery defects still
survived the green baseline. Five P1 and two P2 findings were reproduced and
fixed, adding 17 tests (1107 → 1124). No P0 remains.

Score trajectory:

| State | D1 | D2 | D3 | D4 | D5 | D6 | D7 | Overall |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-08-04 post-fix rescore | 6 | 5 | 4 | 6 | 7 | 7 | 7 | ~6.0 |
| `68a780c` latest main, stricter rescore | 7 | 6 | 5 | 7 | 7 | 7 | 8 | ~6.7 |
| This audit, patched state | **8** | **6** | **5** | **7** | **8** | **8** | **8** | **~7.1** |

The score remains near 7 despite the clean verification result:
Korean documentation is still substantially incomplete, the default CJS bundle
has little budget left, E2E is post-merge rather than PR-gating, and
live branch protection could not be independently queried in this session.

## Method and evidence

The requested agentmemory concepts were recalled first:

- `main-branch-full-audit`, `whole-project-rescore`, `project-wide-evaluation`
  resolved to observation `mem_msjlf7wz_2447c46903cf` (strength 7).
- `functional-correctness` and evidence-first defect hunting resolved to
  `mem_msjlcamg_43def9763f68` (strength 7).

The prior functional audit, rubric, cross-evaluation, post-fix rescore, and
Claude/Codex correctness comparison were read before testing. The same D1–D7
rubric was retained, with stricter requirements: a claim needed source or
measured evidence, and a suspected defect needed a discriminating failing test.

CodeGraph instructions were present, but no `codegraph_*` tool was exposed in
this session. Specific files were therefore read directly; literal searches used
`rg`. Work was isolated from the original checkout. When `main` advanced from
`7592ad8` to #207 during the audit, the branch was rebased onto the new SHA,
#207's broader core/render defense was retained, and the baseline was rerun.

## Clean-main baseline

Before any audit patch:

| Gate | Result |
| --- | --- |
| Build | PASS; default ESM/CJS 18.62/18.87 KB gzip, headless 19.91/20.18 KB |
| Unit/integration | PASS, 55 files / 1107 tests |
| Typecheck, lint, format | PASS |
| Docs | Next and Docusaurus en/ko builds PASS; 112 examples in 15 docs compile; 24 pages explicitly unchecked |
| Tarball consumer smoke | PASS, 5 packages / 7 ESM+CJS entry points; exposed missing adapter licenses |
| Consumer tree-shaking | PASS; unused pickers eliminated; `useDatePicker` consumer 8.25 KB, all APIs 24.98 KB gzip |
| Accessibility | PASS, 17 files / 411 tests |
| Malformed-value matrix | PASS; 147 render, mounted-grid, timezone, default-value, SSR, and hook cases from #207 |
| IANA sweep | PASS, 418 zones × leap/non-leap years = 305,558 civil-day round trips |
| Dependency audit | FAIL, two HIGH `image-size@2.0.2` DoS advisories in private Docusaurus build path only; no fixed release |

This is why “all tests pass” was treated only as a starting point.

## Fixed findings

### P1 — programmatic picker mutations bypassed malformed-value protection

- **Evidence:** #207 made malformed external `value` safe to render, but final
  mutation methods still accepted the same invalid candidate. The regression in
  `packages/react/src/components/__tests__/invalid-value.test.tsx` calls all six
  date-bearing headless mutations and requires zero callbacks and zero throws.
- **Reproduction:** call `selectDate('not-a-date')`,
  `setRange({start:'not-a-date', end:null})`, `selectWeek('not-a-date')`, or the
  Month/Year/DateTime equivalents on latest main.
- **Impact:** the UI was resilient to bad inbound state while programmatic APIs
  could still emit it or throw during date math—an inconsistent callback contract.
- **Files:** `packages/react/src/internal/usableDate.ts`, all date-bearing hooks,
  and Date/Range/DateTime Root commit boundaries.
- **Fix:** keep #207's raw-value preservation/core comparison guards, add
  exception-safe adapter validation, and reject unusable mutation candidates
  immediately before normalization or callback dispatch.

### P1 — Dayjs adapter accepted impossible civil dates

- **Evidence:** shared conformance assertions at
  `packages/core/src/test-helpers/index.ts:157`; Dayjs alone accepted
  `2026-02-29` and `2026-02-30T00:00:00.000Z` while date-fns and Luxon rejected
  them.
- **Reproduction:** call `DayjsAdapter.isValid('2026-02-29')` or parse the value
  through `parseInputValue`.
- **Impact:** adapter choice changed validation semantics and could persist an
  unintended rolled-over date.
- **Files:** `packages/adapter-dayjs/src/index.ts:146`.
- **Fix:** retain Dayjs instant validation and independently validate the ISO
  Y/M/D tuple against UTC calendar fields.

### P1 — typed MonthPicker/YearPicker values violated their storage contract

- **Evidence:** `MonthPicker.test.tsx:85` and `YearPicker.test.tsx:80` failed with
  June 15 / August 19 where the public contract promised June 1 / January 1.
- **Reproduction:** type a full mid-month date into `MonthPicker.Input` or a
  non-January date into `YearPicker.Input`.
- **Impact:** identical user choices emitted different values depending on
  whether selection came from the grid or the input.
- **Files:** `packages/react/src/components/DatePicker/Root.tsx:93`, MonthPicker
  and YearPicker Roots.
- **Fix:** add an internal `selectionGranularity` commit boundary and normalize
  to month-start/year-start before civil-timezone conversion.

### P1 — WeekPicker only guarded disabled endpoints

- **Evidence:** component test `WeekPicker.test.tsx:375` and headless test
  `useWeekPicker.test.tsx:129` both failed when Wednesday was disabled but the
  Sunday/Saturday endpoints were enabled.
- **Reproduction:** disable `2026-01-14`, then select any day in Jan 11–17.
- **Impact:** contradicted the documented invariant that any disabled day makes
  its whole week unavailable; mouse, keyboard, ARIA, and headless state all
  disagreed with that contract.
- **Files:** `packages/react/src/components/_shared/week.ts:9`, RangePicker
  Calendar in week mode, and `useWeekPicker`.
- **Fix:** compute the anchored seven-day coordinate range once and use the
  same whole-week predicate for rendering, `aria-disabled`, click, Enter/Space,
  keyboard skipping, headless commit, and headless calendar flags.

### P1 — named non-DatePicker inputs submitted display strings, not API values

- **Evidence:** four RED tests in
  `packages/react/src/components/__tests__/form-submission.test.tsx:15`.
  Browser `FormData` contained `2026-01-11`, `14:30`, and
  `2026-01-15 14:30` instead of the controlled UTC-ISO values.
- **Reproduction:** add `name` to Range/Week/Time/DateTime Inputs and serialize
  the surrounding form.
- **Impact:** silent data corruption at the native form boundary. WeekPicker
  documentation additionally claimed the inherited `name` prop did not exist.
- **Files:** RangePicker, TimePicker, DateTimePicker Inputs and their en/ko docs.
- **Fix:** remove `name` from visible inputs and emit a hidden named field with
  the canonical ISO value, matching Date/Month/Year behavior.

### P2 — programmatic time partials silently rolled over

- **Evidence:** `time.test.ts:45` and `timezone.test.ts:332` initially showed
  `{hours: 24}`, negative values, minute/second 60, and fractions becoming
  plausible but unintended datetimes.
- **Reproduction:** call `setTime(iso, {hours: 24})` or
  `setTimeInTimezone(iso, {minutes: 60}, zone)`.
- **Impact:** invalid programmatic input mutated dates across day boundaries
  instead of surfacing a caller error.
- **Files:** `packages/core/src/utils/time.ts:10` and
  `packages/core/src/utils/timezone.ts:217`.
- **Fix:** shared field-wise integer/range validation with `RangeError` before
  any date arithmetic.

### P2 — adapter tarballs advertised but omitted LICENSE

- **Evidence:** the initial packed contents for all three adapters lacked
  `LICENSE`; `scripts/__tests__/check-package-tarballs.test.mjs:67` now proves
  the checker rejects that state.
- **Reproduction:** `pnpm build && pnpm check-package-tarballs` and inspect the
  adapter tarball lists.
- **Impact:** incomplete published compliance artifacts despite every manifest
  declaring MIT and including `LICENSE` in `files`.
- **Files:** all adapter `LICENSE` files and
  `scripts/check-package-tarballs.mjs:54`.
- **Fix:** add exact MIT license files and make absence a release-blocking
  tarball invariant.

All publishable fixes are covered by `.changeset/quiet-calendars-guard.md`.

## Remaining findings and risks

### P2 — Korean API documentation is not at English parity

- **Evidence:** non-empty line ratios are Date 57%, Range 59%, Week 54%, Time
  57%, DateTime 38%, Month 58%, Year 56%. Several Korean pages still contain
  English prose/headings (for example WeekPicker disabled rules and timezone).
- **Impact:** Korean users do not receive the same constraint, event, form, and
  edge-case contract as English users. Both sites build because compilation
  checks syntax, not semantic parity.
- **Direction:** define a page-section parity manifest, translate the missing
  content, and fail CI when required headings/API rows diverge.

### P2 — default CJS bundle has little remaining budget

- **Evidence:** patched sizes are ESM/CJS 19.43/19.71 KB against 20 KB; the CJS
  margin is only 295 bytes. Headless is 20.71/21.04 KB against 22 KB.
- **Impact:** a small correctness fix can block the next PR or encourage raising
  the ceiling without architectural work.
- **Direction:** move reusable validation/calendar helpers to a smaller shared
  representation, audit duplicated default/headless code, and set an early
  warning threshold below the hard limit.

### P2 — cross-browser E2E is not a pre-merge gate

- **Evidence:** `.github/workflows/e2e-and-docs.yml` triggers on `push: main` and
  manual dispatch only. The PR aggregate gate does not depend on it.
- **Impact:** focus, hydration, browser-specific form, and popover regressions can
  merge before Chromium/Firefox/WebKit discovers them.
- **Direction:** add `pull_request` (possibly path-filtered with a stable skip
  job) and make the three browser results part of the required aggregate.

### P2 — release/security actions use mutable version tags

- **Evidence:** release uses `changesets/action@v1`; checkout/setup actions and
  the OSV reusable workflow also use tags rather than immutable commit SHAs.
  Release has write permissions plus `id-token: write`.
- **Impact:** tag movement compromises a privileged supply-chain path.
- **Direction:** pin third-party actions by full SHA and use automated, reviewed
  pin updates.

### P3 — local adapter conformance can read stale built core helpers

- **Evidence:** the new shared conformance assertion appeared green until
  `@kalyx/core` was rebuilt because tests import `@kalyx/core/test-helpers` from
  `dist`. CI builds core first, so CI is correct; plain local `pnpm test:run`
  after editing only the helper can be stale.
- **Impact:** misleading local green during adapter-contract development.
- **Direction:** alias the test-helper source in Vitest or add an explicit
  pretest core build.

### P3 — two ignored HIGH advisories and governance state need monitoring

- `pnpm audit --prod` reports two HIGH infinite-loop advisories in
  `image-size@2.0.2`, reachable only through private Docusaurus tooling. No fixed
  version exists. `osv-scanner.toml` documents the rationale and expires both
  ignores on 2026-11-07; published package consumers are not exposed.
- `gh auth status` reported an invalid token, so the live main ruleset, required
  review count, and actual required-check contexts could not be independently
  verified in this session. The latest-main audit artifacts record one required
  approval and 11 required checks, but repository settings remain an external
  verification item rather than a newly observed fact.

## Twelve-area assessment

1. **All pickers and hooks:** all seven rendered pickers and seven headless
   hooks now reject invalid mutations and survive invalid external state.
2. **State/callback contract:** controlled ownership is stable; callbacks fire
   on accepted commits only. Invalid, disabled, and out-of-granularity commits
   are now guarded at the mutation boundary.
3. **Timezone/DST/civil day:** 305,558 exhaustive round trips pass across 418
   zones, 2024 leap year and 2026; DST gap uses forward snapping and overlap uses
   earlier-offset disambiguation.
4. **Disabled/min/max/commit:** day, range endpoints, month/year full exclusion,
   and now all seven week days share render/commit semantics.
5. **Keyboard/focus/RTL/ARIA:** 414 accessibility tests pass; focus restoration,
   live regions, RTL horizontal movement and disabled selection skipping are
   covered. Week disabled state is now consistent across mouse/keyboard/ARIA.
6. **Forms and Input/Root:** all named Inputs now submit canonical ISO through
   hidden fields while visible text remains presentation-only.
7. **SSR/RSC/ESM/CJS/exports:** deterministic SSR/DST cases, Next builds, direct
   ESM+CJS tarball imports, and both React entries' `"use client"` banner pass.
8. **Adapters/semver:** shared conformance covers date-fns, Dayjs and Luxon,
   including impossible dates. Packed internal dependencies resolve to caret
   ranges (`workspace:^` source), avoiding the former exact-pin dead end.
9. **Tree-shaking/consumer bundle:** every unused picker is eliminated in the
   real esbuild consumer harness; a single picker remains 16.30–20.10 KB gzip
   because the pickers share substantial infrastructure.
10. **English/Korean docs/API:** factual Month/Year disabled/form errors and all
    new form contracts are fixed; Korean completeness remains P2.
11. **Release/changesets/provenance/security:** all five packages declare
    provenance; release builds, tests, checks bundles/tarballs/changesets; OSV
    and license scans run on PR. Latest-main artifacts record one approval and
    11 required checks; immutable action pins and independent live ruleset
    confirmation remain.
12. **Green-suite blind spots:** #207 closed malformed external-state rendering,
    but invalid programmatic mutations, impossible adapter dates, typed
    granularity, interior-week disabled state, native form payloads, time
    rollover, and packed licenses still survived the latest green suite. They
    are now explicit regressions; docs parity, PR E2E, and stale local dist are
    still not fully gated.

## Competitive interpretation (D3)

Kalyx now has a credible niche rather than a unique capability claim: zero-CSS
composition, seven related picker shapes, ISO-string persistence, multiple
adapters, explicit IANA civil-day semantics, and MIT range support in one small
library. It is not broadly feature-superior. Current Ark UI exposes a composable
DatePicker plus a headless hook; React Aria has DateRangePicker; React DayPicker
has range and timezone support; MUI X covers date, time, datetime and range with
deep validation. D3 therefore rises only from 4 to 5: the implementation is more
credible, while the market remains crowded and several competitors have broader
field, validation, and localization systems.

Primary references checked on 2026-08-07:

- https://ark-ui.com/docs/components/date-picker
- https://react-aria.adobe.com/DateRangePicker
- https://daypicker.dev/start
- https://daypicker.dev/localization/setting-time-zone
- https://mui.com/x/api/date-pickers/
- https://mui.com/x/react-date-pickers/validation/

## Final verification of patched state

| Command / probe | Result |
| --- | --- |
| `pnpm build` | PASS; default 19.43/19.71 KB, headless 20.71/21.04 KB gzip |
| `pnpm test:run` | PASS, 56 files / 1124 tests |
| `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `git diff --check` | PASS |
| `pnpm test:coverage` | PASS, 56 files / 1124 tests; 90.65% statements, 86.98% branches, 95.57% functions, 92.96% lines |
| `pnpm check-a11y` | PASS, 17 files / 414 tests |
| `pnpm test:e2e` | PASS, 93/93 across Chromium, Firefox, WebKit |
| Next docs type/build | PASS, 11 static routes |
| Docusaurus type/build | PASS, en and ko |
| `pnpm check-doc-examples` | PASS, 112 examples / 15 docs |
| `pnpm check-package-tarballs` | PASS, 5 packages / 7 ESM+CJS entries; all licenses present |
| bundle and tree-shaking checks | PASS |
| exhaustive IANA civil-day probe (included in the test suite) | PASS, 305,558/305,558 |
| `pnpm audit --prod` | expected FAIL: two documented, private-docs-only, unfixable HIGH advisories |

## Follow-up order

1. Bring the seven Korean component pages to a mechanically checked section/API
   parity baseline.
2. Make cross-browser E2E a required PR check.
3. Recover GitHub authentication and verify main ruleset/review/check settings
   against the workflow job names.
4. Pin privileged GitHub Actions to immutable SHAs.
5. Recover at least 1 KB of default CJS bundle headroom before expanding APIs.
6. Remove the adapter conformance test's reliance on stale local core `dist`.
7. Revisit the two OSV ignores before 2026-11-07.
