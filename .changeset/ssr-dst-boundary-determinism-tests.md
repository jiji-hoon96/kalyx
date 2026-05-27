---
'@kalyx/react': patch
---

test(ssr): cover controlled value at a DST boundary with displayTimezone across all 7 pickers

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
