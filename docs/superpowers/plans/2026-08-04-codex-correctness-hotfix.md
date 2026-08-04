# Codex Correctness Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve UTC calendar coordinates across the complete IANA offset range and prevent partially disabled calendars from stranding focus after month navigation.

**Architecture:** Extract the proven two-pass civil-time resolution inside `setTimeInTimezone` into one private helper that accepts explicit civil fields, then route `civilMidnightFromUtcDay` through it. Reuse the existing `resolveEnabledCalendarFocus` at the three month-navigation boundaries instead of creating another focus algorithm.

**Tech Stack:** TypeScript 5, React 19, Vitest 4, Testing Library, fast-check, tsup, Playwright.

## Global Constraints

- Baseline is immutable commit `a71c43a`.
- No public API additions or signature changes.
- Preserve spring-gap snap-forward and fall-ambiguity earlier-instant behavior.
- Do not mix documentation, release, supply-chain, prop-precedence, or feature work into this PR.
- Every production change must be preceded by a focused test observed failing for the expected reason.
- Default `@kalyx/react` ESM and CJS artifacts must stay below the approved 20 KB gzip ceiling.

---

### Task 1: Extreme-positive timezone coordinate preservation

**Files:**
- Modify: `packages/core/src/__tests__/timezone.test.ts`
- Modify: `packages/core/src/__tests__/timezone.property.test.ts`
- Modify: `packages/core/src/utils/timezone.ts`

**Interfaces:**
- Consumes: existing public `civilMidnightFromUtcDay(gridUtcIso, timeZone)`, `calendarDayFromInstant(iso, timeZone)`, and `setTimeInTimezone(iso, partial, timeZone)`.
- Produces: private `resolveCivilDateTime(parts, timeZone): ISODateString`; public signatures and exports remain unchanged.

- [ ] **Step 1: Add literal extreme-positive regression fixtures**

Append to the existing `civilMidnightFromUtcDay — calendar-grid cell bridge` describe block:

```ts
it.each([
  ['Pacific/Auckland', '2026-01-14T11:00:00.000Z'],
  ['Pacific/Chatham', '2026-01-14T10:15:00.000Z'],
  ['Pacific/Kiritimati', '2026-01-14T10:00:00.000Z'],
] as const)('preserves January 15 in %s', (timeZone, expected) => {
  const coordinate = '2026-01-15T00:00:00.000Z';
  const instant = civilMidnightFromUtcDay(coordinate, timeZone);

  expect(instant).toBe(expected);
  expect(calendarDayFromInstant(instant, timeZone)).toBe(coordinate);
});
```

These hand-derived literals catch the noon-probe mutation: Auckland/Chatham/Kiritimati must not round-trip as January 16.

- [ ] **Step 2: Add the missing coordinate round-trip property**

Add `Pacific/Auckland` and `Pacific/Chatham` to `ZONES`. Define a UTC-midnight coordinate generator independently from the production helper:

```ts
const utcCalendarCoordinate = () =>
  fc
    .date({
      min: new Date('2020-01-01T00:00:00.000Z'),
      max: new Date('2045-01-01T00:00:00.000Z'),
      noInvalidDate: true,
    })
    .map(
      (date) =>
        new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
        ).toISOString(),
    );
```

Add this invariant to `timezone invariants (property-based)`:

```ts
it('round-trips every UTC calendar coordinate through civil midnight', () => {
  fc.assert(
    fc.property(utcCalendarCoordinate(), zone(), (coordinate, timeZone) => {
      const instant = civilMidnightFromUtcDay(coordinate, timeZone);
      expect(calendarDayFromInstant(instant, timeZone)).toBe(coordinate);
    }),
    RUNS,
  );
});
```

- [ ] **Step 3: Verify RED for the timezone tests**

Run:

```bash
pnpm exec vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
```

Expected: FAIL because the current noon probe maps at least Auckland, Chatham, and Kiritimati to January 16. Existing unrelated timezone tests must remain green.

- [ ] **Step 4: Extract an explicit civil-date-time resolver**

In `packages/core/src/utils/timezone.ts`, add a private type and helper immediately before `setTimeInTimezone`:

```ts
type CivilDateTime = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function resolveCivilDateTime(target: CivilDateTime, timeZone: string): ISODateString {
  const civilEpoch = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hours,
    target.minutes,
    target.seconds,
  );
  const probe1 = new Date(civilEpoch).toISOString();
  const offset1 = getTimezoneOffsetMinutes(probe1, timeZone);
  const realEpoch1 = civilEpoch - offset1 * 60_000;
  const probe2 = new Date(realEpoch1).toISOString();
  const offset2 = getTimezoneOffsetMinutes(probe2, timeZone);
  const realEpoch2 = civilEpoch - offset2 * 60_000;

  const civilMatches = (epoch: number) => {
    const actual = partsInTimezone(new Date(epoch), timeZone);
    return (
      actual.year === target.year &&
      actual.month === target.month &&
      actual.day === target.day &&
      actual.hour === target.hours &&
      actual.minute === target.minutes &&
      actual.second === target.seconds
    );
  };
  const match1 = civilMatches(realEpoch1);
  const match2 = civilMatches(realEpoch2);

  if (match1 && match2) return new Date(Math.min(realEpoch1, realEpoch2)).toISOString();
  if (match1) return new Date(realEpoch1).toISOString();
  if (match2) return new Date(realEpoch2).toISOString();
  return new Date(Math.max(realEpoch1, realEpoch2)).toISOString();
}
```

