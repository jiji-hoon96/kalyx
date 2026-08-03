---
"@kalyx/core": patch
---

fix(calendar): retarget focus off a disabled day in `getCalendarDays` (HIGH-2)

When the requested `focusedDate` fell on a disabled day, that day still carried the
`isFocused` flag. In the React grid that made a disabled `<button>` the only tabbable
cell — and a disabled button can't receive DOM focus, so opening a calendar whose value
(or today, when no value is set) was disabled left keyboard navigation stranded with no
focusable cell (e.g. a weekend-disabling picker opened on a weekend, or
`disabled: [{ before: tomorrow }]` with no value).

`getCalendarDays` now moves the focus flag to the first enabled day (preferring the
current month) whenever the requested focus lands on a disabled day, so every grid opens
with a focusable anchor. Enabled requested dates are unchanged, and no anchor is added
when `focusedDate` is omitted. This fixes DatePicker, RangePicker, and WeekPicker in one
place, at zero bundle cost.
