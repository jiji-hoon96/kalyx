# @kalyx/core

## 1.0.0-rc.7

### Minor Changes

- 0eca2e8: Two new `DatePicker.Calendar` / `RangePicker.Calendar` props plus an ISO-week utility:
  - **`showWeekNumber`** — render an ISO 8601 week-number column (1–53) on the left of the grid. The column uses `<th scope="row" aria-hidden="true">` so it doesn't participate in the WAI-ARIA grid data region; keyboard navigation across date cells is unchanged. New className slots: `weekNumberHeader`, `weekNumber`.
  - **`fixedWeeks`** — when true, always render 6 rows (42 cells) regardless of the month. Useful for popover layouts that need a stable height across month navigation.

  Both also accepted on `CalendarOptions` (the `getCalendarDays` core util gains `fixedWeeks`).

  New core export: **`getISOWeekNumber(iso)`** — pure UTC computation, no date-fns dep. Anchored to the Thursday of the week (so the same week always returns the same number regardless of `weekStartsOn`).

  ```tsx
  <DatePicker value={date} onChange={setDate}>
    <DatePicker.Input />
    <DatePicker.Popover>
      <DatePicker.Calendar showWeekNumber fixedWeeks />
    </DatePicker.Popover>
  </DatePicker>
  ```

  Bundle impact: +0.46 KB ESM gzip (13.96 → 14.42 KB). Still well under the 15 KB ceiling.

- d62c84e: `DisabledRule` gains a programmatic `filter` variant — pass any predicate `(iso: ISODateString) => boolean` to disable arbitrary days that don't fit the declarative `before` / `after` / `dayOfWeek` / `date` rules.

  ```tsx
  const holidays = new Set(['2026-01-01T00:00:00.000Z', '2026-12-25T00:00:00.000Z']);

  <DatePicker
    disabled={[
      { dayOfWeek: [0, 6] }, // weekends
      { filter: (iso) => holidays.has(iso) }, // holidays
    ]}
  >
    …
  </DatePicker>;
  ```

  The new variant slots into the existing `isDateDisabled` evaluation (short-circuits on first match) and works with keyboard-navigation disabled-skip in `DatePicker.Calendar` / `RangePicker.Calendar` with no further changes. Equivalent to `react-datepicker`'s `filterDate` prop and MUI X DatePicker's `shouldDisableDate`. Bundle impact: 0 KB (still 13.96 KB ESM gzip).

## 1.0.0-rc.6

### Patch Changes

