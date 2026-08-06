---
id: core
title: '@kalyx/core'
sidebar_position: 1
---

# @kalyx/core

플랫폼 독립 날짜 로직입니다. 보통은 `@kalyx/react`를 통해 간접적으로 사용하게 됩니다.

```bash
pnpm add @kalyx/core
```

`DateFnsAdapter`를 쓰는 예제에는 어댑터 패키지와 그 기반 날짜 라이브러리도 필요합니다.

```bash
pnpm add @kalyx/adapter-date-fns date-fns
```

## 타입

```ts
type ISODateString = string;

type DisabledRule =
  | { date: ISODateString }
  | { before: ISODateString }
  | { after: ISODateString }
  | { dayOfWeek: number[] }
  | { filter: (iso: ISODateString) => boolean };

type DateRange = {
  start: ISODateString | null;
  end: ISODateString | null;
};

type CalendarDay = {
  isoString: ISODateString;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
};

type CalendarWeek = CalendarDay[];
type CalendarGrid = CalendarWeek[];

type WeekStartsOn = 0 | 1;

type CalendarOptions = {
  weekStartsOn?: WeekStartsOn;
  today?: ISODateString;
  selected?: ISODateString | null;
  focusedDate?: ISODateString;
  disabled?: DisabledRule[];
  range?: DateRange | null;
  rangeHover?: ISODateString | null;
  timezone?: string;
  fixedWeeks?: boolean;
};

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};
```

## `DateAdapter`

전체 인터페이스는 [어댑터 개념 문서 →](../concepts/adapters.md)를 참고하세요.

## `DateFnsAdapter`

기본 어댑터입니다 — UTC 안전하며 date-fns v4 위에 구현돼 있습니다.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
```

## 캘린더 유틸리티

### `getCalendarDays(viewMonth, adapter, options)`

한 달치 4~6주 그리드를 만듭니다. 레이아웃이 정확히 6주를 요구하면 `fixedWeeks: true`를 설정하세요.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { getCalendarDays } from '@kalyx/core';

const grid = getCalendarDays(
  '2026-04-01T00:00:00.000Z',
  DateFnsAdapter,
  { weekStartsOn: 0, today: '2026-04-16T00:00:00.000Z', fixedWeeks: true },
);
```

`CalendarGrid`(7개짜리 `CalendarDay` 배열 4~6개)를 반환합니다. 앞뒤에 붙는 날짜들은 이웃한 달에 속합니다(`isCurrentMonth: false`). `fixedWeeks: true`이면 결과는 항상 6×7입니다.

### `isDateDisabled(iso, rules, adapter, timezone?)`

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { isDateDisabled } from '@kalyx/core';

isDateDisabled(
  '2026-04-18T00:00:00.000Z',
  [{ dayOfWeek: [0, 6] }],
  DateFnsAdapter,
); // → true (Saturday)

// With `timezone`, `{ date }` / `{ dayOfWeek }` rules match by the civil day in
// that zone. Pass the civil-midnight-in-timezone instant the pickers emit — the
// same value `onChange` gives you — not a raw `…T00:00:00Z` grid coordinate:
isDateDisabled(
  '2026-01-15T05:00:00.000Z',            // civil Jan 15 in America/New_York
  [{ date: '2026-01-15T05:00:00.000Z' }],
  DateFnsAdapter,
  'America/New_York',
); // → true
```

`iso`는 손으로 만든 UTC-자정 그리드 좌표가 아니라 **검사 대상이 되는 시점(instant)** 입니다. 음수 UTC offset 아래에서는 `2026-01-15T00:00:00.000Z`가 현지 기준으로는 여전히 14일입니다. `{ before }` / `{ after }`는 instant 비교이며 `timezone`을 무시합니다. 캘린더의 셀별 disabled 상태만 필요하다면 이 함수 대신 `getCalendarDays(...)`가 미리 계산해 둔 `isDisabled` 플래그를 읽으세요 — 셀마다 알아서 정규화해 줍니다.

### `getISOWeekNumber(iso)`

해당 instant의 UTC 날짜에 대한 ISO 8601 주차(1~53)입니다. 주는 월요일에 시작하고 1주차는 그 해의 첫 목요일이 속한 주이므로, 1월 초와 12월 말의 날짜는 이웃한 해의 주차 체계에 속할 수 있습니다. `WeekPicker`가 주 라벨에 이 값을 씁니다.

```ts
import { getISOWeekNumber } from '@kalyx/core';

getISOWeekNumber('2026-01-01T00:00:00.000Z'); // → 1   (a Thursday, so ISO week 1)
getISOWeekNumber('2026-04-15T00:00:00.000Z'); // → 16
getISOWeekNumber('2026-12-31T00:00:00.000Z'); // → 53
```

이 함수는 **UTC** 날짜를 읽습니다. `displayTimezone` 아래에서는 civil 날짜가 다를 수 있으므로, 사용자가 보는 주차가 필요하다면 `calendarDayFromInstant(iso, timeZone)`으로 먼저 변환하세요.

### `minDate(a, b, adapter)` / `maxDate(a, b, adapter)`

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { minDate } from '@kalyx/core';

minDate(
  '2026-04-15T00:00:00.000Z',
  '2026-04-10T00:00:00.000Z',
  DateFnsAdapter,
);
// → "2026-04-10T00:00:00.000Z"
```

