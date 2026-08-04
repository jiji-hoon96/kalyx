# Codex Correctness Hotfix Design

> **Date:** 2026-08-04
> **Baseline:** `a71c43a` (`@kalyx/core@1.4.1`, `@kalyx/react@1.4.1`)
> **Branch:** `fix/codex-correctness-2026-08`

## Goal

Fix the two remaining correctness blockers found by the post-1.4.1 dual-model audit:

1. UTC+12 through UTC+14 display timezones can map a UTC calendar coordinate to the next civil day.
2. Calendar month-button navigation can anchor focus on a disabled first day and strand keyboard navigation.

The pull request must contain executable regressions that fail on `a71c43a`, pass after the fixes, and give Claude a compact adversarial verification surface.

## Scope

### Included

- Correct `civilMidnightFromUtcDay` for the full IANA offset range, including fractional positive offsets.
- Preserve the existing DST disambiguation contract used by `setTimeInTimezone`:
  - spring-forward gaps snap forward;
  - fall-back ambiguity chooses the earlier instant.
- Retarget month-button focus through the existing enabled-focus resolver in:
  - `DatePicker.Calendar`;
  - `RangePicker.Calendar`, which is also used by WeekPicker;
  - standalone `useDatePicker` previous/next month methods.
- Add focused unit, property, component, and hook regressions.
- Run the repository's full correctness and packaging verification suite.

### Excluded

- Documentation/API-reference corrections.
- Release workflow, action pinning, alternate-adapter packaging, and supply-chain hardening.
- `disabled`/`readOnly` child-prop precedence changes.
- New picker features or public APIs.
- Broad refactors unrelated to the two root causes.

Those excluded areas will be handled in separate PRs after Claude verifies this correctness PR.

## Root Cause 1: UTC+12 and Greater Civil-Day Drift

Calendar cells use UTC-midnight coordinates such as `2026-01-15T00:00:00.000Z`. `civilMidnightFromUtcDay` must interpret the coordinate's UTC year/month/day as an explicit civil date in the requested display timezone.

The current implementation changes the coordinate to noon UTC and asks `startOfDayInTimezone` for the probe's observed civil day. This is not valid over the global offset range. At UTC+12 or greater, noon UTC is already the next civil day. For example, the January 15 coordinate round-trips as January 16 in Auckland, Chatham, and Kiritimati.

No single UTC probe hour can cover the complete −12 through +14 range, so changing noon to another constant only moves the failure boundary.

## Timezone Design

Extract the existing two-pass offset resolution from `setTimeInTimezone` into a private helper that accepts explicit civil date-time parts:

```ts
resolveCivilDateTime(
  { year, month, day, hours, minutes, seconds },
  timeZone,
): ISODateString
```

The helper will:

1. Treat the requested civil fields as a provisional UTC epoch.
2. Probe the timezone offset at that epoch.
3. Re-probe at the first resolved candidate to cross DST boundaries correctly.
4. Compare both candidates by civil round-trip.
5. Select the matching candidate, the earlier candidate for ambiguity, or the later candidate for a gap.

`setTimeInTimezone` will continue deriving its target date and unspecified time fields from the input instant, then delegate to this helper. This preserves its public behavior while avoiding duplicated DST logic.

`civilMidnightFromUtcDay` will read the grid coordinate with UTC getters and call the helper with those exact year/month/day fields and zero time. It will no longer infer the target date through a timezone-observed probe.

## Timezone Tests

Tests are written and observed RED before production changes:

- Concrete UTC+12/+13/+13:45/+14 cases, including Auckland, Chatham, and Kiritimati.
- Round-trip invariant:

```ts
calendarDayFromInstant(civilMidnightFromUtcDay(coordinate, zone), zone)
  === coordinate
```

- Property coverage across representative negative, zero, fractional, DST, and extreme-positive zones and generated calendar coordinates.
- Existing New York, Seoul, leap-day, Sydney DST, spring-gap, and fall-ambiguity tests remain green.

The production change that makes these tests pass is the explicit-civil-field resolver. A test that passes while the noon probe is present is invalid and must be corrected before implementation.

## Root Cause 2: Disabled Focus After Month Navigation

Opening a picker already routes its initial coordinate through `resolveEnabledCalendarFocus`. Month-button navigation does not. It writes `startOfMonth(newMonth)` directly into focused state.

If day 1 is disabled, the only cell with `data-focused=true` and `tabIndex=0` is a disabled button. The focus effect targets that button, and ArrowRight continues from the stale disabled coordinate without recovery.

## Focus Design

For each month-button or standalone-hook transition:

1. Compute `newMonth` with the adapter.
2. Compute `monthStart` with `adapter.startOfMonth(newMonth)`.
3. Pass `monthStart`, disabled rules, adapter, and optional display timezone to `resolveEnabledCalendarFocus`.
4. Store the resolved coordinate as focused state.
5. Keep `newMonth` as the visible month and preserve the existing announcement.

This reuses the same rule evaluation as the open path and avoids a second focus-selection algorithm. It does not change the public API.

## Focus Tests

Tests are written and observed RED before production changes:

- DatePicker: next-month button where day 1 is disabled focuses an enabled day; ArrowRight continues moving.
- RangePicker: the same transition does not leave a disabled focused cell.
- `useDatePicker`: `nextMonth` and `previousMonth` return an enabled focused coordinate when the target month starts disabled.
- At least one test uses `displayTimezone` so rule normalization is exercised.

The tests assert observable state or DOM behavior rather than the helper's implementation.

## Error and Edge Handling

- Invalid IANA timezone handling remains delegated to `Intl.DateTimeFormat`, matching current behavior.
- If no enabled day can be found within the resolver's bounded search, focus remains on the supplied coordinate, matching the existing fallback contract.
- Fully disabled calendars therefore remain non-navigable by definition, but partially disabled calendars must not strand focus on month transition.
- Timezone conversion continues returning ISO UTC strings and does not mutate inputs.

## Verification

Required before the PR is opened:

```text
targeted RED evidence for timezone tests
targeted RED evidence for DatePicker/RangePicker/hook tests
targeted GREEN tests
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:run
pnpm test:coverage
pnpm build
pnpm check-bundle
node scripts/verify-entry-split.mjs
pnpm --filter docs-site build
pnpm test:e2e
```

The final verification must record the immutable commit SHA, exact pass counts, bundle values, and any non-blocking warnings.

## Claude Adversarial Verification Checklist

Claude should independently verify:

1. Revert only the timezone implementation while retaining tests; extreme-positive tests must fail.
2. Revert only each focus call-site change while retaining tests; the corresponding component/hook test must fail.
3. Test both positive and negative offset extremes rather than Seoul-only fixtures.
4. Check fractional zones (`Pacific/Chatham`) and DST (`Pacific/Auckland`) as separate classes.
5. Confirm `setTimeInTimezone` gap and ambiguity behavior is unchanged after helper extraction.
6. Reproduce month-button navigation with multiple leading disabled days, not only day 1.
7. Confirm DateTimePicker and WeekPicker inherit the corrected shared calendar paths.
8. Re-measure default and headless bundles from a clean install.

## Success Criteria

- UTC calendar coordinates preserve their civil date across the tested IANA offset classes.
- Partially disabled target months always receive an enabled focus anchor after month-button or standalone-hook navigation.
- Every new regression is proven RED before implementation and GREEN after implementation.
- No public API is added or changed.
- Full verification passes and the default bundle remains below the approved 20 KB gzip ceiling.
