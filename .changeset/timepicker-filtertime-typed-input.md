---
"@kalyx/react": patch
---

fix(timepicker): honor `filterTime` on typed input commits (M-3)

`TimePicker.Input` committed a typed time on blur/Enter without consulting `filterTime`,
so a blacked-out slot (e.g. a lunch-break or business-hours exclusion) that the
`HourList`/`MinuteList` correctly disable could still be entered by typing. The typed
commit path now rejects a time whose `(hours, minutes)` are filtered out, matching the
list controls. (`filterTime` returns `true` to disable a slot.)
