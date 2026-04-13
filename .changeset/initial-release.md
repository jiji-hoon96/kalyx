---
"@kalyx/core": minor
"@kalyx/react": minor
---

Initial release of Kalyx — headless, SSR-safe React DatePicker library.

Features:
- DatePicker: single date selection with Calendar, Input, Trigger, Popover
- RangePicker: date range selection with auto-swap and hover preview
- TimePicker: 12h/24h mode, minute step, HourList/MinuteList/AmPmToggle
- DateTimePicker: combined date+time via context bridging (reuses existing components)
- useDatePicker, useRangePicker, useTimePicker hooks for custom UIs
- WAI-ARIA compliant: grid, dialog, combobox, listbox, radiogroup patterns
- SSR safe: verified with Next.js 15 App Router
- Zero CSS: style with classNames prop and data-* attributes
- ISO 8601 UTC strings only (no native Date objects)
- Bundle: 7.71KB gzip (target ≤12KB)
- 185 unit/integration tests passing
