---
"@kalyx/docs": patch
---

Add a `/playground` page to the demo site so library maintainers and users can exercise every component in one place. The page applies shared `locale` / `displayTimezone` / `weekStartsOn` / time-format / minute-step / `disabled` / `readOnly` controls across all 7 pickers (DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker), shows the live `ISODateString` / `DateRange` output for each, logs the last 20 events (`change`, `openChange`), and includes a keyboard shortcut reference.
