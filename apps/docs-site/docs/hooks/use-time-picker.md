---
id: use-time-picker
title: useTimePicker
sidebar_position: 3
---

# useTimePicker

Hook behind `<TimePicker>`. Use when building custom time UIs (sliders, wheels, custom option lists).

```tsx
import { useTimePicker } from '@kalyx/react';
```

## Signature

```ts
function useTimePicker(options?: UseTimePickerOptions): UseTimePickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled value. |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial value. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Change callback. |
| `format` | `'12h' \| '24h'` | `'24h'` | Time format. |
| `step` | `number` | `1` | Minute granularity. |
| `withSeconds` | `boolean` | `false` | Include seconds. |
| `displayTimezone` | `string` | — | IANA zone. When set, `currentTime` / `setHour` / `setMinute` read and write time-of-day as observed in this zone (DST-aware). See [Timezone](../concepts/timezone.md). |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `ISODateString \| null` | Current value. |
| `currentTime` | `TimeValue` | `{ hours, minutes, seconds }`. |
| `setTime` | `(partial: Partial<TimeValue>) => void` | Merge an update. |
| `setHour` | `(hour: number) => void` | Set hour only (24h). |
| `setMinute` | `(minute: number) => void` | Set minute only. |
| `setSecond` | `(second: number) => void` | Set second only. |
| `setPeriod` | `(period: 'AM' \| 'PM') => void` | Change AM/PM (12h only). |
| `availableHours` | `number[]` | Hour options for current format. |
| `availableMinutes` | `number[]` | Minute options filtered by `step`. |
| `format` | `'12h' \| '24h'` | Resolved format. |
| `displayHour` | `number` | Hour in current format (12h maps 0/13 → 12/1). |
| `period` | `'AM' \| 'PM' \| null` | `null` in 24h mode. |
| `pickerId` | `string` | Stable ID for ARIA wiring. |

### `TimeValue`

```ts
type TimeValue = {
  hours: number;     // 0–23
  minutes: number;   // 0–59
  seconds: number;   // 0–59
};
```

## Example — scroll wheel

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

## Related

- [TimePicker component →](../components/timepicker.md)
- [DateTimePicker →](../components/datetimepicker.md)
