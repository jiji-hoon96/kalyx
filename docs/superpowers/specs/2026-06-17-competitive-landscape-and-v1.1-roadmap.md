# 2026-06 Competitive Landscape and v1.1+ Roadmap

**Date.** 2026-06-17
**Author.** Maintainer (with multi-agent research + audit synthesis)
**Companion.** `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md` (internal defect/gap catalog).
**Sources.** Multi-source primary-fetch with 3-vote adversarial verification (21 verified claims). Full research transcript: `/tmp/kalyx-research-report.md`.

---

## TL;DR

The Kalyx 1.0 thesis — **headless + integrated DatePicker/TimePicker/Range/Input + adapter pattern + ISO/UTC strings + ≤16 KB gzip** — is structurally intact in mid-2026. None of the four library-shaped holes Kalyx targeted has closed:

| 1.0 thesis | June 2026 status |
|---|---|
| Headless UI declines DatePicker | **Still declines.** Discussion #289 open since 2021, no maintainer answer, zero date components in source. |
| react-day-picker has no Input/TimePicker | **Still doesn't.** v10.0.1 is a "cleanup release"; official docs explicitly say "DayPicker does not include a built-in time picker." |
| react-datepicker has the #1018 timezone bug | **Closed as docs-only "not a bug."** 8-year issue resolved by `949cd8e` (Nov 2025, +2/+87 docs lines, zero source changes). Library still uses native `Date` as value. |
| MUI X is heavy and partly paywalled | **Heavier and more paywalled.** 9.5.0 = 58.2 KB gzip, Range/Time-Range pickers explicitly require a commercial Pro license. |

Two real shifts happened that should bend the roadmap:

1. **Chakra UI v3.34 (March 2026) shipped a DatePicker** — but it inherits Ark UI's hard `@internationalized/date` dependency, which *deepened* in 2026 with `useDateFormatter` and Persian/Buddhist/Islamic/Hebrew calendar support all routed through that library. The "Chakra has nothing" narrative is dead; the "Adobe-stack lock-in" critique is sharper.
2. **Adobe documents `@internationalized/date` as Temporal-bound** by design ("we hope to back the objects in this package with Temporal once browsers ship it"). The entire React Aria / Ark / Chakra stack is pre-positioned to inherit Temporal correctness for free. Kalyx's date-fns core is not.

Combined with the internal audit's findings, the recommended v1.1+ ordering is below.

---

## Section 1 — What the 1.0 thesis got right (still moat)

