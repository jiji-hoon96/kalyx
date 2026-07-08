---
'@kalyx/react': minor
---

Add RTL support via a `dir` prop (`"ltr"` | `"rtl"`, default `"ltr"`) on every picker Root (DatePicker, RangePicker, TimePicker via DateTimePicker, MonthPicker, YearPicker, WeekPicker). In `dir="rtl"` the calendar/month/year grid carries `dir="rtl"` for styling and mirrors the physical ArrowLeft/ArrowRight keys per the WAI-ARIA grid pattern — the visually-left cell is the *next* date, the visually-right cell the *previous* — while ArrowUp/ArrowDown, PageUp/PageDown, and Home/End keep their logical direction. The disabled-cell skip loop is direction-aware so it continues along the same logical path. Also exports the `Direction` type from the main and `/headless` entries.