## 날짜 문자열 유틸리티

### `normalizeISO(value)`

관대한 정규화 함수입니다 — `2026-04-15` 같은 날짜만 있는 값을 완전한 UTC-자정 ISO string으로 확장합니다. 완전한 ISO datetime과 인식하지 못한 문자열은 그대로 반환하며, 빈 문자열은 빈 문자열로 남습니다.

### `parseInputValue(input, adapter)`

`yyyy-MM-dd`, `yyyy/MM/dd`, 또는 여덟 자리 `yyyyMMdd` 형태의 사용자 입력을 파싱합니다.

```ts
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';
import { parseInputValue } from '@kalyx/core';

parseInputValue('2026/04/15', DateFnsAdapter);
// → "2026-04-15T00:00:00.000Z"
```

## 시간 유틸리티

### `setTime(iso, partial)` / `getTime(iso)`

```ts
import { setTime, getTime } from '@kalyx/core';

setTime('2026-04-15T00:00:00.000Z', { hours: 9, minutes: 30 });
// → "2026-04-15T09:30:00.000Z"

getTime('2026-04-15T09:30:00.000Z');
// → { hours: 9, minutes: 30, seconds: 0 }
```

### `parseTimeString(input)` / `formatTimeString(time, withSeconds?)`

```ts
import { formatTimeString, parseTimeString } from '@kalyx/core';

parseTimeString('09:30');   // → { hours: 9, minutes: 30, seconds: 0 }
parseTimeString('09:30:45'); // → { hours: 9, minutes: 30, seconds: 45 }
formatTimeString({ hours: 9, minutes: 30, seconds: 0 });       // → "09:30"
formatTimeString({ hours: 9, minutes: 30, seconds: 0 }, true); // → "09:30:00"
```

### `formatTimeFromISO(iso, format)`

ISO datetime을 UTC 기준으로 `HH:mm`, `HH:mm:ss`, `h:mm a`, `h:mm:ss a` 중 하나로 포매팅합니다.

```ts
import { formatTimeFromISO } from '@kalyx/core';

formatTimeFromISO('2026-04-15T13:30:00.000Z', 'h:mm a');
// → "1:30 PM"
```

### 12시간제 헬퍼

```ts
import { to12Hour, to24Hour } from '@kalyx/core';

to12Hour(13);                    // → { hours12: 1, period: 'PM' }
to24Hour(1, 'PM');               // → 13
```

### 옵션 생성기

```ts
import { generateHours, generateMinutes } from '@kalyx/core';

generateHours('24h'); // → [0, 1, 2, …, 23]
generateHours('12h'); // → [1, 2, …, 12]
generateMinutes(15);  // → [0, 15, 30, 45]
```

### `isSameTime(a, b)`

```ts
import { isSameTime } from '@kalyx/core';

isSameTime({ hours: 9, minutes: 0, seconds: 0 }, { hours: 9, minutes: 0, seconds: 0 });
// → true
```

## Locale 유틸리티

```ts
import { formatFullDate, formatMonthYear, getMonthName, getWeekdayNames } from '@kalyx/core';

getMonthName(3, 'en-US');            // → "April"
formatMonthYear(2026, 3, 'en-US');   // → "April 2026"
getWeekdayNames('en-US', 0);
// → [{ short: 'Sun', full: 'Sunday' }, …]
formatFullDate('2026-04-15T00:00:00.000Z', 'en-US');
// → "Wednesday, April 15, 2026"
```

### `getWeekStartForLocale(locale?)`

해당 locale이 관습적으로 쓰는 한 주의 첫 요일을 `WeekStartsOn` — `0`(일요일) 또는 `1`(월요일) — 로 반환합니다. 런타임의 locale 데이터가 구분하는 시작 요일이 그 둘입니다. `weekStartsOn`을 넘기지 않으면 `DatePicker`와 `RangePicker`가 이 함수를 호출합니다. 명시한 prop이 항상 우선합니다.

```ts
import { getWeekStartForLocale } from '@kalyx/core';

getWeekStartForLocale('en-US'); // → 0  (Sunday)
getWeekStartForLocale('de-DE'); // → 1  (Monday)
```

### `getDayPeriodName(period, locale?)`

지역화된 AM/PM 이름입니다. `TimePicker.AmPmToggle`이 사용합니다.

```ts
import { getDayPeriodName } from '@kalyx/core';

getDayPeriodName('AM', 'en-US'); // → "AM"
getDayPeriodName('PM', 'ko-KR'); // → "오후"
```

## Timezone 유틸리티

