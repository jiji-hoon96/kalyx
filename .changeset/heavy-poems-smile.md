---
'@kalyx/react': patch
---

Enforce month and year constraints correctly, including under `displayTimezone`.

Two related defects in `MonthPicker` / `YearPicker` and their headless hooks:

**Commits were unguarded.** `useMonthPicker.selectMonth` and
`useYearPicker.selectYear` computed the grid's `isDisabled` flags but committed
without consulting them, so a cell the grid renders as unselectable could still
be committed programmatically and fire `onChange`. Only the `/headless` hooks
were affected — the components are built on `DatePickerRoot`, which already
guarded its commit path.

**The disabled calculation ignored `displayTimezone`.** `isRangeFullyDisabled`
compared raw UTC coordinates against bounds that are civil-midnight instants. In
a large positive-offset zone a period's civil range sits up to 14 hours earlier
than its UTC coordinates suggest, so a month lying entirely before a `before`
bound stayed **enabled** — visibly selectable in the grid, and committable. In
`Pacific/Kiritimati` with `{ before: <civil 2026-01-01> }`, all of December 2025
remained available. Negative-offset zones happened to compute correctly, which is
why this survived earlier review.

The range is now half-open — callers pass the start of the next period rather
than its last millisecond — and both ends are mapped through the display zone
before comparison. UTC behaviour (no `displayTimezone`) is unchanged and locked
by boundary tests.

**This changes rendering, not just commits:** under `displayTimezone`, months and
years that previously appeared enabled may now correctly render as disabled. Both
the grid flag and the commit guard call the same predicate, so they cannot
disagree in either direction.

The guard deliberately uses `isRangeFullyDisabled` rather than `isDateDisabled`:
a month or year is disabled only when a bound excludes it *entirely*, so
day-granular `{ date }` and `{ dayOfWeek }` rules must not block it.
