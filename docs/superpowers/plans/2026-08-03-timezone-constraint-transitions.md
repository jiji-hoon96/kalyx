# Timezone and Constraint Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make calendar civil-day identity and selection constraints consistent across rendered components, presets, keyboard input, and headless hooks without changing the public stored-value contract.

**Architecture:** Keep calendar grid cells as UTC-midnight *civil-date coordinates* (`YYYY-MM-DDT00:00:00.000Z`). Convert those coordinates to real instants only at the selection boundary when `displayTimezone` is set. Convert stored instants back to grid coordinates when deriving the visible month or focused cell. Centralize final disabled/time-filter checks in Root and hook mutation functions so every interaction path shares the same policy.

**Tech Stack:** TypeScript, React 19, Vitest, Testing Library, date-fns adapter, tsup.

## Global Constraints

- Work from baseline commit `77ed089be47e708f0ba54abdbd4271ee294d9aeb` plus the approved comparison spec only; do not cherry-pick Claude implementation commits.
- Preserve the existing stored-value contract: date-only values under `displayTimezone` are UTC instants representing civil midnight in that timezone.
- Preserve the existing grid-cell contract: `CalendarDay.isoString` remains a UTC-midnight civil-date coordinate.
- `before` and `after` disabled rules remain instant comparisons for backward compatibility. Only `{ date }` gains timezone-aware civil-day equality.
- A rejected selection is a no-op: no state change, no callback, and no popover close caused by that attempted commit.
- Existing controlled values that are now disabled remain renderable; constraints gate new mutations only.

### Task 1: Define the civil-date coordinate conversion

**Files:**

- Modify: `packages/core/src/utils/timezone.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/__tests__/timezone.test.ts`
- Test: `packages/core/src/__tests__/timezone.property.test.ts`

**Step 1: Write failing examples**

Add tests for a new exported `calendarDayFromInstant(iso, timezone)` helper:

- `2026-01-15T05:00:00.000Z` in `America/New_York` becomes `2026-01-15T00:00:00.000Z`.
- `2025-12-31T15:00:00.000Z` in `Asia/Seoul` becomes `2026-01-01T00:00:00.000Z`.
- Around generated DST-boundary instants, `civilMidnightFromUtcDay(calendarDayFromInstant(x, tz), tz)` is on the same civil day as `x`.

Run: `pnpm vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts`

Expected: FAIL because the export does not exist.

**Step 2: Implement the minimum helper**

Use the already-cached timezone parts in `timezone.ts`; construct a UTC ISO at midnight from the extracted civil year/month/day. Export it from `packages/core/src/index.ts`. Do not parse localized display strings.

**Step 3: Verify and commit**

Run the focused tests, then `pnpm --filter @kalyx/core build`.

Commit: `fix(core): add civil date coordinate conversion`

### Task 2: Make calendar flags and exact-date constraints timezone-correct

**Files:**

- Modify: `packages/core/src/utils/calendar.ts`
- Test: `packages/core/src/__tests__/calendar.test.ts`
- Test: `packages/core/src/__tests__/calendar.property.test.ts`

**Step 1: Write failing calendar tests**

Cover both offset directions:

- A January grid with selected `2026-01-15T05:00:00.000Z` and `America/New_York` marks day 15, not 16.
- A January grid with selected `2025-12-31T15:00:00.000Z` and `Asia/Seoul` marks January 1.
- `today`, range start/end/interior, and `{ date }` disabled flags use the same displayed civil day.
- `before`/`after` tests retain their current instant semantics.

Run: `pnpm vitest run packages/core/src/__tests__/calendar.test.ts packages/core/src/__tests__/calendar.property.test.ts`

Expected: FAIL on selected/range/exact-disabled civil-day assertions.

**Step 2: Implement candidate conversion at the grid boundary**

