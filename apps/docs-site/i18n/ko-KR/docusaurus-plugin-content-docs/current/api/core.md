---
id: core
title: '@kalyx/core'
sidebar_position: 1
---

# @kalyx/core

플랫폼 독립 날짜 로직. 보통 `@kalyx/react`를 통해 간접 소비됩니다.

```bash
pnpm add @kalyx/core
```

## 타입

```ts
type ISODateString = string;

type DisabledRule =
  | { date: ISODateString }
  | { before: ISODateString }
  | { after: ISODateString }
  | { dayOfWeek: number[] };

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
  range?: DateRange;
  rangeHover?: ISODateString | null;
};

type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};
```

## `DateAdapter`

전체 인터페이스는 [어댑터 개념 →](../concepts/adapters.md)에.

## `DateFnsAdapter`

기본 어댑터 — date-fns v4 기반, UTC 안전.

```ts
import { DateFnsAdapter } from '@kalyx/core';
```

## 캘린더 유틸

### `getCalendarDays(viewMonth, adapter, options)`

한 달의 6주 그리드를 생성합니다.

```ts
import { getCalendarDays, DateFnsAdapter } from '@kalyx/core';

const grid = getCalendarDays(
  '2026-04-01T00:00:00.000Z',
  DateFnsAdapter,
  { weekStartsOn: 0, today: '2026-04-16T00:00:00.000Z' },
);
```

`CalendarGrid` (6×7 `CalendarDay`)을 반환합니다. 앞뒤 패딩 날짜는 이웃 달이며 `isCurrentMonth: false`.

### `isDateDisabled(iso, rules, adapter)`

```ts
import { isDateDisabled, DateFnsAdapter } from '@kalyx/core';

isDateDisabled(
  '2026-04-18T00:00:00.000Z',
  [{ dayOfWeek: [0, 6] }],
  DateFnsAdapter,
); // → true (토요일)
```

### `minDate(dates)` / `maxDate(dates)`

```ts
import { minDate, maxDate } from '@kalyx/core';

minDate(['2026-04-15T00:00:00.000Z', '2026-04-10T00:00:00.000Z']);
// → "2026-04-10T00:00:00.000Z"
```

## 날짜 문자열 유틸

### `normalizeISO(value)`

관용적 파서 — `2026-04-15` 같은 부분 입력을 받아 UTC 자정 ISO 문자열로 반환. 유효하지 않으면 `null`.

### `parseInputValue(input, format, adapter)`

명시적 포맷으로 사용자 입력 파싱.

```ts
parseInputValue('15/04/2026', 'dd/MM/yyyy', DateFnsAdapter);
// → "2026-04-15T00:00:00.000Z"
```

## 시간 유틸

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
parseTimeString('09:30');    // → { hours: 9, minutes: 30, seconds: 0 }
parseTimeString('09:30:45'); // → { hours: 9, minutes: 30, seconds: 45 }
formatTimeString({ hours: 9, minutes: 30, seconds: 0 });       // → "09:30"
formatTimeString({ hours: 9, minutes: 30, seconds: 0 }, true); // → "09:30:00"
```

### `formatTimeFromISO(iso, withSeconds?)`

`formatTimeString(getTime(iso), withSeconds)`와 동등한 편의 래퍼.

### 12시간제 헬퍼

```ts
import { to12Hour, to24Hour } from '@kalyx/core';

to12Hour(13);                    // → { hours12: 1, period: 'PM' }
to24Hour(1, 'PM');               // → 13
```

### 옵션 생성기

```ts
generateHours('24h'); // → [0, 1, 2, …, 23]
generateHours('12h'); // → [12, 1, 2, …, 11]
generateMinutes(15);  // → [0, 15, 30, 45]
```

### `isSameTime(a, b)`

```ts
isSameTime({ hours: 9, minutes: 0, seconds: 0 }, { hours: 9, minutes: 0, seconds: 0 });
// → true
```

## 로케일 유틸

```ts
getMonthName(3, 'ko-KR');               // → "4월"
formatMonthYear(2026, 3, 'ko-KR');      // → "2026년 4월"
getWeekdayNames('ko-KR', 0);
// → [{ short: '일', full: '일요일' }, …]
formatFullDate('2026-04-15T00:00:00.000Z', 'ko-KR');
// → "2026년 4월 15일"
```

## 함께 보기

- [개념 → ISO 문자열](../concepts/iso-string.md)
- [개념 → 어댑터](../concepts/adapters.md)
