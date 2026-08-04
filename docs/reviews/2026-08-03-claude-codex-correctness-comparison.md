# Claude/Codex correctness outcome comparison

Date: 2026-08-03 (America/Los_Angeles)

Baseline: `77ed089be47e708f0ba54abdbd4271ee294d9aeb`

Codex candidate: `fix/codex-correctness` through `abb787c`

This is an outcome-based comparison, not a blind comparison. Claude PR summaries and diffs were visible before the Codex implementation was finished. The evaluation therefore compares acceptance outcomes, regression risk, public API compatibility, tests, and measured bundle impact rather than claiming model-isolated authorship.

## Comparison method and limitations

This report is a code-review and reproduced-outcome assessment, not the blinded experiment originally described in `docs/superpowers/specs/2026-08-03-claude-codex-correctness-comparison-design.md`. The latest Claude diffs, comments, and reported CI were inspected, and their findings were checked against executable reproductions while the Codex candidate was developed. The Claude branches were not run through the same full repository gate in this worktree, and no shared withheld suite, withheld hash, `audit/model-comparison` artifact, or blinded numeric scorecard was produced.

Consequently, Claude PASS/FAIL cells below describe the observable acceptance coverage and residual risk of the reviewed PR diffs; they are not symmetric benchmark scores. A true candidate-to-candidate selection still requires the planned read-only cross-validation after both Draft PRs exist.

## Latest Claude PR state

All four PRs were re-queried from GitHub on 2026-08-03. They are open, mergeable, blocked by branch protection, and have successful reported CI checks.

| PR | Latest head | Verdict | Reason |
| --- | --- | --- | --- |
| #176 | `0d0300d1efec4e1b08bcbc623978fba0f61b0a6f` | 수정 필요 | The updated head adds a cross-evaluation handoff but does not correct the evaluation's missing P0 timezone findings, inaccurate docs/API claims, consumer bundle/tree-shaking evidence, or live audit evidence. |
| #178 | `0e32d2ea6fa9769b67739650d99e16714fff2fd0` | 대체 권장 | Correctly finds DatePicker typed-input bypass, but validates before timezone normalization, covers UTC only, and does not cover DateTime/Range/headless final mutation boundaries. |
| #179 | `98c2c66a28fb6ff8f0aa38d2245b48403ac766d6` | 대체 권장 | Makes a disabled cell non-focused in derived Core flags, but intentionally leaves React `focusedDate` stale, so DOM focus and the first Arrow origin diverge. Its tests do not assert the exact adjacent destination. |
| #180 | `0c105f60aa07120275328233eff6d481480ac0cf` | 대체 권장 | The positive-offset exact-date test hides the UTC-coordinate mismatch in negative offsets, and TimePicker validation remains input-specific rather than guarding final Root/context/headless mutations. |

The three Claude fixes are valid narrow bug discoveries. Their isolated CI success does not establish combined path parity, and this Codex worktree did not cherry-pick them.

## Acceptance matrix

| Acceptance outcome | Claude PRs | Codex candidate | Evidence/risk |
| --- | --- | --- | --- |
| New York stored date opens, focuses, and highlights the displayed civil day | FAIL | PASS | Claude does not normalize stored Root view/focus; Codex component and hook tests cover negative offsets. |
| Seoul first-of-month value reopens in the displayed month/day | FAIL | PASS | Codex converts stored instants to UTC-midnight calendar coordinates. |
| Selected/today/range/focus flags share civil-day identity | FAIL | PASS | Codex Core tests cover positive/negative offsets and range/focus/today. |
| Exact-date and day-of-week rules follow displayed civil dates | PARTIAL | PASS | #180 covers exact date only and misses the negative-offset representation; Codex also derives civil weekday. |
| `before`/`after` retain instant semantics | PASS/UNCHANGED | PASS | Codex passes stored instants to these comparisons and has regression coverage. |
| DatePicker typed/calendar/preset/context mutations share one final gate | PARTIAL | PASS | #178 handles only DatePicker Root with pre-normalized validation; Codex validates the normalized final candidate and avoids double conversion. |
| RangePicker preset/calendar/context endpoint parity | FAIL | PASS | Codex validates both final endpoints; rejected presets do not change state, call `onChange`, or close. Range text inputs remain intentionally read-only. |
| WeekPicker calendar/clicked anchors emit zoned civil-midnight endpoints | FAIL | PASS | Codex covers calendar and both clicked directions, plus no-timezone compatibility. |
| TimePicker `filterTime` sees final merged displayed time | PARTIAL | PASS | #180 gates typed input only; Codex gates Root and hook mutations. |
| DateTimePicker disabled date and `filterTime` apply to calendar/time/preset/context | FAIL | PASS | Codex validates the final merged datetime before state/callback/close. |
| Five headless hooks match rendered component semantics | FAIL | PASS | Codex covers view/focus normalization, final disabled gates, range/week endpoints, and time filters. |
| Rejected mutation causes no state, `onChange`, or popover close | PARTIAL | PASS | Codex assertions cover uncontrolled state and callback/close effects at final boundaries. |
| Disabled focused day keeps DOM focus, state, and first Arrow origin aligned | FAIL (known residual) | PASS | #179 documents its first-Arrow residual; Codex state transition and exact-destination tests cover it. |
| Public ISO-string contract and existing public return types remain compatible | PASS | PASS | Codex review caught and restored `UseRangePickerReturn.setRange: void`. |
| Repository 17KB React index budget | PASS per isolated Claude PR | FAIL | Codex measured ESM 18.30KB and CJS 18.43KB. No budget/config change was made. |

