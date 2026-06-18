---
"@kalyx/core": minor
---

Add `@kalyx/core/test-helpers` — a framework-agnostic adapter **conformance suite**. `runAdapterConformanceTests(adapter, { describe, it, expect })` executes the full `DateAdapter` contract (UTC / ISO-8601 semantics across all 22 methods) so any adapter — the built-in `@kalyx/adapter-date-fns` and future dayjs / luxon / Temporal adapters — can prove it conforms with a single call. Zero runtime footprint (type-only import, separate `./test-helpers` entry) and no effect on the `@kalyx/react` bundle.
