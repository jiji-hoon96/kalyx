<div align="center">

<img src="./img/main.jpeg" alt="Kalyx — 마침내 완성된 Headless DatePicker" width="720" />

# Kalyx

**마침내 완성된 Headless React DatePicker.**

[문서](https://kalyx-docs.vercel.app/ko) · [English Docs](https://kalyx-docs.vercel.app) · [npm](https://www.npmjs.com/package/@kalyx/react) · [GitHub](https://github.com/jiji-hoon96/kalyx)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![RC](https://img.shields.io/npm/v/@kalyx/react/next?color=f59e0b&label=RC)](https://www.npmjs.com/package/@kalyx/react?activeTab=versions)
[![Bundle](https://img.shields.io/badge/gzip-12.07KB-brightgreen)](#번들-크기)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

> English README: [README.md](./README.md)

Kalyx는 **완결된 채로** 배포되는 Headless React DatePicker 라이브러리입니다. 단일 날짜, 날짜 범위, 시간, 날짜+시간을 하나의 조합형 API로 다룹니다 — gzip 13KB 이하, CSS 없음, SSR 안전.

```bash
pnpm add @kalyx/react
```

> **v1.0 릴리즈 후보(RC)를 사용해 보세요!**
> `pnpm add @kalyx/react@next` — 이슈는 [`v1-rc`](https://github.com/jiji-hoon96/kalyx/issues?q=label%3Av1-rc) 라벨로 등록해 주세요.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## 왜 Kalyx인가

2026년 React 생태계는 양극단만 있습니다 — Kalyx가 그 공백을 채웁니다.

bundlephobia 기준 (2026년 4월). 각주는 표 아래를 참조.

| 라이브러리 | 버전 | 번들 (min+gzip) | Headless | Input | TimePicker | DateTimePicker | RangePicker | 값 계약 | Timezone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| react-day-picker | 9.14 | 2.4 KB¹ | ✅ | ❌ BYO | ❌ | ❌ | ✅ | `Date` | ⚠️ |
| react-datepicker | 9.1 | 44 KB | ❌ (CSS 필수) | ✅ | ⚠️ prop | ⚠️ 결합형 | ✅ 분리형 | `Date` | ⚠️ |
| Ark UI | 5.36 | 265 KB² | ✅ | ✅ | ❌ (제거됨) | ❌ | ✅ | `Date` | ⚠️ |
| React Aria | 1.17 | 247 KB² | ✅ | ✅ | ✅ | ✅ | ✅ | `CalendarDate` | ✅ |
| **Kalyx** | 1.0.0-rc.1 | **12.07 KB** | ✅ | ✅ | ✅ 전용 | ✅ 전용 | ✅ 전용 | ISO 8601 UTC | ✅ `displayTimezone` |

1. react-day-picker는 캘린더 그리드만 제공 — Kalyx와 동일한 스콥을 맞추려면 Input·Popover·TimePicker를 직접 조합해야 함. 2.4 KB는 기본 엔트리 기준.
2. `@ark-ui/react`와 `react-aria-components`는 40+ 컴포넌트를 포함한 모노리스 패키지 — 트리셰이킹 시 더 작아지지만 `@internationalized/date` 등 생태계를 통째로 끌어들임.

## 특징

- **Zero CSS** — 임포트할 스타일시트도, 재정의할 클래스도 없음.
- **진짜 조합형** — Radix 스타일 dot 표기. props 폭발 없음.
- **Headless** — Tailwind, shadcn/ui, Chakra, 어떤 CSS와도 짝 지을 수 있음.
- **SSR 안전** — Next.js App Router에서 검증. `useId` 기반 안정 ID.
- **ISO 8601 UTC 문자열** — `Date` 객체의 함정 없음.
- **타임존 인지** — `displayTimezone` prop으로 IANA 타임존과 DST를 안전하게 처리. UTC 저장 계약은 그대로.
- **접근성** — WAI-ARIA, 풀 키보드, axe 자동 통과.
- **트리셰이킹** — 렌더하는 만큼만 비용.
- **TypeScript 우선** — strict, `any` 없음.

## 패키지

| 패키지 | 역할 |
| --- | --- |
| [`@kalyx/react`](./packages/react) | React 컴포넌트·훅·타입 |
| [`@kalyx/core`](./packages/core) | 플랫폼 독립 날짜 로직·어댑터 |

## 빠른 시작

```tsx
'use client';

import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

export function BookingField() {
  const [date, setDate] = useState<ISODateString | null>(null);
  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input placeholder="YYYY-MM-DD" />
      <DatePicker.Trigger />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

값은 항상 `ISODateString | null`:

```ts
// onChange → "2026-04-15T00:00:00.000Z" | null
```

[빠른 시작 가이드 →](https://kalyx-docs.vercel.app/ko/docs/getting-started/quick-start)

## Tailwind CSS로 스타일링

Kalyx는 headless입니다 — `classNames`와 `data-*` 속성으로 직접 스타일을 입힙니다.

### classNames 사용

```tsx
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input
    className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm
               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    placeholder="날짜 선택"
  />
  <DatePicker.Popover className="mt-1 rounded-xl border bg-white p-4 shadow-lg">
    <DatePicker.Calendar
      classNames={{
        header: "flex items-center justify-between mb-2",
        title: "text-sm font-semibold",
        navButton: "p-1 rounded hover:bg-gray-100",
        grid: "w-full border-collapse",
        weekdayHeader: "text-xs font-medium text-gray-500 pb-2",
        day: "h-9 w-9 rounded-lg text-sm hover:bg-gray-100",
        daySelected: "bg-blue-600 text-white hover:bg-blue-700",
        dayToday: "font-bold text-blue-600",
        dayDisabled: "text-gray-300 cursor-not-allowed",
        dayOutsideMonth: "text-gray-300",
      }}
    />
  </DatePicker.Popover>
</DatePicker>
```

### data 속성 활용

모든 상호작용 상태는 `data-*` 속성으로 노출되어 CSS나 Tailwind arbitrary selector로 다룰 수 있습니다:

```css
[data-selected] { @apply bg-blue-600 text-white; }
[data-today] { @apply font-bold ring-1 ring-blue-400; }
[data-disabled] { @apply opacity-30 cursor-not-allowed; }
[data-in-range] { @apply bg-blue-100; }
[data-range-start] { @apply rounded-l-lg bg-blue-600 text-white; }
[data-range-end] { @apply rounded-r-lg bg-blue-600 text-white; }
```

더 많은 레시피: [Tailwind](https://kalyx-docs.vercel.app/ko/docs/recipes/tailwind) · [shadcn/ui](https://kalyx-docs.vercel.app/ko/docs/recipes/shadcn) · [React Hook Form](https://kalyx-docs.vercel.app/ko/docs/recipes/react-hook-form)

## 컴포넌트

```tsx
import {
  DatePicker,       // 단일 날짜
  RangePicker,      // 프리셋 포함 범위
  TimePicker,       // 시 + 분 (+ 초)
  DateTimePicker,   // 날짜 + 시간 결합
  MonthPicker,      // 월 선택
  YearPicker,       // 연도 선택
  WeekPicker,       // 주 단위 범위 선택
} from '@kalyx/react';
```

각 Root는 dot 표기로 서브 컴포넌트를 노출합니다.

```tsx
<DatePicker.Input />
<DatePicker.Trigger />
<DatePicker.Popover />
<DatePicker.Calendar />
<DatePicker.MonthGrid />
<DatePicker.YearGrid />
<DatePicker.Presets />
```

## 훅

```tsx
import { useDatePicker, useRangePicker, useTimePicker } from '@kalyx/react';
```

컴포넌트로 표현되지 않는 완전 커스텀 UI를 만들 때 사용합니다.

## 문서

전체 문서는 **[kalyx-docs.vercel.app](https://kalyx-docs.vercel.app/ko)** 에 있습니다.

- [소개](https://kalyx-docs.vercel.app/ko/docs/intro)
- [설치](https://kalyx-docs.vercel.app/ko/docs/getting-started/installation)
- [Composition API](https://kalyx-docs.vercel.app/ko/docs/concepts/composition)
- [컴포넌트](https://kalyx-docs.vercel.app/ko/docs/components/datepicker)
- [훅](https://kalyx-docs.vercel.app/ko/docs/hooks/use-date-picker)
- [레시피 — Tailwind / shadcn / React Hook Form](https://kalyx-docs.vercel.app/ko/docs/recipes/tailwind)
- [테스트](https://kalyx-docs.vercel.app/ko/docs/recipes/testing)
- [문제 해결](https://kalyx-docs.vercel.app/ko/docs/troubleshooting)
- [마이그레이션 가이드](https://kalyx-docs.vercel.app/ko/docs/migration)

## 번들 크기

```
@kalyx/react  →  gzip 12.07 KB  (v1.0.0-rc.1, 7개 컴포넌트, "use client" 자동 주입)
```

CI에서 `≤ 13 KB`로 강제. `@kalyx/core`에 `sideEffects: false`가 설정돼 있어 임포트 단위 트리셰이킹이 작동합니다 — `TimePicker`만 쓰면 DatePicker 코드가 사라집니다.

## 지원 환경

- React 19+
- 모든 모던 브라우저 (Chrome, Firefox, Safari, Edge)
- SSR: Next.js App Router·Pages Router, Remix, `renderToString`
- 개발 시 Node ≥ 20

## 기여

```bash
pnpm install
pnpm test           # 단위 + 컴포넌트 테스트
pnpm test:e2e       # Playwright
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle   # ≤ 13 KB 강제
pnpm --filter docs-site start  # 문서 사이트 localhost:3000
```

PR 환영. 보내기 전에 아키텍처 원칙이 담긴 [CLAUDE.md](./CLAUDE.md)를 확인하세요.

## 라이선스

[MIT](./LICENSE) © 2026 Kalyx contributors.
