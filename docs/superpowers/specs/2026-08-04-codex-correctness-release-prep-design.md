# Codex Correctness Release Preparation Design

> **Date:** 2026-08-04
> **PR:** #187 (`fix/codex-correctness-2026-08`)
> **Reviewed implementation head:** `360259961a991b39034d74f18ba9c1932ba10210`

## Goal

Complete the release-preparation portion of the UTC+12 through UTC+14 correctness fix without merging the pull request or publishing packages. The pull request must prove the calendar-coordinate round trip across every IANA timezone exposed by the supported Node runtimes and must carry the patch release intent for both linked public packages.

## Scope

### Included

- Enumerate all IANA timezone identifiers exposed by `Intl.supportedValuesOf('timeZone')`.
- Exercise every enumerated timezone, rather than sampling zones from one global arbitrary.
- Property-check UTC calendar coordinates from 2020-01-01 through 2045-01-01 for each timezone.
- Use a fixed fast-check seed and a bounded number of runs per timezone so a CI failure is reproducible and the Node 20/22 matrix stays practical.
- Keep the existing exact Auckland, Chatham, and Kiritimati regression expectations.
- Add one changeset that declares patch releases for both `@kalyx/core` and `@kalyx/react`.
- Re-run the complete local quality gates and update PR #187 at an immutable head SHA.

### Excluded

- Merging PR #187.
- Running `changeset version`, changing package versions, creating tags, or publishing to npm.
- Documentation corrections, publish-tarball smoke tests, adapter provenance changes, and validation-tool changes. Those remain separate follow-up pull requests.

## IANA Property-Test Design

The test obtains the zone list at runtime:

```ts
const IANA_ZONES = Intl.supportedValuesOf('timeZone');
```

The suite first asserts that the list is non-empty and includes the three named regression zones. It then iterates over every zone. Each zone receives its own deterministic fast-check property over normalized UTC-midnight calendar coordinates in the supported date window:

```ts
calendarDayFromInstant(civilMidnightFromUtcDay(coordinate, zone), zone) === coordinate
```

The seed is fixed and included in failure output. Runs are bounded per zone; the implementation will start with 12 runs per zone and may increase only if the measured focused-test runtime remains below 10 seconds on the development machine. This guarantees zone coverage while avoiding the ambiguity of `fc.constantFrom(...zones)`, which can miss individual identifiers.

The property validates the public invariant. It does not duplicate the private offset algorithm or assert implementation details.

## Release Intent

The changeset contains both linked packages explicitly:

```yaml
"@kalyx/core": patch
"@kalyx/react": patch
```

`@kalyx/core` owns the corrected timezone function. `@kalyx/react` is included because it consumes and exposes that behavior and the repository links core/react releases. This also prevents users of the exact published React dependency graph from missing the corrected core version.

The changeset summary will mention both the extreme-positive timezone correction and disabled month-navigation focus correction already present in PR #187.

## Verification

The updated pull request must pass:

- focused timezone unit and property tests;
- `pnpm typecheck`;
- `pnpm lint`;
- `pnpm format:check`;
- `pnpm test:run` and `pnpm test:coverage`;
- `pnpm build`, `pnpm check-bundle`, and `pnpm check-tree-shaking`;
- both documentation builds used by the repository;
- `pnpm test:e2e` across Chromium, Firefox, and WebKit;
- `node scripts/verify-changesets.mjs`;
- `git diff --check` and a clean worktree.

PR #187 will retain a Claude verification checklist calling out the all-zone property, the fixed seed, the changeset package list, and the prohibition on publishing.

## Failure Handling

- If a runtime lacks `Intl.supportedValuesOf`, the test fails with an explicit supported-runtime error; the project requires Node 20 or newer, so silently falling back to a partial hard-coded list would weaken the guarantee.
- If a runtime exposes a zone that fails the invariant, fast-check reports the zone through the enclosing assertion context and reports the reproducible seed/counterexample.
- If the all-zone test exceeds the runtime budget, reduce runs per zone while preserving at least one generated coordinate for every zone. Never replace guaranteed enumeration with random zone sampling.

## Success Criteria

1. Every timezone returned by Node's `Intl.supportedValuesOf('timeZone')` is exercised in CI on Node 20 and Node 22.
2. Every exercised coordinate round-trips to the identical UTC calendar coordinate.
3. Auckland, Chatham, and Kiritimati retain exact instant expectations.
4. The changeset requests patch releases for core and react only.
5. No version, tag, GitHub release, npm package, or public API is changed during this task.
