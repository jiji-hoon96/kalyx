---
id: use-week-picker
title: useWeekPicker
sidebar_position: 6
---

# useWeekPicker

`<WeekPicker>` 뒤의 헤드리스 훅. 단일 `selectWeek` 가 클릭된 날이 속한 주 전체를 커밋하고, 그리드는 선택된 주를 범위로 강조합니다.

:::info `/headless` 엔트리
**`@kalyx/react/headless`**(어댑터 비의존)에서 export됩니다. [날짜 어댑터 & `/headless` 엔트리](../guides/adapters.md) 참고.
:::

```tsx
import { useWeekPicker } from '@kalyx/react/headless';
```

## 시그니처

```ts
function useWeekPicker(options?: UseWeekPickerOptions): UseWeekPickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | controlled 주, `{ start, end }` 범위. |
| `defaultValue` | `DateRange` | — | uncontrolled 초기 주. |
| `onChange` | `(week: DateRange) => void` | — | 선택된 주가 바뀔 때 호출. |
| `disabled` | `DisabledRule[]` | `[]` | 비활성 규칙. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작 요일. |
| `adapter` | `DateAdapter` | — | 날짜 어댑터 (`/headless`에서 필수). |
| `displayTimezone` | `string` | — | civil-day 비교용 IANA 존. |

### 반환

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `DateRange` | 선택된 주 `{ start, end }`. |
| `isOpen` | `boolean` | popover 상태. |
| `open` / `close` / `toggle` | `() => void` | popover 제어. |
| `selectWeek` | `(iso: ISODateString) => void` | 클릭된 날이 속한 주 전체 커밋. |
| `viewMonth` | `ISODateString` | 표시 중인 달의 1일. |
| `setViewMonth` | `(iso: ISODateString) => void` | 특정 달로 점프. |
| `calendar` | `CalendarGrid` | 선택된 주를 범위로 강조한 6×7 그리드. |
| `previousMonth` / `nextMonth` | `() => void` | 달 내비게이션 단축. |
| `pickerId` | `string` | ARIA 연결용 안정 ID. |
| `adapter` | `DateAdapter` | 해석된 어댑터. |

`calendar` 의 각 `CalendarDay` 는 커밋된 주를 반영하는 `isRangeStart` / `isRangeEnd` / `isInRange` 를 가집니다([useDatePicker → CalendarDay](./use-date-picker.md#calendarday) 참고).

## 예제

```tsx
import { useWeekPicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

export function MiniWeekGrid() {
  const { calendar, viewMonth, previousMonth, nextMonth, selectWeek } =
    useWeekPicker({ adapter: DateFnsAdapter, weekStartsOn: 1 });

  return (
    <div>
      <header>
        <button onClick={previousMonth} aria-label="Previous">◀</button>
        <span>{viewMonth.slice(0, 7)}</span>
        <button onClick={nextMonth} aria-label="Next">▶</button>
      </header>
      <div className="grid grid-cols-7">
        {calendar.flat().map((day) => (
          <button
            key={day.isoString}
            disabled={day.isDisabled}
            onClick={() => selectWeek(day.isoString)}
            className={day.isInRange || day.isRangeStart || day.isRangeEnd ? 'bg-indigo-100' : ''}>
            {day.dayNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 관련

- [WeekPicker 컴포넌트 →](../components/weekpicker.md)
- [useRangePicker →](./use-range-picker.md)
- [날짜 어댑터 →](../guides/adapters.md)
