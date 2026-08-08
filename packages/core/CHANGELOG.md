# @kalyx/core

## 1.4.6

### Patch Changes

- 503396d: Reject impossible adapter dates and out-of-range programmatic time values, keep every picker and headless hook usable when external state contains an invalid date, enforce month-start/year-start values for typed MonthPicker and YearPicker commits, reject weeks containing any disabled civil day, submit ISO values from every named picker input, and include the advertised license in every adapter tarball.

## 1.4.5

### Patch Changes

- 68a780c: Stop a malformed `value` from crashing the whole React tree.

  `value` and `defaultValue` normally arrive from a form field or a database row, so an
  empty or unparseable string is data rather than a programming error. It used to throw
  `RangeError: Invalid time value` during render and unmount the entire tree; under
  `renderToString` a single bad row became a 500.

  The crash had three layers:

  - **View seed** — every Root and headless hook passed the raw value to
    `adapter.startOfDay()`, which builds its result from `new Date(value).toISOString()`.
    Six of the seven pickers and six of the seven hooks were affected; `TimePicker` and
    `useTimePicker` already parsed defensively. Note that `''` is not nullish, so an empty
    form field slipped past the existing `?? adapter.today()` fallback.
  - **Comparison layer** — `getCalendarDays` handed `selected` / `focusedDate` / `range` to
    `isSameDay(..., timezone)`, reaching `Intl.DateTimeFormat.formatToParts(Invalid Date)`.
    It now treats an unparseable value as absent: a flag that cannot be computed is `false`.
    This also covers headless consumers calling `getCalendarDays` directly.
  - **Time extraction** — `getTimeInTimezone(value, timezone)` took the same path in
    `TimePicker` and `DateTimePicker`.

  The last two only triggered with `displayTimezone` set.

  The view now falls back to the current month when the value cannot be parsed. The value
  itself is left untouched and `Input` displays it verbatim, so the mistake stays visible
  instead of being silently swallowed. Previously `Input` intended this via a `try/catch`,
  but adapters render an unparseable value as `"NaN-NaN-NaN"` rather than throwing, so that
  fallback never ran and users saw `NaN-NaN-NaN` in the field.

## 1.4.2

### Patch Changes

- a0c73f5: Preserve calendar dates in UTC+12 through UTC+14 display timezones and keep month navigation focus on enabled, rendered days.

  Month navigation now follows the direction you travelled, so a fully disabled month no longer traps the calendar: stepping back past it continues into earlier months instead of returning to the month you came from. `useRangePicker`, `useWeekPicker`, and `useDateTimePicker` resolve their focus target the same way as the components and no longer focus a disabled day after navigating.

## 1.4.1

### Patch Changes

- 0f7b368: Correct calendar civil-day identity in display timezones and enforce disabled date and time constraints consistently across picker components, presets, keyboard interactions, context mutations, and headless hooks.

  > **Added retroactively (2026-08-06).** The entry above understated the release:
  > correcting the civil-day identity also changed what these functions return for
  > callers who set a `timezone`. If you consume `@kalyx/core` directly — custom
  > grids, your own disabled logic — the following are behavior changes, not just
  > bug fixes:
  >
  > - **`getCalendarDays` flag basis.** `isToday`, `isSelected`, `isFocused`,
  >   `isDisabled` and the range flags are now evaluated against each cell's
  >   civil-midnight instant in `timezone` rather than its raw UTC coordinate.
  >   Under a non-zero UTC offset these flags can land on a different cell than
  >   in 1.4.0 — which is the point, but custom renderers will see the shift.
  >   `CalendarDay.isoString` still carries the raw UTC coordinate, so it is not
  >   interchangeable with the value the flags were computed from.
  > - **`isDateDisabled` gained a 4th parameter,** `timezone?: string`. Existing
  >   3-argument calls are unaffected. When you do pass a zone, `{ date }` and
  >   `{ dayOfWeek }` match by civil day, and the `iso` you pass must be an
  >   instant of the kind the pickers emit — a hand-written `…T00:00:00.000Z` is
  >   a UTC coordinate and will resolve to the wrong civil day under a non-zero
  >   offset. `{ before }` / `{ after }` remain instant comparisons.

## 1.4.0

### Minor Changes

