---
"@kalyx/core": patch
---

Remove unused English-hardcoded weekday utilities from `utils/date.ts`:

- `WEEKDAY_LABELS` (constant)
- `getOrderedWeekdays()` (function)

Both were internal exports (never exposed via `@kalyx/core` public `index.ts`) and had no consumers anywhere in the workspace. They were superseded by the locale-aware `getWeekdayNames(locale, weekStartsOn)` in `utils/locale.ts`, which uses `Intl.DateTimeFormat` to produce the same shape with multi-language support.

No public API surface changed.
