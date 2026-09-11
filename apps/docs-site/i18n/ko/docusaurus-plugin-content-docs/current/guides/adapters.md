---
title: 날짜 어댑터와 headless 엔트리
sidebar_position: 1
description: '@kalyx/react/headless 엔트리로 date-fns 를 Day.js 나 Luxon 으로 바꾸고, conformance suite 로 커스텀 어댑터를 검증합니다.'
---

# 날짜 어댑터와 `/headless` 엔트리

`@kalyx/react`는 `date-fns`가 이미 연결된 상태로 배포됩니다. 새로 시작하는
경우라면 어댑터를 신경 쓸 필요가 없습니다. 설치하고, import 하고, 렌더하면 끝입니다.

이 가이드는 두 번째 경우를 위한 것입니다. 앱에 이미 `dayjs`, `luxon`, `Temporal`을
싣고 있고, Kalyx 때문에 날짜 라이브러리를 하나 더 번들에 넣고 싶지는 않은 경우입니다.

## 미리 만들어진 어댑터 패키지

직접 만들기 전에, Kalyx가 이미 제공하는 어댑터가 있는지 확인하세요. 각각은
공유 conformance 스위트(`@kalyx/core/test-helpers`)로 검증된, UTC로 고정된
얇은 `DateAdapter`이므로 기본 어댑터와 동일하게 동작합니다:

| 패키지 | 백엔드 | 사용 시점 |
| --- | --- | --- |
| `@kalyx/adapter-date-fns` | date-fns | 기본값. `@kalyx/react`가 자동 설치. |
| `@kalyx/adapter-dayjs` | dayjs | 이미 dayjs를 쓰는 경우 (Mantine 등 다수 스택). |
| `@kalyx/adapter-luxon` | luxon | 이미 luxon을 쓰는 경우 (엔터프라이즈 / timezone 중심 스택에서 흔함). |

```bash npm2yarn
npm install @kalyx/adapter-luxon   # or @kalyx/adapter-dayjs
```

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { LuxonAdapter } from '@kalyx/adapter-luxon';