- d40ae7e: feat(timepicker): localize AM/PM labels + add `locale` prop

  - `@kalyx/core`: new `getDayPeriodName(period, locale)` util returning the
    localized day-period label via `Intl.DateTimeFormat` (en-US → AM/PM,
    ko-KR → 오전/오후, ja-JP → 午前/午後).
  - `@kalyx/react`: `TimePicker` gains a `locale` prop, and `TimePicker.AmPmToggle`
    now renders the localized day-period label (the underlying value/logic stays
    ASCII `'AM' | 'PM'`; only the visible text + aria-label are localized).
    `DateTimePicker` forwards its existing `locale` to the AM/PM toggle.

  Backwards-compatible: defaults to `en-US` → "AM"/"PM" as before.

## 1.2.0

### Minor Changes

- 24b09c7: Infer `weekStartsOn` from the active `locale` when the prop is not set (B7).

  `@kalyx/core` now exports `getWeekStartForLocale(locale)`, which reads `Intl.Locale(locale).weekInfo.firstDay` and maps it to the `WeekStartsOn` surface (`0 | 1`) — Sunday-first locales (e.g. `en-US`, `ja-JP`, `ko-KR`) resolve to `0`, Monday-first locales (e.g. `en-GB`, `de-DE`, `fr-FR`) to `1`. It caches per-locale and falls back to `0` on engines without `weekInfo` or for unparseable tags.

  `DatePicker` and `RangePicker` (and the `MonthPicker`/`YearPicker` wrappers built on `DatePicker.Root`) now default `weekStartsOn` to the locale's first day instead of always Sunday. An explicit `weekStartsOn` prop still wins, so existing pinned usage is unchanged. Consumers that relied on the implicit Sunday default while passing a Monday-first `locale` will now see Monday-first weeks — pass `weekStartsOn={0}` to restore the old behavior.

## 1.1.0

### Minor Changes

- 96993f5: Add `@kalyx/core/test-helpers` — a framework-agnostic adapter **conformance suite**. `runAdapterConformanceTests(adapter, { describe, it, expect })` executes the full `DateAdapter` contract (UTC / ISO-8601 semantics across all 22 methods) so any adapter — the built-in `@kalyx/adapter-date-fns` and future dayjs / luxon / Temporal adapters — can prove it conforms with a single call. Zero runtime footprint (type-only import, separate `./test-helpers` entry) and no effect on the `@kalyx/react` bundle.

### Patch Changes

- eb44024: Fix `startOfDayInTimezone` returning an instant one hour early on a DST-transition day. It took a single UTC-offset probe at "civil-midnight-as-UTC", which can land on the wrong side of a transition (e.g. Australia/Sydney springing forward on Oct 1: 00:00 local is still AEST +10, but 00:00 UTC reads as post-transition AEDT +11). It now delegates to `setTimeInTimezone`'s two-pass DST disambiguation, so civil midnight is correct on transition days; this also flows through `todayInTimezone` and `civilMidnightFromUtcDay`. Surfaced by the new fast-check property suite.

## 1.0.2

### Patch Changes

- 66bd6dc: fix(timezone): snap forward for non-existent civil times in DST gaps; document deterministic disambiguation

  `setTimeInTimezone` previously returned a pre-transition instant when the
  requested civil time fell in a DST spring-forward gap. Asking for
  `2026-03-08 02:30 America/New_York` — which does not exist because clocks jump
  02:00 EST → 03:00 EDT — returned `2026-03-08T06:30:00.000Z` (= 01:30 EST, an
  hour before the gap), silently corrupting the user's intent.

  `setTimeInTimezone` now classifies its two-pass offset candidates by whether
  their civil round-trip matches the requested civil time, and:

  - **Spring-forward gap** (neither candidate matches): snap forward to the
    later candidate — the first valid civil instant past the gap. `2026-03-08
02:30 America/New_York` now returns `2026-03-08T07:30:00.000Z` (= 03:30
    EDT).
  - **Fall-back ambiguity** (both candidates match): pick the earlier instant
    (EDT before EST in US Eastern, BST before GMT in Europe/London). Matches
    `@internationalized/date` and the TC39 Temporal default
    (`disambiguation: 'earlier'`).
  - **Single-match** (one candidate matches, near a transition): return the
    matching candidate. This was the source of intermittent off-by-one-hour
    drift near transitions.

  The JSDoc above `setTimeInTimezone` now documents the policy explicitly. The
  existing ambiguous-hour test was tightened from
  `expect([...]).toContain(result)` (two-valid-answers) to an exact-equality
  assertion against the documented choice.

  Audit reference: `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md`
  (items T-D1, T-D2).

