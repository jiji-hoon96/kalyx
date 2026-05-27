# @kalyx/adapter-date-fns

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