<DatePicker adapter={LuxonAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

셋 모두 모든 연산을 UTC로 수행해 동일한 ISO 8601(`...Z`) 시맨틱을 지키며,
timezone 관련 작업은 `@kalyx/core`에 위임합니다. 정확성 로직은 각 어댑터가
아니라 core에 있습니다. 백엔드가 맞는 게 없으면
[아래 인터페이스](#직접-어댑터-작성하기)로 직접 작성하세요.

---

## 기본값 (date-fns)

```bash npm2yarn
npm install @kalyx/react
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

기본 엔트리는 `DateFnsAdapter`를 자동 설치하므로 필요한 date-fns 함수가
소비자 그래프에 포함되고 캘린더가 즉시 동작합니다. 정확한 비용은 주변
의존성 그래프에 따라 달라지므로 애플리케이션 번들러로 측정하세요.

**대부분의** 앱에는 이쪽이 맞는 선택입니다. 바꿔야 할 이유가 있을 때만 계속
읽으세요.

---

## 왜 바꾸나요?

다음 경우에는 `/headless` 엔트리로 바꾸는 게 좋습니다.

- **이미 `dayjs` / `luxon` / `Temporal`을 싣고 있다.** 여기에 `date-fns`까지
  더하면 순수한 짐입니다. 파서도 둘, 산술 엔진도 둘, 포매터도 둘이 됩니다.
- **Kalyx가 번들하지 않는 날짜 라이브러리가 필요하다.** 직접 만든 어댑터를
  넘기면 Kalyx가 모든 날짜 연산을 그쪽으로 보냅니다.
- **테스트에 결정론적인 시계가 필요하다.** `today()`가 항상 같은 ISO string을
  돌려주는 스텁 어댑터를 쓰면 캘린더 스냅샷이 안정됩니다.

어느 쪽에도 해당하지 않는다면 기본값에 머무르세요. 바꾸는 데 드는 주의력이
번들에서 아끼는 바이트보다 큽니다.

---

## 커스텀 어댑터 사용하기

`@kalyx/react/headless`에서 import 하고 `adapter` prop을 넘기세요. 그 밖의
컴포넌트 표면은 `@kalyx/react`와 완전히 같습니다.

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
// or a prebuilt one: import { LuxonAdapter } from '@kalyx/adapter-luxon';
// or your own: import { MyAdapter } from './my-adapter';

<DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

모든 Root 컴포넌트(`DatePicker`, `RangePicker`, `TimePicker`,
`DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`)가 같은 `adapter`
prop을 받습니다. hook 7종도 전부 `adapter` 옵션을 받습니다. 메인 엔트리의
`useDatePicker`, `useRangePicker`, `useTimePicker`와 `/headless` 엔트리만
내보내는 `useMonthPicker`, `useYearPicker`, `useWeekPicker`,
`useDateTimePicker`입니다.

headless 엔트리에서 `adapter` prop을 빠뜨리면, Root가 렌더 시점에 명확한
에러를 던집니다.

```
[@kalyx/react/headless] DatePicker requires an adapter.
Pass one via <DatePicker adapter={...}>.
If you don't need a custom adapter, import from '@kalyx/react' instead.
```

이건 의도된 동작입니다. 나중에 `addMonths` 호출 안에서 Calendar grid를 가리키는
스택 트레이스와 함께 터지는 것보다, 렌더 시점에 실수를 잡아 주는 편이 훨씬
친절합니다.

### 두 엔트리 섞어 쓰기

앱 대부분은 `@kalyx/react`(기본 어댑터)로 쓰고, 필요한 화면 하나만
`@kalyx/react/headless`(커스텀 어댑터)로 쓸 수 있습니다. 둘은 자유롭게 함께
씁니다. 컴포넌트 구현은 같은 코드이고, 기본 어댑터를 주입하느냐만 다릅니다.

---

## 직접 어댑터 작성하기

쓰려는 날짜 라이브러리를 이미 만들어진 패키지가 다루지 않는다면
(date-fns, dayjs, luxon은 위 절 참고), `DateAdapter` 인터페이스를 직접
구현하세요. 메서드는 **21개**입니다. 전부 ISO 8601 UTC string을 입력으로 받고
ISO string, boolean, 숫자 중 하나를 돌려줍니다. 네이티브 `Date` 객체는 이
경계를 넘지 않습니다.

```ts
import type { DateAdapter } from '@kalyx/react/headless';

interface DateAdapter {
  // Parsing & formatting
  parse(value: string, format?: string): string;
  format(iso: string, formatStr: string, timezone?: string): string;

  // Arithmetic
  addDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  // Comparison
  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  isSameDay(a: string, b: string, timezone?: string): boolean;
  isSameMonth(a: string, b: string): boolean;

  // Boundaries
  startOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string): string;
  endOfMonth(iso: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  // Clock
  now(): string;       // Current instant
  today(timezone?: string): string;  // Civil midnight in the given zone

  // Validation
  isValid(value: string): boolean;

  // Component access
  getYear(iso: string): number;
  getMonth(iso: string): number;  // 0-indexed (matches Date.getUTCMonth)
  getDate(iso: string): number;
  getDay(iso: string): number;    // 0=Sunday
}
```

### dayjs 참조 구현

스케치입니다. DST 경계를 건드리지 않는 대부분의 용례에서 동작합니다.
`dayjs`, `dayjs/plugin/utc`, `dayjs/plugin/timezone`,
`dayjs/plugin/customParseFormat`을 설치하세요.

```ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { DateAdapter } from '@kalyx/react/headless';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// date-fns tokens (yyyy, MM, dd, HH, mm) → dayjs tokens (YYYY, MM, DD, HH, mm).
// Kalyx passes date-fns-style format strings everywhere, so we translate at the edge.
function toDayjsFormat(fmt: string): string {
  return fmt
    .replace(/yyyy/g, 'YYYY')
    .replace(/yy/g, 'YY')
    .replace(/dd/g, 'DD')
    .replace(/d/g, 'D');
}

export const DayjsAdapter: DateAdapter = {
  parse: (value, format) =>
    format ? dayjs.utc(value, toDayjsFormat(format)).toISOString() : dayjs.utc(value).toISOString(),

  format: (iso, fmt, tz) => {
    const d = tz ? dayjs.utc(iso).tz(tz) : dayjs.utc(iso);
    return d.format(toDayjsFormat(fmt));
  },

  addDays: (iso, n) => dayjs.utc(iso).add(n, 'day').toISOString(),
  addMonths: (iso, n) => dayjs.utc(iso).add(n, 'month').toISOString(),
  addYears: (iso, n) => dayjs.utc(iso).add(n, 'year').toISOString(),

  isBefore: (a, b) => dayjs.utc(a).isBefore(dayjs.utc(b)),
  isAfter: (a, b) => dayjs.utc(a).isAfter(dayjs.utc(b)),
  isSameDay: (a, b, tz) => {
    const da = tz ? dayjs.utc(a).tz(tz) : dayjs.utc(a);
    const db = tz ? dayjs.utc(b).tz(tz) : dayjs.utc(b);
    return da.isSame(db, 'day');
  },
  isSameMonth: (a, b) => dayjs.utc(a).isSame(dayjs.utc(b), 'month'),

  startOfDay: (iso, tz) => {
    const d = tz ? dayjs.utc(iso).tz(tz) : dayjs.utc(iso);
    return d.startOf('day').toISOString();
  },
  startOfMonth: (iso) => dayjs.utc(iso).startOf('month').toISOString(),
  endOfMonth: (iso) => dayjs.utc(iso).endOf('month').toISOString(),
  startOfWeek: (iso, weekStartsOn = 0) => {
    // dayjs.startOf('week') is locale-dependent. Compute manually to match Kalyx's
    // weekStartsOn contract (0 = Sunday, 1 = Monday).
    const d = dayjs.utc(iso);
    const dow = d.day();
    const diff = (dow - weekStartsOn + 7) % 7;
    return d.subtract(diff, 'day').startOf('day').toISOString();
  },
  endOfWeek: (iso, weekStartsOn = 0) => {
    const d = dayjs.utc(iso);
    const dow = d.day();
    const diff = (weekStartsOn + 6 - dow + 7) % 7;
    return d.add(diff, 'day').endOf('day').toISOString();
  },

  now: () => dayjs.utc().toISOString(),
  today: (tz) => {
    const d = tz ? dayjs().tz(tz) : dayjs.utc();
    return d.startOf('day').toISOString();
  },

  isValid: (v) => dayjs(v).isValid(),

  getYear: (iso) => dayjs.utc(iso).year(),
  getMonth: (iso) => dayjs.utc(iso).month(),  // already 0-indexed
  getDate: (iso) => dayjs.utc(iso).date(),
  getDay: (iso) => dayjs.utc(iso).day(),
};
```

그다음:

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from './my-dayjs-adapter';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Calendar />
</DatePicker>
```

### 꼭 맞춰야 할 것

- **언제나 ISO 8601 UTC string을 돌려주세요**(`Z`로 끝나는 값). 로컬 시각
  문자열은 다음 연산에서 조용히 어긋납니다.
- **`getMonth`는 0-indexed 입니다.** `Date.getUTCMonth()`에 맞추세요. luxon의
  `.month`는 1-indexed 이므로 1을 빼야 합니다.
- **`startOfDay` / `today`는 timezone을 받습니다**. 값이 주어지면 UTC 자정이
  아니라 *그 존의* civil 자정 instant를 돌려주세요. 값이 없으면 같은 캘린더
  날짜의 UTC 자정을 돌려줍니다. TimePicker와 Calendar 모두 DST 경계에서 이
  구분에 의존합니다.
- **`format` 토큰은 date-fns를 따릅니다**(`yyyy`, `MM`, `dd`, `HH`, `mm`).
  라이브러리가 다른 토큰을 쓴다면 위 예시처럼 어댑터 경계에서 변환하세요.

### 어댑터 테스트하기

가장 빠른 점검은 그 어댑터로 `<DatePicker.Calendar />`를 렌더한 뒤 화살표
키로 한 달을 훑어 보는 것입니다. 날짜가 라이브러리가 보고하는 값과 맞으면
계약이 지켜지고 있는 것입니다.

확실히 하려면 공유 conformance 스위트를 돌리세요. `@kalyx/core/test-helpers`가
`runAdapterConformanceTests`를 내보내는데, 미리 만들어진 어댑터들이 검증받는
바로 그 스위트입니다. 윤년, DST 전환, 월말 롤오버, 요일 및 월 인덱스 규약을
다룹니다.

```ts
import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { MyAdapter } from './my-adapter';

runAdapterConformanceTests(MyAdapter, { describe, it, expect });
```

모든 케이스가 통과하면, 그 어댑터는 `@kalyx/adapter-date-fns`,
`@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon`과 같은 계약을 만족합니다.

---

## 다음 단계

- [ISO string →](../concepts/iso-string.md)
- [Timezone 처리 →](../concepts/timezone.md)
- [Core API 레퍼런스 →](../api/core.md)
