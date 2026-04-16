---
id: intro
title: 소개
sidebar_position: 1
slug: /intro
---

# Kalyx

**Kalyx**는 *완결된* 채로 배포되는 Headless React DatePicker 라이브러리입니다. 날짜 UI가 필요로 하는 네 가지 — **단일 날짜**, **날짜 범위**, **시간**, **날짜 + 시간** — 를 하나의 일관된 조합형 API로 제공합니다.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Trigger />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## Kalyx가 필요한 이유

2026년 React 생태계의 DatePicker 선택지는 양극단입니다. 그 사이를 채우는 라이브러리가 없습니다.

| 선택지 | 장점 | 한계 |
| --- | --- | --- |
| **react-day-picker** | Headless, 접근성 있는 캘린더 그리드 | 입력창·시간·범위 미지원 |
| **react-datepicker** | 통합 기능 | 60KB, CSS 필수, Date 객체 API, 타임존 함정 |
| **Ark UI / React Aria** | 조합 패턴 지원 | TimePicker 없음(Ark), 무거운 의존성(Aria) |

Kalyx는 그 공백을 채웁니다.

- **Headless 철학** — 스타일시트도, 재정의할 클래스도 없습니다.
- **통합 프리미티브** — DatePicker, RangePicker, TimePicker, DateTimePicker가 하나의 컨텍스트 모델을 공유합니다.
- **조합 우선** — Radix 스타일 dot 표기. props 100개짜리 거대 컴포넌트 없음.
- **gzip 12KB 이하** — 측정하고, CI에서 강제.
- **SSR 안전** — Next.js App Router 환경에서 검증.
- **ISO 8601 UTC 문자열**을 값 계약으로 사용. Date 객체의 함정 없음.

## 누구에게 적합한가

- **Tailwind**, **shadcn/ui**, **Chakra**, 자체 디자인 시스템을 이미 쓰면서 토큰에 맞는 날짜 UI가 필요한 팀.
- **번들 크기**와 **트리셰이킹**에 민감한 앱.
- **Next.js**, **Remix** 등 SSR/RSC 환경에서 동작하는 모든 앱.

## 담겨 있는 것

```
@kalyx/react                @kalyx/core
─────────────────────       ─────────────────────
<DatePicker>                DateFnsAdapter
<RangePicker>               getCalendarDays
<TimePicker>                isDateDisabled
<DateTimePicker>            setTime / getTime
useDatePicker               parseInputValue
useRangePicker              normalizeISO
useTimePicker               …외 다수
```

## 다음 단계

- [설치 →](./getting-started/installation.md)
- [빠른 시작 (5분) →](./getting-started/quick-start.md)
- [Composition API →](./concepts/composition.md)
- [컴포넌트 →](./components/datepicker.md)
