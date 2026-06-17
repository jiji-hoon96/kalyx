---
'@kalyx/react': patch
'@kalyx/core': patch
---

fix(a11y): stop Escape from bubbling out of the picker when the popover is open

When a Kalyx picker (DatePicker / RangePicker / DateTimePicker / MonthPicker /
YearPicker / WeekPicker) is mounted inside a host modal or dialog with its own
Escape handler, a single Escape press used to close BOTH the picker and the
modal. The picker now calls `preventDefault()` and `stopPropagation()` on the
synthetic Escape in its Input and Calendar/Grid key handlers (and on the
native document-level listener inside `usePopover`), so Escape stays scoped to
the picker when it would have closed the popover. When the popover is closed,
Escape still propagates normally to parent handlers.

Audit reference: `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md`
(items A-D1, A-D2).
