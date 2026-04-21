# @kalyx/core

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
