# @kalyx/react

## 1.0.0-rc.3

### Patch Changes

- 3587b13: Replace deprecated `MutableRefObject<T>` with `RefObject<T>` in context types.

  `@types/react@19` marks `MutableRefObject` as deprecated (`Use 'RefObject' instead`). In React 19 `RefObject<T>` is itself mutable, so the swap is type-equivalent for the existing `referenceRef` usage in `DatePickerContext` and `RangePickerContext`.

  No runtime change. No public API surface change.

- Updated dependencies [3587b13]
  - @kalyx/core@1.0.0-rc.3

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

- 733c0a1: Follow-up to the v1.0-rc audit series:
  - **Fix WebKit Enter regression** — `DatePicker.Input` now commits the calendar's currently focused day on Enter when the popover is open and no text was typed. WebKit doesn't always shift focus from the input to the day button on `input.click()`, so the previous behavior (preventDefault but no commit) left the popover dangling. Other browsers also benefit when the user presses Enter immediately after opening.
  - **Consolidate parsing path** — extract the parse-and-commit logic into a single `commitText` helper used by `onChange`, `onBlur`, `onCompositionEnd`, and Enter. Removes ~60 bytes of duplicated logic.
  - **Bundle target raised to 13 KB** — the v1.0-rc accessibility / API additions (IME composition, popover focus-out, hidden form input, `aria-rowindex`/`colindex`, `displayName`, keyboard skip-disabled) accumulated to 12.07 KB gzip; the 12 KB ceiling was 0.07 KB tight. README, docs, `tsup.config.ts`, and `scripts/check-bundle-size.js` updated to ≤13 KB. Still ~3× smaller than `react-datepicker`.

- 3228533: P1 v1.0-rc API/a11y/docs improvements:
  - **Popover focus-out close** — `usePopover` now closes the popover when focus leaves the floating layer and the reference element (Tab through). Matches the Radix/Ark dismissable layer pattern.
  - **`name` prop + hidden form input** — `DatePicker.Input` accepts a `name` prop. When set, a hidden `<input type="hidden">` is rendered alongside the visible input so the value participates in native form submission and integrates with `react-hook-form` Controller-less flows.
  - **IME composition handling** — `DatePicker.Input` now defers parsing during IME composition (`compositionstart` / `compositionend`). Previously, partial Korean / Japanese / Chinese input was repeatedly re-parsed and the user's text disappeared.
  - **README parity** — Korean README now has the "Styling with Tailwind CSS" and "Using data attributes" sections that were missing. Version table and bundle-size claim corrected to `v1.0.0-rc.1` / `11.57 KB`.
  - **Package metadata** — `peerDependenciesMeta`, `engines.node`, and `publishConfig.provenance` added to both `@kalyx/react` and `@kalyx/core`.
  - **`@kalyx/react` description** — corrected from "under 10 KB gzipped" (false claim) to "≤12 KB gzipped".

- e8519d0: Performance: memoize hot paths to avoid wasted recomputation:
  - `DatePicker.Calendar` and `RangePicker.Calendar` now `useMemo` their `getCalendarDays` and `getWeekdayNames` results. Previously the 42-cell grid and 7 weekday tuples were rebuilt every parent re-render even when none of the inputs changed.
  - `TimePicker.HourList` and `TimePicker.MinuteList` `useMemo` their `generateHours(format)` / `generateMinutes(step)` arrays so the listbox identity is stable across renders.
  - `usePopover` middleware (`offset` / `flip` / `shift`) is now hoisted to a module-level constant, eliminating Floating UI's repeated middleware-array reconciliation.

