---
title: How Kalyx compares
description: How Kalyx stacks up against react-datepicker, react-day-picker, react-calendar, react-native-calendars, react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates.
slug: /comparison
---

# How Kalyx compares

The 2026 React date-picker landscape has two extremes: integrated-but-heavy
(react-datepicker, MUI) and headless-but-partial (react-day-picker, react-aria,
ark-ui). Picking either side forces a real trade-off — bundle size vs assembly
cost, CSS lock-in vs missing primitives. Kalyx is built to occupy the middle:
seven complete primitives, one composition API, no required stylesheet,
≤16 KB gzipped.

Two updates since the table below was first compiled: Chakra UI v3.34 (March 2026)
shipped a DatePicker built on Ark UI, and react-datepicker 9.1.0 (Nov 2025) added
an optional `timeZone` IANA prop behind a `date-fns-tz` peer dependency. Neither
changes Kalyx's position in the matrix — Chakra inherits Ark's
`@internationalized/date` lock-in, and react-datepicker still uses native `Date`
as its value type. Notes [^4] and [^15] below describe the deltas.

## Popularity at a glance

Stars and weekly downloads move quickly — treat these as a snapshot, not a leaderboard.
For libraries that live in a monorepo (react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates), star counts reflect the parent repo, not the sub-package.

| Library | GitHub stars | npm weekly downloads |
| --- | :---: | :---: |
| react-datepicker | 8.4k | 4,600,048 |
| react-day-picker | 6.8k | 39,161,992[^14] |
| react-calendar | 3.8k | 1,132,734 |
| react-native-calendars | 10.3k | 541,161 |
| react-aria | 15.5k | 5,934,915 |
| ark-ui | 5.2k | 815,578 |
| @mui/x-date-pickers | 5.7k | 4,779,445 |
| @mantine/dates | 31.2k | 955,080 |
| **Kalyx** | 4 | 618 |

## Feature matrix

<div style={{overflowX: 'auto'}}>

