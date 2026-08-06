---
'@kalyx/react': patch
---

Stop `useMonthPicker` and `useYearPicker` from committing a disabled cell.

Both hooks computed the grid's `isDisabled` flags but committed without checking
them, so a month or year the grid renders as unselectable could still be passed
to `selectMonth` / `selectYear` and would fire `onChange`. Only the `/headless`
hooks were affected — the `MonthPicker` and `YearPicker` components are built on
`DatePickerRoot`, which already guarded its commit path.

The guard uses the same `isRangeFullyDisabled` predicate the grids use for their
flags, so the commit and the rendered state agree: a month or year is refused
only when a `before` / `after` bound excludes it *entirely*. Day-granular
`{ date }` and `{ dayOfWeek }` rules never disable a whole month or year, and
they do not block the commit either.

If you were relying on `selectMonth` / `selectYear` emitting for out-of-range
values, read the value back from `onChange` instead — it is now the same set of
values the grid lets a user click.
