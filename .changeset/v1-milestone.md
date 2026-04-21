---
'@kalyx/react': major
'@kalyx/core': major
---

chore: v1.0 milestone — API freeze.

Kalyx v1.0 declares the public API stable. This is a milestone release bundling the v0.5 surface additions (MonthPicker, YearPicker, WeekPicker, DatePicker.Presets, `onOpenChange`/`onCalendarNavigate` event callbacks) with an explicit commitment to semantic versioning going forward.

### What v1.0 commits to

- **Public API surface** — exports from `@kalyx/react` and `@kalyx/core` listed in their `index.ts` files. Any breaking change requires a major bump.
- **Compositional structure** — Root + subcomponent names (`DatePicker.Input`, `DatePicker.Calendar`, …) are stable. Removal or renaming requires a major bump.
- **Value semantics** — ISO 8601 UTC strings for single dates, `DateRange` `{start, end}` for ranges. `displayTimezone` behavior (civil-midnight-in-tz for date selection) is stable.
- **Accessibility contracts** — role/aria-\* attributes emitted by each component are stable.

### What v1.0 does NOT freeze

- Internal implementation details (non-exported functions, component file layout).
- CSS class name strings on elements — no classes are applied by default; only when a consumer passes them via `classNames` props.
- Error message text.
- Peer dependency version ranges (may expand to cover new React majors).

### Breaking changes vs 0.4.x

None. v1.0 is API-compatible with 0.4.x — existing code continues to work. The major bump communicates stability commitment, not breakage.
