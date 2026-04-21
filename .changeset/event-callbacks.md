---
'@kalyx/react': minor
---

feat: add `onOpenChange` and `onCalendarNavigate` callbacks on `DatePicker`, `RangePicker`, and `DateTimePicker` Root components.

- `onOpenChange(isOpen: boolean)` fires whenever the popover opens or closes (regardless of trigger — click, keyboard, outside click, selection).
- `onCalendarNavigate(viewMonth: ISODateString)` fires when the calendar view moves to a different month. The emitted value is the first day of the newly-visible month in UTC.

Neither callback fires on initial mount. `TimePicker` does not expose these callbacks since it has no popover or calendar.