- abc56ac: Security: pin transitive `fast-uri` to `>=3.1.2` and `@babel/plugin-transform-modules-systemjs` to `>=7.29.4` via `pnpm.overrides`.

  Resolves three Code Scanning alerts on `pnpm-lock.yaml`:
  - `fast-uri@3.1.0` — [GHSA-v39h-62p7-jpjc](https://osv.dev/GHSA-v39h-62p7-jpjc) (CVE-2026-6322), first patched in `3.1.2`.
  - `fast-uri@3.1.0` — [GHSA-q3j6-qgpj-74h6](https://osv.dev/GHSA-q3j6-qgpj-74h6) (CVE-2026-6321), first patched in `3.1.1`.
  - `@babel/plugin-transform-modules-systemjs@7.29.0` — [GHSA-fv7c-fp4j-7gwp](https://osv.dev/GHSA-fv7c-fp4j-7gwp) (CVE-2026-44728), first patched in `7.29.4` on the 7.x line.

  All three packages are transitive build-time dependencies (ajv → fast-uri, Babel preset-env → systemjs plugin); no public API impact.

## 1.0.0-rc.4

### Patch Changes

- df97687: P1 audit follow-ups for v1.0-rc:
  - **SSR hydration safety in 4 commit/drilldown grids** — `DatePicker.MonthGrid`, `DatePicker.YearGrid`, `MonthPicker.Grid`, and `YearPicker.Grid` previously called `adapter.today()` directly inside their render bodies, producing a server/client clock-mismatch hydration warning across day boundaries (and intermittently wrong "today" highlights in tz-different SSR setups). Today is now snapshotted via `useState(null)` + post-mount `useEffect`, so the server output and the first client render agree, and the highlight settles on the first effect tick.
  - **`AmPmToggle` now follows the WAI-ARIA radiogroup pattern** — Arrow / Home / End / Space / Enter move and commit selection between AM and PM, and `tabIndex` is roving (only the checked radio is in the tab order). Previously both buttons were tabbable and arrow keys were ignored.
  - **`DatePicker.Preset` / `RangePicker.Preset` now use `aria-pressed`** instead of `role="option"` + `aria-selected`. `role="option"` is invalid outside `role="listbox"` / `role="combobox"`, so axe was flagging the previous markup. Active state still appears on `data-active` for CSS targeting.
  - **`RangePicker.Calendar` no longer advertises `aria-multiselectable="true"`** — a date range is one selection (two endpoints), not a multi-select grid.
  - **Test stability** — `useRangePicker` `respects disabled rules` test pinned to April 2026 via `defaultValue` so the calendar grid contains the expected weekend day regardless of the system clock (was failing once the clock crossed into May).
  - **`labels.ts` test coverage** — first unit tests for the default-label exports.

  Behavioral notes for users (none of these are breaking for code that follows the documented `data-*` styling contract):
  - If you targeted Preset buttons via `[aria-selected="true"]` in CSS, switch to `[aria-pressed="true"]` or `[data-active]`.
  - If you targeted the range grid via `[aria-multiselectable]`, that attribute is gone; use `[role="grid"]` on the calendar root instead.

## 1.0.0-rc.3

### Patch Changes

- 3587b13: Remove unused English-hardcoded weekday utilities from `utils/date.ts`:
  - `WEEKDAY_LABELS` (constant)
  - `getOrderedWeekdays()` (function)

  Both were internal exports (never exposed via `@kalyx/core` public `index.ts`) and had no consumers anywhere in the workspace. They were superseded by the locale-aware `getWeekdayNames(locale, weekStartsOn)` in `utils/locale.ts`, which uses `Intl.DateTimeFormat` to produce the same shape with multi-language support.

  No public API surface changed.

## 1.0.0-rc.2

### Patch Changes

- aadb512: Security: pin transitive `postcss` to `>=8.5.10` via `pnpm.overrides`.

  Two `postcss` versions in `pnpm-lock.yaml` (`8.4.31` from a `postcss-load-config` chain and `8.5.9` from the `tsup` chain) were affected by [GHSA-qx2v-qp2m-jg93](https://osv.dev/GHSA-qx2v-qp2m-jg93) (CVSS 6.1 — improper newline handling that lets crafted input bypass quote escapes). Both are now resolved to `8.5.10`+. The OSV scanner workflow (which auto-creates issues #23 / #24 / #27) now reports zero advisories.

- 21f3c1f: Resolve v1.0-rc release-blocking defects (P0):
  - **`"use client"` directive** — bundle is now marked as a React Server Component client boundary via tsup banner. Next.js App Router consumers no longer have to wrap each import.
  - **Stable `today()`/`now()` initialization** — `viewMonth`/`focusedDate` `useState` calls in `DatePicker`/`RangePicker`/`DateTimePicker` Roots now use lazy initializers, so the adapter isn't called on every render.
  - **`@kalyx/core` version sync** — bumped from `1.0.0-rc.0` to `1.0.0-rc.1` to match `@kalyx/react`.
  - **`@kalyx/core` package contents** — `LICENSE` and `CHANGELOG.md` are now included in the npm tarball (`files` field).
  - **Form auto-submit blocked when calendar open** — pressing Enter inside `DatePicker.Input`/`RangePicker.Input`/`DateTimePicker.Input` while the popover is open no longer submits the surrounding `<form>`.
  - **`aria-haspopup="dialog"` on Trigger** — completes the WAI-ARIA combobox/dialog pattern.
  - **Disabled cells skipped during keyboard navigation** — Calendar arrow keys / PageUp/Down / Home / End now step over disabled days and stop only when no enabled day is reachable.

- 3228533: P1 v1.0-rc API/a11y/docs improvements:
  - **Popover focus-out close** — `usePopover` now closes the popover when focus leaves the floating layer and the reference element (Tab through). Matches the Radix/Ark dismissable layer pattern.
  - **`name` prop + hidden form input** — `DatePicker.Input` accepts a `name` prop. When set, a hidden `<input type="hidden">` is rendered alongside the visible input so the value participates in native form submission and integrates with `react-hook-form` Controller-less flows.
  - **IME composition handling** — `DatePicker.Input` now defers parsing during IME composition (`compositionstart` / `compositionend`). Previously, partial Korean / Japanese / Chinese input was repeatedly re-parsed and the user's text disappeared.
  - **README parity** — Korean README now has the "Styling with Tailwind CSS" and "Using data attributes" sections that were missing. Version table and bundle-size claim corrected to `v1.0.0-rc.1` / `11.57 KB`.
  - **Package metadata** — `peerDependenciesMeta`, `engines.node`, and `publishConfig.provenance` added to both `@kalyx/react` and `@kalyx/core`.
  - **`@kalyx/react` description** — corrected from "under 10 KB gzipped" (false claim) to "≤12 KB gzipped".

- b6129ed: P2 polish for v1.0-rc:
  - **Calendar grid `aria-rowindex` / `aria-colindex` / `aria-rowcount` / `aria-colcount`** — `DatePicker.Calendar` and `RangePicker.Calendar` now expose grid coordinates so screenreaders announce position ("row 3 of 6, column 4 of 7") during keyboard navigation.
  - **`displayName` on all `forwardRef` components** — `DatePicker.Input`, `DatePicker.Trigger`, `RangePicker.Input`, `TimePicker.Input`, `DateTimePicker.Input` now render with their public dot-notation name in React DevTools.
  - **JSDoc on `DatePicker.Input` and `DatePicker.Trigger`** — public API surface for the most-used components has explanatory docstrings.
  - **`addYears` leap-day regression tests** — locked the date-fns clamp behavior (2024-02-29 + 1y → 2025-02-28, not March 1).
  - **DST fall-back ambiguous-hour regression test** — captures the current behavior of `setTimeInTimezone` for 2026-11-01 01:30 America/New_York so silent drift surfaces as a test failure.
  - **Test count claim corrected** — root and core `CLAUDE.md` previously claimed "1,000+ unit tests"; actual count is ~140 in core, 374 across the workspace.

## 1.0.0-rc.0

### Major Changes

- ca7180e: chore: v1.0 milestone — API freeze.

  Kalyx v1.0 declares the public API stable. This is a milestone release bundling the v0.5 surface additions (MonthPicker, YearPicker, WeekPicker, DatePicker.Presets, `onOpenChange`/`onCalendarNavigate` event callbacks) with an explicit commitment to semantic versioning going forward.

  ### What v1.0 commits to
  - **Public API surface** — exports from `@kalyx/react` and `@kalyx/core` listed in their `index.ts` files. Any breaking change requires a major bump.
  - **Compositional structure** — Root + subcomponent names (`DatePicker.Input`, `DatePicker.Calendar`, …) are stable. Removal or renaming requires a major bump.
  - **Value semantics** — ISO 8601 UTC strings for single dates, `DateRange` `{start, end}` for ranges. `displayTimezone` behavior (civil-midnight-in-tz for date selection) is stable.
  - **Accessibility contracts** — role/aria-\* attributes emitted by each component are stable.

  ### What v1.0 does NOT freeze
  - Internal implementation details (non-exported functions, component file layout).
  - CSS class name strings on elements — no classes are applied by default; only when a consumer passes them via `classNames` props.
  - Error message text.
  - Peer dependency version ranges (may expand to cover new React majors).

  ### Breaking changes vs 0.4.x

  None. v1.0 is API-compatible with 0.4.x — existing code continues to work. The major bump communicates stability commitment, not breakage.

## 0.4.0

### Minor Changes

- 104bbf2: feat: full `displayTimezone` support across all pickers (v0.4)

  All four pickers (`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`) and their corresponding hooks (`useDatePicker`, `useRangePicker`, `useTimePicker`) now accept a `displayTimezone` prop/option.

  When set, the value stored via `onChange` is the **civil midnight of the selected day in the target timezone** (in UTC-ISO form), eliminating the classic "day off by one" bug that affects picker libraries bound to `new Date()`. Input formatting, calendar highlighting, and the time-of-day controls all follow the display timezone — including DST-aware offsets for zones like `America/New_York` and `Europe/London`.

  `DateFnsAdapter` now honors the `timezone` argument on `format`, `isSameDay`, `startOfDay`, and `today` (previously declared-but-ignored). Core also exposes new helpers:
  - `civilMidnightFromUtcDay(iso, tz)`
  - `getTimeInTimezone(iso, tz)`
  - `setTimeInTimezone(iso, partial, tz)`

  No breaking changes — omitting `displayTimezone` keeps the existing UTC semantics.

### Patch Changes

- b3a8897: perf: mark `@kalyx/core` as `sideEffects: false` so downstream bundlers can tree-shake unused exports. Safe because the package is purely functional (no module-level side effects).

## 0.3.0

### Minor Changes

- 669391b: Improve code quality, performance, and stability
  - Enforce UTC timezone suffix in ISO regex
  - Extract shared usePopover and useListboxNavigation hooks
  - Add Intl.DateTimeFormat caching for locale/timezone utilities
  - Memoize disabledRules to prevent unnecessary context re-creation
  - Add try-catch around adapter.format() for error resilience
  - Cancel requestAnimationFrame on unmount in listbox navigation
  - Remove unused parseInputValue format parameter
  - Boost test coverage: 87% → 92%
  - Fix bundle size measurement to report both ESM and CJS

## 0.2.2

### Patch Changes

- ebf4fd7: Add repository/homepage/bugs/keywords metadata to @kalyx/core for npm provenance validation

## 0.2.1

### Patch Changes

- fe0e63e: Add full documentation site (Docusaurus, EN/KO), rewrite READMEs for npm, fix CI pnpm version to 10

## 0.2.0

### Minor Changes

- e9bb9e8: Initial release of Kalyx — headless, SSR-safe React DatePicker library.

  Features:
  - DatePicker: single date selection with Calendar, Input, Trigger, Popover
  - RangePicker: date range selection with auto-swap and hover preview
  - TimePicker: 12h/24h mode, minute step, HourList/MinuteList/AmPmToggle
  - DateTimePicker: combined date+time via context bridging (reuses existing components)
  - useDatePicker, useRangePicker, useTimePicker hooks for custom UIs
  - WAI-ARIA compliant: grid, dialog, combobox, listbox, radiogroup patterns
  - SSR safe: verified with Next.js 15 App Router
  - Zero CSS: style with classNames prop and data-\* attributes
  - ISO 8601 UTC strings only (no native Date objects)
  - Bundle: 7.71KB gzip (target ≤12KB)
  - 185 unit/integration tests passing
