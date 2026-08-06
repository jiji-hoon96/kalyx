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

## 직접 확인해보세요

7종 피커 전부, [라이브 플레이그라운드](/playground)에서 녹화. 화면의 스타일은 데모용이며 Kalyx는 CSS를 전혀 포함하지 않습니다.

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', margin: '1.5rem 0'}}>
  <figure style={{margin: 0}}><img src="/img/demos/datepicker.avif" alt="DatePicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>DatePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/rangepicker.avif" alt="RangePicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>RangePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/timepicker.avif" alt="TimePicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>TimePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/datetimepicker.avif" alt="DateTimePicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>DateTimePicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/monthpicker.avif" alt="MonthPicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>MonthPicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/yearpicker.avif" alt="YearPicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>YearPicker</figcaption></figure>
  <figure style={{margin: 0}}><img src="/img/demos/weekpicker.avif" alt="WeekPicker 데모" loading="lazy" style={{width: '100%', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-200)'}} /><figcaption>WeekPicker</figcaption></figure>
</div>

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
- **~18.5 KB gzip (≤ 20 KB 한계)** — 측정된 값, CI 에서 강제된다.
- **SSR 안전** — Next.js App Router 환경에서 검증됨.
- **ISO 8601 UTC 문자열** 을 값 계약으로 사용 — Date 객체로 인한 함정 없음.
- **Timezone 인지** — opt-in `displayTimezone` prop 이 UTC 저장 계약을 유지한 채 DST 와 civil-day 의미론을 처리한다. [Timezone 컨셉 페이지](./concepts/timezone) 참고.

## 누구를 위한 것인가

- 이미 **Tailwind**, **shadcn/ui**, **Chakra**, 또는 자체 디자인 시스템을 쓰고 있고, 그 토큰을 따르는 date UI 가 필요한 팀.
- **번들 크기** 를 신경 쓰는 앱 — 피커 7종 전부가 경쟁 라이브러리 하나치 정도 공간에 들어가고, CI 로 천장을 강제합니다. (피커별 제거는 **주장하지 않습니다** — 하나만 import 해도 7종 전부와 비용이 거의 같습니다. [트러블슈팅 → 번들 크기](./troubleshooting.md#번들-크기가-예상보다-큽니다) 참고.)
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
