---
'@kalyx/core': patch
'@kalyx/react': patch
---

fix(core): allow `generateMinutes` step values up to 60

`generateMinutes(step)` rejected any step above 30, which prevented legitimate cases like `step=45` (quarter-and-three-quarters past the hour) and `step=60` (on-the-hour only). The slot-generation loop already works for any 1–60 integer, so the upper bound is now 60 with the same error message format. Steps `0`, `61+`, and negative values still throw. No callers in `@kalyx/react` relied on the previous narrower bound.