- 288b2ed: fix(a11y): stop Escape from bubbling out of the picker when the popover is open

  When a Kalyx picker (DatePicker / RangePicker / DateTimePicker / MonthPicker /
  YearPicker / WeekPicker) is mounted inside a host modal or dialog with its own
  Escape handler, a single Escape press used to close BOTH the picker and the
  modal. The picker now calls `preventDefault()` and `stopPropagation()` on the
  synthetic Escape in its Input and Calendar/Grid key handlers (and on the
  native document-level listener inside `usePopover`), so Escape stays scoped to
  the picker when it would have closed the popover. When the popover is closed,
  Escape still propagates normally to parent handlers.

  Audit reference: `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md`
  (items A-D1, A-D2).

## 1.0.0

### Major Changes

- 5b6c37f: Extract `@kalyx/adapter-date-fns` and make `@kalyx/core` neutral

  Step 1 + 2 of the four-step adapter-extraction plan (see `.claude/skills/adapter-extraction.md`). After this change, `@kalyx/core` no longer depends on `date-fns` or `date-fns-tz`; it ships only the platform-agnostic date logic (`getCalendarDays`, `isDateDisabled`, timezone helpers, labels, the `DateAdapter` contract). The DateFnsAdapter implementation now lives in its own publishable package so dayjs / luxon / Temporal adapters can be added later without forcing every Kalyx user to bundle two date libraries.

  ### What changed
  - **`@kalyx/core`** — `DateFnsAdapter` is no longer exported and `date-fns` / `date-fns-tz` are no longer listed as dependencies. `utils/timezone.ts` was the lone leak and uses native `new Date(string)` now (every caller already routes through `normalizeISO` or `DateAdapter.parse`, so the input subset is fully spec-defined).
  - **`@kalyx/adapter-date-fns`** — new package with the full `DateFnsAdapter` implementation moved verbatim. Same UTC semantics, same timezone-aware paths, same 35 adapter tests.
  - **`@kalyx/react`** — imports `DateFnsAdapter` from `@kalyx/adapter-date-fns` now. The default adapter is still wired up automatically — anyone using `import { DatePicker } from '@kalyx/react'` keeps the previous behaviour with zero changes. The adapter package is a direct dependency so consumers installing just `@kalyx/react` continue to get a working default.

  ### Migration

  If you imported `DateFnsAdapter` directly from `@kalyx/core`:

  ```diff
  - import { DateFnsAdapter } from '@kalyx/core';
  + import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
  ```

  `@kalyx/react` consumers don't need to change anything — the adapter is still re-exported from `@kalyx/react`.

  ### Next (separate PR)

  The `/headless` entry point (`@kalyx/react/headless`) that lets dayjs/luxon users tree-shake date-fns out is a follow-up. The component Roots still default to the date-fns adapter inline; the entry split requires moving that fallback out of each Root and into the entry boundary.

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

- 4629384: chore(oss): unify node engines to >=20 and add public repository metadata
  - `@kalyx/react` and `@kalyx/core` now require Node `>=20`, matching the root workspace and CI. This was the de-facto requirement; only the published manifests still claimed `>=18`.
  - Root `package.json` now exposes `homepage`, `repository`, and `bugs` so `npm info` and the npm registry page link back to the GitHub repo.
  - `.github/PULL_REQUEST_TEMPLATE.md` bundle ceiling updated `15KB → 16 KB` to match the post-rc.8 limit advertised in README and CI.
  - `.gitignore` ignores `.codegraph/`, `.serena/`, and `.tmp-*/` (MCP server caches and worktree scratchpads).

- c8a6609: fix(rangepicker): announce next selection target and final range to screen readers

  `<RangePicker.Calendar>` now announces context-aware messages through its existing `role="status"` live region:
  - After the first click (start), it announces `<formatted-date>. Now select end date.` so screen-reader users know the next click commits the other endpoint.
  - After the second click (end), it announces `Range selected: <start> – <end>` instead of just the bare date — matching the swap-if-before behaviour so the announcement always reflects what was committed.
  - Week-mode commits now share the same `Range selected: ...` prefix for consistency.

  The two new strings are wired through `RangePickerLabels.selectingEnd` and `RangePickerLabels.rangeSelected` with English defaults, and they are fully overridable via the existing `labels` prop for i18n. `@kalyx/core` gets a `minor` bump because `RangePickerLabels` gained required fields (with defaults supplied by `DEFAULT_RANGEPICKER_LABELS`); any consumer constructing a literal `RangePickerLabels` from scratch will need to add the two keys.

### Patch Changes

- 19ac1c0: fix(core): allow `generateMinutes` step values up to 60

  `generateMinutes(step)` rejected any step above 30, which prevented legitimate cases like `step=45` (quarter-and-three-quarters past the hour) and `step=60` (on-the-hour only). The slot-generation loop already works for any 1–60 integer, so the upper bound is now 60 with the same error message format. Steps `0`, `61+`, and negative values still throw. No callers in `@kalyx/react` relied on the previous narrower bound.

