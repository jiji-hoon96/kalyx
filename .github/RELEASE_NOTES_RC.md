# v1.0.0-rc.3 — Release Candidate

This is the latest RC for Kalyx v1.0 (rc.0 → rc.3). The public API is frozen; we're collecting feedback before cutting the stable release.

## What's in

- **MonthPicker / YearPicker / WeekPicker** — three new top-level components sharing the same composition + adapter contract
- **Presets API** — `DatePicker.Presets` + `DatePicker.Preset` (today / tomorrow / startOfMonth / custom ISO)
- **Event callbacks** — `onOpenChange`, `onCalendarNavigate` on all picker roots
- **WeekPicker mutation fix** — WeekPicker no longer mutates the shared calendar config
- **IANA timezone** — DST-safe `displayTimezone` on Date/DateTime/Range pickers
- **rc.1 → rc.3 fixes** — P0 release blockers (#25), P1 a11y/API/docs (#26), perf memoization (#28), P2 polish (#29), Enter-on-focused-day (#36), bundle ceiling raised 12 → 13 KB (#37)
- **API freeze** — public API surface is stable; any breaking change requires a major bump

## Bundle

- ESM: **12.27 KB** gzip (target: ≤ 13 KB)
- CJS: **12.48 KB** gzip

## Install

```bash
pnpm add @kalyx/react@rc   # currently 1.0.0-rc.3 (dist-tag matches .changeset/pre.json)
```

## Feedback

RC issues welcome at https://github.com/jiji-hoon96/kalyx/issues — tag them `v1-rc`.

## Full changelog

See [packages/react/CHANGELOG.md](./packages/react/CHANGELOG.md) and [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md).
