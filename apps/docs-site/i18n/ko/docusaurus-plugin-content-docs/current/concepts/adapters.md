---
id: adapters
title: 날짜 어댑터
sidebar_position: 4
description: 'Kalyx 는 DateAdapter 를 통해 날짜 라이브러리와 대화합니다. 배포된 date-fns·Day.js·Luxon 어댑터를 쓰거나 직접 만들 수 있습니다.'
---

# 날짜 어댑터

Kalyx는 특정 날짜 라이브러리에 박제돼 있지 않습니다. 모든 동작이 `DateAdapter` 인터페이스를 거칩니다. 기본 구현은 **date-fns v4**를 감싸지만, 원하면 자체 어댑터를 제공할 수 있습니다.

## 인터페이스

```ts
import type { DateAdapter, ISODateString } from '@kalyx/react';

interface DateAdapter {
  /** Any format → ISO 8601 UTC string. `format` is a parsing hint, not required. */
  parse(value: string, format?: string): string;

  /** ISO string → display string. The third argument is an IANA timezone, not a locale. */
  format(iso: string, formatStr: string, timezone?: string): string;

  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  now(): string;
  today(timezone?: string): string;

  isValid(value: string): boolean;

  getYear(iso: string): number;
  getMonth(iso: string): number;
  getDate(iso: string): number;
  getDay(iso: string): number;
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

## 기본이 아닌 어댑터 쓰기

Day.js 와 Luxon 은 더 이상 손으로 어댑터를 쓸 필요가 없다. 둘 다 패키지로 배포돼 있으므로,
설치해서 `/headless` 엔트리에 넘기는 것이 지원되는 경로다.

```bash npm2yarn
npm install @kalyx/react @kalyx/adapter-dayjs dayjs
```

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from '@kalyx/adapter-dayjs';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>;
```

`@kalyx/adapter-luxon` 도 `LuxonAdapter` 로 같은 방식이다. `/headless` 엔트리는 어댑터를
싣지 않으므로 `adapter` 가 필수다. 생략하면 렌더 시점에 컴포넌트 이름이 담긴 에러가 난다.

## 직접 어댑터 작성

Kalyx 가 배포하지 않는 백엔드를 쓸 때만 직접 쓴다. 계약은 위의 `DateAdapter` 인터페이스이고,
틀리기 쉬운 지점이 셋 있다.

- `parse` 는 `Date` 가 아니라 **ISO 문자열**을 반환한다. `format` 인자는 선택적 힌트다.
- `format` 의 세 번째 인자는 locale 이 아니라 **IANA 타임존**이다.
- `isSameDay`, `startOfDay`, `today` 는 모두 선택적 `timezone` 을 받는다. 이걸 무시하면
  모든 피커에서 `displayTimezone` 이 깨진다.

모든 계산은 UTC 로 한다. Kalyx 는 ISO 문자열이 `Z` 로 끝난다고 가정한다.

결과를 손으로 확인하지 않는다. `@kalyx/core/test-helpers` 가 공식 어댑터 3종이 돌리는 것과
같은 conformance suite 를 export 하며, 여기서는 그것이 "맞다"의 정의다.

```ts
import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { MyAdapter } from './my-adapter';

runAdapterConformanceTests(MyAdapter, { describe, it, expect });
```

## 의존성 관련 참고

`@kalyx/core`는 이제 날짜 라이브러리에 독립적이며 자체 `date-fns` 의존성이 없습니다. 기본 어댑터는 `@kalyx/adapter-date-fns`에 있고, 기본 `@kalyx/react` 엔트리가 이를 자동으로 주입하므로 `@kalyx/react`만 설치해도 바로 동작합니다.

이미 `dayjs`, `luxon`, 또는 `Temporal`을 사용한다면 `@kalyx/react/headless`에서 import하여 어댑터를 교체하고 번들에서 `date-fns`를 완전히 제외할 수 있습니다. Kalyx는 `@kalyx/adapter-dayjs`와 `@kalyx/adapter-luxon` 공식 drop-in 어댑터를 제공하므로 직접 작성할 필요가 없습니다. 전체 사용법은 [어댑터 가이드](../guides/adapters.md)를 참고하세요.

## 다음

- [어댑터 가이드 (커스텀 어댑터, `/headless` 엔트리) →](../guides/adapters.md)
- [ISO 문자열 →](./iso-string.md)
- [API 레퍼런스 — core →](../api/core.md)
