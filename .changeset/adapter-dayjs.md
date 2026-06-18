---
"@kalyx/adapter-dayjs": minor
---

New package: **`@kalyx/adapter-dayjs`** — a dayjs-backed `DateAdapter`, drop-in for the ~half of the ecosystem (Mantine and others) already shipping dayjs. It runs dayjs in UTC mode for the same UTC / ISO-8601 semantics as `@kalyx/adapter-date-fns`, delegates all timezone-aware operations to `@kalyx/core` (the correctness moat lives in core, not the adapter), and is validated against the full `@kalyx/core/test-helpers` conformance suite — the suite's first second implementation, proving the `DateAdapter` contract is portable rather than date-fns-specific.
