---
"@kalyx/core": patch
---

perf: mark `@kalyx/core` as `sideEffects: false` so downstream bundlers can tree-shake unused exports. Safe because the package is purely functional (no module-level side effects).
