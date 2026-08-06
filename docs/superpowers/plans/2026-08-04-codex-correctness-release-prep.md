# Codex Correctness Release Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete PR #187 with guaranteed all-IANA timezone coverage and a core/react patch changeset, without versioning, merging, or publishing.

**Architecture:** Keep the runtime fix unchanged. Extend the existing core property suite so every timezone returned by the supported Node runtime receives its own deterministic fast-check run, then encode release intent in one changeset. Validate the inherited implementation with a deliberate temporary noon-probe mutation because the production fix predates this test-completeness task.

**Tech Stack:** TypeScript, Vitest 4, fast-check 3, Intl, pnpm, Changesets, GitHub Actions Node 20/22 matrix

## Global Constraints

- Exercise every timezone returned by `Intl.supportedValuesOf('timeZone')`; random zone sampling is insufficient.
- Normalize generated values to UTC-midnight calendar coordinates from 2020-01-01 through 2045-01-01.
- Use deterministic per-zone seeds and at least 12 runs per zone.
- Keep the focused timezone property test below 10 seconds locally.
- Request patch releases for `@kalyx/core` and `@kalyx/react` only.
- Do not run `changeset version`, publish packages, merge PR #187, or change public APIs.

---

### Task 1: Guarantee all-IANA calendar-coordinate round trips

**Files:**
- Modify: `packages/core/src/__tests__/timezone.property.test.ts`

**Interfaces:**
- Consumes: `Intl.supportedValuesOf('timeZone')`, `civilMidnightFromUtcDay`, `calendarDayFromInstant`, and the existing `utcCalendarCoordinate()` arbitrary.
- Produces: one deterministic property that guarantees every runtime-supported IANA timezone is exercised.

- [ ] **Step 1: Add the all-zone property**

Add constants near the existing property configuration:

```ts
const IANA_ZONES = Intl.supportedValuesOf('timeZone');
const IANA_RUNS_PER_ZONE = 12;
const IANA_SEED = 0x4b414c59;
```

Add a test that first checks the enumerated list and then property-checks every zone:

```ts
it('round-trips calendar coordinates in every supported IANA timezone', () => {
  expect(IANA_ZONES.length).toBeGreaterThan(0);
  expect(IANA_ZONES).toEqual(
    expect.arrayContaining(['Pacific/Auckland', 'Pacific/Chatham', 'Pacific/Kiritimati']),
  );

  IANA_ZONES.forEach((timeZone, index) => {
    try {
      fc.assert(
        fc.property(utcCalendarCoordinate(), (coordinate) => {
          const instant = civilMidnightFromUtcDay(coordinate, timeZone);
          expect(calendarDayFromInstant(instant, timeZone)).toBe(coordinate);
        }),
        { numRuns: IANA_RUNS_PER_ZONE, seed: IANA_SEED + index },
      );
    } catch (error) {
      throw new Error(
        `Calendar-coordinate round trip failed in ${timeZone}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
});
```

- [ ] **Step 2: Run the focused suite and record its runtime**

Run:

```bash
time pnpm exec vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
```

Expected: PASS because the correctness implementation already exists; total wall-clock time remains below 10 seconds.

- [ ] **Step 3: Prove the property catches the original regression**

Temporarily replace `civilMidnightFromUtcDay` with the former noon-probe implementation, without staging it:

```ts
const utc = new Date(gridUtcIso);
const probe = new Date(
  Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 12, 0, 0),
).toISOString();
return startOfDayInTimezone(probe, timeZone);
```

Run the focused property test. Expected: FAIL with an extreme-positive timezone counterexample. Restore the direct `resolveCivilDateTime` implementation using `apply_patch`, then rerun and expect PASS.

- [ ] **Step 4: Run static checks for the test change**

Run:

```bash
pnpm exec prettier --check packages/core/src/__tests__/timezone.property.test.ts
pnpm lint
pnpm typecheck
git diff --check
```

Expected: all commands exit 0.

---

### Task 2: Encode the patch release intent

**Files:**
- Create: `.changeset/fix-calendar-coordinate-roundtrips.md`

**Interfaces:**
- Consumes: linked core/react release policy from `.changeset/config.json`.
- Produces: one valid Changesets patch declaration for core and react.

- [ ] **Step 1: Add the changeset**

Create:

```md
---
"@kalyx/core": patch
"@kalyx/react": patch
---

Preserve calendar dates in UTC+12 through UTC+14 display timezones and keep month navigation focus on enabled, rendered days.
```

- [ ] **Step 2: Validate changeset parsing and status**

Run:

```bash
node scripts/verify-changesets.mjs
pnpm changeset status
```

Expected: no ignored/publishable mixing error; status lists patch bumps for core and react and no other package.

- [ ] **Step 3: Commit the executable coverage and release intent**

```bash
git add packages/core/src/__tests__/timezone.property.test.ts .changeset/fix-calendar-coordinate-roundtrips.md
git commit -m "test(core): verify all IANA calendar round trips"
```

---

### Task 3: Verify and update PR #187

**Files:**
- Modify externally: PR #187 body only

**Interfaces:**
- Consumes: the final immutable branch HEAD and local verification evidence.
- Produces: an updated remote branch and PR body with Claude verification instructions.

- [ ] **Step 1: Run focused and complete verification**

Run:

```bash
pnpm exec vitest run packages/core/src/__tests__/timezone.test.ts packages/core/src/__tests__/timezone.property.test.ts
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:run
pnpm test:coverage
pnpm build
pnpm check-bundle
pnpm check-tree-shaking
pnpm --filter docs-site build
pnpm docs:build
pnpm test:e2e
node scripts/verify-changesets.mjs
git diff --check a71c43a..HEAD
git status --short
```

Expected: every command passes and the worktree is clean after reverting any generated `next-env.d.ts` change with `apply_patch`.

- [ ] **Step 2: Request independent read-only review**

Review the final range `a71c43a..HEAD`, focusing on guaranteed zone enumeration, property determinism, runtime cost, changeset scope, and absence of publish/version side effects. Resolve every Critical or Important finding before pushing.

- [ ] **Step 3: Push and update the PR**

```bash
git push origin fix/codex-correctness-2026-08
gh pr edit 187 --body-file /private/tmp/kalyx-codex-correctness-pr.md
```

Update the body first so it includes the final SHA, all-zone count/runtime, changeset scope, verification results, and Claude checklist.

- [ ] **Step 4: Monitor remote checks**

```bash
gh pr checks 187 --watch --interval 10
```

Expected: `All Checks Pass` and every required job succeeds.