- 3587b13: Remove unused English-hardcoded weekday utilities from `utils/date.ts`:
  - `WEEKDAY_LABELS` (constant)
  - `getOrderedWeekdays()` (function)

  Both were internal exports (never exposed via `@kalyx/core` public `index.ts`) and had no consumers anywhere in the workspace. They were superseded by the locale-aware `getWeekdayNames(locale, weekStartsOn)` in `utils/locale.ts`, which uses `Intl.DateTimeFormat` to produce the same shape with multi-language support.

  No public API surface changed.

- abc56ac: Security: pin transitive `fast-uri` to `>=3.1.2` and `@babel/plugin-transform-modules-systemjs` to `>=7.29.4` via `pnpm.overrides`.

  Resolves three Code Scanning alerts on `pnpm-lock.yaml`:
  - `fast-uri@3.1.0` — [GHSA-v39h-62p7-jpjc](https://osv.dev/GHSA-v39h-62p7-jpjc) (CVE-2026-6322), first patched in `3.1.2`.
  - `fast-uri@3.1.0` — [GHSA-q3j6-qgpj-74h6](https://osv.dev/GHSA-q3j6-qgpj-74h6) (CVE-2026-6321), first patched in `3.1.1`.
  - `@babel/plugin-transform-modules-systemjs@7.29.0` — [GHSA-fv7c-fp4j-7gwp](https://osv.dev/GHSA-fv7c-fp4j-7gwp) (CVE-2026-44728), first patched in `7.29.4` on the 7.x line.

  All three packages are transitive build-time dependencies (ajv → fast-uri, Babel preset-env → systemjs plugin); no public API impact.

- aadb512: Security: pin transitive `postcss` to `>=8.5.10` via `pnpm.overrides`.

  Two `postcss` versions in `pnpm-lock.yaml` (`8.4.31` from a `postcss-load-config` chain and `8.5.9` from the `tsup` chain) were affected by [GHSA-qx2v-qp2m-jg93](https://osv.dev/GHSA-qx2v-qp2m-jg93) (CVSS 6.1 — improper newline handling that lets crafted input bypass quote escapes). Both are now resolved to `8.5.10`+. The OSV scanner workflow (which auto-creates issues #23 / #24 / #27) now reports zero advisories.

- 0556886: fix(core): validate inputs to `to12Hour` and `to24Hour`

  `to12Hour(hours24)` and `to24Hour(hours12, period)` are public exports from `@kalyx/core` but had no input validation. The previous silent arithmetic mapped invalid inputs onto plausible-looking but wrong outputs and hid caller bugs:
  - `to12Hour(24)` returned `{ hours12: 12, period: 'PM' }` (because `24 % 12 = 0` → mapped to 12)
  - `to12Hour(-1)` returned `{ hours12: -1, period: 'AM' }`
  - `to24Hour(13, 'PM')` returned `25`
  - `to24Hour(0, 'AM')` returned `0` (but `0` is not a valid 12-hour clock value — midnight is `12 AM`)

  Both functions now throw `RangeError` with a clear message when the input is outside its valid integer range (`[0, 23]` for `to12Hour`, `[1, 12]` for `to24Hour`). `Number.isInteger` guards non-integers and `NaN`. No `@kalyx/react` callers ever passed invalid values, so the internal contracts are unchanged; only direct `@kalyx/core` users who relied on the silent-wrong behaviour see the new exception.

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

## 1.0.0-rc.13

### Major Changes

- 5b6c37f: Extract `@kalyx/adapter-date-fns` and make `@kalyx/core` neutral

  Step 1 + 2 of the four-step adapter-extraction plan (see `.claude/skills/adapter-extraction.md`). After this change, `@kalyx/core` no longer depends on `date-fns` or `date-fns-tz`; it ships only the platform-agnostic date logic (`getCalendarDays`, `isDateDisabled`, timezone helpers, labels, the `DateAdapter` contract). The DateFnsAdapter implementation now lives in its own publishable package so dayjs / luxon / Temporal adapters can be added later without forcing every Kalyx user to bundle two date libraries.

  ### What changed
  - **`@kalyx/core`** — `DateFnsAdapter` is no longer exported and `date-fns` / `date-fns-tz` are no longer listed as dependencies. `utils/timezone.ts` was the lone leak and uses native `new Date(string)` now (every caller already routes through `normalizeISO` or `DateAdapter.parse`, so the input subset is fully spec-defined).
  - **`@kalyx/adapter-date-fns`** — new package with the full `DateFnsAdapter` implementation moved verbatim. Same UTC semantics, same timezone-aware paths, same 35 adapter tests.
  - **`@kalyx/react`** — imports `DateFnsAdapter` from `@kalyx/adapter-date-fns` now. The default adapter is still wired up automatically — anyone using `import { DatePicker } from '@kalyx/react'` keeps the previous behaviour with zero changes. The adapter package is a direct dependency so consumers installing just `@kalyx/react` continue to get a working default.

  ### Migration

  If you imported `DateFnsAdapter` directly from `@kalyx/core`:

  ```diff
  - import { DateFnsAdapter } from '@kalyx/core';
  + import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
  ```

  `@kalyx/react` consumers don't need to change anything — the adapter is still re-exported from `@kalyx/react`.

  ### Next (separate PR)

  The `/headless` entry point (`@kalyx/react/headless`) that lets dayjs/luxon users tree-shake date-fns out is a follow-up. The component Roots still default to the date-fns adapter inline; the entry split requires moving that fallback out of each Root and into the entry boundary.

## 1.0.0-rc.12

### Patch Changes

- 0556886: fix(core): validate inputs to `to12Hour` and `to24Hour`

  `to12Hour(hours24)` and `to24Hour(hours12, period)` are public exports from `@kalyx/core` but had no input validation. The previous silent arithmetic mapped invalid inputs onto plausible-looking but wrong outputs and hid caller bugs:
  - `to12Hour(24)` returned `{ hours12: 12, period: 'PM' }` (because `24 % 12 = 0` → mapped to 12)
  - `to12Hour(-1)` returned `{ hours12: -1, period: 'AM' }`
  - `to24Hour(13, 'PM')` returned `25`
  - `to24Hour(0, 'AM')` returned `0` (but `0` is not a valid 12-hour clock value — midnight is `12 AM`)

  Both functions now throw `RangeError` with a clear message when the input is outside its valid integer range (`[0, 23]` for `to12Hour`, `[1, 12]` for `to24Hour`). `Number.isInteger` guards non-integers and `NaN`. No `@kalyx/react` callers ever passed invalid values, so the internal contracts are unchanged; only direct `@kalyx/core` users who relied on the silent-wrong behaviour see the new exception.

## 1.0.0-rc.11

### Minor Changes

- c8a6609: fix(rangepicker): announce next selection target and final range to screen readers

  `<RangePicker.Calendar>` now announces context-aware messages through its existing `role="status"` live region:
  - After the first click (start), it announces `<formatted-date>. Now select end date.` so screen-reader users know the next click commits the other endpoint.
  - After the second click (end), it announces `Range selected: <start> – <end>` instead of just the bare date — matching the swap-if-before behaviour so the announcement always reflects what was committed.
  - Week-mode commits now share the same `Range selected: ...` prefix for consistency.

  The two new strings are wired through `RangePickerLabels.selectingEnd` and `RangePickerLabels.rangeSelected` with English defaults, and they are fully overridable via the existing `labels` prop for i18n. `@kalyx/core` gets a `minor` bump because `RangePickerLabels` gained required fields (with defaults supplied by `DEFAULT_RANGEPICKER_LABELS`); any consumer constructing a literal `RangePickerLabels` from scratch will need to add the two keys.

### Patch Changes

- 19ac1c0: fix(core): allow `generateMinutes` step values up to 60

  `generateMinutes(step)` rejected any step above 30, which prevented legitimate cases like `step=45` (quarter-and-three-quarters past the hour) and `step=60` (on-the-hour only). The slot-generation loop already works for any 1–60 integer, so the upper bound is now 60 with the same error message format. Steps `0`, `61+`, and negative values still throw. No callers in `@kalyx/react` relied on the previous narrower bound.

## 1.0.0-rc.10

### Minor Changes

- 4629384: chore(oss): unify node engines to >=20 and add public repository metadata
  - `@kalyx/react` and `@kalyx/core` now require Node `>=20`, matching the root workspace and CI. This was the de-facto requirement; only the published manifests still claimed `>=18`.
  - Root `package.json` now exposes `homepage`, `repository`, and `bugs` so `npm info` and the npm registry page link back to the GitHub repo.
  - `.github/PULL_REQUEST_TEMPLATE.md` bundle ceiling updated `15KB → 16 KB` to match the post-rc.8 limit advertised in README and CI.
  - `.gitignore` ignores `.codegraph/`, `.serena/`, and `.tmp-*/` (MCP server caches and worktree scratchpads).

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