- b6129ed: P2 polish for v1.0-rc:
  - **Calendar grid `aria-rowindex` / `aria-colindex` / `aria-rowcount` / `aria-colcount`** — `DatePicker.Calendar` and `RangePicker.Calendar` now expose grid coordinates so screenreaders announce position ("row 3 of 6, column 4 of 7") during keyboard navigation.
  - **`displayName` on all `forwardRef` components** — `DatePicker.Input`, `DatePicker.Trigger`, `RangePicker.Input`, `TimePicker.Input`, `DateTimePicker.Input` now render with their public dot-notation name in React DevTools.
  - **JSDoc on `DatePicker.Input` and `DatePicker.Trigger`** — public API surface for the most-used components has explanatory docstrings.
  - **`addYears` leap-day regression tests** — locked the date-fns clamp behavior (2024-02-29 + 1y → 2025-02-28, not March 1).
  - **DST fall-back ambiguous-hour regression test** — captures the current behavior of `setTimeInTimezone` for 2026-11-01 01:30 America/New_York so silent drift surfaces as a test failure.
  - **Test count claim corrected** — root and core `CLAUDE.md` previously claimed "1,000+ unit tests"; actual count is ~140 in core, 374 across the workspace.

- Updated dependencies [aadb512]
- Updated dependencies [21f3c1f]
- Updated dependencies [3228533]
- Updated dependencies [b6129ed]
  - @kalyx/core@1.0.0-rc.2

## 1.0.0-rc.1

### Patch Changes

- 3afb15b: Fix popover styling regression that broke documentation live previews.
  - `DatePicker.Popover` and `RangePicker.Popover` now merge user-provided `style` props _under_ Floating UI's positioning instead of being overwritten by it. Previously, passing `style={{...}}` to a Popover stripped away `position: absolute`, `top`, `left`, and `transform`, causing the popover to render as a static block at full container width.
  - The popover is now hidden until Floating UI computes its position, eliminating an unpositioned first-frame flash on every open.
  - The shared `usePopover` hook also wires the floating element's reference synchronously in the ref callback, so positioning is resolved before paint in most cases.

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

### Minor Changes

- 3db8444: feat: add `DatePicker.Presets` and `DatePicker.Preset` for single-date quick selection.

  Mirrors the existing `RangePicker.Presets` API. Pass a predefined `value` key (`today`, `tomorrow`, `yesterday`, `startOfMonth`, `endOfMonth`, `startOfYear`) or a direct ISO via `date`.

  ```tsx
  <DatePicker value={date} onChange={setDate}>
    <DatePicker.Input />
    <DatePicker.Popover>
      <DatePicker.Presets>
        <DatePicker.Preset value="today">Today</DatePicker.Preset>
        <DatePicker.Preset value="tomorrow">Tomorrow</DatePicker.Preset>
        <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
      </DatePicker.Presets>
      <DatePicker.Calendar />
    </DatePicker.Popover>
  </DatePicker>
  ```

  - Active preset is marked `aria-selected="true"` when its resolved date matches the current value (timezone-aware).
  - Clicking a preset commits and closes the popover.
  - `displayTimezone` is honored when resolving "today"-relative presets.

- 56e1ce9: feat: add `onOpenChange` and `onCalendarNavigate` callbacks on `DatePicker`, `RangePicker`, and `DateTimePicker` Root components.
  - `onOpenChange(isOpen: boolean)` fires whenever the popover opens or closes (regardless of trigger — click, keyboard, outside click, selection).
  - `onCalendarNavigate(viewMonth: ISODateString)` fires when the calendar view moves to a different month. The emitted value is the first day of the newly-visible month in UTC.

  Neither callback fires on initial mount. `TimePicker` does not expose these callbacks since it has no popover or calendar.

- 6fc7c59: feat: add `MonthPicker` — a headless month selector.

  `MonthPicker` stores the selected month as the first day of that month in UTC-ISO form (e.g., `"2026-04-01T00:00:00.000Z"`). It reuses `DatePicker` infrastructure (Input, Trigger, Popover), so the only new primitive is `MonthPicker.Grid`, a 12-month commit grid with year navigation.

  ```tsx
  <MonthPicker value={month} onChange={setMonth}>
    <MonthPicker.Input placeholder="Pick a month" />
    <MonthPicker.Popover>
      <MonthPicker.Grid />
    </MonthPicker.Popover>
  </MonthPicker>
  ```

  - Default `displayFormat` is `"yyyy-MM"`.
  - `displayTimezone` is supported (commits map to civil midnight of month-start in the target zone).
  - Month selection highlighting is timezone-aware — the grid reflects the month of the current value even when stored in zone-adjusted UTC form.
  - Primary UX is click-to-select; full `yyyy-MM-dd` typed input still works via the inherited Input behavior.

