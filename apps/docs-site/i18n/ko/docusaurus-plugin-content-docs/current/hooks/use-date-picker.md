---
id: use-date-picker
title: useDatePicker
sidebar_position: 1
---

# useDatePicker

`<DatePicker>` 뒤에 있는 훅. 조합 컴포넌트로 표현되지 않는 완전 커스텀 UI가 필요할 때 사용합니다.

```tsx
import { useDatePicker } from '@kalyx/react';
```

## 시그니처

```ts
function useDatePicker(options?: UseDatePickerOptions): UseDatePickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | 제어 값. |
| `defaultValue` | `ISODateString` | — | 비제어 초기값. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 변경 콜백. |
| `disabled` | `DisabledRule[]` | `[]` | 비활성 규칙. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 어댑터. |

### 반환값

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `ISODateString \| null` | 현재 값. |
| `isOpen` | `boolean` | popover 상태. |
| `open` | `() => void` | popover 열기. |
| `close` | `() => void` | popover 닫기. |
| `toggle` | `() => void` | popover 토글. |
| `selectDate` | `(iso: ISODateString \| null) => void` | 프로그래매틱 값 지정. |
| `viewMonth` | `ISODateString` | 보이는 월의 1일 (UTC). |
| `setViewMonth` | `(iso: ISODateString) => void` | 월 점프. |
| `calendar` | `CalendarGrid` | 6×7 `CalendarDay` 그리드. |
| `focusedDate` | `ISODateString` | 키보드 포커스 위치. |
| `setFocusedDate` | `(iso: ISODateString) => void` | 포커스 이동. |
| `previousMonth` | `() => void` | `setViewMonth(prev)` 단축. |
| `nextMonth` | `() => void` | `setViewMonth(next)` 단축. |
| `pickerId` | `string` | ARIA 연결용 `useId` 기반 ID. |
| `adapter` | `DateAdapter` | 해결된 어댑터. |

### `CalendarDay`

```ts
type CalendarDay = {
  isoString: ISODateString;
  dayNumber: number;           // 1–31
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isRangeStart: boolean;       // useDatePicker에선 항상 false
  isRangeEnd: boolean;         // useDatePicker에선 항상 false
  isInRange: boolean;          // useDatePicker에선 항상 false
};
```

## 예시 — 커스텀 그리드

```tsx
import { useDatePicker } from '@kalyx/react';

export function MiniCalendar() {
  const {
    value,
    calendar,
    viewMonth,
    previousMonth,
    nextMonth,
    selectDate,
  } = useDatePicker({
    defaultValue: new Date().toISOString(),
    onChange: (v) => console.log(v),
  });

  return (
    <div>
      <header>
        <button onClick={previousMonth} aria-label="이전">◀</button>
        <span>{viewMonth.slice(0, 7)}</span>
        <button onClick={nextMonth} aria-label="다음">▶</button>
      </header>
      <div className="grid grid-cols-7">
        {calendar.flat().map((day) => (
          <button
            key={day.isoString}
            aria-selected={day.isSelected}
            disabled={day.isDisabled}
            onClick={() => selectDate(day.isoString)}
            className={[
              day.isCurrentMonth ? '' : 'opacity-40',
              day.isToday ? 'ring-1 ring-indigo-500' : '',
              day.isSelected ? 'bg-indigo-600 text-white' : '',
            ].join(' ')}>
            {day.dayNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 훅 vs 컴포넌트

| 필요 | 선택 |
| --- | --- |
| 표준 캘린더, 가벼운 스타일링 | `<DatePicker.Calendar classNames={…}>` |
| 표준 캘린더, 커스텀 DOM 슬롯 | `<DatePicker>` + 커스텀 `className` |
| 비그리드 레이아웃 (주 뷰, 어젠다, 인라인 리스트) | `useDatePicker` |
| 디자인 시스템 프리미티브 내부 | `useDatePicker`를 자체 컴포넌트로 래핑 |

## 관련

- [useRangePicker →](./use-range-picker.md)
- [DatePicker 컴포넌트 →](../components/datepicker.md)
