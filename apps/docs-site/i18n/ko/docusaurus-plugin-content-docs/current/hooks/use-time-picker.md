---
id: use-time-picker
title: useTimePicker
sidebar_position: 3
---

# useTimePicker

`<TimePicker>` 뒤의 훅. 커스텀 시간 UI (슬라이더, 휠, 자체 옵션 리스트)를 만들 때 사용합니다.

```tsx
import { useTimePicker } from '@kalyx/react';
```

## 시그니처

```ts
function useTimePicker(options?: UseTimePickerOptions): UseTimePickerReturn;
```

### 옵션

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | 제어 값. |
| `defaultValue` | `ISODateString` | — | 비제어 초기값. |
| `onChange` | `(value: ISODateString \| null) => void` | — | 변경 콜백. |
| `format` | `'12h' \| '24h'` | `'24h'` | 시간 포맷. |
| `step` | `number` | `1` | 분 간격. |
| `withSeconds` | `boolean` | `false` | 초 포함. |

### 반환값

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `ISODateString \| null` | 현재 값. |
| `currentTime` | `TimeValue` | `{ hours, minutes, seconds }`. |
| `setTime` | `(partial: Partial<TimeValue>) => void` | 부분 업데이트 병합. |
| `setHour` | `(hour: number) => void` | 시 지정 (24h). |
| `setMinute` | `(minute: number) => void` | 분 지정. |
| `setSecond` | `(second: number) => void` | 초 지정. |
| `setPeriod` | `(period: 'AM' \| 'PM') => void` | AM/PM 변경 (12h). |
| `availableHours` | `number[]` | 현재 포맷의 시 옵션. |
| `availableMinutes` | `number[]` | `step`으로 필터된 분. |
| `format` | `'12h' \| '24h'` | 해결된 포맷. |
| `displayHour` | `number` | 현재 포맷의 표시 시 (12h는 0/13 → 12/1). |
| `period` | `'AM' \| 'PM' \| null` | 24h 모드에선 `null`. |
| `pickerId` | `string` | ARIA용 안정 ID. |

### `TimeValue`

```ts
type TimeValue = {
  hours: number;     // 0–23
  minutes: number;   // 0–59
  seconds: number;   // 0–59
};
```

## 예시 — 스크롤 휠

```tsx
import { useTimePicker } from '@kalyx/react';

export function TimeWheel() {
  const {
    availableHours,
    availableMinutes,
    currentTime,
    setHour,
    setMinute,
  } = useTimePicker({ step: 15 });

  return (
    <div className="flex gap-2">
      <ul className="overflow-y-auto h-40">
        {availableHours.map((h) => (
          <li key={h}>
            <button
              aria-pressed={h === currentTime.hours}
              onClick={() => setHour(h)}>
              {String(h).padStart(2, '0')}
            </button>
          </li>
        ))}
      </ul>
      <ul className="overflow-y-auto h-40">
        {availableMinutes.map((m) => (
          <li key={m}>
            <button
              aria-pressed={m === currentTime.minutes}
              onClick={() => setMinute(m)}>
              {String(m).padStart(2, '0')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 관련

- [TimePicker 컴포넌트 →](../components/timepicker.md)
- [DateTimePicker →](../components/datetimepicker.md)
