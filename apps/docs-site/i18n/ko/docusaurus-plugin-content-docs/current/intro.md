---
id: intro
title: 소개
sidebar_position: 1
slug: /intro
---

# Kalyx

**Kalyx** 는 *완성된 상태로* 출시되는 headless React DatePicker 라이브러리다. 7개의 조합 가능한 picker — **DatePicker**, **RangePicker**, **TimePicker**, **DateTimePicker**, **MonthPicker**, **YearPicker**, **WeekPicker** — 가 하나의 일관된 API 뒤에 자리한다.

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

## Kalyx 가 존재하는 이유

2026년 React 생태계에는 두 극단만 존재하고 그 사이가 비어 있다:

| 옵션 | 제공하는 것 | 부족한 것 |
| --- | --- | --- |
| **react-day-picker** | Headless, 접근성 갖춘 캘린더 그리드 | input, time, range 미포함 |
| **react-datepicker** | 통합된 기능 | 60KB, CSS 강제, Date 객체 API, timezone 함정 |
| **Ark UI / React Aria** | Composition 패턴 | TimePicker 미제공(Ark), 무거운 의존성(Aria) |

Kalyx 는 그 공백을 채운다:

- **Headless 철학** — 스타일시트 없음, 덮어써야 할 클래스 없음.
- **통합된 primitive** — 7개의 picker (DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker) 가 하나의 컨텍스트 모델을 공유한다.
- **Composition 우선** — Radix 스타일의 dot notation. 100개짜리 prop 덩어리 없음.
- **~15 KB gzip (≤ 16 KB 한계)** — 측정된 값, CI 에서 강제된다.
- **SSR 안전** — Next.js App Router 환경에서 검증됨.
- **ISO 8601 UTC 문자열** 을 값 계약으로 사용 — Date 객체로 인한 함정 없음.
- **Timezone 인지** — opt-in `displayTimezone` prop 이 UTC 저장 계약을 유지한 채 DST 와 civil-day 의미론을 처리한다. [Timezone 컨셉 페이지](./concepts/timezone) 참고.

## 누구를 위한 것인가

- 이미 **Tailwind**, **shadcn/ui**, **Chakra**, 또는 자체 디자인 시스템을 쓰고 있고, 그 토큰을 따르는 date UI 가 필요한 팀.
- **번들 크기** 와 **tree-shaking** 을 신경 쓰는 앱.
- **Next.js**, **Remix**, 또는 다른 SSR/RSC 환경에서 동작하는 것.

## 패키지 구성

```
@kalyx/react                @kalyx/core
─────────────────────       ─────────────────────
<DatePicker>                DateFnsAdapter
<RangePicker>               getCalendarDays
<TimePicker>                isDateDisabled
<DateTimePicker>            setTime / getTime
<MonthPicker>               formatInTimezone
<YearPicker>                getMonthName
<WeekPicker>                parseInputValue
useDatePicker               normalizeISO
useRangePicker              DEFAULT_*_LABELS
useTimePicker               …외 다수
```

## 다음 단계

- [패키지 설치 →](./getting-started/installation)
- [퀵 스타트 (5분) →](./getting-started/quick-start)
- [Composition API →](./concepts/composition)
- [컴포넌트 →](./components/datepicker)
