---
id: react
title: '@kalyx/react'
sidebar_position: 2
---

# @kalyx/react

공개 React API입니다. 아래 이름들은 전부 `@kalyx/react`에서 바로 import 할 수 있습니다.

```ts
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
} from '@kalyx/react';
```

## 컴포넌트

| 이름 | 문서 |
| --- | --- |
| `DatePicker` | [컴포넌트 문서](../components/datepicker.md) |
| `RangePicker` | [컴포넌트 문서](../components/rangepicker.md) |
| `TimePicker` | [컴포넌트 문서](../components/timepicker.md) |
| `DateTimePicker` | [컴포넌트 문서](../components/datetimepicker.md) |
| `MonthPicker` | [컴포넌트 문서](../components/monthpicker.md) |
| `YearPicker` | [컴포넌트 문서](../components/yearpicker.md) |
| `WeekPicker` | [컴포넌트 문서](../components/weekpicker.md) |

## 훅

| 이름 | 문서 |
| --- | --- |
| `useDatePicker` | [훅 문서](../hooks/use-date-picker.md) |
| `useRangePicker` | [훅 문서](../hooks/use-range-picker.md) |
| `useTimePicker` | [훅 문서](../hooks/use-time-picker.md) |

훅 4종은 `@kalyx/react/headless` 엔트리에만 실립니다. 기본 엔트리의 바이트 예산 밖에 두기 위해서입니다.

| 이름 | 문서 |
| --- | --- |
| `useMonthPicker` | [훅 문서](../hooks/use-month-picker.md) |
| `useYearPicker` | [훅 문서](../hooks/use-year-picker.md) |
| `useWeekPicker` | [훅 문서](../hooks/use-week-picker.md) |
| `useDateTimePicker` | [훅 문서](../hooks/use-date-time-picker.md) |

```ts
import { useMonthPicker } from '@kalyx/react/headless';
```

## 어댑터

`DateFnsAdapter`는 편의를 위해 `@kalyx/react`에서 다시 export 합니다(메인 엔트리가 이미 기본으로 주입하는 어댑터입니다).

```ts
import { DateFnsAdapter } from '@kalyx/react';
```

미리 만들어 둔 어댑터 두 종이 별도 패키지로 배포돼 있으며, `@kalyx/react/headless` 엔트리와 함께 씁니다.

```ts
import { DayjsAdapter } from '@kalyx/adapter-dayjs';
import { LuxonAdapter } from '@kalyx/adapter-luxon';
```

세 어댑터 모두 동일한 `DateAdapter` 계약을 구현하고, UTC로 동작하며, `@kalyx/core/test-helpers`로 검증됩니다. [어댑터 가이드](../guides/adapters.md)를 참고하세요.

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
  DatePickerPresetsProps,
  DatePickerPresetsClassNames,
  DatePickerPresetProps,
  DatePickerPresetKey,
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

서브 컴포넌트 타입은 DatePicker와 TimePicker에서 다시 export 됩니다.

### MonthPicker 타입

```ts
import type {
  MonthPickerRootProps,
  MonthPickerInputProps,
  MonthPickerTriggerProps,
  MonthPickerPopoverProps,
  MonthPickerGridProps,
  MonthPickerGridClassNames,
} from '@kalyx/react';
```

### YearPicker 타입

```ts
import type {
  YearPickerRootProps,
  YearPickerInputProps,
  YearPickerTriggerProps,
  YearPickerPopoverProps,
  YearPickerGridProps,
  YearPickerGridClassNames,
} from '@kalyx/react';
```

### WeekPicker 타입

```ts
import type {
  WeekPickerRootProps,
  WeekPickerInputProps,
  WeekPickerPopoverProps,
  WeekPickerCalendarProps,
  WeekPickerCalendarClassNames,
} from '@kalyx/react';
```

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

- `@kalyx/core` (workspace)
- `@kalyx/adapter-date-fns` (workspace — 기본 엔트리를 위해 `date-fns`를 함께 들고 옵니다)
- `@floating-ui/react ^0.27.0`

Peer 의존성: `react ^19.0.0`, `react-dom ^19.0.0`.

선택적 어댑터 패키지(`/headless` 엔트리를 기본이 아닌 백엔드와 함께 쓸 때만 설치): `@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon`.

## 번들 크기

기본 엔트리 산출물은 gzip 기준 **약 18.5 KB**입니다(컴포넌트 7종, CI 한계 20 KB). Headless ESM/CJS 산출물에는 별도의 22 KB CI 게이트가 적용됩니다 — 이 엔트리는 같은 컴포넌트에 더해 훅 7종 전부와 `DateTimePicker.Presets`까지 싣기 때문에, 기본 엔트리의 수치를 공유하지 않고 따로 예산을 잡습니다.

이 수치는 의존성을 external 로 둔 **산출물** 기준입니다. 애플리케이션이 실제로 배포하는 크기는 더 큽니다 — 번들러가 `@kalyx/core`·`@kalyx/adapter-date-fns`·`@floating-ui/react` 까지 해석하기 때문이며, 이 저장소의 소비자 하네스 실측은 **약 24 KB** gzip 입니다. `sideEffects: false`를 선언하지만 그 하네스는 루트 엔트리에서 picker별 제거를 입증하지 못합니다 — 피커 하나만 import 해도 7종 전부와 비용이 거의 같습니다. 실제 import 조합은 프로덕션 번들에서 직접 측정하시고, 전체 설명은 [트러블슈팅 → 번들 크기](../troubleshooting.md#번들-크기가-예상보다-큽니다)를 참고하세요.

## 함께 보기

- [@kalyx/core API →](./core.md)
- [마이그레이션 가이드 →](../migration.md)
