---
"@kalyx/core": patch
"@kalyx/react": patch
---

Preserve calendar dates in UTC+12 through UTC+14 display timezones and keep month navigation focus on enabled, rendered days.

Month navigation now follows the direction you travelled, so a fully disabled month no longer traps the calendar: stepping back past it continues into earlier months instead of returning to the month you came from. `useRangePicker`, `useWeekPicker`, and `useDateTimePicker` resolve their focus target the same way as the components and no longer focus a disabled day after navigating.
