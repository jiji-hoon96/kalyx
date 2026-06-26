---
id: use-week-picker
title: useWeekPicker
sidebar_position: 6
---

# useWeekPicker

The headless hook behind `<WeekPicker>`. A single `selectWeek` commits the whole week containing the clicked day; the grid highlights the selected week as a range.

:::info `/headless` entry
Exported from **`@kalyx/react/headless`** (adapter-agnostic). See [Date adapters & the `/headless` entry](../guides/adapters.md).
:::

```tsx
import { useWeekPicker } from '@kalyx/react/headless';
```

## Signature

```ts
function useWeekPicker(options?: UseWeekPickerOptions): UseWeekPickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | Controlled week as a `{ start, end }` range. |
| `defaultValue` | `DateRange` | — | Uncontrolled initial week. |
| `onChange` | `(week: DateRange) => void` | — | Fires when the selected week changes. |
| `disabled` | `DisabledRule[]` | `[]` | Disable rules. |
| `weekStartsOn` | `0 \| 1` | `0` | Day the week starts on. |
| `adapter` | `DateAdapter` | — | Date adapter (required on `/headless`). |
| `displayTimezone` | `string` | — | IANA zone for civil-day comparison. |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `DateRange` | Selected week as `{ start, end }`. |
| `isOpen` | `boolean` | Popover state. |
| `open` / `close` / `toggle` | `() => void` | Popover controls. |
| `selectWeek` | `(iso: ISODateString) => void` | Commit the whole week containing the clicked day. |
| `viewMonth` | `ISODateString` | First-day-of-visible-month. |
| `setViewMonth` | `(iso: ISODateString) => void` | Jump to a month. |
| `calendar` | `CalendarGrid` | 6×7 grid with the selected week highlighted as a range. |
| `previousMonth` / `nextMonth` | `() => void` | Month navigation shorthands. |
| `pickerId` | `string` | Stable ID for ARIA wiring. |
| `adapter` | `DateAdapter` | The resolved adapter. |

Each `CalendarDay` in `calendar` carries `isRangeStart` / `isRangeEnd` / `isInRange` reflecting the committed week (see [useDatePicker → CalendarDay](./use-date-picker.md#calendarday)).

## Example

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

## Related

- [WeekPicker component →](../components/weekpicker.md)
- [useRangePicker →](./use-range-picker.md)
- [Date adapters →](../guides/adapters.md)
