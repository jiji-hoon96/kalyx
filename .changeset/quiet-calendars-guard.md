---
'@kalyx/core': patch
'@kalyx/react': patch
'@kalyx/adapter-date-fns': patch
'@kalyx/adapter-dayjs': patch
'@kalyx/adapter-luxon': patch
---

Reject impossible adapter dates and out-of-range programmatic time values, keep every picker and headless hook usable when external state contains an invalid date, enforce month-start/year-start values for typed MonthPicker and YearPicker commits, reject weeks containing any disabled civil day, submit ISO values from every named picker input, and include the advertised license in every adapter tarball.