### 1.1 Headless DatePicker for Tailwind ecosystem
Headless UI Discussion [#289](https://github.com/tailwindlabs/headlessui/discussions/289) remains open since 2021-03-25 with 118 +1 reactions, no maintainer answer, and verified-empty `packages/@headlessui-react/src/components` (retrieved 2026-06-17). Recent community comments (April 2025, February 2026) reaffirm the gap. Tailwind users still get redirected to React Aria.

**Hold.** Kalyx is the only "headless + integrated + ≤16KB" option for that audience. Marketing investment here pays.

### 1.2 Integrated TimePicker + DateTimePicker + RangePicker
react-day-picker v10's "guides/timepicker" page (retrieved 2026-06-17) verbatim: "DayPicker does not include a built-in time picker." v10 added Hijri calendar, `resetOnSelect`, and `@daypicker/*` scoped add-ons — nothing on time selection or input integration.

Ark UI does **not** have a standalone TimePicker as of v5.32.0 (the audit's prior CLAUDE.md claim "Ark UI removed TimePicker" was technically loose; more precisely, Ark folds time into DatePicker via `CalendarDateTime` from `@internationalized/date` — not a standalone component a Tailwind user can compose).

**Hold.** Composition story remains uniquely complete in the headless category.

### 1.3 ISO 8601 UTC string in/out + IANA timezone
react-datepicker 9.1.0 (Nov 2025) added an optional `timeZone` IANA prop gated behind `date-fns-tz` peer (commit `2cd1b36`). But the library still uses `Date` as the value type, still ships CSS as side-effect, and #1018 was explicitly classified as "expected JavaScript `Date` behavior" rather than fixed.

**Partially eroded but still distinctive.** Kalyx's ISO-string-everywhere + DST-aware civil-midnight is architecturally separate from "opt into date-fns-tz." Worth keeping the moat sharp; see §2 audit follow-ups (T-D1, T-D2).

### 1.4 Free Range Picker
MUI X 9.5.0 = 58.2 KB gzip ([bundlephobia, retrieved 2026-06-17](https://bundlephobia.com/package/@mui/x-date-pickers)); `DateRangePicker` and `TimeRangePicker` ship only in `@mui/x-date-pickers-pro` and require a commercial Pro license. That license is the strongest single positioning argument Kalyx has gained since 1.0.

**Lean in.** Marketing/comparison work (see §3 item M1) should explicitly contrast.

### 1.5 Adapter pattern + Headless entry
@mantine/dates@9.3.2 declares `dayjs` as a non-negotiable peer ("dayjs is a required dependency – you cannot change it to another date library"). Ark UI 5.32 made `@internationalized/date` deeper, not shallower. **No mainstream React date library other than Kalyx offers adapter pluggability.** The `/headless` entry split (1.0.0 ship) and the standalone `@kalyx/adapter-date-fns` package mean Kalyx is the only mainstream option whose date library is a build-time choice.

**Hold and extend.** This is the single most defensible architectural choice. v1.1 should make the implicit promise explicit by shipping a second adapter.

---

## Section 2 — What the 1.0 thesis underweighted (new dimensions)

### 2.1 Temporal-readiness as a future feature
The single most important dimension that didn't exist when Kalyx was scoped: **Adobe explicitly documents that `@internationalized/date` is Temporal-shaped and will be backed by Temporal once browsers ship it** ([Adobe docs, retrieved 2026-06-17](https://react-aria.adobe.com/internationalized/date/)). The whole React Aria + Ark + Chakra ecosystem is positioned to inherit Temporal correctness without API change.

Kalyx's adapter pattern is the right shape to absorb this, but only if an experimental `@kalyx/adapter-temporal` exists before Temporal ships. Adobe's stack will appear "Temporal-native" to a market unfamiliar with the polyfill timing.

**Implication.** Promote Temporal adapter from "v1.1+ when Temporal stabilizes" (current CLAUDE.md §14) to **v1.1 experimental track** — even pre-shipping, it can target polyfilled environments and Node 22+. The optionality matters more than the immediate user count.

### 2.2 The Adobe-stack as a single competitor
React Aria, Ark UI, and Chakra UI v3.34 now all compose `@internationalized/date`. They share a 2.8–8 KB Brotli (not gzip) tax for the date library plus their UI primitives. This is a **single bloc**, not three separate competitors. The architectural critique — date-library lock-in, Brotli-only size claim, calendar-system feature surface routed through one third-party — applies to all three at once.

**Implication.** Comparison-page copy should treat them as a category, not enumerate separately. (Mantine + dayjs is its own bloc.)

### 2.3 Non-Gregorian calendar feature creep
Ark v5.32.0 (2026-02-21) added Persian / Buddhist / Islamic / Hebrew calendars via `@internationalized/date`. react-day-picker v10 added Hijri + `@daypicker/persian|hebrew|buddhist|ethiopic|islamic` packages. This is a market signal — non-Gregorian calendar support is now table-stakes in the high-end of the market.

**Implication.** Kalyx should be **explicit** that Gregorian-only is the v1 line. Don't compete on calendar count; acknowledge the gap on comparison page so it doesn't read as undisclosed limitation.

### 2.4 React 19 RSC, but not yet a date-picker story
React 19 adoption is mainstream by mid-2026 but no major picker has shipped meaningful RSC server-component primitives (all major libraries remain `'use client'`). RSC compat for Kalyx today means "works behind a client boundary" — which is what every competitor also does. **Not a v1.1 differentiator.** Worth a docs note ("use behind `'use client'`"), not engineering work.

### 2.5 AI/LLM agent integration
Not surfaced in this round of research as a date-picker-specific category. **No action.**

---

## Section 3 — Recommended v1.1+ roadmap (impact × effort)

Priorities are derived from intersecting research findings with the internal audit (`2026-06-17-kalyx-1.0-functional-audit.md`). Each item references either the research finding `[R-n]` or the audit ID (`A-Dx`, `T-Dx`, `B-Dx`, etc.) — or both.

### Track A — 1.0.x patch (next 2-4 weeks)

Items below are correctness or contract enforcement. No public API change.

| # | Item | Refs | Effort |
|---|---|---|---|
| A1 | Escape consumption + double-handler fix | A-D1, A-D2 | XS |
| A2 | Focus restoration on popover close | A-D3 | S |
| A3 | DST gap-time: snap-forward + document + test | T-D1 | M |
| A4 | DST ambiguous-time: document choice + strict test | T-D2 | XS |
| A5 | `verify-entry-split.mjs` in `pr-check.yml` | B-D1, [R-4] | XS |
| A6 | Gzip-measurement single source of truth | B-R1 | XS |
| A7 | RangePicker hover preview regression test | TC-H1 | S |
| A8 | Rolling coverage adds: fractional offsets (T-D3), `minDate`/`maxDate` × TZ (T-G1), value-on-disabled (TC-M1), controlled↔uncontrolled (TC-M2), props-during-open (TC-M3), DateTimePicker TZ round-trip (TC-M5), TimePicker step snap (TC-M6), WeekPicker year boundary (TC-M7) | various | XS each |

Bundle impact target: **zero new code paths, ≤50 bytes net.**

### Track B — v1.1 minor (next 6-10 weeks)

The minor that turns the adapter pattern from a promise into a demonstrated capability. Anchor: **two real adapters in npm + the conformance suite that proves they're interchangeable.**

| # | Item | Refs | Effort | Impact |
|---|---|---|---|---|
| B1 | `@kalyx/adapter-dayjs` package | CLAUDE.md §14 (existing), [R-7] | M | High |
| B2 | `@kalyx/core/test-helpers` adapter conformance suite | CLAUDE.md §14 (existing) | M | High (unblocks B1, B3, B6) |
| B3 | `@kalyx/adapter-luxon` package | CLAUDE.md §14 (existing) | S-M (after B2) | Med |
| B4 | `useMonthPicker` / `useYearPicker` / `useWeekPicker` / `useDateTimePicker` hooks (ship under `/headless` only) | API-G1 | M | Med |
| B5 | `DateTimePicker.Presets` (compose existing Presets pattern) | API-G2 | M | Med |
| B6 | `@kalyx/adapter-temporal` (experimental flag) | [R-5], CLAUDE.md §14 | M-L | Strategic |
| B7 | `weekStartsOn` locale inference (explicit prop overrides) | T-G2 | XS | Low-Med |
| B8 | Korean translation of `/headless` adapter guide | CLAUDE.md §14 (existing), [R-7] | S | Med |
| B9 | Bundle margin tooling: `scripts/bundle-diff.mjs` + PR comment | B-D2, CLAUDE.md §14 (existing) | M | Med |
| B10 | a11y polish set: A-G1 (`announce()` parity), A-G2 (WeekPicker nav decision), A-G3 (axe-when-open for DatePicker), A-G4 (Trigger focus-restore tests), A-G5 (week-mode aria-label) | various | S | Low-Med |
| B11 | Public docs: comparison page refresh + landing comparison vs MUI X Pro paywall | [R-6] | S | High |

Bundle impact target: hooks (B4) and Presets (B5) **must ship under `/headless` exports only**, leaving the default entry untouched. Margin pressure on the default entry must not increase.

### Track C — v1.2 minor (next quarter)

Items that need a clear user signal or that depend on Track B landing.

| # | Item | Refs | Effort | Impact |
|---|---|---|---|---|
| C1 | RTL support + tests | TC-M4 | M | Med (i18n market) |
| C2 | Adopt `fast-check` for `@kalyx/core` date math | TC-H2 | M | Med (correctness) |
| C3 | `DisabledRule` type narrowing per picker, OR documented semantics | API-G3 | S | Low |
| C4 | More e2e: mid-flight prop changes, locale switch | structural | M | Low-Med |
| C5 | Per-dependency bundle size report (`@floating-ui/react` etc.) | B-R2 | S | Low |

### Track D — Strategic watch (no commitment yet)

| # | Item | Trigger |
|---|---|---|
| D1 | Persian/Buddhist/Islamic/Hebrew calendar support | A concrete user request, OR competitor catches up enough that omission becomes a marketing liability. (Currently: Kalyx is honest about Gregorian-only; that's enough.) |
| D2 | React Native adapter | Already deferred in CLAUDE.md §14. Hold. |
| D3 | Storybook / visual regression | If 3+ a11y or visual regressions slip through in 1.0.x or 1.1, escalate. |

### Marketing / non-engineering

| # | Item | Refs |
|---|---|---|
| M1 | "Free MIT Range Picker, ≤16KB, headless, no Pro license" landing comparison | [R-6] |
| M2 | Soften CLAUDE.md §1 line about "Ark UI removed TimePicker." More accurate: "Ark UI has no standalone TimePicker; time is folded into DatePicker via `@internationalized/date`." | [R-4] |
| M3 | Add note on Brotli vs gzip when citing `@internationalized/date` 8 KB / 2.8 KB figures. Don't put a Brotli number next to a gzip number without normalizing. | research caveat |
| M4 | Adobe-stack as a single category in comparison copy (React Aria + Ark + Chakra v3.34+ all share the `@internationalized/date` tax). | [R-4], [R-5] |
| M5 | Honest disclosure: Gregorian-only for v1; non-Gregorian on D1. | [R-2], [R-4] |

---

## Section 4 — Reordering CLAUDE.md §14 (next track)

Current §14 lists four v1.1+ tracks (`@kalyx/adapter-dayjs`, conformance suite, KO `/headless` translation, bundle margin monitoring) plus four "1.0 follow-ups" (Trusted Publisher registration, GitHub release backfill, release.yml hardening, docs CHANGELOG / lockfile refresh).

This spec recommends keeping all eight items and adding the rest. Updated §14 (see "Section 5" below) should:

1. Move the 1.0 follow-ups (Trusted Publisher etc.) to a dedicated "1.0 cleanup" subsection — they're still live but tactically narrow.
2. Promote `@kalyx/adapter-dayjs` + adapter conformance suite to "1.1 P0" — they're the spine of the minor.
3. Add **1.0.x patch** items (A1-A8 from this spec) as a new immediate subsection.
4. Add `@kalyx/adapter-temporal` (experimental) as a 1.1 strategic track.
5. Add B11 (marketing comparison vs MUI X Pro) as a near-term marketing item.

---

## Section 5 — Decisions to make before starting Track B

These are forks where I should not start work without a decision:

1. **B6 (Temporal adapter) flag plumbing.** Ship as `@kalyx/adapter-temporal@0.x` separately published, OR `@kalyx/adapter-temporal` published but with a runtime guard that throws unless `globalThis.Temporal` exists? **Recommendation:** separately published `@kalyx/adapter-temporal@0.x` (matches the adapter package pattern; no surprises in the default install).
2. **B4 (missing hooks) entry placement.** Headless-only, OR default entry too? **Recommendation:** headless-only. The default entry is for users who want components; if they want hooks, they're already on `/headless`. Saves bundle pressure.
3. **B11 marketing claim shape.** Claim "5× smaller than MUI X" using 58.2 / 15.63 ≈ 3.7× — **NOT 5×**. Keep it accurate; "nearly 4× smaller" is fine. Don't put the Brotli number from Adobe next to gzip.
4. **A3 (DST gap-time) policy.** Snap-forward (recommended) vs. throw. **Recommendation:** snap-forward. Matches `@internationalized/date` / Temporal `disambiguation: 'earlier'`-then-forward; least surprising for a UI picker.
5. **D1 trigger threshold.** What signal moves non-Gregorian from "watch" to "do"? **Recommendation:** ≥3 distinct GitHub issues asking for it, OR a single enterprise sponsor.

---

## Section 6 — What this spec does NOT cover

- Pricing / commercial Kalyx offering. Out of scope.
- Detailed designs for each adapter package — those become their own specs at execution time.
- Per-PR work breakdown for Track A. Treated as a single patch series; will be planned with writing-plans skill when starting.
- React Native adapter. Deferred per CLAUDE.md §14.

---

## Section 7 — Followups

When Track A patches ship, revisit:

1. Does the ~380-byte bundle margin hold? If so, defer B9 (bundle-diff tooling).
2. Did A3's snap-forward policy generate user feedback? If users want `disambiguation` as a configurable option, fold into B6/B7.
3. Re-check Radix UI date-picker status (research caveat #1) and `react-calendar` / `react-native-calendars` (research caveat #4) — they were not fetched this round.
4. Re-check TC39 Temporal stage / Chromium intent-to-ship. If Temporal hits Stage 4 in 2026 H2, B6 moves from "experimental" to "stabilize."

---

## Source ledger

Primary-source URLs retrieved 2026-06-17 (full transcript in `/tmp/kalyx-research-report.md`):

- Headless UI: `tailwindlabs/headlessui` Discussion #289, components source tree.
- react-day-picker: `daypicker.dev/upgrading`, `/guides/timepicker`, `/guides/input-fields`.
- react-datepicker: GitHub issue #1018, commit `949cd8e`, `docs/timezone.md`, npm registry, weekly downloads API.
- Chakra UI v3.34: blog post, `chakra-ui.com/docs/components/date-picker`, `ark-ui.com/docs/components/date-picker`, Ark UI v5.32.0 changelog.
- React Aria: `react-aria.adobe.com/internationalized/date/`.
- MUI X: `mui.com/x/introduction/licensing/`, bundlephobia API, npm registry.
- Mantine: `mantine.dev/dates/getting-started`, npm registry, bundlephobia.
