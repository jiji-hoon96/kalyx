---
id: react
title: '@kalyx/react'
sidebar_position: 2
---

# @kalyx/react

공개 React API. 아래 이름들은 모두 `@kalyx/react`에서 직접 import 가능합니다.

```ts
import { DatePicker, RangePicker, TimePicker, DateTimePicker } from '@kalyx/react';
```

## 컴포넌트

| 이름 | 참조 |
| --- | --- |
| `DatePicker` | [컴포넌트 문서](../components/datepicker.md) |
| `RangePicker` | [컴포넌트 문서](../components/rangepicker.md) |
| `TimePicker` | [컴포넌트 문서](../components/timepicker.md) |
| `DateTimePicker` | [컴포넌트 문서](../components/datetimepicker.md) |

## 훅

| 이름 | 참조 |
| --- | --- |
| `useDatePicker` | [훅 문서](../hooks/use-date-picker.md) |
| `useRangePicker` | [훅 문서](../hooks/use-range-picker.md) |
| `useTimePicker` | [훅 문서](../hooks/use-time-picker.md) |

## 어댑터

`DateFnsAdapter` — `@kalyx/core`에서 재export.

```ts
import { DateFnsAdapter } from '@kalyx/react';
```

## 타입

### DatePicker 타입

```ts
import type {
  DatePickerRootProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerPopoverProps,
  DatePickerCalendarProps,
  DatePickerCalendarClassNames,
  DatePickerMonthGridProps,
  DatePickerMonthGridClassNames,
  DatePickerYearGridProps,
  DatePickerYearGridClassNames,
} from '@kalyx/react';
```

### RangePicker 타입

```ts
import type {
  RangePickerRootProps,
  RangePickerInputProps,
  RangeInputPart,            // 'start' | 'end'
  RangePickerPopoverProps,
  RangePickerCalendarProps,
  RangePickerCalendarClassNames,
  RangePickerPresetsProps,
  RangePickerPresetsClassNames,
  RangePickerPresetProps,
  PresetKey,
} from '@kalyx/react';
```

### TimePicker 타입

```ts
import type {
  TimePickerRootProps,
  TimePickerInputProps,
  TimePickerHourListProps,
  TimePickerHourListClassNames,
  TimePickerMinuteListProps,
  TimePickerMinuteListClassNames,
  TimePickerAmPmToggleProps,
  TimePickerAmPmToggleClassNames,
} from '@kalyx/react';
```

### DateTimePicker 타입

```ts
import type {
  DateTimePickerRootProps,
  DateTimePickerInputProps,
} from '@kalyx/react';
```

서브 컴포넌트 타입은 DatePicker와 TimePicker에서 재export됩니다.

### 훅 타입

```ts
import type {
  UseDatePickerOptions,
  UseDatePickerReturn,
  UseRangePickerOptions,
  UseRangePickerReturn,
  UseTimePickerOptions,
  UseTimePickerReturn,
} from '@kalyx/react';
```

### `@kalyx/core` 재export

```ts
import type {
  ISODateString,
  DateRange,
  DisabledRule,
  DateAdapter,
  CalendarDay,
  TimeValue,
} from '@kalyx/react';
```

## 런타임 의존성

- `@kalyx/core` (워크스페이스)
- `@floating-ui/react ^0.26.0`
- `date-fns ^4.0.0`
- `date-fns-tz ^3.0.0`

Peer: `react ^19.0.0`, `react-dom ^19.0.0`.

## 번들 크기

전체 공개 표면 gzip: **약 9.2 KB**. 임포트 단위 트리셰이킹 — 예를 들어 `TimePicker`만 사용하면 DatePicker 코드 ~3KB가 제거됩니다. CI의 `scripts/check-bundle-size.js`가 검증합니다.

## 함께 보기

- [@kalyx/core API →](./core.md)
- [마이그레이션 가이드 →](../migration.md)
