# @kalyx/react

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

- Updated dependencies [66bd6dc]
- Updated dependencies [288b2ed]
  - @kalyx/core@1.0.2

## 1.0.1

### Patch Changes

- 5b68f62: Bump `@floating-ui/react` from `^0.26.0` to `^0.27.0`. No public API change — popover positioning, focus-out behaviour, and SSR safety are unaffected. Tests (497/497) and bundle size (15.76 KB CJS / 15.63 KB ESM gzip, ≤ 16 KB ceiling) hold.

## 1.0.0

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

- 4629384: chore(oss): unify node engines to >=20 and add public repository metadata
  - `@kalyx/react` and `@kalyx/core` now require Node `>=20`, matching the root workspace and CI. This was the de-facto requirement; only the published manifests still claimed `>=18`.
  - Root `package.json` now exposes `homepage`, `repository`, and `bugs` so `npm info` and the npm registry page link back to the GitHub repo.
  - `.github/PULL_REQUEST_TEMPLATE.md` bundle ceiling updated `15KB → 16 KB` to match the post-rc.8 limit advertised in README and CI.
  - `.gitignore` ignores `.codegraph/`, `.serena/`, and `.tmp-*/` (MCP server caches and worktree scratchpads).

- 44b3fa6: Add `@kalyx/react/headless` entry for adapter-explicit usage. Default `@kalyx/react` entry continues to auto-inject the date-fns adapter — no breaking change. Use the headless entry to opt out of the bundled date-fns and provide your own adapter (dayjs, luxon, custom). See [Adapters guide](https://kalyx-docs.vercel.app/docs/guides/adapters).
- 0d3b845: `TimePicker.Root` gains a programmatic **`filterTime`** prop — `(hours: number, minutes: number) => boolean` returning `true` for any slot that should be unselectable. Equivalent to `react-datepicker`'s `filterTime` and MUI X's `shouldDisableTime`, covering use cases the static `step` prop can't (business-hours-only, lunch breaks, blackout slots, per-day variations).

  ```tsx
  <TimePicker
    value={time}
    onChange={setTime}
    step={15}
    // Business hours only: 09:00–11:45 and 13:00–17:45 (no lunch slot)
    filterTime={(h, m) => h < 9 || h >= 18 || h === 12}
  >
    <TimePicker.Input />
    <TimePicker.HourList />
    <TimePicker.MinuteList />
  </TimePicker>
  ```

  Behavior:
  - **`MinuteList`** — minutes for which `filterTime(currentHour, minute)` returns `true` get `aria-disabled="true"` and reject click/Enter.
  - **`HourList`** — an hour is marked `aria-disabled="true"` only when `filterTime` returns `true` for **every** step minute within it. Hours with at least one open minute remain selectable.
  - 12-hour mode — the predicate always receives 24-hour values (`0`–`23`) regardless of the picker's display format.

  **Note**: `DateTimePicker` does not yet wire this through — combine `DatePicker.Root` + `TimePicker.Root` manually if you need both date and time-slot filtering in the same picker.

  Bundle ceiling raised 15 → 16 KB (PR #N follows the 12→13→14→15 cadence — each raise tied to a documented feature; CLAUDE.md §2 records the chain). Measured 15.01 KB ESM / 15.16 KB CJS at this commit, ~4× smaller than react-datepicker.

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

- 63fb80a: fix(datetimepicker): close composition-API gap and expose missing public types
  - `<DateTimePicker.Root>` now accepts `withSeconds` and `filterTime` props (was silently hard-coded to `withSeconds: false`, `filterTime: undefined`)
  - `currentTime` no longer calls `DateFnsAdapter.today()` during render when `value` is null — eliminates the UTC-midnight hydration mismatch risk
  - Public API now re-exports `CalendarWeek`, `CalendarGrid`, `CalendarOptions`, `WeekStartsOn`, `WeekdayInfo`, every `{Picker}Labels` type, and the four `DEFAULT_*_LABELS` runtime constants per CLAUDE.md §6

- 1ca818c: fix(react): prevent WeekPicker from mutating RangePicker.Calendar

  `WeekPicker` previously called `Object.assign(RangePickerRoot, { ..., Calendar: WeekPickerCalendar })`, which mutates the shared `RangePickerRoot` function object. Because `RangePicker.Calendar` is attached to the same object (via the earlier `Object.assign` in `RangePicker/index.ts`), importing `WeekPicker` would overwrite `RangePicker.Calendar` with `WeekPickerCalendar`.

  Users of `RangePicker` would then see week-selection behavior (single click commits a full week and closes the popover) instead of the documented two-click range flow — even without importing `WeekPicker` directly, because both pickers share the module graph.

  Added an internal `WeekPickerRoot` wrapper that the `Object.assign` target now uses, preserving `RangePickerRoot.Calendar` intact.

  Caught by the `RangePicker › select range in start-date -> end-date order` Playwright test; all existing behavior is restored.

- 19ac1c0: fix(core): allow `generateMinutes` step values up to 60

  `generateMinutes(step)` rejected any step above 30, which prevented legitimate cases like `step=45` (quarter-and-three-quarters past the hour) and `step=60` (on-the-hour only). The slot-generation loop already works for any 1–60 integer, so the upper bound is now 60 with the same error message format. Steps `0`, `61+`, and negative values still throw. No callers in `@kalyx/react` relied on the previous narrower bound.

- eafc3c1: fix(input): drop stale typed text when the parent re-sets value externally

  `<DatePicker.Input>` and `<TimePicker.Input>` keep half-typed text in a local `inputText` state while the user is editing — without it, parse-failed input would vanish on every keystroke. The state was reset only when the user committed via blur/Enter, which left a real gap:

  If the value changed from anywhere else (parent re-rendered with a new `value`, a calendar click, a `Preset`, a custom-Hook `setRange`, an HourList option), the Input kept rendering the user's stale text. Source-of-truth and visible value diverged silently.

  A `useEffect` keyed on `ctx.value` now resets `inputText` whenever the source-of-truth changes. The Input goes back to formatting the new value normally. For DatePicker the reset is skipped while an IME composition is in flight (Korean/Japanese/Chinese), so an in-flight character is never wiped mid-stroke.

  Impact: `DatePicker`, `MonthPicker`, `YearPicker` (the last two reuse `DatePickerInput`), and `TimePicker` all get the fix. `RangePicker`/`WeekPicker`/`DateTimePicker` Inputs are read-only or non-editable and already track context directly, so they were never affected.

- 23bc187: docs(i18n): translate Korean intro and stop bumping demo apps on every patch
  - `apps/docs-site/i18n/ko/.../intro.md` is now fully translated to Korean. Previously the file lived in the `i18n/ko/` tree but the body was the verbatim English copy, so Korean docs visitors saw English content on the landing page.
  - `.changeset/config.json` `ignore` now includes the two demo workspaces (`@kalyx/docs`, `docs-site`). Changesets used to bump them on every release because they depend on `@kalyx/react`, polluting their CHANGELOG with `Updated dependencies` entries and adding noise to release PRs. Demo apps aren't published — they don't need versioning.

- 3afb15b: Fix popover styling regression that broke documentation live previews.
  - `DatePicker.Popover` and `RangePicker.Popover` now merge user-provided `style` props _under_ Floating UI's positioning instead of being overwritten by it. Previously, passing `style={{...}}` to a Popover stripped away `position: absolute`, `top`, `left`, and `transform`, causing the popover to render as a static block at full container width.
  - The popover is now hidden until Floating UI computes its position, eliminating an unpositioned first-frame flash on every open.
  - The shared `usePopover` hook also wires the floating element's reference synchronously in the ref callback, so positioning is resolved before paint in most cases.

- c8a6609: fix(rangepicker): announce next selection target and final range to screen readers

  `<RangePicker.Calendar>` now announces context-aware messages through its existing `role="status"` live region:
  - After the first click (start), it announces `<formatted-date>. Now select end date.` so screen-reader users know the next click commits the other endpoint.
  - After the second click (end), it announces `Range selected: <start> – <end>` instead of just the bare date — matching the swap-if-before behaviour so the announcement always reflects what was committed.
  - Week-mode commits now share the same `Range selected: ...` prefix for consistency.

  The two new strings are wired through `RangePickerLabels.selectingEnd` and `RangePickerLabels.rangeSelected` with English defaults, and they are fully overridable via the existing `labels` prop for i18n. `@kalyx/core` gets a `minor` bump because `RangePickerLabels` gained required fields (with defaults supplied by `DEFAULT_RANGEPICKER_LABELS`); any consumer constructing a literal `RangePickerLabels` from scratch will need to add the two keys.

- 3587b13: Replace deprecated `MutableRefObject<T>` with `RefObject<T>` in context types.

  `@types/react@19` marks `MutableRefObject` as deprecated (`Use 'RefObject' instead`). In React 19 `RefObject<T>` is itself mutable, so the swap is type-equivalent for the existing `referenceRef` usage in `DatePickerContext` and `RangePickerContext`.

  No runtime change. No public API surface change.

- abc56ac: Security: pin transitive `fast-uri` to `>=3.1.2` and `@babel/plugin-transform-modules-systemjs` to `>=7.29.4` via `pnpm.overrides`.

  Resolves three Code Scanning alerts on `pnpm-lock.yaml`:
  - `fast-uri@3.1.0` — [GHSA-v39h-62p7-jpjc](https://osv.dev/GHSA-v39h-62p7-jpjc) (CVE-2026-6322), first patched in `3.1.2`.
  - `fast-uri@3.1.0` — [GHSA-q3j6-qgpj-74h6](https://osv.dev/GHSA-q3j6-qgpj-74h6) (CVE-2026-6321), first patched in `3.1.1`.
  - `@babel/plugin-transform-modules-systemjs@7.29.0` — [GHSA-fv7c-fp4j-7gwp](https://osv.dev/GHSA-fv7c-fp4j-7gwp) (CVE-2026-44728), first patched in `7.29.4` on the 7.x line.

  All three packages are transitive build-time dependencies (ajv → fast-uri, Babel preset-env → systemjs plugin); no public API impact.

- aadb512: Security: pin transitive `postcss` to `>=8.5.10` via `pnpm.overrides`.

  Two `postcss` versions in `pnpm-lock.yaml` (`8.4.31` from a `postcss-load-config` chain and `8.5.9` from the `tsup` chain) were affected by [GHSA-qx2v-qp2m-jg93](https://osv.dev/GHSA-qx2v-qp2m-jg93) (CVSS 6.1 — improper newline handling that lets crafted input bypass quote escapes). Both are now resolved to `8.5.10`+. The OSV scanner workflow (which auto-creates issues #23 / #24 / #27) now reports zero advisories.

- e5bd203: test(ssr): cover controlled value at a DST boundary with displayTimezone across all 7 pickers

  The existing `renderToString` smoke tests only exercised the default `value=null` (or generic non-DST) path. They missed the highest-risk hydration scenario: a controlled value rendered on a DST transition day (2026-03-08 US Eastern spring-forward) while `displayTimezone="America/New_York"` forces the calendar/highlighting/time rows to map UTC ↔ civil time across the seam.

  Each picker now has one new determinism test inside its `SSR safety` describe that renders the same tree twice via `renderToString` and asserts byte-identical output. Any accidental clock-read or non-deterministic `Intl` path during render would surface as a string diff.
  - `DatePicker` — 2026-03-08 day cell + popover + calendar
  - `RangePicker` — range straddling the DST seam
  - `TimePicker` — value at 02:00 EST → 03:00 EDT
  - `DateTimePicker` — full date + time tree (highest hydration surface)
  - `MonthPicker` — March 2026 month grid
  - `YearPicker` — 2026 decade grid
  - `WeekPicker` — week containing the spring-forward day

  No production code changed; the suite goes from 314 → 321 picker tests and locks the current SSR-deterministic behaviour against future regressions.

- 1a77283: docs: clarify `TimePicker.filterTime` polarity. The predicate returns `true` to mark a slot **unselectable** — same polarity as MUI X's `shouldDisableTime`, and the **inverse** of react-datepicker's `filterTime` (which returns `true` to _keep_ a slot). Earlier JSDoc/changelog called it "equivalent to react-datepicker's `filterTime`", which is misleading because the polarity is reversed; react-datepicker migrators must invert their predicate. No runtime behavior change — JSDoc, the published package description (≤16 KB), and docs only.
- 4178a92: fix(timepicker, rangepicker): hydration-safe time fallback and memoized preset resolution
  - `<TimePicker.Root>` no longer calls `DateFnsAdapter.today()` during render when `value` is null. The displayed `currentTime` now falls back to a stable `{ hours: 0, minutes: 0, seconds: 0 }` and `today()` is resolved at event time inside `setTime`. Removes the UTC-midnight SSR/CSR hydration mismatch risk.
  - `<RangePicker.Preset>` memoizes the resolved preset range. Previously `resolvePreset` (and `adapter.today()`) ran twice per render per preset — once in the click handler and once in the `isActive` getter — turning a 5-preset row into 10 `today()` allocations per render. No behavioral change.

- b40080d: Internal: sync the `tsup` onSuccess bundle-size budget from `13 KB` to `15 KB` so the per-build warning matches the actual CI gate (`scripts/check-bundle-size.js`, `pr-check.yml`, `release.yml`). No runtime change; the published artifact is byte-identical.

  This was a leftover from the 13 → 14 → 15 KB ceiling raises during RC (PR #46 / PR #48); only the tsup-side TARGET_KB was missed during those bumps, so local `pnpm build` printed a spurious `⚠️` even though CI passed.

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

- 9f3cf9b: WAI-ARIA grid keyboard navigation for the four 3×4 picker grids
  (`DatePicker.MonthGrid`, `DatePicker.YearGrid`, `MonthPicker.Grid`,
  `YearPicker.Grid`).

  Before, these grids declared `role="grid"` but had no key handler — keyboard
  users could not select a month or year, in violation of CLAUDE.md §7.

  Now each grid implements:
  - **Arrow keys** — ±1 column / ±3 rows, clamped to grid bounds.
  - **Home / End** — first / last cell of the current row.
  - **PageUp / PageDown** — previous / next year (or decade for year grids).
  - **Enter / Space** — commit the focused cell (drilldown grids switch view via
    `onSelect`; commit grids close the popover via `ctx.selectDate`).
  - **Roving tabIndex** — only the focused cell has `tabIndex=0`; the
    `data-focused` attribute follows.
  - **Auto-refocus** — DOM focus moves with `focusedIndex` so PageUp/Down lands
    the user back on the same column position. Cells use stable index keys so
    the buttons persist across page nav.

  Component-level integration tests added per CLAUDE.md §7 across `DatePicker`,
  `RangePicker`, `DateTimePicker`, and `WeekPicker`: leap-year (Feb 29 2024)
  click commit, `before`/`after` rule click block, `dayOfWeek` rule click block
  plus visual `aria-disabled`, and keyboard ArrowLeft skip-disabled.

  **Bundle target raised to 14 KB** — full grid keyboard nav (state + handlers
  - auto-refocus) added ~1.4 KB gzip across the four grids. Measured 12.85 KB
    ESM / 13.64 KB CJS at this point. README, docs, `scripts/check-bundle-size.js`,
    PR template, and CI gate updated to ≤14 KB.

  **Internal:** new shared `useGridState` hook in
  `packages/react/src/components/_shared/grid-keyboard.ts` (not exported from
  the package public API) consolidates keyboard handling and roving-focus
  state across all four grids.

- 9b19df4: `MonthPicker.Grid` and `YearPicker.Grid` now respect `before` / `after`
  disabled rules — months/years that fall entirely outside the allowed range
  are rendered with the `disabled` HTML attribute, `aria-disabled="true"`, the
  new `monthDisabled` / `yearDisabled` className slots, and are skipped during
  keyboard navigation.

  This was deliberately deferred from PR #46 to keep that bundle under 14 KB;
  it lands now with a 14 → 15 KB ceiling bump.

  Behavioral details:
  - A month is "fully disabled" only when every day in it is excluded by a
    `before` or `after` rule. `date` and `dayOfWeek` rules can never disable a
    whole month, so they remain a per-day concern.
  - A year follows the same rule against `[Jan 1 00:00:00, Dec 31 23:59:59.999]`.
  - Click and keyboard `Enter` / `Space` on a disabled cell are no-ops.
  - Initial focus and post-PageUp/PageDown focus both re-anchor to the first
    enabled cell when the natural target is itself disabled. (A `disabled`
    HTML button can't receive DOM focus, so without the re-anchor the user
    would silently lose keyboard navigation.)

  **Internal:** `useGridState` regains its optional `disabledFlags` parameter
  plus a focus re-anchor effect; `isRangeFullyDisabled` is reintroduced as an
  internal helper. Neither is exposed in the package public API.

  **Bundle target:** raised 14 → 15 KB (measured 13.96 KB ESM / 14.21 KB CJS).
  Same precedent as the 12 → 13 KB and 13 → 14 KB bumps when prior feature
  work landed. Updated `scripts/check-bundle-size.js`, `pr-check.yml`, READMEs,
  CLAUDE.md, PR template, and `check-bundle.md`.

- Updated dependencies [5b6c37f]
- Updated dependencies [0eca2e8]
- Updated dependencies [d62c84e]
- Updated dependencies [19ac1c0]
- Updated dependencies [4629384]
- Updated dependencies [c8a6609]
- Updated dependencies [3587b13]
- Updated dependencies [abc56ac]
- Updated dependencies [aadb512]
- Updated dependencies [0556886]
- Updated dependencies [ca7180e]
- Updated dependencies [df97687]
- Updated dependencies [21f3c1f]
- Updated dependencies [3228533]
- Updated dependencies [b6129ed]
  - @kalyx/core@1.0.0
  - @kalyx/adapter-date-fns@1.0.0

## 1.0.0-rc.14

### Minor Changes

- 44b3fa6: Add `@kalyx/react/headless` entry for adapter-explicit usage. Default `@kalyx/react` entry continues to auto-inject the date-fns adapter — no breaking change. Use the headless entry to opt out of the bundled date-fns and provide your own adapter (dayjs, luxon, custom). See [Adapters guide](https://kalyx-docs.vercel.app/docs/guides/adapters).

## 1.0.0-rc.13

### Minor Changes

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

### Patch Changes

- Updated dependencies [5b6c37f]
  - @kalyx/core@1.0.0-rc.13
  - @kalyx/adapter-date-fns@1.0.0-rc.1

## 1.0.0-rc.12

### Patch Changes

- e5bd203: test(ssr): cover controlled value at a DST boundary with displayTimezone across all 7 pickers

  The existing `renderToString` smoke tests only exercised the default `value=null` (or generic non-DST) path. They missed the highest-risk hydration scenario: a controlled value rendered on a DST transition day (2026-03-08 US Eastern spring-forward) while `displayTimezone="America/New_York"` forces the calendar/highlighting/time rows to map UTC ↔ civil time across the seam.

  Each picker now has one new determinism test inside its `SSR safety` describe that renders the same tree twice via `renderToString` and asserts byte-identical output. Any accidental clock-read or non-deterministic `Intl` path during render would surface as a string diff.
  - `DatePicker` — 2026-03-08 day cell + popover + calendar
  - `RangePicker` — range straddling the DST seam
  - `TimePicker` — value at 02:00 EST → 03:00 EDT
  - `DateTimePicker` — full date + time tree (highest hydration surface)
  - `MonthPicker` — March 2026 month grid
  - `YearPicker` — 2026 decade grid
  - `WeekPicker` — week containing the spring-forward day

  No production code changed; the suite goes from 314 → 321 picker tests and locks the current SSR-deterministic behaviour against future regressions.

- Updated dependencies [0556886]
  - @kalyx/core@1.0.0-rc.12

## 1.0.0-rc.11

### Patch Changes

- 19ac1c0: fix(core): allow `generateMinutes` step values up to 60

  `generateMinutes(step)` rejected any step above 30, which prevented legitimate cases like `step=45` (quarter-and-three-quarters past the hour) and `step=60` (on-the-hour only). The slot-generation loop already works for any 1–60 integer, so the upper bound is now 60 with the same error message format. Steps `0`, `61+`, and negative values still throw. No callers in `@kalyx/react` relied on the previous narrower bound.

- eafc3c1: fix(input): drop stale typed text when the parent re-sets value externally

  `<DatePicker.Input>` and `<TimePicker.Input>` keep half-typed text in a local `inputText` state while the user is editing — without it, parse-failed input would vanish on every keystroke. The state was reset only when the user committed via blur/Enter, which left a real gap:

  If the value changed from anywhere else (parent re-rendered with a new `value`, a calendar click, a `Preset`, a custom-Hook `setRange`, an HourList option), the Input kept rendering the user's stale text. Source-of-truth and visible value diverged silently.

  A `useEffect` keyed on `ctx.value` now resets `inputText` whenever the source-of-truth changes. The Input goes back to formatting the new value normally. For DatePicker the reset is skipped while an IME composition is in flight (Korean/Japanese/Chinese), so an in-flight character is never wiped mid-stroke.

  Impact: `DatePicker`, `MonthPicker`, `YearPicker` (the last two reuse `DatePickerInput`), and `TimePicker` all get the fix. `RangePicker`/`WeekPicker`/`DateTimePicker` Inputs are read-only or non-editable and already track context directly, so they were never affected.

- 23bc187: docs(i18n): translate Korean intro and stop bumping demo apps on every patch
  - `apps/docs-site/i18n/ko/.../intro.md` is now fully translated to Korean. Previously the file lived in the `i18n/ko/` tree but the body was the verbatim English copy, so Korean docs visitors saw English content on the landing page.
  - `.changeset/config.json` `ignore` now includes the two demo workspaces (`@kalyx/docs`, `docs-site`). Changesets used to bump them on every release because they depend on `@kalyx/react`, polluting their CHANGELOG with `Updated dependencies` entries and adding noise to release PRs. Demo apps aren't published — they don't need versioning.

- c8a6609: fix(rangepicker): announce next selection target and final range to screen readers

  `<RangePicker.Calendar>` now announces context-aware messages through its existing `role="status"` live region:
  - After the first click (start), it announces `<formatted-date>. Now select end date.` so screen-reader users know the next click commits the other endpoint.
  - After the second click (end), it announces `Range selected: <start> – <end>` instead of just the bare date — matching the swap-if-before behaviour so the announcement always reflects what was committed.
  - Week-mode commits now share the same `Range selected: ...` prefix for consistency.

  The two new strings are wired through `RangePickerLabels.selectingEnd` and `RangePickerLabels.rangeSelected` with English defaults, and they are fully overridable via the existing `labels` prop for i18n. `@kalyx/core` gets a `minor` bump because `RangePickerLabels` gained required fields (with defaults supplied by `DEFAULT_RANGEPICKER_LABELS`); any consumer constructing a literal `RangePickerLabels` from scratch will need to add the two keys.

- Updated dependencies [19ac1c0]
- Updated dependencies [c8a6609]
  - @kalyx/core@1.0.0-rc.11

## 1.0.0-rc.10

### Minor Changes

- 4629384: chore(oss): unify node engines to >=20 and add public repository metadata
  - `@kalyx/react` and `@kalyx/core` now require Node `>=20`, matching the root workspace and CI. This was the de-facto requirement; only the published manifests still claimed `>=18`.
  - Root `package.json` now exposes `homepage`, `repository`, and `bugs` so `npm info` and the npm registry page link back to the GitHub repo.
  - `.github/PULL_REQUEST_TEMPLATE.md` bundle ceiling updated `15KB → 16 KB` to match the post-rc.8 limit advertised in README and CI.
  - `.gitignore` ignores `.codegraph/`, `.serena/`, and `.tmp-*/` (MCP server caches and worktree scratchpads).

### Patch Changes

- 63fb80a: fix(datetimepicker): close composition-API gap and expose missing public types
  - `<DateTimePicker.Root>` now accepts `withSeconds` and `filterTime` props (was silently hard-coded to `withSeconds: false`, `filterTime: undefined`)
  - `currentTime` no longer calls `DateFnsAdapter.today()` during render when `value` is null — eliminates the UTC-midnight hydration mismatch risk
  - Public API now re-exports `CalendarWeek`, `CalendarGrid`, `CalendarOptions`, `WeekStartsOn`, `WeekdayInfo`, every `{Picker}Labels` type, and the four `DEFAULT_*_LABELS` runtime constants per CLAUDE.md §6

- 4178a92: fix(timepicker, rangepicker): hydration-safe time fallback and memoized preset resolution
  - `<TimePicker.Root>` no longer calls `DateFnsAdapter.today()` during render when `value` is null. The displayed `currentTime` now falls back to a stable `{ hours: 0, minutes: 0, seconds: 0 }` and `today()` is resolved at event time inside `setTime`. Removes the UTC-midnight SSR/CSR hydration mismatch risk.
  - `<RangePicker.Preset>` memoizes the resolved preset range. Previously `resolvePreset` (and `adapter.today()`) ran twice per render per preset — once in the click handler and once in the `isActive` getter — turning a 5-preset row into 10 `today()` allocations per render. No behavioral change.

- Updated dependencies [4629384]
  - @kalyx/core@1.0.0-rc.10

## 1.0.0-rc.9

### Patch Changes

- 1a77283: docs: clarify `TimePicker.filterTime` polarity. The predicate returns `true` to mark a slot **unselectable** — same polarity as MUI X's `shouldDisableTime`, and the **inverse** of react-datepicker's `filterTime` (which returns `true` to _keep_ a slot). Earlier JSDoc/changelog called it "equivalent to react-datepicker's `filterTime`", which is misleading because the polarity is reversed; react-datepicker migrators must invert their predicate. No runtime behavior change — JSDoc, the published package description (≤16 KB), and docs only.

## 1.0.0-rc.8

### Minor Changes

- 0d3b845: `TimePicker.Root` gains a programmatic **`filterTime`** prop — `(hours: number, minutes: number) => boolean` returning `true` for any slot that should be unselectable. Equivalent to `react-datepicker`'s `filterTime` and MUI X's `shouldDisableTime`, covering use cases the static `step` prop can't (business-hours-only, lunch breaks, blackout slots, per-day variations).

  ```tsx
  <TimePicker
    value={time}
    onChange={setTime}
    step={15}
    // Business hours only: 09:00–11:45 and 13:00–17:45 (no lunch slot)
    filterTime={(h, m) => h < 9 || h >= 18 || h === 12}
  >
    <TimePicker.Input />
    <TimePicker.HourList />
    <TimePicker.MinuteList />
  </TimePicker>
  ```

  Behavior:
  - **`MinuteList`** — minutes for which `filterTime(currentHour, minute)` returns `true` get `aria-disabled="true"` and reject click/Enter.
  - **`HourList`** — an hour is marked `aria-disabled="true"` only when `filterTime` returns `true` for **every** step minute within it. Hours with at least one open minute remain selectable.
  - 12-hour mode — the predicate always receives 24-hour values (`0`–`23`) regardless of the picker's display format.

  **Note**: `DateTimePicker` does not yet wire this through — combine `DatePicker.Root` + `TimePicker.Root` manually if you need both date and time-slot filtering in the same picker.

  Bundle ceiling raised 15 → 16 KB (PR #N follows the 12→13→14→15 cadence — each raise tied to a documented feature; CLAUDE.md §2 records the chain). Measured 15.01 KB ESM / 15.16 KB CJS at this commit, ~4× smaller than react-datepicker.

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

### Patch Changes

- b40080d: Internal: sync the `tsup` onSuccess bundle-size budget from `13 KB` to `15 KB` so the per-build warning matches the actual CI gate (`scripts/check-bundle-size.js`, `pr-check.yml`, `release.yml`). No runtime change; the published artifact is byte-identical.

  This was a leftover from the 13 → 14 → 15 KB ceiling raises during RC (PR #46 / PR #48); only the tsup-side TARGET_KB was missed during those bumps, so local `pnpm build` printed a spurious `⚠️` even though CI passed.

- Updated dependencies [0eca2e8]
- Updated dependencies [d62c84e]
  - @kalyx/core@1.0.0-rc.7

## 1.0.0-rc.6

### Patch Changes

- abc56ac: Security: pin transitive `fast-uri` to `>=3.1.2` and `@babel/plugin-transform-modules-systemjs` to `>=7.29.4` via `pnpm.overrides`.

  Resolves three Code Scanning alerts on `pnpm-lock.yaml`:
  - `fast-uri@3.1.0` — [GHSA-v39h-62p7-jpjc](https://osv.dev/GHSA-v39h-62p7-jpjc) (CVE-2026-6322), first patched in `3.1.2`.
  - `fast-uri@3.1.0` — [GHSA-q3j6-qgpj-74h6](https://osv.dev/GHSA-q3j6-qgpj-74h6) (CVE-2026-6321), first patched in `3.1.1`.
  - `@babel/plugin-transform-modules-systemjs@7.29.0` — [GHSA-fv7c-fp4j-7gwp](https://osv.dev/GHSA-fv7c-fp4j-7gwp) (CVE-2026-44728), first patched in `7.29.4` on the 7.x line.

  All three packages are transitive build-time dependencies (ajv → fast-uri, Babel preset-env → systemjs plugin); no public API impact.

- Updated dependencies [abc56ac]
  - @kalyx/core@1.0.0-rc.6

## 1.0.0-rc.5

### Patch Changes

- 9f3cf9b: WAI-ARIA grid keyboard navigation for the four 3×4 picker grids
  (`DatePicker.MonthGrid`, `DatePicker.YearGrid`, `MonthPicker.Grid`,
  `YearPicker.Grid`).

  Before, these grids declared `role="grid"` but had no key handler — keyboard
  users could not select a month or year, in violation of CLAUDE.md §7.

  Now each grid implements:
  - **Arrow keys** — ±1 column / ±3 rows, clamped to grid bounds.
  - **Home / End** — first / last cell of the current row.
  - **PageUp / PageDown** — previous / next year (or decade for year grids).
  - **Enter / Space** — commit the focused cell (drilldown grids switch view via
    `onSelect`; commit grids close the popover via `ctx.selectDate`).
  - **Roving tabIndex** — only the focused cell has `tabIndex=0`; the
    `data-focused` attribute follows.
  - **Auto-refocus** — DOM focus moves with `focusedIndex` so PageUp/Down lands
    the user back on the same column position. Cells use stable index keys so
    the buttons persist across page nav.

  Component-level integration tests added per CLAUDE.md §7 across `DatePicker`,
  `RangePicker`, `DateTimePicker`, and `WeekPicker`: leap-year (Feb 29 2024)
  click commit, `before`/`after` rule click block, `dayOfWeek` rule click block
  plus visual `aria-disabled`, and keyboard ArrowLeft skip-disabled.

  **Bundle target raised to 14 KB** — full grid keyboard nav (state + handlers
  - auto-refocus) added ~1.4 KB gzip across the four grids. Measured 12.85 KB
    ESM / 13.64 KB CJS at this point. README, docs, `scripts/check-bundle-size.js`,
    PR template, and CI gate updated to ≤14 KB.

  **Internal:** new shared `useGridState` hook in
  `packages/react/src/components/_shared/grid-keyboard.ts` (not exported from
  the package public API) consolidates keyboard handling and roving-focus
  state across all four grids.

- 9b19df4: `MonthPicker.Grid` and `YearPicker.Grid` now respect `before` / `after`
  disabled rules — months/years that fall entirely outside the allowed range
  are rendered with the `disabled` HTML attribute, `aria-disabled="true"`, the
  new `monthDisabled` / `yearDisabled` className slots, and are skipped during
  keyboard navigation.

  This was deliberately deferred from PR #46 to keep that bundle under 14 KB;
  it lands now with a 14 → 15 KB ceiling bump.

  Behavioral details:
  - A month is "fully disabled" only when every day in it is excluded by a
    `before` or `after` rule. `date` and `dayOfWeek` rules can never disable a
    whole month, so they remain a per-day concern.
  - A year follows the same rule against `[Jan 1 00:00:00, Dec 31 23:59:59.999]`.
  - Click and keyboard `Enter` / `Space` on a disabled cell are no-ops.
  - Initial focus and post-PageUp/PageDown focus both re-anchor to the first
    enabled cell when the natural target is itself disabled. (A `disabled`
    HTML button can't receive DOM focus, so without the re-anchor the user
    would silently lose keyboard navigation.)

  **Internal:** `useGridState` regains its optional `disabledFlags` parameter
  plus a focus re-anchor effect; `isRangeFullyDisabled` is reintroduced as an
  internal helper. Neither is exposed in the package public API.

  **Bundle target:** raised 14 → 15 KB (measured 13.96 KB ESM / 14.21 KB CJS).
  Same precedent as the 12 → 13 KB and 13 → 14 KB bumps when prior feature
  work landed. Updated `scripts/check-bundle-size.js`, `pr-check.yml`, READMEs,
  CLAUDE.md, PR template, and `check-bundle.md`.

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

- Updated dependencies [df97687]
  - @kalyx/core@1.0.0-rc.4

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