`displayTimezone`이 설정되면 모든 피커가 내부적으로 사용합니다. 같은 계산을 직접 할 수 있도록 공개돼 있습니다.

### `formatInTimezone(iso, formatStr, timeZone)`

UTC instant를 요청한 존 기준으로 포매팅합니다. DST 전환을 처리합니다.

```ts
import { formatInTimezone } from '@kalyx/core';

formatInTimezone('2026-03-08T07:30:00.000Z', 'yyyy-MM-dd HH:mm', 'America/New_York');
// → '2026-03-08 03:30'   (post spring-forward EDT)
```

### `startOfDayInTimezone(iso, timeZone)`

주어진 UTC instant가 속한 날의 civil 자정을 UTC ISO string으로 표현한 값입니다.

```ts
import { startOfDayInTimezone } from '@kalyx/core';

startOfDayInTimezone('2026-01-15T12:00:00.000Z', 'Asia/Seoul');
// → '2026-01-14T15:00:00.000Z'
```

### `isSameDayInTimezone(a, b, timeZone)`

해당 존에서의 civil-day 동치 비교입니다. `iso.slice(0, 10)`을 비교하는 것보다 timezone 안전한 대안입니다.

### `todayInTimezone(timeZone)`

해당 존의 civil 자정으로 표현한 "오늘"입니다.

### `getTimezoneOffsetMinutes(iso, timeZone)`

주어진 instant 시점의 UTC offset(UTC 기준 동쪽으로 몇 분)입니다. DST 전환 전후로 값이 달라집니다.

### `civilMidnightFromUtcDay(gridUtcIso, timeZone)`

Calendar가 쓰는 다리 역할입니다. UTC-자정 그리드 셀 ISO를 해당 존에서 같은 캘린더 날짜의 civil 자정으로 매핑합니다. 직접 쓸 일은 드물고, 커스텀 캘린더 렌더러를 위해 공개돼 있습니다.

```ts
import { civilMidnightFromUtcDay } from '@kalyx/core';

civilMidnightFromUtcDay('2026-01-15T00:00:00.000Z', 'Asia/Seoul');
// → '2026-01-14T15:00:00.000Z'   (Seoul Jan 15, 00:00)
```

### `calendarDayFromInstant(iso, timeZone)`

`civilMidnightFromUtcDay`의 역함수입니다. 임의의 instant를 받아, 그 instant가 해당 존에서 속하는 civil 날짜의 UTC-자정 좌표를 반환합니다. "이 값이 어느 캘린더 셀에 속하는가?"에 답할 때 쓰세요.

```ts
import { calendarDayFromInstant } from '@kalyx/core';

calendarDayFromInstant('2025-12-31T15:00:00.000Z', 'Asia/Seoul');
// → '2026-01-01T00:00:00.000Z'   (already Jan 1 in Seoul)
calendarDayFromInstant('2026-01-15T05:00:00.000Z', 'America/New_York');
// → '2026-01-15T00:00:00.000Z'
```

두 함수는 모든 IANA 존에서 왕복합니다: `calendarDayFromInstant(civilMidnightFromUtcDay(c, tz), tz) === c`. 이 property는 core 테스트 스위트에서 전 존에 대해 강제됩니다.

### `getTimeInTimezone(iso, timeZone)` / `setTimeInTimezone(iso, partial, timeZone)`

해당 존에서 관측되는 시각을 읽고 씁니다. `setTimeInTimezone`은 civil 날짜를 보존하고 시각 부분만 교체하며, DST offset을 흡수하기 위해 한 번 반복 계산합니다.

```ts
import { setTimeInTimezone } from '@kalyx/core';

setTimeInTimezone('2026-01-15T00:00:00.000Z', { hours: 10 }, 'Asia/Seoul');
// → '2026-01-15T01:00:00.000Z'   (Seoul 10:00 = UTC 01:00)
```

사용 패턴은 [Timezone 개념 문서](../concepts/timezone.md)를 참고하세요.

## 접근성 라벨

기본 ARIA 라벨 세트입니다. 어느 피커 Root에서든 `labels` prop으로 덮어쓸 수 있습니다.

```ts
import {
  DEFAULT_DATEPICKER_LABELS,
  DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS,
  DEFAULT_DATETIMEPICKER_LABELS,
} from '@kalyx/core';

import type {
  DatePickerLabels,
  RangePickerLabels,
  TimePickerLabels,
  DateTimePickerLabels,
} from '@kalyx/core';
```

각 라벨 세트는 `triggerOpen`, `prevMonth`, `nextMonth`, `hourOption(h)` 같은 키를 제공합니다. 필요한 것만 덮어쓰려면 `Partial<*Labels>`를 넘기세요.

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker labels={{ triggerOpen: 'Open calendar', triggerClose: 'Close calendar' }}>
  <span />
</DatePicker>;
```

## 함께 보기

- [개념 → ISO string](../concepts/iso-string.md)
- [개념 → 어댑터](../concepts/adapters.md)
- [개념 → Timezone](../concepts/timezone.md)
