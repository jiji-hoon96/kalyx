# Task 1 report: civil-date coordinate conversion

## Files changed

- `packages/core/src/utils/timezone.ts`
- `packages/core/src/index.ts`
- `packages/core/src/__tests__/timezone.test.ts`
- `packages/core/src/__tests__/timezone.property.test.ts`

## Red test evidence

Command run before implementation:

```sh
pnpm vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
```

Outcome: failed as expected with 3 failed and 49 passed tests. Each new assertion failed because `calendarDayFromInstant is not a function`, including the generated DST-boundary property (first counterexample: `2026-03-08T06:59:59.000Z` in `America/New_York`). This confirms the tests exercised the missing public behavior rather than a test setup error.

## Implementation decisions

- `calendarDayFromInstant(iso, timeZone)` reuses the existing cached `Intl.DateTimeFormat` parts extractor to obtain the instant's civil year, month, and day.
- It returns `new Date(Date.UTC(year, month - 1, day)).toISOString()`, preserving calendar-grid coordinates as UTC-midnight civil-date values.
- It does not parse localized display strings.
- The helper is exported from the core package barrel.
- Example coverage pins New York and Seoul year-boundary conversion; property coverage checks civil-day preservation immediately around New York and London DST changes.

## Green verification

```sh
pnpm vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
```

Outcome: 2 test files passed, 52 tests passed, duration 1.35s.

```sh
pnpm --filter @kalyx/core build
```

Outcome: exited 0. ESM, CJS, and DTS builds all succeeded; DTS generation completed in 520ms.

```sh
git diff --check
```

Outcome: exited 0 with no whitespace errors.

## Self-review

- The conversion has one responsibility and uses the module's established timezone-parts cache.
- Tests have literal, independently derived expected values and invoke real timezone code without mocks.
- The property verifies the required composition with `civilMidnightFromUtcDay` and compares observed civil days rather than UTC dates.
- No unrelated production behavior or formatting was changed.

## Concerns

None.
