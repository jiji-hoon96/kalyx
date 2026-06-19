---
"@kalyx/core": minor
"@kalyx/react": minor
---

Infer `weekStartsOn` from the active `locale` when the prop is not set (B7).

`@kalyx/core` now exports `getWeekStartForLocale(locale)`, which reads `Intl.Locale(locale).weekInfo.firstDay` and maps it to the `WeekStartsOn` surface (`0 | 1`) — Sunday-first locales (e.g. `en-US`, `ja-JP`, `ko-KR`) resolve to `0`, Monday-first locales (e.g. `en-GB`, `de-DE`, `fr-FR`) to `1`. It caches per-locale and falls back to `0` on engines without `weekInfo` or for unparseable tags.

`DatePicker` and `RangePicker` (and the `MonthPicker`/`YearPicker` wrappers built on `DatePicker.Root`) now default `weekStartsOn` to the locale's first day instead of always Sunday. An explicit `weekStartsOn` prop still wins, so existing pinned usage is unchanged. Consumers that relied on the implicit Sunday default while passing a Monday-first `locale` will now see Monday-first weeks — pass `weekStartsOn={0}` to restore the old behavior.
