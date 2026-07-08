---
id: adapters
title: 날짜 어댑터
sidebar_position: 4
---

# 날짜 어댑터

Kalyx는 특정 날짜 라이브러리에 박제돼 있지 않습니다. 모든 동작이 `DateAdapter` 인터페이스를 거칩니다. 기본 구현은 **date-fns v4**를 감싸지만, 원하면 자체 어댑터를 제공할 수 있습니다.

## 인터페이스

```ts
import type { DateAdapter, ISODateString } from '@kalyx/react';

interface DateAdapter {
  parse(value: string, format: string): Date | null;
  format(iso: ISODateString, format: string, locale?: string): string;
  addDays(iso: ISODateString, amount: number): ISODateString;
  addMonths(iso: ISODateString, amount: number): ISODateString;
  addYears(iso: ISODateString, amount: number): ISODateString;
  isBefore(a: ISODateString, b: ISODateString): boolean;
  isAfter(a: ISODateString, b: ISODateString): boolean;
  isSameDay(a: ISODateString, b: ISODateString): boolean;
  isSameMonth(a: ISODateString, b: ISODateString): boolean;
  startOfDay(iso: ISODateString): ISODateString;
  startOfMonth(iso: ISODateString): ISODateString;
  endOfMonth(iso: ISODateString): ISODateString;
  startOfWeek(iso: ISODateString, weekStartsOn: 0 | 1): ISODateString;
  endOfWeek(iso: ISODateString, weekStartsOn: 0 | 1): ISODateString;
  now(): ISODateString;
  today(): ISODateString;
  isValid(value: string): boolean;
  getYear(iso: ISODateString): number;
  getMonth(iso: ISODateString): number;
  getDate(iso: ISODateString): number;
  getDay(iso: ISODateString): number;
}
```

## 기본 어댑터 쓰기

`DateFnsAdapter`는 자동 적용됩니다. 대부분의 경우 건드릴 일이 없습니다.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

명시적으로 지정하고 싶다면:

```tsx
import { DatePicker, DateFnsAdapter } from '@kalyx/react';

<DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
  ...
</DatePicker>
```

## 어댑터를 두는 이유

- **컴포넌트 코드 수정 없이 엔진 교체.** 다음 큰 날짜 API는 `Temporal`이며, 안정화되면 가벼운 어댑터가 바로 꽂힙니다.
- **특수 용도의 번들 축소.** Luxon, Day.js를 쓰는 팀은 자체 어댑터로 date-fns를 제외할 수 있습니다.
- **고정 시계로 테스트.** `today()`를 고정 반환하는 스텁 어댑터면 캘린더 테스트가 결정적이 됩니다.

## 커스텀 어댑터 작성

직접 만들기 전에, Kalyx가 이미 제공하는 어댑터가 있는지 확인하세요.
`@kalyx/adapter-dayjs`(dayjs)와 `@kalyx/adapter-luxon`(luxon)은 공유
conformance 스위트로 검증된 drop-in 어댑터라 직접 작성할 필요가 없습니다.
자세한 사용법은 [어댑터 가이드](../guides/adapters.md) 참고.

백엔드가 맞는 게 없다면, `DateAdapter` 타입을 만족하는 객체면 됩니다. Day.js 기반 간단 예시:

```ts
import dayjs from 'dayjs';
import type { DateAdapter, ISODateString } from '@kalyx/react';

export const DayjsAdapter: DateAdapter = {
  parse: (value, format) => {
    const d = dayjs(value, format);
    return d.isValid() ? d.toDate() : null;
  },
  format: (iso, fmt) => dayjs.utc(iso).format(fmt),
  addDays: (iso, n) => dayjs.utc(iso).add(n, 'day').toISOString(),
  addMonths: (iso, n) => dayjs.utc(iso).add(n, 'month').toISOString(),
  addYears: (iso, n) => dayjs.utc(iso).add(n, 'year').toISOString(),
  isBefore: (a, b) => dayjs.utc(a).isBefore(dayjs.utc(b)),
  isAfter: (a, b) => dayjs.utc(a).isAfter(dayjs.utc(b)),
  isSameDay: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'day'),
  isSameMonth: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'month'),
  startOfDay: (iso) => dayjs.utc(iso).startOf('day').toISOString(),
  startOfMonth: (iso) => dayjs.utc(iso).startOf('month').toISOString(),
  endOfMonth: (iso) => dayjs.utc(iso).endOf('month').toISOString(),
  startOfWeek: (iso, w) => dayjs.utc(iso).startOf('week').add(w, 'day').toISOString(),
  endOfWeek: (iso, w) => dayjs.utc(iso).endOf('week').add(w, 'day').toISOString(),
  now: () => dayjs.utc().toISOString(),
  today: () => dayjs.utc().startOf('day').toISOString(),
  isValid: (v) => dayjs(v).isValid(),
  getYear: (iso) => dayjs.utc(iso).year(),
  getMonth: (iso) => dayjs.utc(iso).month(),
  getDate: (iso) => dayjs.utc(iso).date(),
  getDay: (iso) => dayjs.utc(iso).day(),
};
```

`adapter` prop으로 전달:

```tsx
<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

:::warning
Day.js 지원은 *예시*이지 공식 지원 어댑터가 아닙니다. 모든 산술은 UTC로 유지하세요 — Kalyx는 ISO 문자열이 `Z`로 끝난다고 가정합니다.
:::

## 의존성 관련 참고

현재 `date-fns`와 `date-fns-tz`는 `@kalyx/react`의 **런타임 의존성**입니다. 향후 릴리즈에서 이를 별도의 `@kalyx/adapter-date-fns` 패키지로 분리해, 어댑터 없는 번들은 무게를 완전히 뺄 수 있게 됩니다.

## 다음

- [ISO 문자열 →](./iso-string.md)
- [API 레퍼런스 — core →](../api/core.md)
