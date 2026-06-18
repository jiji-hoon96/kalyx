# @kalyx/adapter-date-fns

## 1.0.1

### Patch Changes

- dd238a8: Remove the unused `date-fns-tz` dependency. It was declared but never imported — all timezone work is delegated to `@kalyx/core`'s Intl-based utilities — so dropping it shrinks the install / supply-chain surface with no behavior change.
- eb44024: Make `addDays` / `addMonths` / `addYears` UTC-stable. They used date-fns, which mutates the LOCAL date field, so on a runtime whose timezone observed DST in the iterated range (e.g. Asia/Seoul in 1987–88) the day-by-day calendar-grid iteration drifted by an hour and duplicated/skipped a UTC day. The adapter now adds in UTC (a UTC day is exactly 86_400_000 ms, with month/year clamping preserved), so calendar grids are identical regardless of the user's `process.env.TZ` / browser timezone. Surfaced by the new calendar property suite.
- Updated dependencies [96993f5]
- Updated dependencies [eb44024]
  - @kalyx/core@1.1.0

## 1.0.0

### Major Changes

- 5b6c37f: Extract `@kalyx/adapter-date-fns` and make `@kalyx/core` neutral

  Step 1 + 2 of the four-step adapter-extraction plan (see `.claude/skills/adapter-extraction.md`). After this change, `@kalyx/core` no longer depends on `date-fns` or `date-fns-tz`; it ships only the platform-agnostic date logic (`getCalendarDays`, `isDateDisabled`, timezone helpers, labels, the `DateAdapter` contract). The DateFnsAdapter implementation now lives in its own publishable package so dayjs / luxon / Temporal adapters can be added later without forcing every Kalyx user to bundle two date libraries.

  ### What changed
  - **`@kalyx/core`** — `DateFnsAdapter` is no longer exported and `date-fns` / `date-fns-tz` are no longer listed as dependencies. `utils/timezone.ts` was the lone leak and uses native `new Date(string)` now (every caller already routes through `normalizeISO` or `DateAdapter.parse`, so the input subset is fully spec-defined).
  - **`@kalyx/adapter-date-fns`** — new package with the full `DateFnsAdapter` implementation moved verbatim. Same UTC semantics, same timezone-aware paths, same 35 adapter tests.
  - **`@kalyx/react`** — imports `DateFnsAdapter` from `@kalyx/adapter-date-fns` now. The default adapter is still wired up automatically — anyone using `import { DatePicker } from '@kalyx/react'` keeps the previous behaviour with zero changes. The adapter package is a direct dependency so consumers installing just `@kalyx/react` continue to get a working default.

  ### Migration

  If you imported `DateFnsAdapter` directly from `@kalyx/core`:

  ```diff
  - import { DateFnsAdapter } from '@kalyx/core';
  + import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
  ```

  `@kalyx/react` consumers don't need to change anything — the adapter is still re-exported from `@kalyx/react`.

  ### Next (separate PR)

  The `/headless` entry point (`@kalyx/react/headless`) that lets dayjs/luxon users tree-shake date-fns out is a follow-up. The component Roots still default to the date-fns adapter inline; the entry split requires moving that fallback out of each Root and into the entry boundary.

### Patch Changes

- Updated dependencies [5b6c37f]
- Updated dependencies [0eca2e8]
- Updated dependencies [d62c84e]
- Updated dependencies [19ac1c0]
- Updated dependencies [4629384]
- Updated dependencies [c8a6609]
- Updated dependencies [3587b13]
- Updated dependencies [abc56ac]
- Updated dependencies [aadb512]
- Updated dependencies [0556886]
- Updated dependencies [ca7180e]
- Updated dependencies [df97687]
- Updated dependencies [21f3c1f]
- Updated dependencies [3228533]
- Updated dependencies [b6129ed]
  - @kalyx/core@1.0.0

## 1.0.0-rc.1

### Major Changes

- 5b6c37f: Extract `@kalyx/adapter-date-fns` and make `@kalyx/core` neutral

  Step 1 + 2 of the four-step adapter-extraction plan (see `.claude/skills/adapter-extraction.md`). After this change, `@kalyx/core` no longer depends on `date-fns` or `date-fns-tz`; it ships only the platform-agnostic date logic (`getCalendarDays`, `isDateDisabled`, timezone helpers, labels, the `DateAdapter` contract). The DateFnsAdapter implementation now lives in its own publishable package so dayjs / luxon / Temporal adapters can be added later without forcing every Kalyx user to bundle two date libraries.

  ### What changed
  - **`@kalyx/core`** — `DateFnsAdapter` is no longer exported and `date-fns` / `date-fns-tz` are no longer listed as dependencies. `utils/timezone.ts` was the lone leak and uses native `new Date(string)` now (every caller already routes through `normalizeISO` or `DateAdapter.parse`, so the input subset is fully spec-defined).
  - **`@kalyx/adapter-date-fns`** — new package with the full `DateFnsAdapter` implementation moved verbatim. Same UTC semantics, same timezone-aware paths, same 35 adapter tests.
  - **`@kalyx/react`** — imports `DateFnsAdapter` from `@kalyx/adapter-date-fns` now. The default adapter is still wired up automatically — anyone using `import { DatePicker } from '@kalyx/react'` keeps the previous behaviour with zero changes. The adapter package is a direct dependency so consumers installing just `@kalyx/react` continue to get a working default.

  ### Migration

  If you imported `DateFnsAdapter` directly from `@kalyx/core`:

  ```diff
  - import { DateFnsAdapter } from '@kalyx/core';
  + import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
  ```

  `@kalyx/react` consumers don't need to change anything — the adapter is still re-exported from `@kalyx/react`.

  ### Next (separate PR)

  The `/headless` entry point (`@kalyx/react/headless`) that lets dayjs/luxon users tree-shake date-fns out is a follow-up. The component Roots still default to the date-fns adapter inline; the entry split requires moving that fallback out of each Root and into the entry boundary.

### Patch Changes

- Updated dependencies [5b6c37f]
  - @kalyx/core@1.0.0-rc.13
