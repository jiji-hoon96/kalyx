---
"@kalyx/react": minor
---

feat(weekpicker): anchor the rolling week to the active start/end input

When `weekAnchor="clicked"`, WeekPicker now respects which input the user opened
from: clicking a day while the **start** input is active anchors the 7-day span
forward (clicked day … +6), while the **end** input anchors it backward
(clicked day − 6 … clicked day). Previously every click anchored from the start.

- `RangePicker.Input` sets the selecting target from its `part` on click
  (`open(part)` / `setSelectingTarget(part)` when already open).
- `RangePicker.Root.open` accepts an optional target; `setSelectingTarget` is
  now exposed on the context.

Backwards-compatible: `weekAnchor="calendar"` (default) and RangePicker's
two-click flow are unchanged.
