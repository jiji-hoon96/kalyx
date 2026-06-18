---
"@kalyx/adapter-date-fns": patch
---

Remove the unused `date-fns-tz` dependency. It was declared but never imported — all timezone work is delegated to `@kalyx/core`'s Intl-based utilities — so dropping it shrinks the install / supply-chain surface with no behavior change.