For each UTC grid coordinate, derive `candidateInstant` with `civilMidnightFromUtcDay` when a timezone is present. Use that instant for today, selected, range, and disabled comparisons while retaining the coordinate as `CalendarDay.isoString`, `dayNumber`, and month/week iteration state. Convert `rangeHover`, which is also a grid coordinate, before range preview comparison.

Extend `isDateDisabled` with an optional timezone argument and pass it only to `{ date }` equality. Keep all other rule behavior unchanged.

**Step 3: Verify and commit**

Run focused core tests and core build.

Commit: `fix(core): align calendar flags with display timezone`

### Task 3: Normalize DatePicker, TimePicker, and DateTimePicker state transitions

**Files:**

- Modify: `packages/react/src/components/DatePicker/Root.tsx`
- Modify: `packages/react/src/components/DatePicker/Calendar.tsx`
- Modify: `packages/react/src/components/DatePicker/Presets.tsx`
- Modify: `packages/react/src/components/TimePicker/Root.tsx`
- Modify: `packages/react/src/components/DateTimePicker/Root.tsx`
- Test: `packages/react/src/components/DatePicker/DatePicker.test.tsx`
- Test: `packages/react/src/components/TimePicker/TimePicker.test.tsx`
- Test: `packages/react/src/components/DateTimePicker/DateTimePicker.test.tsx`

**Step 1: Write failing transition tests**

Add component tests proving:

- A stored Seoul January 1 value opens January, highlights January 1, and focuses that cell.
- A New York January 15 value opens/highlights January 15 rather than January 16.
- DatePicker `today` and direct-date presets emit exactly one timezone conversion.
- Typed input matching a `{ date }`, `before`, `after`, `dayOfWeek`, or `filter` rule does not call `onChange`.
- Calendar keyboard Enter and disabled-date focus checks use the same timezone-aware predicate.
- TimePicker rejects typed and context-driven time mutations rejected by `filterTime` at the Root boundary.
- DateTimePicker rejects date commits whose merged datetime has a disabled civil date.
- DateTimePicker rejects full presets and time mutations rejected by `filterTime`.

Run the two component test files and observe the expected failures.

**Step 2: Normalize view/focus coordinates**

In both roots, convert `currentValue`/timezone-aware today to `calendarDayFromInstant` for lazy view/focus initialization and every `open()` reset. Keep stored values untouched. Derive `onCalendarNavigate` from the coordinate view month.

**Step 3: Centralize final validation**

In DatePicker `selectDate`, convert the coordinate once, then call `isDateDisabled(normalized, rules, adapter, displayTimezone)` before state/callback/close.

In TimePicker `setTime`, derive the final displayed hours/minutes from the merged value and reject it through `filterTime` before state/callback. This keeps typed input, lists, and direct context calls on the same policy.

In DateTimePicker, validate the final merged value in `updateValue`: date rules first, then `filterTime` using the final displayed hours/minutes. Permit `null`. This makes calendar, typed input, presets, and time controls share one gate.

**Step 4: Fix preset and keyboard boundary inputs**

Resolve DatePicker presets in coordinate space by converting timezone-aware today/direct values to a calendar coordinate before calling `selectDate`. In Calendar keyboard checks, convert the focused coordinate to its timezone civil-midnight instant before `isDateDisabled`.

**Step 5: Verify and commit**

Run all three focused component test files, React typecheck/build, and commit.

Commit: `fix(react): normalize date picker transitions`

### Task 4: Normalize range, week, and preset transitions

**Files:**

- Modify: `packages/react/src/components/RangePicker/Root.tsx`
- Modify: `packages/react/src/components/RangePicker/Calendar.tsx`
- Modify: `packages/react/src/components/RangePicker/Presets.tsx`
- Test: `packages/react/src/components/RangePicker/RangePicker.test.tsx`
- Test: `packages/react/src/components/WeekPicker/WeekPicker.test.tsx`

**Step 1: Write failing range/week tests**

Add tests proving:

- Stored zoned ranges open and highlight the correct month/endpoints in positive and negative offsets.
- Typed and direct preset endpoints matching disabled rules are rejected without callback or close.
- Predefined presets compute this week/month/year in the display timezone at UTC date boundaries.
- Calendar week mode emits both endpoints as timezone civil-midnight instants.
- `weekAnchor="clicked"` preserves its directional seven-day behavior after conversion.

Run the focused test files and observe failures.

**Step 2: Normalize Root transitions**

Convert stored start/today to coordinates for view/focus initialization and open. Convert clicked coordinates once in `selectDate`. Put endpoint constraint validation in `setRange` so typed input, presets, week mode, and direct headless-style context calls share it.

**Step 3: Normalize week and preset calculations**

Compute calendar weeks and predefined preset periods in coordinate space, then convert non-null endpoints exactly once before `setRange`. Pass timezone to active-state civil-day comparisons. Convert keyboard candidates before disabled checks.

**Step 4: Verify and commit**

Run focused tests and React build.

Commit: `fix(react): normalize range and week transitions`

### Task 5: Bring headless hooks to parity

**Files:**

- Modify: `packages/react/src/hooks/useDatePicker.ts`
- Modify: `packages/react/src/hooks/useRangePicker.ts`
- Modify: `packages/react/src/hooks/useWeekPicker.ts`
- Modify: `packages/react/src/hooks/useDateTimePicker.ts`
- Modify: `packages/react/src/hooks/useTimePicker.ts`
- Test: corresponding `packages/react/src/hooks/*.test.tsx`

**Step 1: Write failing hook tests**

For each hook, prove the same timezone month/focus and rejection outcomes as its component Root. Add `filterTime` to the time and datetime hook options and verify rejected mutations do not update uncontrolled state or call `onChange`. Verify week endpoints are timezone civil midnights.

Run: `pnpm vitest run packages/react/src/hooks/useDatePicker.test.tsx packages/react/src/hooks/useRangePicker.test.tsx packages/react/src/hooks/useWeekPicker.test.tsx packages/react/src/hooks/useDateTimePicker.test.tsx packages/react/src/hooks/useTimePicker.test.tsx`

Expected: FAIL for the new parity assertions and missing options.

**Step 2: Implement shared transition semantics**

Apply the same coordinate conversion and root-level validation order used by the rendered components. Avoid new React-global state or a behavior-heavy abstraction; small pure helpers may be added only where they remove literal duplicated conversion logic.

**Step 3: Verify and commit**

Run focused hook tests, React typecheck/build, and commit.

Commit: `fix(react): enforce constraints in headless hooks`

### Task 6: Full regression and comparison evidence

**Files:**

- Modify if needed: tests only for regressions found during verification
- Add: `.changeset/<generated-correctness-name>.md`
- Add: `docs/reviews/2026-08-03-claude-codex-correctness-comparison.md`

**Step 1: Run repository gates**

Run in this exact order:

1. `pnpm build`
2. `pnpm test:run`
3. `pnpm test:coverage`
4. `pnpm typecheck`
5. `pnpm lint`
6. `pnpm format:check`
7. `pnpm check-bundle`
8. `pnpm check-tree-shaking`
9. `pnpm test:e2e`

Record command, exit status, test counts, coverage, bundle sizes, and any pre-existing failures. Do not call a gate successful from stale CI or another worktree.

**Step 2: Add release note**

Add patch changesets for `@kalyx/core` and `@kalyx/react` describing civil-day correctness and consistent selection constraint enforcement.

**Step 3: Compare against Claude PRs**

Review PRs #178, #179, and #180 at their current head SHAs. Compare acceptance-test coverage, public API impact, root-cause handling, duplication, regression risk, bundle delta, and residual bugs. Because their summaries were visible before this implementation, label the comparison as outcome-based rather than blind.

**Step 4: Commit and open a draft PR**

Commit verification notes, push `fix/codex-correctness`, and open a draft PR targeting `main`. Include the baseline SHA, verification matrix, known limitations, and links to the Claude PRs.

Commit: `docs: compare Claude and Codex correctness fixes`