## Reproduced bugs and regression tests

- Stored zoned instants were used directly as UTC grid coordinates, shifting selected/focused cells and visible months in New York and Seoul.
- Exact-date and weekday disabled rules used mismatched UTC/civil coordinates.
- Typed, preset, context, range/week, and headless mutations could bypass final disabled checks.
- TimePicker and DateTimePicker mutations could bypass `filterTime` or apply it before the final merge.
- Week endpoints were emitted as raw UTC coordinates rather than timezone civil-midnight instants.
- Derived disabled focus could disagree with React state and the first Arrow origin.
- A fully disabled month could leave focus trapped because the initial resolver searched only within that month.
- Review regressions caught stale preset active state after timezone changes, stale hook toggle/navigation focus, and a public hook return-type change.

Each fix was developed from a failing reproduction before implementation. The durable regression tests are committed beside the affected domains; most transient RED logs and task review packets remain ignored local session artifacts rather than PR evidence. Final focused results were Range/Week 83/83 and headless hooks 83/83.

## Codex changes and commits

| Commit | Scope |
| --- | --- |
| `6c8e200` | Civil-date coordinate conversion |
| `ca22d26`, `09aaeb8`, `3fe02c1` | Calendar flags, focus, exact date, civil weekday |
| `d4386ae`, `cf23681` | Date/Time/DateTime Root and preset transitions |
| `a67276d`, `bc69a5e` | Range/week transitions and review regressions |
| `41da3ba`, `f5ec11d` | Five headless hooks and review fixes |
| `8453478`, `abb787c` | Disabled-focus alignment, zoned preset state, and fully disabled month escape |

Production changes are limited to Core timezone/calendar utilities and React picker Roots, Calendars, Presets, contexts, and hooks. Tests were added beside each affected domain. `.changeset/calm-clocks-align.md` releases `@kalyx/core` and `@kalyx/react` as patches.

## Full validation evidence

Commands were run in the required order in `/private/tmp/kalyx-codex-correctness`:

| Command | Exit | Actual result |
| --- | ---: | --- |
| `pnpm build` | 0 | Core/date-fns/React built; React index warning ESM 18.30KB, CJS 18.43KB. |
| `pnpm test:run` | 0 | 45 files, 852 tests passed. |
| `pnpm test:coverage` | 0 | 852 passed; statements 89.75%, branches 86.17%, functions 94.02%, lines 92.12%. |
| `pnpm typecheck` | 0 | `tsc -b` passed. |
| `pnpm lint` | 0 | ESLint passed. |
| `pnpm format:check` | 0 | All matched package source files passed Prettier. |
| `pnpm check-bundle` | 1 | FAIL: ESM 18.30KB and CJS 18.43KB exceed 17KB. |
| `pnpm check-tree-shaking` | 0 | Single picker 23.78KB gzip, hook 24.10KB, all 24.80KB; all picker scenarios remain identical. |
| `node scripts/verify-entry-split.mjs` | 1 | Additional PR-CI gate reproduced locally: default 26.39KB, headless 26.08KB; 1.2% reduction misses the >=2% threshold. CI measured 1.1%. |
| `pnpm test:e2e` | 0 | 93/93 passed across Chromium, Firefox, and WebKit. |
| `pnpm --filter docs-site typecheck` | 2 | Existing baseline failure: `src/pages/index.tsx(11,33): Cannot find namespace 'JSX'`. |

## Bundle and API delta

Baseline React index was approximately ESM 16.66KB / CJS 16.91KB gzip. The Codex candidate is ESM 18.30KB / CJS 18.43KB, about +1.64KB / +1.52KB and over budget. Source analysis attributes the growth to correctness logic distributed across Range Calendar/Root, DateTime Root, Core, exported headless hooks, and disabled-focus alignment rather than a build-option change. The 17KB limit and tsup/check scripts are untouched.

Consumer tree-shaking also remains an independent product risk: every single rendered picker bundles to the same 23.78KB gzip. The dedicated headless entry-split gate also fails because the headless consumer bundle is only 1.2% smaller than default locally (1.1% in CI), below its 2% sanity threshold. This branch does not redesign package entries because that was explicitly out of scope.

No intended breaking value or callback contract was introduced. Independent task review found and corrected a temporary `setRange` return-type regression before final validation.

The final independent correctness review reported no remaining Critical or Important finding in the implemented scope. Bundle size was explicitly excluded from that approval and remains a release decision.

## Remaining risks and recommendation

1. Bundle packaging has two release blockers: the 17KB React index ceiling and the >=2% headless entry-split threshold. Do not merge, silently raise a threshold, or change the export strategy without a maintainer decision. A shared transition-layer refactor could reduce duplication but is materially broader and needs its own regression/review cycle.
2. The docs-site JSX namespace failure predates this branch and is outside the correctness scope, but it should be fixed before calling repository-wide validation fully green.
3. Consumer tree-shaking claims remain unsupported by the current harness result and should be corrected or addressed separately.
4. Claude PR #176 should be corrected before merging as audit documentation. Do not merge #178/#179/#180 on top of the Codex implementation; they overlap and retain narrower semantics.

Recommended merge order after resolving the bundle decision: Codex correctness candidate first; a corrected documentation-only #176 second; close or supersede #178/#179/#180. Do not merge any branch yet.
