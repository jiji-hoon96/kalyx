---
id: intro
title: 소개
sidebar_position: 1
slug: /intro
description: 'Kalyx 는 headless React 날짜 피커 라이브러리입니다. 피커 7종, CSS 없음, SSR 안전, ISO 8601 UTC 문자열 입출력.'
---

# Kalyx

**Kalyx** 는 값을 ISO 8601 UTC 문자열로 주고받는 headless React 날짜 피커 라이브러리다. 7개의 조합 가능한 picker(**DatePicker**, **RangePicker**, **TimePicker**, **DateTimePicker**, **MonthPicker**, **YearPicker**, **WeekPicker**)가 하나의 일관된 API 뒤에 자리한다.

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

서울에서 `new Date(2026, 3, 15)` 로 날짜를 만들어 저장하면 서버에는 4월 14일(UTC 15:00)로 들어간다. UTC+9 의 자정은 UTC 로 전날 오후이기 때문이다. 그래서 Kalyx 는 어떤 경계에서도 `Date` 를 받지 않는다. 값은 ISO 8601 UTC 문자열로 들어오고 나가며, 표시 타임존은 값과 분리된 opt-in prop(`displayTimezone`)이라 저장값이 보는 사람의 타임존에 따라 달라지지 않는다. [Timezone 컨셉 페이지](./concepts/timezone) 참고.

날짜·범위·날짜+시간은 다른 headless 라이브러리도 이미 다룬다. Kalyx 가 더하는 것은 더 좁다.

- **값 모델.** 값이 `@internationalized/date` 객체(Ark UI·React Aria 의 방식)가 아니라 ISO 8601 UTC 문자열이라 JSON 에 그대로 실린다.
- **목록형 TimePicker.** `TimePicker.HourList`·`TimePicker.MinuteList` 는 `role="listbox"` 목록에서 골라 찍는 입력이다.
- **월·연·주 피커**가 DatePicker 와 같은 조합형 API 를 쓴다.

그 밖에:

- **Headless.** 스타일시트 없음, 덮어써야 할 클래스 없음.
- **Composition 우선.** Radix 스타일의 dot notation. 100개짜리 prop 덩어리 없음.
- **SSR 안전.** 7종 picker 모두 `renderToString` 테스트가 있고, 두 엔트리 모두 `"use client"` 지시어로 배포된다.
- **접근성.** WAI-ARIA 역할과 풀 키보드 지원, 컴포넌트 테스트에 jest-axe 검사 포함.

## 누구를 위한 것인가

- 이미 **Tailwind**, **shadcn/ui**, **Chakra**, 또는 자체 디자인 시스템을 쓰고 있고, 그 토큰을 따르는 date UI 가 필요한 팀.
- 날짜를 저장하고, 브라우저와 서버 사이에서 하루가 밀리면 안 되는 앱.
- **번들 크기** 를 신경 쓰는 앱. 의존성까지 묶어 minify 하고 React 는 외부로 두면 DatePicker 하나가 gzip 약 19 KB, 7종 picker + 메인 엔트리 훅 3종 전부가 약 26 KB 입니다. 쓰지 않는 picker 는 제거되지만 남은 picker 들은 큰 공통 기반을 공유합니다. [트러블슈팅 → 번들 크기](./troubleshooting.md#번들-크기가-예상보다-큽니다) 참고.
- 서버 렌더링하는 React 앱. 예를 들어 Next.js App Router 에서 Kalyx 를 client component 안에 두는 경우. [SSR 안전](./concepts/ssr) 참고.

## 패키지 구성

```
@kalyx/react                @kalyx/core                 @kalyx/adapter-date-fns
─────────────────────       ─────────────────────       ───────────────────────
<DatePicker>                getCalendarDays             DateFnsAdapter
<RangePicker>               isDateDisabled
<TimePicker>                setTime / getTime           (also published:
<DateTimePicker>            formatInTimezone             @kalyx/adapter-dayjs
<MonthPicker>               getMonthName                 @kalyx/adapter-luxon)
<YearPicker>                parseInputValue
<WeekPicker>                normalizeISO
useDatePicker               DEFAULT_*_LABELS
useRangePicker              …and more
useTimePicker

@kalyx/react/headless: the same components without the bundled adapter,
plus useMonthPicker / useYearPicker / useWeekPicker / useDateTimePicker.
```

## 다음 단계

- [패키지 설치 →](./getting-started/installation)
- [퀵 스타트 (5분) →](./getting-started/quick-start)
- [Composition API →](./concepts/composition)
- [컴포넌트 →](./components/datepicker)
