---
'@kalyx/core': patch
---

fix(core): validate inputs to `to12Hour` and `to24Hour`

`to12Hour(hours24)` and `to24Hour(hours12, period)` are public exports from `@kalyx/core` but had no input validation. The previous silent arithmetic mapped invalid inputs onto plausible-looking but wrong outputs and hid caller bugs:

- `to12Hour(24)` returned `{ hours12: 12, period: 'PM' }` (because `24 % 12 = 0` → mapped to 12)
- `to12Hour(-1)` returned `{ hours12: -1, period: 'AM' }`
- `to24Hour(13, 'PM')` returned `25`
- `to24Hour(0, 'AM')` returned `0` (but `0` is not a valid 12-hour clock value — midnight is `12 AM`)

Both functions now throw `RangeError` with a clear message when the input is outside its valid integer range (`[0, 23]` for `to12Hour`, `[1, 12]` for `to24Hour`). `Number.isInteger` guards non-integers and `NaN`. No `@kalyx/react` callers ever passed invalid values, so the internal contracts are unchanged; only direct `@kalyx/core` users who relied on the silent-wrong behaviour see the new exception.
