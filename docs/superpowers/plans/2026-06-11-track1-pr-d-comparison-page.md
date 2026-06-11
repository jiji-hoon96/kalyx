# Track 1 PR-D — `/docs/comparison` Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/docs/comparison` (en + ko) with a feature matrix, inline-SVG bundle chart, and "When NOT to use Kalyx" section; wire it into the sidebar; swap `<WhyKalyx>`'s CTA to the new page.

**Architecture:** New markdown pages in `apps/docs-site/docs/comparison.md` and `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md`. Sidebar entry in `apps/docs-site/sidebars.ts`. One-line href swap + one-line test update in the `<WhyKalyx>` component to close the PR-A2 follow-up.

**Tech Stack:** Markdown / MDX, raw HTML SVG (no chart library), existing Docusaurus i18n pipeline, existing vitest + @testing-library/react test stack from PR-A2.

**Scope:** Five commits, ~300 LoC, no new dependencies.

**Reference spec:** `docs/superpowers/specs/2026-06-11-track1-pr-d-comparison-page-design.md`

---

## File Structure

**Create:**
- `apps/docs-site/docs/comparison.md` — English comparison page
- `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md` — Korean translation

**Modify:**
- `apps/docs-site/sidebars.ts` — add a `Comparison` doc entry
- `apps/docs-site/src/components/WhyKalyx/index.tsx` — change CTA href from `/docs/intro#comparison` to `/docs/comparison`
- `apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx` — update the expected href

---

## Task list

### Task 1: Verify env + locate current sidebars / WhyKalyx state

**Files:** none (verification only)

- [ ] **Step 1: Confirm we're on the latest main**

Run:
```bash
git log -1 --format="%h %s"
```
Expected: HEAD points at PR-A2 merge (`7990348` or newer). If older, `git pull --ff-only` on the host worktree first.

- [ ] **Step 2: Read the current sidebars structure**

Run:
```bash
cat apps/docs-site/sidebars.ts
```
Identify which `category` the comparison page should slot into. The likely spot is a top-level "Reference" or "Concepts" category — match whatever pattern is already there. If no obvious fit exists, plan to add a new `category: 'Comparison'` (or fold it into the top-level docs list).

Record the exact insertion point in your status.

- [ ] **Step 3: Read WhyKalyx component + test**

Run:
```bash
sed -n '30,55p' apps/docs-site/src/components/WhyKalyx/index.tsx
sed -n '20,40p' apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx
```
Confirm the current href is exactly `/docs/intro#comparison` (it is, per PR-A2). Your edits will touch only this one string in each file.

- [ ] **Step 4: Confirm baseline tests pass**

Run:
```bash
pnpm test:run
```
Expected: 535+ tests pass. **Do not proceed if anything fails.**

No commit. Verification only.

---

### Task 2: Write the English comparison page

**Files:**
- Create: `apps/docs-site/docs/comparison.md`

- [ ] **Step 1: Write the page**

Create `apps/docs-site/docs/comparison.md` with the following content:

````markdown
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
````

- [ ] **Step 2: Verify the build picks it up**

Run:
```bash
pnpm --filter docs-site build 2>&1 | tail -20
```
Expected: `[SUCCESS] Generated static files in "build"` for both en and ko (ko will still serve the English version as fallback at this point — Korean translation lands in Task 3). NO broken-anchor warnings; the WhyKalyx CTA still points at `/docs/intro#comparison` so that's the only remaining broken anchor (we fix it in Task 6).

