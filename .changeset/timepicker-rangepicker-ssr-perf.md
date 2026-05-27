---
'@kalyx/react': patch
---

fix(timepicker, rangepicker): hydration-safe time fallback and memoized preset resolution

- `<TimePicker.Root>` no longer calls `DateFnsAdapter.today()` during render when `value` is null. The displayed `currentTime` now falls back to a stable `{ hours: 0, minutes: 0, seconds: 0 }` and `today()` is resolved at event time inside `setTime`. Removes the UTC-midnight SSR/CSR hydration mismatch risk.
- `<RangePicker.Preset>` memoizes the resolved preset range. Previously `resolvePreset` (and `adapter.today()`) ran twice per render per preset — once in the click handler and once in the `isActive` getter — turning a 5-preset row into 10 `today()` allocations per render. No behavioral change.
