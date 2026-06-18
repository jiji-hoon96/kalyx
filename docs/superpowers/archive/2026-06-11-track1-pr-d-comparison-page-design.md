# Track 1 PR-D — `/docs/comparison` Page

**Date:** 2026-06-11
**Status:** Approved (parent spec) — subset spec for implementation
**Track:** 1 (Visuals · Interactivity · Comparison) — PR #5 of 5
**Parent spec:** [`2026-06-09-track1-visuals-interactive-comparison-design.md`](./2026-06-09-track1-visuals-interactive-comparison-design.md) § D

## Context

Track 1 has already shipped PR-A1 (hero recorder + WebPs) and PR-A2 (landing redesign). PR-A2 stubbed the `<WhyKalyx>` CTA to `/docs/intro#comparison` because the comparison page didn't exist yet — that's the follow-up obligation this PR closes.

PR-D is small (~300 LoC, mostly markdown) and has no code dependencies on PR-B or PR-C. It can ship in any order relative to those.

## Scope

**In:**

- New file `apps/docs-site/docs/comparison.md` (English)
- New file `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md` (Korean translation)
- Sidebar entry in `apps/docs-site/sidebars.ts` so the page appears in the docs nav
- Inline SVG bundle-size bar chart (hand-coded, no chart library)
- Static feature matrix with 7 libraries × ~16 features
- "When NOT to use Kalyx" honesty paragraph
- Swap `<WhyKalyx>` CTA from `/docs/intro#comparison` → `/docs/comparison` (closes the PR-A2 follow-up)
- Update the WhyKalyx smoke test's expected href

**Out:**

- Live re-measurement of competitor bundle sizes (illustrative values per parent spec § D; explicit "Last measured" note)
- Methodology automation (CI script that diffs bundle sizes weekly) — deferred
- Interactive sort/filter on the matrix — static is fine
- Per-library deep-dive subsections — keep page concise

## Architecture

### File layout

```
apps/docs-site/
├── docs/comparison.md                                              ← English
├── i18n/ko/docusaurus-plugin-content-docs/current/comparison.md    ← Korean
├── src/components/WhyKalyx/index.tsx                                ← edit: swap href
└── src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx              ← edit: update expected href
sidebars.ts                                                          ← add entry
```

### Comparison page structure (markdown)

```markdown
---
title: How Kalyx compares
description: How Kalyx stacks up against react-datepicker, react-day-picker, react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates.
slug: /comparison
---

# How Kalyx compares

3-sentence intro (problem statement).

## Feature matrix

| Feature | react-datepicker | react-day-picker | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | Kalyx |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DatePicker | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ... 15 more rows ... |

> Last measured 2026-06-11. Methodology: bundle sizes via bundlephobia + size-limit; feature presence verified against each library's v-latest docs at the time of writing.

## Bundle size at a glance

[Inline SVG horizontal bar chart, Kalyx bar highlighted]

## When NOT to use Kalyx

3-paragraph honesty section.
```

### Inline SVG bar chart

Hand-coded SVG inside the markdown (Docusaurus allows raw HTML/SVG via MDX). Each `<rect>` width scaled by `kb / max_kb * total_pixel_width`. Kalyx bar gets a distinct fill matching `var(--ifm-color-primary)` so it visually pops.

Approximate sizes used (per parent spec § D — illustrative until re-measured):

| Library | KB gzip |
|---|---|
| react-datepicker | 62 |
| @mui/x-date-pickers | 45 |
| @mantine/dates | 30 |
| react-aria | 28 |
| react-day-picker | 22 |
| ark-ui (DatePicker) | 20 |
| **Kalyx** | **15** (live `bundle-size` CI value) |

The SVG is one block of inline markup at the bottom of section 2. Dimensions: ~640 px × ~280 px, no scripting, accessible via `role="img"` + `aria-label="Bundle size comparison (gzip, KB)"`.

### Korean translation

Verbatim structure mirroring the English file. Korean text written by hand from the English source. Same SVG (kept English library names — they're product names — but legend / `<title>` translated).

## Testing strategy

- WhyKalyx component test: expected href updated from `/docs/intro#comparison` → `/docs/comparison`. Existing 3 tests stay; no new tests added.
- Docs-site build: `pnpm --filter docs-site build` must pass for both locales, no broken anchor warnings (since the target page now exists).
- No new vitest unit tests for the markdown page itself (it's content, not logic).
- Manual visual review on `pnpm --filter docs-site start` of `/docs/comparison` and `/ko/docs/comparison`.

## Success criteria

- [ ] `/docs/comparison` and `/ko/docs/comparison` both exist and render
- [ ] Feature matrix shows all 7 libraries × ≥ 15 features
- [ ] Inline SVG bar chart renders with all 7 bars + accessible label
- [ ] "When NOT to use Kalyx" section present
- [ ] "Last measured 2026-06-11" footer present
- [ ] Sidebar shows a `Comparison` entry under the appropriate category
- [ ] `WhyKalyx` CTA navigates to `/docs/comparison` (no longer to `#comparison` anchor)
- [ ] `pnpm --filter docs-site build` produces no broken-anchor warnings on either locale
- [ ] All existing tests still pass (no smoke tests broken by the WhyKalyx href change — only its expectation is bumped)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Library data points get stale | "Last measured YYYY-MM-DD" footer + 90-day staleness check is a follow-up. PR-D ships a fresh snapshot. |
| Markdown table renders wide on mobile and overflows | Wrap matrix in a `<div style="overflow-x:auto">` so it scrolls horizontally on narrow viewports. |
| Korean page diverges from English over time | Out of scope here; parent spec lists `scripts/check-comparison-parity.mjs` as a future tool. |
| WhyKalyx href swap breaks the existing test | One-line test update. Smoke-test pass required before merge. |

## PR breakdown

Single PR. Commit shape (~5 commits):

1. `docs(comparison): add /docs/comparison page (en)`
2. `docs(comparison): add Korean translation`
3. `docs(comparison): add sidebar entry`
4. `feat(docs-site): swap WhyKalyx CTA target to /docs/comparison`
5. `test(docs-site): update WhyKalyx expected href`

## References

- Parent spec § D — `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md`
- PR-A2 follow-up obligation — see PR #102 description
- Bundle figures sourced from bundlephobia + each library's own `size-limit`/published gzip stats, as of 2026-06-11
