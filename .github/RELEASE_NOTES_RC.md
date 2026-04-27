# v1.0.0-rc.0 — First Release Candidate

This is the first RC for Kalyx v1.0. The public API is frozen; we're collecting feedback before cutting the stable release.

## What's in

- **MonthPicker / YearPicker / WeekPicker** — three new top-level components sharing the same composition + adapter contract
- **Presets API** — `DatePicker.Presets` + `DatePicker.Preset` (today / tomorrow / startOfMonth / custom ISO)
- **Event callbacks** — `onOpenChange`, `onCalendarNavigate` on all picker roots
- **WeekPicker mutation fix** — WeekPicker no longer mutates the shared calendar config
- **IANA timezone** — DST-safe `displayTimezone` on Date/DateTime/Range pickers
- **API freeze** — public API surface is now stable; any breaking change requires a major bump

## Bundle

- ESM: **11.36 KB** gzip (target: ≤ 12 KB)
- CJS: **11.36 KB** gzip

## Install

```bash
pnpm add @kalyx/react@next   # 1.0.0-rc.0
```

## Feedback

RC issues welcome at https://github.com/jiji-hoon96/kalyx/issues — tag them `v1-rc`.

## Full changelog

See [packages/react/CHANGELOG.md](./packages/react/CHANGELOG.md) and [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md).