Move the existing explanatory two-pass comment above this helper. Do not change its gap/ambiguity selection rules.

- [ ] **Step 5: Route both public functions through the resolver**

Replace the noon-probe body of `civilMidnightFromUtcDay` with:

```ts
const coordinate = new Date(gridUtcIso);
return resolveCivilDateTime(
  {
    year: coordinate.getUTCFullYear(),
    month: coordinate.getUTCMonth() + 1,
    day: coordinate.getUTCDate(),
    hours: 0,
    minutes: 0,
    seconds: 0,
  },
  timeZone,
);
```

Replace the duplicated two-pass implementation in `setTimeInTimezone` with:

```ts
return resolveCivilDateTime(
  {
    year: p.year,
    month: p.month,
    day: p.day,
    hours: partial.hours ?? p.hour,
    minutes: partial.minutes ?? p.minute,
    seconds: partial.seconds ?? p.second,
  },
  timeZone,
);
```

- [ ] **Step 6: Verify GREEN and unchanged DST behavior**

Run:

```bash
pnpm exec vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
```

Expected: both files pass, including existing Sydney start-of-day, New York spring gap, and fall ambiguity tests.

- [ ] **Step 7: Commit the timezone fix**

```bash
git add packages/core/src/utils/timezone.ts packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
git commit -m "fix(core): preserve extreme-positive timezone dates"
```

---

### Task 2: Enabled focus after calendar month navigation

**Files:**
- Modify: `packages/react/src/components/DatePicker/DatePicker.test.tsx`
- Modify: `packages/react/src/components/RangePicker/RangePicker.test.tsx`
- Modify: `packages/react/src/hooks/useDatePicker.test.tsx`
- Modify: `packages/react/src/components/DatePicker/Calendar.tsx`
- Modify: `packages/react/src/components/RangePicker/Calendar.tsx`
- Modify: `packages/react/src/hooks/useDatePicker.ts`

**Interfaces:**
- Consumes: existing internal `resolveEnabledCalendarFocus(coordinate, disabled, adapter, timezone?)`.
- Produces: no new interface; existing navigation methods and buttons now store an enabled focus coordinate.

- [ ] **Step 1: Add a DatePicker DOM regression**

Add a test beside the existing disabled-focus keyboard tests:

```tsx
it('retargets focus after next-month navigation when the first day is disabled', async () => {
  const user = userEvent.setup();
  render(
    <DatePicker
      defaultValue="2026-06-15T00:00:00.000Z"
      disabled={[{ dayOfWeek: [3] }]}
    >
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );

  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('button', { name: /next month/i }));

  const focused = document.querySelector<HTMLButtonElement>('[data-focused="true"]');
  expect(focused).toHaveAccessibleName('Thursday, July 2, 2026');
  expect(focused).toBeEnabled();
  expect(focused).toHaveFocus();

  await user.keyboard('{ArrowRight}');
  expect(document.activeElement).toHaveAccessibleName('Friday, July 3, 2026');
});
```

This catches direct assignment of disabled July 1 and proves the keyboard can recover.

- [ ] **Step 2: Add RangePicker and hook regressions**

Add a RangePicker test near calendar navigation callbacks:

```tsx
it('keeps an enabled focus anchor when the target month starts disabled', async () => {
  const user = userEvent.setup();
  renderRangePicker({
    defaultValue: { start: '2026-06-15T00:00:00.000Z', end: null },
    disabled: [{ dayOfWeek: [3] }],
  });

  await user.click(screen.getByLabelText('Start date'));
  await user.click(screen.getByRole('button', { name: 'Next month' }));

  const focused = document.querySelector<HTMLButtonElement>('[data-focused="true"]');
  expect(focused).toHaveAccessibleName('Thursday, July 2, 2026');
  expect(focused).toBeEnabled();
  expect(focused).toHaveFocus();
});
```

Add hook tests to `useDatePicker — navigation`:

```ts
it.each([
  ['nextMonth', '2026-06-15T00:00:00.000Z', '2026-07-02T00:00:00.000Z'],
  ['previousMonth', '2026-08-15T00:00:00.000Z', '2026-07-02T00:00:00.000Z'],
] as const)('%s skips a disabled first day', (method, initial, expected) => {
  const { result } = renderHook(() =>
    useDatePicker({
      defaultValue: initial,
      disabled: [{ dayOfWeek: [3] }],
    }),
  );

  act(() => result.current[method]());

  expect(result.current.focusedDate).toBe(expected);
});
```

