---
'@kalyx/core': minor
'@kalyx/react': patch
---

fix(rangepicker): announce next selection target and final range to screen readers

`<RangePicker.Calendar>` now announces context-aware messages through its existing `role="status"` live region:

- After the first click (start), it announces `<formatted-date>. Now select end date.` so screen-reader users know the next click commits the other endpoint.
- After the second click (end), it announces `Range selected: <start> – <end>` instead of just the bare date — matching the swap-if-before behaviour so the announcement always reflects what was committed.
- Week-mode commits now share the same `Range selected: ...` prefix for consistency.

The two new strings are wired through `RangePickerLabels.selectingEnd` and `RangePickerLabels.rangeSelected` with English defaults, and they are fully overridable via the existing `labels` prop for i18n. `@kalyx/core` gets a `minor` bump because `RangePickerLabels` gained required fields (with defaults supplied by `DEFAULT_RANGEPICKER_LABELS`); any consumer constructing a literal `RangePickerLabels` from scratch will need to add the two keys.
