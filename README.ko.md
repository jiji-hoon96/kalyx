<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./img/hero-dark.webp">
  <img src="./img/hero-light.webp" alt="Kalyx: 7개의 날짜 프리미티브, 하나의 API" width="720">
</picture>

# Kalyx

**값을 ISO 8601 UTC 문자열로 주고받는 Headless React 날짜 피커.**

[문서](https://kalyx-docs-site.vercel.app/ko) · [English](https://kalyx-docs-site.vercel.app) · [npm](https://www.npmjs.com/package/@kalyx/react) · [README.md](./README.md)

[![npm](https://img.shields.io/npm/v/@kalyx/react?color=5b4fe1&label=%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![CI](https://github.com/jiji-hoon96/kalyx/actions/workflows/pr-check.yml/badge.svg)](https://github.com/jiji-hoon96/kalyx/actions/workflows/pr-check.yml)
[![codecov](https://codecov.io/gh/jiji-hoon96/kalyx/branch/main/graph/badge.svg)](https://codecov.io/gh/jiji-hoon96/kalyx)
[![npm downloads](https://img.shields.io/npm/dw/%40kalyx%2Freact)](https://www.npmjs.com/package/@kalyx/react)
[![Bundle](https://img.shields.io/badge/gzip%20%28dist%20file%2C%20deps%20external%29-~19.5KB-brightgreen)](https://kalyx-docs-site.vercel.app/ko/docs/api/react#bundle-size)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19%2B-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic?file=src%2FApp.tsx)

</div>

---

Kalyx는 단일 날짜 / 범위 / 시간 / 날짜+시간 / 월 / 연 / 주 7종 픽커를 하나의 Headless 조합형 API로 다루는 React 라이브러리입니다. CSS는 없습니다. 의존성까지 묶고 React는 외부로 두면 DatePicker 하나가 gzip ~19 KB, 7종 전부가 ~26 KB 입니다([측정 방법](#번들)).

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

`onChange`는 항상 `ISODateString | null` 을 반환합니다. UTC 안전, `Date` 객체 없음.

## Kalyx를 쓰는 이유

서울에서 `new Date(2026, 3, 15)` 로 날짜를 만들어 저장하면 서버에는 4월 14일(UTC 15:00)로 들어갑니다. UTC+9 의 자정은 UTC 로 전날 오후이기 때문입니다. 그래서 Kalyx는 어떤 경계에서도 `Date` 를 받지 않습니다. 값은 ISO 8601 UTC 문자열로 들어오고 나가며, 표시 타임존은 값과 분리된 opt-in prop(`displayTimezone`)이라 저장값이 보는 사람의 타임존에 따라 달라지지 않습니다.

날짜·범위·날짜+시간은 다른 headless 라이브러리도 이미 다룹니다. Kalyx가 더하는 것은 더 좁습니다.

- **값 모델.** 값이 `@internationalized/date` 객체(Ark UI·React Aria 의 방식)가 아니라 ISO 8601 UTC 문자열이라 JSON 에 그대로 실립니다.
- **목록형 TimePicker.** `TimePicker.HourList`·`TimePicker.MinuteList` 는 `role="listbox"` 목록에서 골라 찍는 입력입니다.
- **월·연·주 피커**가 DatePicker 와 같은 조합형 API 를 씁니다.

## 특징

- **Zero CSS.** 임포트할 스타일시트도, 재정의할 클래스도 없음 (Tailwind, shadcn/ui, Chakra, 일반 CSS 무엇이든).
- **Composition API.** Radix 스타일 dot 표기. props 폭발 없음.
- **SSR 안전.** 7종 픽커 모두 `renderToString` 테스트가 있고, 두 엔트리 모두 `"use client"` 지시어로 배포됩니다.
- **ISO 8601 UTC 문자열.** 입출력에 `Date` 객체가 없음.
- **IANA 타임존.** opt-in `displayTimezone`이 DST 를 처리하고, 저장 계약은 UTC 그대로.
- **접근성.** WAI-ARIA 역할과 풀 키보드 지원, 컴포넌트 테스트에 jest-axe 검사 포함.
- **i18n 준비 완료.** `locale` prop (Intl 기반 월/요일/AM-PM 이름, locale 기반 주 시작 요일 추론) + `dir` prop 으로 RTL 지원.
- **picker별 tree-shaking.** 쓰지 않는 picker 는 제거되지만 남은 picker 들은 큰 공통 기반을 공유합니다. 실측으로 DatePicker 하나만 쓰면 약 18.90 KB gzip, TimePicker 하나만 쓰면 약 16.36 KB, 7종 픽커 + 메인 엔트리 훅 3종을 전부 쓰면 약 25.65 KB 입니다. `pnpm check-tree-shaking` 으로 확인할 수 있습니다.
- **TypeScript strict.** `any` 없음.

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

두 숫자는 서로 다른 것을 잽니다.

- **앱에 실제로 실리는 크기** (`pnpm check-tree-shaking`). esbuild 로 minify 하고 `@kalyx/core`·`@kalyx/adapter-date-fns`·`@floating-ui/react` 까지 함께 묶은 뒤(React, React DOM 은 외부) gzip 한 크기. DatePicker 하나 ~19 KB, 7종 픽커 + 훅 ~26 KB.
- **배포 파일 한 개의 크기** (`pnpm check-bundle`, 배지의 값). `packages/react/dist/index.js` 한 파일이고 위 세 의존성은 외부 import 로 남깁니다. gzip ~19.5 KB. CI 한계는 기본 엔트리(ESM+CJS)가 20 KB, 더 큰 headless 엔트리가 별도로 22 KB 입니다.

의존성을 포함한 다른 라이브러리의 크기 수치와 비교할 때는 첫 번째 숫자를 씁니다.

## 지원 환경

React 19+ · 모던 브라우저 · SSR: 모든 picker 에 `renderToString` 테스트 · Node ≥ 20.

## 로드맵

1.0 이후 배포물: day.js·Luxon 어댑터, `/headless` 훅 4종, `Presets` API, IANA `displayTimezone`, RTL + `Intl` 기반 i18n, `@kalyx/core` 전반의 프로퍼티 기반 테스트(`fast-check`).

**다음 계획**

- 피커별 `DisabledRule` 시맨틱 명확화 (각 피커가 어떤 규칙 형태를 따르는지)
- 의존성별 번들 크기 리포트
- e2e 커버리지 확대: 렌더링 도중 props 변경, 로캘 전환

**검토 중** (확정 아님)

- 그레고리력 외 달력 체계 (페르시아, 히브리, 불교, …)
- React Native 어댑터
- 비주얼 리그레션 / Storybook 하네스

이 목록은 실제 사용 피드백이 방향을 정합니다. [이슈](https://github.com/jiji-hoon96/kalyx/issues)나 [디스커션](https://github.com/jiji-hoon96/kalyx/discussions)으로 의견을 주세요.

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