| Feature | react-datepicker | react-day-picker | react-calendar | react-native-calendars | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| DatePicker                | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| RangePicker               | ✓ | partial[^1] | ✓ | ✓ | ✓ | partial[^1] | Pro[^16] | ✓ | **✓** |
| TimePicker                | partial[^2] | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | **✓** |
| DateTimePicker            | partial[^2] | ✗ | ✗ | ✗ | partial[^3] | ✗ | ✓ | ✓ | **✓** |
| MonthPicker               | ✓ | ✗ | partial[^11] | ✓ | partial[^3] | ✗ | ✓ | ✓ | **✓** |
| YearPicker                | ✓ | ✗ | partial[^11] | partial[^11] | ✗ | ✗ | ✓ | ✓ | **✓** |
| WeekPicker                | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Timezone-aware (IANA)     | partial[^4][^15] | ✗ | ✗ | partial[^4] | ✓ | ✗ | ✓ | partial[^4] | **✓** |
| Zero CSS (no required import) | ✗ | ✓ | ✗ | partial[^12] | ✓ | ✓ | ✗ | ✗ | **✓** |
| SSR-safe (App Router)     | partial[^5] | ✓ | ✓ | partial[^13] | ✓ | ✓ | partial[^5] | ✓ | **✓** |
| RSC-friendly              | ✗ | ✓ | partial[^6] | ✗ | partial[^6] | ✓ | ✗ | partial[^6] | **✓** |
| a11y verified (axe + WAI-ARIA) | partial[^7] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| ISO string API (UTC in/out) | ✗ | partial[^8] | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Adapter pattern (date-fns/dayjs/luxon) | ✗ | ✗ | ✗ | ✗ | partial[^9] | ✗ | ✓ | ✗ | **partial[^10]** |
| Bundle gzip (KB)          | ~62 | ~22 | ~17 | ~85 (RN) | ~28 | ~20 | ~45 | ~30 | **~15** |
| License                   | MIT | MIT | MIT | MIT | Apache-2.0 | MIT | MIT | MIT | **MIT** |

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
[^11]: Surfaces a `view` or `defaultView` prop for month/year drill-down; not exported as a dedicated standalone component.
[^12]: Inline styles by default; theme can be customized but there is no CSS-free escape hatch comparable to Kalyx.
[^13]: React Native first; the web shim runs in browsers but the package isn't designed for Next.js App Router server boundaries.
[^14]: shadcn/ui's `Calendar` component depends on react-day-picker; the count includes downstream adoption via shadcn rather than direct use only.
[^15]: react-datepicker 9.1.0 (Nov 2025) added an optional `timeZone` prop accepting IANA identifiers, gated behind a `date-fns-tz` peer. Value type is still the native `Date` object, not an ISO string. Issue [#1018](https://github.com/Hacker0x01/react-datepicker/issues/1018) — open since 2017 — was closed 2025-12 as a docs-only resolution that classifies the original symptom as expected `Date` behavior.
[^16]: MUI X DateRangePicker and TimeRangePicker live in `@mui/x-date-pickers-pro` and require a commercial Pro license. The free MIT `@mui/x-date-pickers` ships DatePicker, TimePicker, and DateTimePicker, but not the range pickers.

> _Last measured 2026-06-17. Methodology: bundle sizes via bundlephobia + each
> library's published `size-limit`; feature presence verified against each
> library's v-latest docs at the time of writing. Adobe's `@internationalized/date`
> size figures are reported in Brotli (not gzip) and are excluded from the bundle
> chart to avoid mixing compression units._

## Bundle size at a glance

<svg role="img" aria-label="Bundle size comparison in KB gzip — Kalyx is among the smallest, alongside react-calendar and ark-ui" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', maxWidth: 640, height: 'auto'}}>
  <style>{`
    .lbl { font: 13px var(--ifm-font-family-base, sans-serif); fill: var(--ifm-font-color-base, #1f1f1f); }
    .val { font: 12px var(--ifm-font-family-monospace, monospace); fill: var(--ifm-color-emphasis-700, #555); }
    .bar { fill: var(--ifm-color-emphasis-400, #b0b0b0); }
    .barKalyx { fill: var(--ifm-color-primary, #6366f1); }
    .axis { stroke: var(--ifm-color-emphasis-300, #d0d0d0); stroke-width: 1; }
  `}</style>
  {/* y axis labels (left side, 180px wide) — each row is 32px tall, starting y=22 */}
  <text x="0" y="22" className="lbl">react-native-calendars</text>
  <text x="0" y="54" className="lbl">react-datepicker</text>
  <text x="0" y="86" className="lbl">@mui/x-date-pickers</text>
  <text x="0" y="118" className="lbl">@mantine/dates</text>
  <text x="0" y="150" className="lbl">react-aria</text>
  <text x="0" y="182" className="lbl">react-day-picker</text>
  <text x="0" y="214" className="lbl">ark-ui</text>
  <text x="0" y="246" className="lbl">react-calendar</text>
  <text x="0" y="278" className="lbl" style={{fontWeight: 700}}>Kalyx</text>

  {/* bars: x starts at 180, scale = (kb/90)*410 px per KB (85 KB → 387px, fits in 410px max) */}
  <rect className="bar" x="180" y="10" width="387" height="16" rx="3" />
  <rect className="bar" x="180" y="42" width="282" height="16" rx="3" />
  <rect className="bar" x="180" y="74" width="205" height="16" rx="3" />
  <rect className="bar" x="180" y="106" width="137" height="16" rx="3" />
  <rect className="bar" x="180" y="138" width="128" height="16" rx="3" />
  <rect className="bar" x="180" y="170" width="100" height="16" rx="3" />
  <rect className="bar" x="180" y="202" width="91" height="16" rx="3" />
  <rect className="bar" x="180" y="234" width="77" height="16" rx="3" />
  <rect className="barKalyx" x="180" y="266" width="68" height="16" rx="3" />

  {/* value labels on the right of each bar */}
  <text x="574" y="22" className="val" textAnchor="end">~85 KB (RN)</text>
  <text x="469" y="54" className="val" textAnchor="end">62 KB</text>
  <text x="392" y="86" className="val" textAnchor="end">45 KB</text>
  <text x="324" y="118" className="val" textAnchor="end">30 KB</text>
  <text x="315" y="150" className="val" textAnchor="end">28 KB</text>
  <text x="287" y="182" className="val" textAnchor="end">22 KB</text>
  <text x="278" y="214" className="val" textAnchor="end">20 KB</text>
  <text x="264" y="246" className="val" textAnchor="end">~17 KB</text>
  <text x="255" y="278" className="val" textAnchor="end" style={{fontWeight: 700, fill: 'var(--ifm-color-primary, #6366f1)'}}>15 KB</text>

  {/* baseline */}
  <line className="axis" x1="180" y1="312" x2="600" y2="312" />
  <text x="180" y="330" className="val">0</text>
  <text x="600" y="330" className="val" textAnchor="end">~90 KB</text>
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
reader hints) are deeper than what we ship. The trade is more code to assemble,
a strict dependency on `@internationalized/date`, and inheriting whatever
direction Adobe takes that package (which is positioned to be backed by TC39
Temporal once browsers ship it — a feature, if you want it; a coupling, if you
don't).

**Use `@mui/x-date-pickers`** if your app already uses MUI. The visual / theme
integration with MUI's design tokens is automatic; bringing Kalyx into a
MUI codebase means rewriting `classNames` to map to MUI's class API. Note that
the DateRangePicker and TimeRangePicker live in `@mui/x-date-pickers-pro` and
require a commercial Pro license; Kalyx's RangePicker is MIT.

**Use `ark-ui` (or Chakra UI v3.34+, which wraps it)** if you're committed to
`@internationalized/date` for non-Gregorian calendars (Persian, Buddhist,
Islamic, Hebrew). Ark v5.32 made that calendar story first-class; Kalyx is
Gregorian-only in v1 and that's not changing soon.

**Use `@mantine/dates`** if you've already standardized on dayjs and want
Mantine's batteries-included form integration. Mantine declares dayjs as a
non-negotiable peer; if dayjs isn't in your tree, the marginal install cost is
real.

In every other case — modern Next.js / Remix app, headless styling story, ISO
strings as your storage primitive, single-digit-KB bundle target — Kalyx is
designed to be the right pick.
