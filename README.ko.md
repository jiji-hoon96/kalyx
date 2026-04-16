<div align="center">

<img src="./img/main.jpeg" alt="Kalyx — 마침내 완성된 Headless DatePicker" width="720" />

# Kalyx

**마침내 완성된 Headless React DatePicker.**

[문서](https://kalyx-docs.vercel.app/ko) · [English Docs](https://kalyx-docs.vercel.app) · [npm](https://www.npmjs.com/package/@kalyx/react) · [GitHub](https://github.com/jiji-hoon96/kalyx)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-9.2KB-brightgreen)](#번들-크기)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

> English README: [README.md](./README.md)

Kalyx는 **완결된 채로** 배포되는 Headless React DatePicker 라이브러리입니다. 단일 날짜, 날짜 범위, 시간, 날짜+시간을 하나의 조합형 API로 다룹니다 — gzip 12KB 이하, CSS 없음, SSR 안전.

```bash
pnpm add @kalyx/react
```

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

| 라이브러리 | Headless | Input | TimePicker | RangePicker | SSR | 번들 (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| react-day-picker | ✅ | ❌ | ❌ | ✅ | ✅ | ~22 KB |
| react-datepicker | ❌ (CSS 필수) | ✅ | ✅ | ✅ | △ | ~60 KB |
| Ark UI | ✅ | ✅ | ❌ (제거됨) | ✅ | ✅ | 큼 |
| React Aria | ✅ | ✅ | ✅ | ✅ | ✅ | 큼 |
| **Kalyx** | ✅ | ✅ | ✅ | ✅ | ✅ | **~9 KB** |

## 특징

- **Zero CSS** — 임포트할 스타일시트도, 재정의할 클래스도 없음.
- **진짜 조합형** — Radix 스타일 dot 표기. props 폭발 없음.
- **Headless** — Tailwind, shadcn/ui, Chakra, 어떤 CSS와도 짝 지을 수 있음.
- **SSR 안전** — Next.js App Router에서 검증. `useId` 기반 안정 ID.
- **ISO 8601 UTC 문자열** — `Date` 객체의 함정 없음.
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

## 컴포넌트

```tsx
import {
  DatePicker,       // 단일 날짜
  RangePicker,      // 프리셋 포함 범위
  TimePicker,       // 시 + 분 (+ 초)
  DateTimePicker,   // 날짜 + 시간 결합
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
- [마이그레이션 가이드](https://kalyx-docs.vercel.app/ko/docs/migration)

## 번들 크기

```
packages/react/dist/index.js  →  gzip 9.2 KB
```

CI에서 `< 12 KB`로 강제. 임포트 단위 트리셰이킹 — `TimePicker`만 쓰면 DatePicker 코드가 사라집니다.

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
pnpm check-bundle   # ≤ 12 KB 강제
pnpm --filter docs-site start  # 문서 사이트 localhost:3000
```

PR 환영. 보내기 전에 아키텍처 원칙이 담긴 [CLAUDE.md](./CLAUDE.md)를 확인하세요.

## 라이선스

[MIT](./LICENSE) © 2026 Kalyx contributors.
