---
id: timepicker
title: TimePicker
sidebar_position: 3
---

# TimePicker

시 + 분 (+ 선택적으로 초) 선택. 12시간제 또는 24시간제.

```tsx
import { TimePicker } from '@kalyx/react';
```

## 기본 사용

```tsx
import { useState } from 'react';
import { TimePicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [time, setTime] = useState<ISODateString | null>(null);
  return (
    <TimePicker value={time} onChange={setTime} format="24h" step={15}>
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
    </TimePicker>
  );
}
```

값은 여전히 ISO 8601 UTC 문자열 — 날짜 부분은 placeholder 역할. 시/분만 필요하면 `@kalyx/core`의 `getTime(iso)`를 쓰세요.

## `<TimePicker>` (Root)

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | 제어형 시간. |
| `defaultValue` | `ISODateString` | — | 비제어 초기값. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 시/분/AM·PM 변경 시 호출. |
| `format` | `'12h' \| '24h'` | `'24h'` | 시간 포맷. |
| `step` | `number` | `1` | 분 간격 (예: `5`, `15`, `30`). |
| `withSeconds` | `boolean` | `false` | 초 표시 (입력 + 리스트). |
| `displayTimezone` | `string` | — | IANA 타임존. 설정 시 시/분 컨트롤이 이 타임존 기준으로 시간을 읽고 쓴다 (DST 인식). [Timezone](../concepts/timezone.md) 참고. |
| `disabled` | `boolean` | `false` | 전체 비활성. |
| `readOnly` | `boolean` | `false` | 변경 방지. |
| `filterTime` | `(hours: number, minutes: number) => boolean` | — | 슬롯별 비활성 predicate. `true`를 반환하면 해당 슬롯을 **선택 불가**로 만든다 (MUI X의 `shouldDisableTime`과 같은 극성 — react-datepicker의 `filterTime`(슬롯을 *유지*하려면 `true`)과는 **반대**). 시(hour)는 해당 시의 모든 `step` 분이 `true`일 때만 비활성. `format`과 무관하게 항상 24시간 값을 받는다. |
| `labels` | `Partial<TimePickerLabels>` | — | ARIA 라벨 재정의. 키: `timeInput`, `hourList`, `minuteList`, `amPmToggle`, `hourOption(h)`, `minuteOption(m)`. |
| `children` | `ReactNode` | — | 서브 컴포넌트. |

## `<TimePicker.Input>`

`HH:MM` (또는 `withSeconds` 시 `HH:MM:SS`)을 표시하는 텍스트 입력. Enter/blur에서 파싱.

- `value`, `onChange`, `type` 제외한 `<input>` 속성 확장.
- `aria-label` 기본값 `"시간 입력"`.

## `<TimePicker.HourList>`

사용 가능한 시 목록 (`role="listbox"`).

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `TimePickerHourListClassNames` | 스타일. |

```ts
type TimePickerHourListClassNames = {
  root?: string;         // <ul>
  option?: string;       // <li role="option">
  optionSelected?: string;
};
```

시 집합:

- `format="24h"` → `0–23`
- `format="12h"` → `1–12` (`<AmPmToggle>`로 오전/오후 관리)

## `<TimePicker.MinuteList>`

`step`으로 필터된 분 목록 (`role="listbox"`).

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `TimePickerMinuteListClassNames` | 스타일 (HourList와 동일). |

## `<TimePicker.AmPmToggle>`

AM/PM 두 라디오 버튼 (`role="radiogroup"`) — `format="12h"`에서만 렌더.

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `classNames` | `TimePickerAmPmToggleClassNames` | 스타일. |

```ts
type TimePickerAmPmToggleClassNames = {
  root?: string;
  button?: string;
  buttonSelected?: string;
};
```

## 패턴

### 12시간제

```tsx
<TimePicker value={time} onChange={setTime} format="12h" step={15}>
  <TimePicker.Input />
  <div className="flex gap-2">
    <TimePicker.HourList />
    <TimePicker.MinuteList />
    <TimePicker.AmPmToggle />
  </div>
</TimePicker>
```

### 초 포함

```tsx
<TimePicker value={time} onChange={setTime} withSeconds>
  <TimePicker.Input />
</TimePicker>
```

### `TimeValue` 추출해 로직에 쓰기

```tsx
import { TimePicker } from '@kalyx/react';
import { getTime } from '@kalyx/core';

function Example() {
  const [time, setTime] = useState<ISODateString | null>(null);

  useEffect(() => {
    if (!time) return;
    const { hours, minutes } = getTime(time); // { hours: 9, minutes: 30, seconds: 0 }
    analytics.track('time_set', { hours, minutes });
  }, [time]);

  return (
    <TimePicker value={time} onChange={setTime}>
      <TimePicker.Input />
    </TimePicker>
  );
}
```

## 관련

- [DateTimePicker →](./datetimepicker.md)
- [useTimePicker →](../hooks/use-time-picker.md)
