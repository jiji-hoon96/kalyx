# @kalyx/docs

## 0.0.6-rc.8

### Patch Changes

- Updated dependencies [0d3b845]
  - @kalyx/react@1.0.0-rc.8

## 0.0.6-rc.7

### Patch Changes

- 93d3cbe: Security: pin transitive `next`, `brace-expansion`, `webpack-dev-server`, and `ws` via `pnpm.overrides`, resolving the OSV alerts raised against the docs app's dev-server tree.

  OSV-detected advisories resolved on `next@15.5.15` (overridden to `>=15.5.18`, resolves to `16.2.6`):
  - GHSA-c4j6-fc7j-m34r (8.6)
  - GHSA-492v-c6pp-mqqv (8.1)
  - GHSA-267c-6grr-h53f (7.5)
  - GHSA-26hh-7cqf-hhc6 (7.5)
  - GHSA-36qx-fr4f-26g5 (7.5)
  - GHSA-8h8q-6873-q5fj (7.5)
  - GHSA-mg66-mrh9-m8jx (7.5)
  - GHSA-gx5p-jg67-6x7h (6.1)
  - GHSA-h64f-5h5j-jqjh (5.9)
  - GHSA-wfc6-r584-vfw7 (5.4)
  - GHSA-ffhc-5mcf-pf4q (4.7)
  - GHSA-3g8h-86w9-wvmq (3.7)
  - GHSA-vfv6-92ff-j949 (3.7)

  Three additional dev-tree advisories surfaced after the Next 16 bump and are also pinned:
  - `brace-expansion@5.0.5` → `>=5.0.6` — [GHSA-jxxr-4gwj-5jf2](https://osv.dev/GHSA-jxxr-4gwj-5jf2) (6.5, DoS via untrimmed `max` option). Targeted to major 5 only (`"brace-expansion@5": ">=5.0.6"`) — the v1 / v2 lines coexist in the dep graph for older tooling and have a different, incompatible API.
  - `webpack-dev-server@5.2.3` → `>=5.2.4` — [GHSA-79cf-xcqc-c78w](https://osv.dev/GHSA-79cf-xcqc-c78w) (5.3, cross-origin source code exposure)
  - `ws@8.20.0` → `>=8.20.1` — [GHSA-58qx-3vcg-4xpx](https://osv.dev/GHSA-58qx-3vcg-4xpx) (4.4, `close()` implementation). Targeted to major 8 only (`"ws@8": ">=8.20.1"`) — the v7 line is unaffected and stays in place.

  All four packages are dev-time dependencies of the docs app (Next's webpack dev server and its transitives). `@kalyx/react` / `@kalyx/core` are unaffected. Next 16 also requires `apps/docs/tsconfig.json` `jsx` → `react-jsx` and the `.next/dev/types/**/*.ts` include; `next-env.d.ts` is auto-regenerated.

  No public API change.

- Updated dependencies [0eca2e8]
- Updated dependencies [d62c84e]
- Updated dependencies [b40080d]
  - @kalyx/react@1.0.0-rc.7

## 0.0.6-rc.6

### Patch Changes

- Updated dependencies [abc56ac]
  - @kalyx/react@1.0.0-rc.6

## 0.0.6-rc.5

### Patch Changes

- Updated dependencies [9f3cf9b]
- Updated dependencies [9b19df4]
  - @kalyx/react@1.0.0-rc.5

## 0.0.6-rc.4

### Patch Changes

- Updated dependencies [df97687]
  - @kalyx/react@1.0.0-rc.4

## 0.0.6-rc.3

### Patch Changes

- Updated dependencies [3587b13]
  - @kalyx/react@1.0.0-rc.3

## 0.0.6-rc.2

### Patch Changes

- 3e9c097: Add a `/playground` page to the demo site so library maintainers and users can exercise every component in one place. The page applies shared `locale` / `displayTimezone` / `weekStartsOn` / time-format / minute-step / `disabled` / `readOnly` controls across all 7 pickers (DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker), shows the live `ISODateString` / `DateRange` output for each, logs the last 20 events (`change`, `openChange`), and includes a keyboard shortcut reference.
- Updated dependencies [aadb512]
- Updated dependencies [21f3c1f]
- Updated dependencies [733c0a1]
- Updated dependencies [3228533]
- Updated dependencies [e8519d0]
- Updated dependencies [b6129ed]
  - @kalyx/react@1.0.0-rc.2

## 0.0.6-rc.1

### Patch Changes

- Updated dependencies [3afb15b]
  - @kalyx/react@1.0.0-rc.1

## 0.0.6-rc.0

### Patch Changes

- Updated dependencies [3db8444]
- Updated dependencies [56e1ce9]
- Updated dependencies [1ca818c]
- Updated dependencies [6fc7c59]
- Updated dependencies [ca7180e]
- Updated dependencies [6fdf8fe]
- Updated dependencies [6fc7c59]
  - @kalyx/react@1.0.0-rc.0

## 0.0.5

### Patch Changes

- Updated dependencies [104bbf2]
  - @kalyx/react@0.4.0

## 0.0.4

### Patch Changes

- Updated dependencies [669391b]
  - @kalyx/react@0.3.0

## 0.0.3

### Patch Changes

- Updated dependencies [ebf4fd7]
  - @kalyx/react@0.2.2

## 0.0.2

### Patch Changes

- Updated dependencies [fe0e63e]
  - @kalyx/react@0.2.1

## 0.0.1

### Patch Changes

- Updated dependencies [e9bb9e8]
  - @kalyx/react@0.2.0
