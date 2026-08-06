<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
  <img src="./img/hero-light.webp" alt="Kalyx — 7개의 날짜 프리미티브, 하나의 API" width="720">
</picture>

# Kalyx

**마침내 완성된 Headless React DatePicker.**

[문서](https://kalyx-docs-site.vercel.app/ko) · [English](https://kalyx-docs-site.vercel.app) · [npm](https://www.npmjs.com/package/@kalyx/react) · [README.md](./README.md)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip-~18.5KB-brightgreen)](https://kalyx-docs-site.vercel.app/ko/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

Kalyx는 **완결된 채로** 배포되는 Headless React DatePicker 라이브러리입니다. 단일 날짜 / 범위 / 시간 / 날짜+시간 / 월 / 연 / 주 7종 픽커를 하나의 조합형 API로 다룹니다 — gzip ~18.5 KB (≤ 20 KB), CSS 없음, SSR 안전.

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

`onChange`는 항상 `ISODateString | null` — UTC 안전, `Date` 객체 없음.

## Kalyx를 쓰는 이유

2026년 React 데이트 피커 시장은 둘 중 하나를 강요한다: 통합됐지만 무거운 것(react-datepicker ~62 KB, MUI ~58 KB), 또는 가볍지만 부분적인 것(react-day-picker — calendar grid만; Ark UI — standalone TimePicker 없음; React Aria — `@internationalized/date` 종속). react-calendar는 단일 날짜·범위는 다루지만 time·RSC·timezone 저장이 빠지고, react-native-calendars는 모바일 우선이다.

Kalyx는 **7개 프리미티브** — 단일 날짜, 범위, 시간, 날짜+시간, 월, 연, 주 — 를 하나의 composition API로 묶는다. Headless, ~18.5 KB gzip, SSR 안전, ISO 문자열 입출력, date-fns/dayjs/luxon용 adapter 패턴.

## 특징

- **Zero CSS** — 임포트할 스타일시트도, 재정의할 클래스도 없음.
- **Composition API** — Radix 스타일 dot 표기. props 폭발 없음.
- **SSR 안전** — Next.js App Router 검증.
- **ISO 8601 UTC 문자열** — `Date` 객체의 함정 없음.
- **IANA 타임존** — `displayTimezone`이 DST·civil day 처리, 저장 계약은 UTC.
- **접근성** — WAI-ARIA + 풀 키보드, axe 자동 통과.
- **i18n 준비 완료** — `locale` prop (Intl 기반 월/요일/AM-PM 이름, locale 기반 주 시작 요일 추론) + `dir` prop 으로 RTL 지원.
- **번들러 친화 메타데이터** — `sideEffects: false`를 선언하며, `pnpm check-tree-shaking`으로 현재 루트 엔트리 비용을 확인할 수 있습니다.
- **TypeScript strict** — `any` 없음.

## 패키지

| 패키지 | 역할 |
|---|---|
| [`@kalyx/react`](./packages/react) | React 컴포넌트·훅·타입 |
| [`@kalyx/core`](./packages/core) | 플랫폼 독립 날짜 로직·`DateAdapter` 계약 |
| [`@kalyx/adapter-date-fns`](./packages/adapter-date-fns) | date-fns 어댑터 (`@kalyx/react` 기본 내장) |
| [`@kalyx/adapter-dayjs`](./packages/adapter-dayjs) | dayjs 어댑터 (`@kalyx/react/headless` 용) |
| [`@kalyx/adapter-luxon`](./packages/adapter-luxon) | luxon 어댑터 (`@kalyx/react/headless` 용) |

## 컴포넌트

7개 조합형 픽커 + 7개 headless 훅 (메인 엔트리에 3개, `@kalyx/react/headless` 에 4개 추가):

```tsx
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
} from '@kalyx/react';

import {
  useMonthPicker, useYearPicker, useWeekPicker, useDateTimePicker,
} from '@kalyx/react/headless';
```

API 레퍼런스, 레시피 (Tailwind / shadcn / React Hook Form), 마이그레이션 가이드는 모두 **[공식 문서](https://kalyx-docs-site.vercel.app/ko)** 에 있습니다.

### 데모

[라이브 플레이그라운드](https://kalyx-docs-site.vercel.app/playground)에서 녹화. 화면의 스타일은 데모용이며 Kalyx는 CSS를 전혀 포함하지 않습니다.

| | | |
|:---:|:---:|:---:|
| **DatePicker**<br><img src="./img/demos/datepicker.avif" alt="DatePicker 데모" width="260"> | **RangePicker**<br><img src="./img/demos/rangepicker.avif" alt="RangePicker 데모" width="260"> | **TimePicker**<br><img src="./img/demos/timepicker.avif" alt="TimePicker 데모" width="260"> |
| **DateTimePicker**<br><img src="./img/demos/datetimepicker.avif" alt="DateTimePicker 데모" width="260"> | **MonthPicker**<br><img src="./img/demos/monthpicker.avif" alt="MonthPicker 데모" width="260"> | **YearPicker**<br><img src="./img/demos/yearpicker.avif" alt="YearPicker 데모" width="260"> |
| **WeekPicker**<br><img src="./img/demos/weekpicker.avif" alt="WeekPicker 데모" width="260"> | | |

## 문서

- [소개](https://kalyx-docs-site.vercel.app/ko/docs/intro) · [빠른 시작](https://kalyx-docs-site.vercel.app/ko/docs/getting-started/quick-start)
- [컴포넌트](https://kalyx-docs-site.vercel.app/ko/docs/components/datepicker) · [훅](https://kalyx-docs-site.vercel.app/ko/docs/hooks/use-date-picker)
- [레시피](https://kalyx-docs-site.vercel.app/ko/docs/recipes/tailwind) · [테스트](https://kalyx-docs-site.vercel.app/ko/docs/recipes/testing) · [문제 해결](https://kalyx-docs-site.vercel.app/ko/docs/troubleshooting)
- [마이그레이션 (react-datepicker / react-day-picker / React Aria)](https://kalyx-docs-site.vercel.app/ko/docs/migration)

## 번들

`@kalyx/react` → gzip **약 18.5 KB**. CI 한계는 기본 엔트리(ESM+CJS)가 20 KB, 더 큰 headless 엔트리가 별도로 22 KB 입니다.

## 지원 환경

React 19+ · 모든 모던 브라우저 · SSR: Next.js App Router / Pages Router / Remix · Node ≥ 20.

## 기여

```bash
pnpm install
pnpm test            # 단위 + 컴포넌트
pnpm typecheck
pnpm lint
pnpm build
pnpm check-bundle    # ≤ 20 KB
```

아키텍처 원칙은 [CLAUDE.md](./CLAUDE.md) 참고.

## 라이선스

[MIT](./LICENSE) © 2026 Kalyx contributors.