- [ ] **Step 3: Verify RED for focus navigation**

Run:

```bash
pnpm exec vitest run packages/react/src/components/DatePicker/DatePicker.test.tsx packages/react/src/components/RangePicker/RangePicker.test.tsx packages/react/src/hooks/useDatePicker.test.tsx
```

Expected: new tests fail because focused state remains July 1, which is disabled. Existing tests remain green.

- [ ] **Step 4: Reuse the enabled-focus resolver in component calendars**

Import `resolveEnabledCalendarFocus` into both calendar files. In each `navigateMonth` callback, replace the direct focused-date assignment with:

```ts
const monthStart = adapter.startOfMonth(newMonth);
ctx.setFocusedDate(
  resolveEnabledCalendarFocus(monthStart, disabled, adapter, displayTimezone),
);
```

Add `disabled` and `displayTimezone` to the callback dependency array. Keep `ctx.setViewMonth(newMonth)` and the month announcement unchanged.

- [ ] **Step 5: Reuse the resolver in the standalone hook**

In both `previousMonth` and `nextMonth`:

```ts
const monthStart = adapter.startOfMonth(newMonth);
setViewMonth(newMonth);
setFocusedDate(
  resolveEnabledCalendarFocus(monthStart, disabled, adapter, displayTimezone),
);
```

Add `disabled` and `displayTimezone` to both dependency arrays.

- [ ] **Step 6: Verify GREEN**

Run:

```bash
pnpm exec vitest run packages/react/src/components/DatePicker/DatePicker.test.tsx packages/react/src/components/RangePicker/RangePicker.test.tsx packages/react/src/hooks/useDatePicker.test.tsx
```

Expected: all three files pass and new focused elements are enabled.

- [ ] **Step 7: Commit the focus fix**

```bash
git add packages/react/src/components/DatePicker/Calendar.tsx packages/react/src/components/DatePicker/DatePicker.test.tsx packages/react/src/components/RangePicker/Calendar.tsx packages/react/src/components/RangePicker/RangePicker.test.tsx packages/react/src/hooks/useDatePicker.ts packages/react/src/hooks/useDatePicker.test.tsx
git commit -m "fix(react): retarget disabled focus after month navigation"
```

---

### Task 3: Full verification and Claude handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-08-04-codex-correctness-hotfix.md` only to check completed boxes if desired; no production changes.

**Interfaces:**
- Consumes: committed Task 1 and Task 2 behavior.
- Produces: immutable verification evidence and a PR description Claude can reproduce.

- [ ] **Step 1: Run static and focused verification**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm exec vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts packages/react/src/components/DatePicker/DatePicker.test.tsx packages/react/src/components/RangePicker/RangePicker.test.tsx packages/react/src/hooks/useDatePicker.test.tsx
```

Expected: every command exits 0.

- [ ] **Step 2: Run the complete test and coverage suites**

```bash
pnpm test:run
pnpm test:coverage
```

Expected: all test files and tests pass; record exact counts and coverage percentages from output.

- [ ] **Step 3: Build and verify package boundaries**

```bash
pnpm build
pnpm check-bundle
node scripts/verify-entry-split.mjs
pnpm --filter docs-site build
```

Expected: builds exit 0; ESM/CJS default bundles remain ≤20 KB; headless contains no date-fns; EN and KO docs build.

- [ ] **Step 4: Run cross-browser E2E**

```bash
pnpm test:e2e
```

Expected: Chromium, Firefox, and WebKit all pass. Record the total count.

- [ ] **Step 5: Inspect the final diff and immutable state**

```bash
git diff --check
git status --short
git log --oneline --decorate -5
git diff a71c43a...HEAD --stat
```

Expected: no unstaged production changes, no whitespace errors, and only the design, plan, tests, and two scoped implementations differ from baseline.

- [ ] **Step 6: Push and open the Codex PR**

```bash
git push -u origin fix/codex-correctness-2026-08
gh pr create --base main --head fix/codex-correctness-2026-08 --title "fix: close timezone and disabled-focus correctness gaps" --body-file /tmp/kalyx-codex-correctness-pr.md
```

The PR body must contain:

- baseline and head SHAs;
- root causes and affected zones/flows;
- RED and GREEN commands with observed outcomes;
- full verification counts and bundle values;
- explicit non-goals;
- a link to the design document;
- the eight-item Claude adversarial checklist from the design.

- [ ] **Step 7: Hand the PR to Claude**

Provide Claude the PR URL and instruct it to review from the immutable head SHA, independently rerun the listed commands, perform implementation-revert RED checks, and report any disagreement without modifying the Codex branch.
