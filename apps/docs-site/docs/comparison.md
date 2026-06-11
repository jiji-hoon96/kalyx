---
title: How Kalyx compares
description: How Kalyx stacks up against react-datepicker, react-day-picker, react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates.
slug: /comparison
---

# How Kalyx compares

The 2026 React date-picker landscape has two extremes: integrated-but-heavy
(react-datepicker, MUI) and headless-but-partial (react-day-picker, react-aria,
ark-ui). Picking either side forces a real trade-off — bundle size vs assembly
cost, CSS lock-in vs missing primitives. Kalyx is built to occupy the middle:
seven complete primitives, one composition API, no required stylesheet,
≤16 KB gzipped.

## Feature matrix

<div style={{overflowX: 'auto'}}>

| Feature | react-datepicker | react-day-picker | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| DatePicker                | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| RangePicker               | ✓ | partial[^1] | ✓ | partial[^1] | ✓ | ✓ | **✓** |
| TimePicker                | partial[^2] | ✗ | ✓ | ✗ | ✓ | ✓ | **✓** |
| DateTimePicker            | partial[^2] | ✗ | partial[^3] | ✗ | ✓ | ✓ | **✓** |
| MonthPicker               | ✓ | ✗ | partial[^3] | ✗ | ✓ | ✓ | **✓** |
| YearPicker                | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | **✓** |
| WeekPicker                | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Timezone-aware (IANA)     | partial[^4] | ✗ | ✓ | ✗ | ✓ | partial[^4] | **✓** |
| Zero CSS (no required import) | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | **✓** |
| SSR-safe (App Router)     | partial[^5] | ✓ | ✓ | ✓ | partial[^5] | ✓ | **✓** |
| RSC-friendly              | ✗ | ✓ | partial[^6] | ✓ | ✗ | partial[^6] | **✓** |
| a11y verified (axe + WAI-ARIA) | partial[^7] | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| ISO string API (UTC in/out) | ✗ | partial[^8] | ✗ | ✗ | ✗ | ✗ | **✓** |
| Adapter pattern (date-fns/dayjs/luxon) | ✗ | ✗ | partial[^9] | ✗ | ✓ | ✗ | **partial[^10]** |
| Bundle gzip (KB)          | ~62 | ~22 | ~28 | ~20 | ~45 | ~30 | **~15** |
| License                   | MIT | MIT | Apache-2.0 | MIT | MIT | MIT | **MIT** |

</div>

[^1]: Calendar grid is provided; range commit semantics must be wired by the consumer.
[^2]: Time controls are bundled but require separate components and configuration props.
[^3]: Available via underlying calendar primitives, not as a standalone exported component.
[^4]: Timezone helpers exist but require manual offset bookkeeping for DST-correct displays.
[^5]: Renders client-side, with hydration warnings if `window` is touched before mount.
[^6]: Compatible inside RSC trees only when the component sits behind a `'use client'` boundary.
[^7]: WAI-ARIA roles present; full axe pass varies by configuration.
[^8]: Returns native `Date`; ISO conversion is the consumer's responsibility.
[^9]: Pinned to `@internationalized/date`; date-fns / dayjs interop must round-trip via that type.
[^10]: Default adapter is `@kalyx/adapter-date-fns`; alternate adapters (`-dayjs`, `-luxon`, `-temporal`) ship across v1.1+.

> _Last measured 2026-06-11. Methodology: bundle sizes via bundlephobia + each
> library's published `size-limit`; feature presence verified against each
> library's v-latest docs at the time of writing._

## Bundle size at a glance

<svg role="img" aria-label="Bundle size comparison in KB gzip — Kalyx is the smallest at 15 KB" viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', maxWidth: 640, height: 'auto'}}>
  <style>{`
    .lbl { font: 13px var(--ifm-font-family-base, sans-serif); fill: var(--ifm-font-color-base, #1f1f1f); }
    .val { font: 12px var(--ifm-font-family-monospace, monospace); fill: var(--ifm-color-emphasis-700, #555); }
    .bar { fill: var(--ifm-color-emphasis-400, #b0b0b0); }
    .barKalyx { fill: var(--ifm-color-primary, #6366f1); }
    .axis { stroke: var(--ifm-color-emphasis-300, #d0d0d0); stroke-width: 1; }
  `}</style>
  {/* y axis labels (left side, 180px wide) — each row is 32px tall, starting y=18 */}
  <text x="0" y="22" className="lbl">react-datepicker</text>
  <text x="0" y="54" className="lbl">@mui/x-date-pickers</text>
  <text x="0" y="86" className="lbl">@mantine/dates</text>
  <text x="0" y="118" className="lbl">react-aria</text>
  <text x="0" y="150" className="lbl">react-day-picker</text>
  <text x="0" y="182" className="lbl">ark-ui</text>
  <text x="0" y="214" className="lbl" style={{fontWeight: 700}}>Kalyx</text>

  {/* bars: x starts at 180, scale = 6.5px per KB (62 KB → 403px, fits in 410px max) */}
  <rect className="bar" x="180" y="10" width="403" height="16" rx="3" />
  <rect className="bar" x="180" y="42" width="293" height="16" rx="3" />
  <rect className="bar" x="180" y="74" width="195" height="16" rx="3" />
  <rect className="bar" x="180" y="106" width="182" height="16" rx="3" />
  <rect className="bar" x="180" y="138" width="143" height="16" rx="3" />
  <rect className="bar" x="180" y="170" width="130" height="16" rx="3" />
  <rect className="barKalyx" x="180" y="202" width="98" height="16" rx="3" />

  {/* value labels on the right of each bar */}
  <text x="590" y="22" className="val" textAnchor="end">62 KB</text>
  <text x="480" y="54" className="val" textAnchor="end">45 KB</text>
  <text x="382" y="86" className="val" textAnchor="end">30 KB</text>
  <text x="369" y="118" className="val" textAnchor="end">28 KB</text>
  <text x="330" y="150" className="val" textAnchor="end">22 KB</text>
  <text x="317" y="182" className="val" textAnchor="end">20 KB</text>
  <text x="285" y="214" className="val" textAnchor="end" style={{fontWeight: 700, fill: 'var(--ifm-color-primary, #6366f1)'}}>15 KB</text>

  {/* baseline */}
  <line className="axis" x1="180" y1="232" x2="600" y2="232" />
  <text x="180" y="250" className="val">0</text>
  <text x="600" y="250" className="val" textAnchor="end">64 KB</text>
</svg>

## When NOT to use Kalyx

We try to be honest about where each competitor wins.

**Use `react-datepicker`** if you need every edge case fixed and don't mind 4×
the bundle. It's been shipping since 2015 — corner cases like Hijri calendars,
Bengali numerals, and exotic date formats are battle-tested there in ways Kalyx
will never catch up on for its v1 line.

**Use `react-aria`** if you're building a design system from scratch and want
Adobe's a11y team standing behind every primitive. React Aria's accessibility
guarantees and platform-aware behavior (selection models, focus rings, screen
reader hints) are deeper than what we ship. The trade is more code to assemble
and a strict dependency on `@internationalized/date`.

**Use `@mui/x-date-pickers`** if your app already uses MUI. The visual / theme
integration with MUI's design tokens is automatic; bringing Kalyx into a
MUI codebase means rewriting `classNames` to map to MUI's class API.

In every other case — modern Next.js / Remix app, headless styling story, ISO
strings as your storage primitive, single-digit-KB bundle target — Kalyx is
designed to be the right pick.
