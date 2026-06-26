---
id: use-date-time-picker
title: useDateTimePicker
sidebar_position: 7
---

# useDateTimePicker

The headless hook behind `<DateTimePicker>`. One ISO string drives both the calendar and the time-of-day; `selectDate` preserves the time and `setTime` preserves the date.

:::info `/headless` entry
Exported from **`@kalyx/react/headless`** (adapter-agnostic). See [Date adapters & the `/headless` entry](../guides/adapters.md).
:::

```tsx
import { useDateTimePicker } from '@kalyx/react/headless';
```

## Signature

```ts
function useDateTimePicker(options?: UseDateTimePickerOptions): UseDateTimePickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled datetime (date + time, UTC). |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial datetime. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Fires when the datetime changes. |
| `disabled` | `DisabledRule[]` | `[]` | Disable rules (applied to days). |
| `weekStartsOn` | `0 \| 1` | `0` | Day the week starts on. |
| `adapter` | `DateAdapter` | — | Date adapter (required on `/headless`). |
| `displayTimezone` | `string` | — | IANA zone. `currentTime` is reported in this zone. See [Timezone](../concepts/timezone.md). |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `ISODateString \| null` | Current datetime. |
| `isOpen` | `boolean` | Popover state. |
| `open` / `close` / `toggle` | `() => void` | Popover controls. |
| `selectDate` | `(iso: ISODateString \| null) => void` | Set the date, preserving the time (does **not** close the popover). |
| `setTime` | `(partial: Partial<TimeValue>) => void` | Change the time, preserving the date. |
| `currentTime` | `TimeValue` | Time portion of the value (in `displayTimezone` when set). |
| `viewMonth` | `ISODateString` | First-day-of-visible-month. |
| `setViewMonth` | `(iso: ISODateString) => void` | Jump to a month. |
| `calendar` | `CalendarGrid` | 6×7 grid of `CalendarDay`s. |
| `focusedDate` | `ISODateString` | Keyboard-focused day. |
| `setFocusedDate` | `(iso: ISODateString) => void` | Move focus. |
| `previousMonth` / `nextMonth` | `() => void` | Month navigation shorthands. |
| `pickerId` | `string` | Stable ID for ARIA wiring. |
| `adapter` | `DateAdapter` | The resolved adapter. |

### `TimeValue`

```ts
type TimeValue = {
  hours: number;   // 0–23
  minutes: number; // 0–59
  seconds: number; // 0–59
};
```

## Example

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

## Related

- [DateTimePicker component →](../components/datetimepicker.md)
- [useDatePicker →](./use-date-picker.md) / [useTimePicker →](./use-time-picker.md)
- [Date adapters →](../guides/adapters.md)