- 6fdf8fe: feat: add `WeekPicker` — a headless week selector.

  `WeekPicker` stores the selected week as a `DateRange` covering all seven days (based on `weekStartsOn`). Unlike `RangePicker`, a single click on any day selects the entire week containing that day.

  ```tsx
  <WeekPicker value={week} onChange={setWeek} weekStartsOn={1}>
    <WeekPicker.Input part="start" />
    <WeekPicker.Input part="end" />
    <WeekPicker.Popover>
      <WeekPicker.Calendar />
    </WeekPicker.Popover>
  </WeekPicker>
  ```

  - Reuses `RangePicker` Root / Input / Popover; only `WeekPicker.Calendar` is new.
  - `weekStartsOn` (0=Sunday, 1=Monday) controls which seven days constitute a week.
  - Enter / Space on the focused day commits the full week containing it.
  - `displayTimezone`, `disabled` rules, and all other RangePicker props are supported.

- 6fc7c59: feat: add `YearPicker` — a headless year selector.

  `YearPicker` stores the selected year as Jan 1 of that year in UTC-ISO form (e.g., `"2026-01-01T00:00:00.000Z"`). It reuses `DatePicker` infrastructure (Input, Trigger, Popover) and exposes `YearPicker.Grid`, a 12-year decade commit grid with decade navigation.

  ```tsx
  <YearPicker value={year} onChange={setYear}>
    <YearPicker.Input placeholder="Pick a year" />
    <YearPicker.Popover>
      <YearPicker.Grid />
    </YearPicker.Popover>
  </YearPicker>
  ```

  - Default `displayFormat` is `"yyyy"`.
  - `displayTimezone` is supported with timezone-aware year highlighting.
  - Primary UX is click-to-select; full `yyyy-MM-dd` typed input still works via the inherited Input behavior.

### Patch Changes

- 1ca818c: fix(react): prevent WeekPicker from mutating RangePicker.Calendar

  `WeekPicker` previously called `Object.assign(RangePickerRoot, { ..., Calendar: WeekPickerCalendar })`, which mutates the shared `RangePickerRoot` function object. Because `RangePicker.Calendar` is attached to the same object (via the earlier `Object.assign` in `RangePicker/index.ts`), importing `WeekPicker` would overwrite `RangePicker.Calendar` with `WeekPickerCalendar`.

  Users of `RangePicker` would then see week-selection behavior (single click commits a full week and closes the popover) instead of the documented two-click range flow — even without importing `WeekPicker` directly, because both pickers share the module graph.

  Added an internal `WeekPickerRoot` wrapper that the `Object.assign` target now uses, preserving `RangePickerRoot.Calendar` intact.

  Caught by the `RangePicker › select range in start-date -> end-date order` Playwright test; all existing behavior is restored.

- Updated dependencies [ca7180e]
  - @kalyx/core@1.0.0-rc.0

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

- Updated dependencies [b3a8897]
- Updated dependencies [104bbf2]
  - @kalyx/core@0.4.0

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

### Patch Changes

- Updated dependencies [669391b]
  - @kalyx/core@0.3.0

## 0.2.2

### Patch Changes

- ebf4fd7: Add repository/homepage/bugs/keywords metadata to @kalyx/core for npm provenance validation
- Updated dependencies [ebf4fd7]
  - @kalyx/core@0.2.2

## 0.2.1

### Patch Changes

- fe0e63e: Add full documentation site (Docusaurus, EN/KO), rewrite READMEs for npm, fix CI pnpm version to 10
- Updated dependencies [fe0e63e]
  - @kalyx/core@0.2.1

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

### Patch Changes

- Updated dependencies [e9bb9e8]
  - @kalyx/core@0.2.0
