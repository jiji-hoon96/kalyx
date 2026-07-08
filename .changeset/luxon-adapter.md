---
'@kalyx/adapter-luxon': minor
---

New package: **`@kalyx/adapter-luxon`** — a luxon-backed `DateAdapter`, drop-in for teams already shipping luxon (common in enterprise / timezone-heavy stacks). It parses every value as a UTC `DateTime` for the same UTC / ISO-8601 semantics as `@kalyx/adapter-date-fns` and `@kalyx/adapter-dayjs`, delegates all timezone-aware operations to `@kalyx/core` (the correctness moat lives in core, not the adapter), and is validated against the full `@kalyx/core/test-helpers` conformance suite — the suite's third backend, further proving the `DateAdapter` contract is portable rather than tied to any one date library.