Open `apps/docs-site/build/comparison/index.html`:
```bash
ls apps/docs-site/build/comparison/
```
Expected: `index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add apps/docs-site/docs/comparison.md
git commit -m "$(cat <<'EOF'
docs(comparison): add /docs/comparison page (en)

Feature matrix across 7 competing libraries × 16 features, inline SVG
horizontal bar chart for bundle size, "When NOT to use Kalyx" honesty
section. Footer documents the 2026-06-11 measurement date and methodology.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add Korean translation

**Files:**
- Create: `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md`

- [ ] **Step 1: Create the Korean file**

Create `apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md` with the following content:

````markdown
---
title: Kalyx 비교
description: react-datepicker, react-day-picker, react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates와 Kalyx를 비교합니다.
slug: /comparison
---

# Kalyx 비교

2026년 React 날짜 선택 라이브러리 생태계는 두 극단으로 나뉘어 있습니다. 통합되어
있지만 무거운 쪽(react-datepicker, MUI)과 headless지만 일부 기능만 제공하는
쪽(react-day-picker, react-aria, ark-ui). 어느 쪽을 택하든 번들 크기 vs 조립 비용,
CSS 강제 vs 빠진 프리미티브라는 실제 트레이드오프를 받아들여야 합니다. Kalyx는 그
중간을 차지하도록 설계됐습니다 — 7개의 완전한 프리미티브, 하나의 조합 API,
강제 스타일시트 없음, 16 KB gzip 이하.

## 기능 매트릭스

<div style={{overflowX: 'auto'}}>

| 기능 | react-datepicker | react-day-picker | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| DatePicker                | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| RangePicker               | ✓ | 부분[^1] | ✓ | 부분[^1] | ✓ | ✓ | **✓** |
| TimePicker                | 부분[^2] | ✗ | ✓ | ✗ | ✓ | ✓ | **✓** |
| DateTimePicker            | 부분[^2] | ✗ | 부분[^3] | ✗ | ✓ | ✓ | **✓** |
| MonthPicker               | ✓ | ✗ | 부분[^3] | ✗ | ✓ | ✓ | **✓** |
| YearPicker                | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | **✓** |
| WeekPicker                | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Timezone (IANA)           | 부분[^4] | ✗ | ✓ | ✗ | ✓ | 부분[^4] | **✓** |
| Zero CSS (강제 import 없음) | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | **✓** |
| SSR 안전 (App Router)     | 부분[^5] | ✓ | ✓ | ✓ | 부분[^5] | ✓ | **✓** |
| RSC 친화                  | ✗ | ✓ | 부분[^6] | ✓ | ✗ | 부분[^6] | **✓** |
| 접근성 검증 (axe + WAI-ARIA) | 부분[^7] | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| ISO string API (UTC in/out) | ✗ | 부분[^8] | ✗ | ✗ | ✗ | ✗ | **✓** |
| Adapter 패턴 (date-fns/dayjs/luxon) | ✗ | ✗ | 부분[^9] | ✗ | ✓ | ✗ | **부분[^10]** |
| 번들 gzip (KB)            | ~62 | ~22 | ~28 | ~20 | ~45 | ~30 | **~15** |
| 라이선스                  | MIT | MIT | Apache-2.0 | MIT | MIT | MIT | **MIT** |

</div>

[^1]: 캘린더 그리드는 제공되지만 range commit 동작은 소비자가 직접 wiring해야 합니다.
[^2]: 시간 컨트롤은 포함되지만 별도 컴포넌트와 설정 prop이 필요합니다.
[^3]: 별도 export된 standalone 컴포넌트가 아니라 캘린더 프리미티브를 통해 가능합니다.
[^4]: Timezone 헬퍼는 있지만 DST 정확한 표시를 위해 수동 오프셋 관리가 필요합니다.
[^5]: 클라이언트 사이드에서만 렌더링되며 mount 전 `window` 접근 시 hydration warning이 발생합니다.
[^6]: `'use client'` 경계 뒤에 있을 때만 RSC 트리 내에서 호환됩니다.
[^7]: WAI-ARIA 역할은 존재하지만 axe 전수 통과는 설정에 따라 다릅니다.
[^8]: native `Date`를 반환하며 ISO 변환은 소비자의 책임입니다.
[^9]: `@internationalized/date`로 고정되어 date-fns / dayjs 상호운용은 해당 타입을 통해 round-trip 해야 합니다.
[^10]: 기본 adapter는 `@kalyx/adapter-date-fns`이며 대체 adapter (`-dayjs`, `-luxon`, `-temporal`)는 v1.1+에서 출시됩니다.

> _2026-06-11 기준 측정. 방법론: 번들 크기는 bundlephobia + 각 라이브러리의 공식
> `size-limit`으로 측정, 기능 유무는 각 라이브러리의 v-latest 문서로 검증._

## 한 눈에 보는 번들 크기

<svg role="img" aria-label="번들 크기 비교 (KB gzip) — Kalyx가 15 KB로 가장 작음" viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', maxWidth: 640, height: 'auto'}}>
  <style>{`
    .lbl { font: 13px var(--ifm-font-family-base, sans-serif); fill: var(--ifm-font-color-base, #1f1f1f); }
    .val { font: 12px var(--ifm-font-family-monospace, monospace); fill: var(--ifm-color-emphasis-700, #555); }
    .bar { fill: var(--ifm-color-emphasis-400, #b0b0b0); }
    .barKalyx { fill: var(--ifm-color-primary, #6366f1); }
    .axis { stroke: var(--ifm-color-emphasis-300, #d0d0d0); stroke-width: 1; }
  `}</style>
  <text x="0" y="22" className="lbl">react-datepicker</text>
  <text x="0" y="54" className="lbl">@mui/x-date-pickers</text>
  <text x="0" y="86" className="lbl">@mantine/dates</text>
  <text x="0" y="118" className="lbl">react-aria</text>
  <text x="0" y="150" className="lbl">react-day-picker</text>
  <text x="0" y="182" className="lbl">ark-ui</text>
  <text x="0" y="214" className="lbl" style={{fontWeight: 700}}>Kalyx</text>

  <rect className="bar" x="180" y="10" width="403" height="16" rx="3" />
  <rect className="bar" x="180" y="42" width="293" height="16" rx="3" />
  <rect className="bar" x="180" y="74" width="195" height="16" rx="3" />
  <rect className="bar" x="180" y="106" width="182" height="16" rx="3" />
  <rect className="bar" x="180" y="138" width="143" height="16" rx="3" />
  <rect className="bar" x="180" y="170" width="130" height="16" rx="3" />
  <rect className="barKalyx" x="180" y="202" width="98" height="16" rx="3" />

  <text x="590" y="22" className="val" textAnchor="end">62 KB</text>
  <text x="480" y="54" className="val" textAnchor="end">45 KB</text>
  <text x="382" y="86" className="val" textAnchor="end">30 KB</text>
  <text x="369" y="118" className="val" textAnchor="end">28 KB</text>
  <text x="330" y="150" className="val" textAnchor="end">22 KB</text>
  <text x="317" y="182" className="val" textAnchor="end">20 KB</text>
  <text x="285" y="214" className="val" textAnchor="end" style={{fontWeight: 700, fill: 'var(--ifm-color-primary, #6366f1)'}}>15 KB</text>

  <line className="axis" x1="180" y1="232" x2="600" y2="232" />
  <text x="180" y="250" className="val">0</text>
  <text x="600" y="250" className="val" textAnchor="end">64 KB</text>
</svg>

## Kalyx를 쓰지 않아야 할 때

각 경쟁 라이브러리가 어디서 더 나은지 솔직하게 정리합니다.

**`react-datepicker`를 쓰세요** — 모든 엣지 케이스가 다 잡혀있어야 하고 번들이
4배 무거운 게 괜찮다면. 2015년부터 출하된 라이브러리라 히지리력, 벵골 숫자,
특이한 날짜 포맷 같은 코너 케이스는 거기서 검증된 깊이로 Kalyx v1이 따라잡지
않을 영역입니다.

**`react-aria`를 쓰세요** — 디자인 시스템을 처음부터 만들고 모든 프리미티브에
Adobe의 접근성 팀이 보증해주길 원한다면. React Aria의 접근성 보장과 플랫폼
인식 동작(선택 모델, focus ring, screen reader hint)은 우리가 제공하는 것보다
깊습니다. 트레이드오프는 더 많은 조립 코드와 `@internationalized/date`에 대한
엄격한 의존성입니다.

**`@mui/x-date-pickers`를 쓰세요** — 앱이 이미 MUI를 사용한다면. MUI 디자인
토큰과의 시각/테마 통합이 자동입니다. MUI 코드베이스에 Kalyx를 도입하려면
`classNames`를 MUI의 클래스 API로 매핑하는 재작성이 필요합니다.

그 외 모든 경우 — 모던 Next.js / Remix 앱, headless 스타일링 스토리, 저장
프리미티브로 ISO string, 한 자릿수 KB 번들 목표 — Kalyx가 올바른 선택이
되도록 설계됐습니다.
````

- [ ] **Step 2: Verify ko build picks it up**

Run:
```bash
pnpm --filter docs-site build 2>&1 | grep -E "\[en\]|\[ko\]|comparison|SUCCESS|broken" | head -10
```
Expected: `[SUCCESS]` for both locales. The Korean page should generate at `build/ko/comparison/index.html`.

- [ ] **Step 3: Commit**

```bash
git add apps/docs-site/i18n/ko/docusaurus-plugin-content-docs/current/comparison.md
git commit -m "$(cat <<'EOF'
docs(comparison): add Korean translation of comparison page

Verbatim structural mirror of /docs/comparison with Korean prose +
Korean SVG aria-label. Footnotes preserved (same anchor names).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Add sidebar entry

**Files:**
- Modify: `apps/docs-site/sidebars.ts`

- [ ] **Step 1: Open the sidebars file**

Run:
```bash
cat apps/docs-site/sidebars.ts
```
The file exports a `SidebarsConfig` object. Each top-level category is `{ type: 'category', label, items: [...] }`.

- [ ] **Step 2: Add the comparison entry**

The right home for the comparison page depends on the existing categories — pick the option below that matches what you saw in Task 1 Step 2:

**Option A** — if there's a "Concepts" / "Reference" / "Why" category, add `'comparison'` as the last item of that array.

**Option B** — if no obvious category fits, add a new top-level entry between the existing "Getting started" and "Components" categories:

```ts
{
  type: 'category',
  label: 'Why Kalyx',
  collapsed: false,
  items: ['comparison'],
},
```

Edit `sidebars.ts` accordingly. The doc id `'comparison'` matches the markdown filename (Docusaurus resolves it automatically because the slug `/comparison` is at root).

- [ ] **Step 3: Verify sidebar renders**

Run:
```bash
pnpm --filter docs-site build 2>&1 | tail -3
```
Expected: build succeeds with no warnings about a missing sidebar reference.

Visit `pnpm --filter docs-site serve --port 3100` and open `http://localhost:3100/docs/intro`. The sidebar should now show the new entry. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add apps/docs-site/sidebars.ts
git commit -m "$(cat <<'EOF'
docs(comparison): add sidebar entry for comparison page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Swap WhyKalyx CTA href

**Files:**
- Modify: `apps/docs-site/src/components/WhyKalyx/index.tsx`

- [ ] **Step 1: Open the file**

Run:
```bash
grep -n "/docs/intro#comparison" apps/docs-site/src/components/WhyKalyx/index.tsx
```
Expected: one match in the `<Link to=...>` and one match in the surrounding comment block (the comment was added in PR-A2 as a swap-target marker).

- [ ] **Step 2: Replace the href + update the comment**

Edit `apps/docs-site/src/components/WhyKalyx/index.tsx`. Find:

```tsx
          {/*
            PR-D will ship /docs/comparison; until then point at the
            existing anchor on /docs/intro. PR-D's plan must swap this
            href to '/docs/comparison'.
          */}
          <Link className={styles.cta} to="/docs/intro#comparison">
```

Replace with:

```tsx
          <Link className={styles.cta} to="/docs/comparison">
```

(Both the comment block and the href change in one edit. The comment was a PR-A2-era TODO; with PR-D shipping, it's no longer relevant.)

- [ ] **Step 3: Test still fails** (TDD-style sanity check)

Run:
```bash
pnpm test:run apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx 2>&1 | tail -5
```
Expected: 1 failing test (the one that asserts `'/docs/intro#comparison'`). Other 2 tests pass. This proves the href edit landed.

- [ ] **Step 4: Commit**

```bash
git add apps/docs-site/src/components/WhyKalyx/index.tsx
git commit -m "$(cat <<'EOF'
feat(docs-site): swap WhyKalyx CTA target to /docs/comparison

Closes the PR-A2 follow-up obligation: now that /docs/comparison
exists, point the CTA there directly instead of at the
/docs/intro#comparison anchor that never existed.

The expected-href test in WhyKalyx.test.tsx fails after this commit
and is fixed in the next commit (so the test history makes the swap
explicit).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Update WhyKalyx test

**Files:**
- Modify: `apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx`

- [ ] **Step 1: Update the expected href**

Edit `apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx`. Find:

```tsx
  it('CTA points at the comparison anchor (stub until PR-D ships /docs/comparison)', () => {
    render(<WhyKalyx />);
    const link = screen.getByRole('link');
    // PR-D swap-target: '/docs/comparison'. Until then we point at the
    // anchor that already exists on /docs/intro.
    expect(link.getAttribute('href')).toBe('/docs/intro#comparison');
  });
```

Replace with:

```tsx
  it('CTA points at /docs/comparison', () => {
    render(<WhyKalyx />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/docs/comparison');
  });
```

- [ ] **Step 2: Run the test to verify it passes**

Run:
```bash
pnpm test:run apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx 2>&1 | tail -3
```
Expected: 3/3 pass.

- [ ] **Step 3: Sanity-run the whole suite**

Run:
```bash
pnpm test:run
```
Expected: all tests pass, ≥ 535.

- [ ] **Step 4: Commit**

```bash
git add apps/docs-site/src/components/WhyKalyx/__tests__/WhyKalyx.test.tsx
git commit -m "$(cat <<'EOF'
test(docs-site): update WhyKalyx expected href to /docs/comparison

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Final verification + PR

- [ ] **Step 1: Full verification matrix**

Run each in order:
```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm --filter docs-site build
```
Expected: all four exit 0.

- [ ] **Step 2: Confirm no broken anchors**

Inspect the docs-site build output for broken-anchor warnings:
```bash
pnpm --filter docs-site build 2>&1 | grep -iE "broken|anchor" | head -10
```
Expected: no output. (PR-A2's stub broken anchor is now resolved because we changed WhyKalyx's href.)

- [ ] **Step 3: Visual review**

Run:
```bash
pnpm --filter docs-site serve --port 3100 --no-open &
SERVE_PID=$!
sleep 5
```
Open in a browser:
- `http://localhost:3100/docs/comparison` — verify matrix renders, SVG bar chart visible, "When NOT to use Kalyx" section present
- `http://localhost:3100/ko/docs/comparison` — verify Korean translation, same structure
- `http://localhost:3100/` — verify WhyKalyx CTA points to `/docs/comparison` (hover, click — should navigate to the new page)

Kill the server:
```bash
kill $SERVE_PID
```

- [ ] **Step 4: Open the PR**

Run:
```bash
git log --oneline main..HEAD
```
Expected: 5 new commits (Tasks 2-6; Task 1 + Task 7 are verification-only).

```bash
gh pr create --base main --title "feat(track1): PR-D — /docs/comparison page + WhyKalyx CTA swap" --body "$(cat <<'EOF'
## Summary

Fifth and final PR in Track 1. Ships the comparison page that PR-A2 stubbed against.

- New \`/docs/comparison\` page (en) — 7-library × 16-feature matrix, inline SVG bundle bar chart, honest "When NOT to use Kalyx" section
- New \`/ko/docs/comparison\` — verbatim structural mirror with Korean prose
- Sidebar entry under the existing category for navigation
- Swap \`<WhyKalyx>\` CTA from \`/docs/intro#comparison\` (PR-A2 stub) → \`/docs/comparison\` (closes the PR-A2 follow-up obligation)
- WhyKalyx test updated to assert the new href

Spec: \`docs/superpowers/specs/2026-06-11-track1-pr-d-comparison-page-design.md\`
Plan: \`docs/superpowers/plans/2026-06-11-track1-pr-d-comparison-page.md\`

### Bundle figures

Sources for the 7-library bar chart, as of 2026-06-11:
- react-datepicker: 62 KB (bundlephobia)
- @mui/x-date-pickers: 45 KB
- @mantine/dates: 30 KB
- react-aria: 28 KB
- react-day-picker: 22 KB
- ark-ui (DatePicker): 20 KB
- Kalyx: 15 KB (live \`bundle-size\` CI value)

### Resolved warnings

The broken-anchor warning for \`/docs/intro#comparison\` that PR-A2 shipped is now resolved — the WhyKalyx CTA points at a real page.

## Test plan

- [x] \`pnpm test:run\` — all suites pass; WhyKalyx href test updated
- [x] \`pnpm typecheck\` and \`pnpm lint\` clean
- [x] \`pnpm --filter docs-site build\` succeeds for en + ko with no broken-anchor warnings
- [x] Visual review of \`/docs/comparison\` and \`/ko/docs/comparison\` in dev — matrix + chart + "When NOT to use Kalyx" all render
- [x] Click WhyKalyx CTA — navigates to \`/docs/comparison\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
Expected: PR URL printed.

---

## Notes for the executor

**If a step fails:** do not skip ahead. Fix in place, re-run the verification, then re-commit (amend if no commits since, otherwise a new commit).

**If the SVG looks broken in the build:** Docusaurus's MDX pipeline can be strict about JSX-in-markdown. The inline `<style>{`...`}</style>` blocks use template literals — if MDX complains, fall back to inline `style={{...}}` attributes on each `<text>` / `<rect>` instead of the CSS classes.

**If the build emits a warning about a missing slug for `comparison`:** confirm the markdown frontmatter has `slug: /comparison`. The sidebar uses the doc id `'comparison'` which is the filename minus `.md`, NOT the slug — these can differ.

**If `pnpm test:run` reports a different baseline than 535:** the project may have moved on. Verify nothing else is broken; the absolute number isn't the criterion — "no regressions vs the pre-Task-1 baseline" is.
