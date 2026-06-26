---
id: use-date-time-picker
title: useDateTimePicker
sidebar_position: 7
---

# useDateTimePicker

`<DateTimePicker>` 뒤의 헤드리스 훅. 하나의 ISO 문자열이 캘린더와 시각을 모두 구동합니다 — `selectDate` 는 시각을 보존하고 `setTime` 은 날짜를 보존합니다.

:::info `/headless` 엔트리
**`@kalyx/react/headless`**(어댑터 비의존)에서 export됩니다. [날짜 어댑터 & `/headless` 엔트리](../guides/adapters.md) 참고.
:::

```tsx
import { useDateTimePicker } from '@kalyx/react/headless';
```

## 시그니처

```ts
function useDateTimePicker(options?: UseDateTimePickerOptions): UseDateTimePickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | controlled datetime (날짜 + 시간, UTC). |
| `defaultValue` | `ISODateString` | — | uncontrolled 초기 datetime. |
| `onChange` | `(value: ISODateString \| null) => void` | — | datetime이 바뀔 때 호출. |
| `disabled` | `DisabledRule[]` | `[]` | 비활성 규칙 (날짜에 적용). |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작 요일. |
| `adapter` | `DateAdapter` | — | 날짜 어댑터 (`/headless`에서 필수). |
| `displayTimezone` | `string` | — | IANA 존. `currentTime` 이 이 존으로 보고됨. [타임존](../concepts/timezone.md) 참고. |

### 반환

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `ISODateString \| null` | 현재 datetime. |
| `isOpen` | `boolean` | popover 상태. |
| `open` / `close` / `toggle` | `() => void` | popover 제어. |
| `selectDate` | `(iso: ISODateString \| null) => void` | 시각을 보존하며 날짜 설정(popover를 **닫지 않음**). |
| `setTime` | `(partial: Partial<TimeValue>) => void` | 날짜를 보존하며 시각 변경. |
| `currentTime` | `TimeValue` | 값의 시각 부분(설정 시 `displayTimezone` 기준). |
| `viewMonth` | `ISODateString` | 표시 중인 달의 1일. |
| `setViewMonth` | `(iso: ISODateString) => void` | 특정 달로 점프. |
| `calendar` | `CalendarGrid` | 6×7 `CalendarDay` 그리드. |
| `focusedDate` | `ISODateString` | 키보드 포커스된 날. |
| `setFocusedDate` | `(iso: ISODateString) => void` | 포커스 이동. |
| `previousMonth` / `nextMonth` | `() => void` | 달 내비게이션 단축. |
| `pickerId` | `string` | ARIA 연결용 안정 ID. |
| `adapter` | `DateAdapter` | 해석된 어댑터. |

### `TimeValue`

```ts
type TimeValue = {
  hours: number;   // 0–23
  minutes: number; // 0–59
  seconds: number; // 0–59
};
```

## 예제

```tsx
import { useDateTimePicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

export function MiniDateTime() {
  const { value, currentTime, calendar, selectDate, setTime } =
    useDateTimePicker({ adapter: DateFnsAdapter, displayTimezone: 'Asia/Seoul' });

  return (
    <div>
      <div className="grid grid-cols-7">
        {calendar.flat().map((day) => (
          <button key={day.isoString} onClick={() => selectDate(day.isoString)}>
            {day.dayNumber}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={currentTime.hours}
        onChange={(e) => setTime({ hours: Number(e.target.value) })}
      />
      <code>{value ?? 'null'}</code>
    </div>
  );
}
```

## 관련

- [DateTimePicker 컴포넌트 →](../components/datetimepicker.md)
- [useDatePicker →](./use-date-picker.md) / [useTimePicker →](./use-time-picker.md)
- [날짜 어댑터 →](../guides/adapters.md)
