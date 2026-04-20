---
id: use-range-picker
title: useRangePicker
sidebar_position: 2
---

# useRangePicker

Hook behind `<RangePicker>`. Same shape as [useDatePicker](./use-date-picker.md), with range state.

```tsx
import { useRangePicker } from '@kalyx/react';
```

## Signature

```ts
function useRangePicker(options?: UseRangePickerOptions): UseRangePickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | Controlled range. |
| `defaultValue` | `DateRange` | — | Uncontrolled initial range. |
| `onChange` | `(range: DateRange) => void` | — | Fires on selection. |
| `disabled` | `DisabledRule[]` | `[]` | Disable rules. |
| `weekStartsOn` | `0 \| 1` | `0` | Week start. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | Custom adapter. |
| `displayTimezone` | `string` | — | IANA zone. Same semantics as [`useDatePicker#displayTimezone`](./use-date-picker.md); applies to both `start` and `end`. |

### Return (delta over `useDatePicker`)

| Field | Type | Description |
| --- | --- | --- |
| `value` | `DateRange` | `{ start, end }`. |
| `selectingTarget` | `'start' \| 'end'` | Which end the next click will set. |
| `selectDate` | `(iso: ISODateString) => void` | Advances the range selection. |
| `setRange` | `(range: DateRange) => void` | Replace both ends at once (used by presets). |
| `hoverDate` | `ISODateString \| null` | For hover-preview highlighting. |
| `setHoverDate` | `(iso: ISODateString \| null) => void` | Setter. |

All other fields (`isOpen`, `open`, `close`, `viewMonth`, `setViewMonth`, `calendar`, `focusedDate`, `setFocusedDate`, `previousMonth`, `nextMonth`, `pickerId`, `adapter`) behave identically.

The `calendar`'s `CalendarDay` values now carry meaningful `isRangeStart`, `isRangeEnd`, and `isInRange` flags.

## Example — hoverable range grid

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
        April
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

## Related

- [useDatePicker →](./use-date-picker.md)
- [RangePicker component →](../components/rangepicker.md)
