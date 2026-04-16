---
id: use-range-picker
title: useRangePicker
sidebar_position: 2
---

# useRangePicker

`<RangePicker>` 뒤의 훅. [useDatePicker](./use-date-picker.md)와 동일한 구조에 범위 상태가 추가됩니다.

```tsx
import { useRangePicker } from '@kalyx/react';
```

## 시그니처

```ts
function useRangePicker(options?: UseRangePickerOptions): UseRangePickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | 제어형 범위. |
| `defaultValue` | `DateRange` | — | 비제어 초기 범위. |
| `onChange` | `(range: DateRange) => void` | — | 선택 시 호출. |
| `disabled` | `DisabledRule[]` | `[]` | 비활성 규칙. |
| `weekStartsOn` | `0 \| 1` | `0` | 주 시작. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | 커스텀 어댑터. |

### 반환값 (`useDatePicker` 대비 차이)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `DateRange` | `{ start, end }`. |
| `selectingTarget` | `'start' \| 'end'` | 다음 클릭이 어느 끝을 설정하는지. |
| `selectDate` | `(iso: ISODateString) => void` | 범위 선택을 진전. |
| `setRange` | `(range: DateRange) => void` | 양 끝을 한 번에 치환 (프리셋용). |
| `hoverDate` | `ISODateString \| null` | 호버 프리뷰 강조에 사용. |
| `setHoverDate` | `(iso: ISODateString \| null) => void` | setter. |

나머지 필드 (`isOpen`, `open`, `close`, `viewMonth`, `setViewMonth`, `calendar`, `focusedDate`, `setFocusedDate`, `previousMonth`, `nextMonth`, `pickerId`, `adapter`)는 동일하게 동작합니다.

`calendar`의 `CalendarDay` 값은 이제 의미 있는 `isRangeStart`, `isRangeEnd`, `isInRange` 플래그를 가집니다.

## 예시 — 호버 가능한 범위 그리드

```tsx
import { useRangePicker } from '@kalyx/react';

export function MiniRange() {
  const {
    calendar,
    selectDate,
    setHoverDate,
    setRange,
  } = useRangePicker({ defaultValue: { start: null, end: null } });

  return (
    <>
      <button
        onClick={() =>
          setRange({
            start: '2026-04-01T00:00:00.000Z',
            end: '2026-04-30T00:00:00.000Z',
          })
        }>
        4월 전체
      </button>
      <div className="grid grid-cols-7">
        {calendar.flat().map((day) => (
          <button
            key={day.isoString}
            onMouseEnter={() => setHoverDate(day.isoString)}
            onMouseLeave={() => setHoverDate(null)}
            onClick={() => selectDate(day.isoString)}
            aria-pressed={day.isRangeStart || day.isRangeEnd}
            className={[
              day.isInRange ? 'bg-indigo-100' : '',
              (day.isRangeStart || day.isRangeEnd) ? 'bg-indigo-600 text-white' : '',
            ].join(' ')}>
            {day.dayNumber}
          </button>
        ))}
      </div>
    </>
  );
}
```

## 관련

- [useDatePicker →](./use-date-picker.md)
- [RangePicker 컴포넌트 →](../components/rangepicker.md)
