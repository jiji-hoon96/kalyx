---
title: Kalyx 비교
description: react-datepicker, react-day-picker, react-calendar, react-native-calendars, react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates와 Kalyx를 비교합니다.
slug: /comparison
---

# Kalyx 비교

2026년 React 날짜 선택 라이브러리 생태계는 두 극단으로 나뉘어 있습니다. 통합되어
있지만 무거운 쪽(react-datepicker, MUI)과 headless지만 일부 기능만 제공하는
쪽(react-day-picker, react-aria, ark-ui). 어느 쪽을 택하든 번들 크기 vs 조립 비용,
CSS 강제 vs 빠진 프리미티브라는 실제 트레이드오프를 받아들여야 합니다. Kalyx는 그
중간을 차지하도록 설계됐습니다 — 7개의 완전한 프리미티브, 하나의 조합 API,
강제 스타일시트 없음, 16 KB gzip 이하.

## 인기도 한눈에

별 수와 주간 다운로드는 빠르게 움직인다 — 리더보드가 아니라 스냅샷으로 받아들이면 된다.
모노레포에서 호스팅되는 라이브러리(react-aria, ark-ui, @mui/x-date-pickers, @mantine/dates)는 부모 저장소의 스타 수다 — 서브 패키지 단위가 아니다.

| 라이브러리 | GitHub 스타 | npm 주간 다운로드 |
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

## 기능 매트릭스

<div style={{overflowX: 'auto'}}>

| 기능 | react-datepicker | react-day-picker | react-calendar | react-native-calendars | react-aria | ark-ui | @mui/x-date-pickers | @mantine/dates | **Kalyx** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| DatePicker                | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| RangePicker               | ✓ | 부분[^1] | ✓ | ✓ | ✓ | 부분[^1] | ✓ | ✓ | **✓** |
| TimePicker                | 부분[^2] | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | **✓** |
| DateTimePicker            | 부분[^2] | ✗ | ✗ | ✗ | 부분[^3] | ✗ | ✓ | ✓ | **✓** |
| MonthPicker               | ✓ | ✗ | 부분[^11] | ✓ | 부분[^3] | ✗ | ✓ | ✓ | **✓** |
| YearPicker                | ✓ | ✗ | 부분[^11] | 부분[^11] | ✗ | ✗ | ✓ | ✓ | **✓** |
| WeekPicker                | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Timezone (IANA)           | 부분[^4] | ✗ | ✗ | 부분[^4] | ✓ | ✗ | ✓ | 부분[^4] | **✓** |
| Zero CSS (강제 import 없음) | ✗ | ✓ | ✗ | 부분[^12] | ✓ | ✓ | ✗ | ✗ | **✓** |
| SSR 안전 (App Router)     | 부분[^5] | ✓ | ✓ | 부분[^13] | ✓ | ✓ | 부분[^5] | ✓ | **✓** |
| RSC 친화                  | ✗ | ✓ | 부분[^6] | ✗ | 부분[^6] | ✓ | ✗ | 부분[^6] | **✓** |
| 접근성 검증 (axe + WAI-ARIA) | 부분[^7] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| ISO string API (UTC in/out) | ✗ | 부분[^8] | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Adapter 패턴 (date-fns/dayjs/luxon) | ✗ | ✗ | ✗ | ✗ | 부분[^9] | ✗ | ✓ | ✗ | **부분[^10]** |
| 번들 gzip (KB)            | ~62 | ~22 | ~17 | ~85 (RN) | ~28 | ~20 | ~45 | ~30 | **~15** |
| 라이선스                  | MIT | MIT | MIT | MIT | Apache-2.0 | MIT | MIT | MIT | **MIT** |

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
[^11]: 월/연 드릴다운용 `view` 또는 `defaultView` prop은 제공하지만, 독립 컴포넌트로 export되지 않는다.
[^12]: 기본은 인라인 스타일이고, 테마 커스터마이징은 가능하지만 Kalyx 수준의 CSS-free 옵트아웃은 없다.
[^13]: React Native 우선. 웹 shim으로 브라우저에서 동작하긴 하지만 Next.js App Router의 server boundary용으로 설계되지 않았다.
[^14]: shadcn/ui의 `Calendar` 컴포넌트가 react-day-picker를 dependency로 쓴다 — 직접 사용자보다 다운스트림 채택분이 큰 비중.

> _2026-06-11 기준 측정. 방법론: 번들 크기는 bundlephobia + 각 라이브러리의 공식
> `size-limit`으로 측정, 기능 유무는 각 라이브러리의 v-latest 문서로 검증._

## 한 눈에 보는 번들 크기

<svg role="img" aria-label="번들 크기 비교 (KB gzip) — Kalyx는 react-calendar, ark-ui와 함께 가장 작은 축이다" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', maxWidth: 640, height: 'auto'}}>
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
