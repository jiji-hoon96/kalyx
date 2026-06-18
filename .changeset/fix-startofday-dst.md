---
"@kalyx/core": patch
---

Fix `startOfDayInTimezone` returning an instant one hour early on a DST-transition day. It took a single UTC-offset probe at "civil-midnight-as-UTC", which can land on the wrong side of a transition (e.g. Australia/Sydney springing forward on Oct 1: 00:00 local is still AEST +10, but 00:00 UTC reads as post-transition AEDT +11). It now delegates to `setTimeInTimezone`'s two-pass DST disambiguation, so civil midnight is correct on transition days; this also flows through `todayInTimezone` and `civilMidnightFromUtcDay`. Surfaced by the new fast-check property suite.
