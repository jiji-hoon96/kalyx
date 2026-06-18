---
"@kalyx/adapter-date-fns": patch
---

Make `addDays` / `addMonths` / `addYears` UTC-stable. They used date-fns, which mutates the LOCAL date field, so on a runtime whose timezone observed DST in the iterated range (e.g. Asia/Seoul in 1987–88) the day-by-day calendar-grid iteration drifted by an hour and duplicated/skipped a UTC day. The adapter now adds in UTC (a UTC day is exactly 86_400_000 ms, with month/year clamping preserved), so calendar grids are identical regardless of the user's `process.env.TZ` / browser timezone. Surfaced by the new calendar property suite.
