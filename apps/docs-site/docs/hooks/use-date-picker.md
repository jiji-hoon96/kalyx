---
id: use-date-picker
title: useDatePicker
sidebar_position: 1
---

# useDatePicker

The hook behind `<DatePicker>`. Use it when you need a fully custom UI that the compound components can't express.

```tsx
import { useDatePicker } from '@kalyx/react';
```

## Signature

```ts
function useDatePicker(options?: UseDatePickerOptions): UseDatePickerReturn;
```

### Options

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled value. |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial value. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Change callback. |
| `disabled` | `DisabledRule[]` | `[]` | Disable rules. |
| `weekStartsOn` | `0 \| 1` | `0` | Week start. |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | Custom adapter. |

### Return

| Field | Type | Description |
| --- | --- | --- |
| `value` | `ISODateString \| null` | Current value. |
| `isOpen` | `boolean` | Popover state. |
| `open` | `() => void` | Open the popover. |
| `close` | `() => void` | Close the popover. |
| `toggle` | `() => void` | Toggle the popover. |
| `selectDate` | `(iso: ISODateString \| null) => void` | Set value programmatically. |
| `viewMonth` | `ISODateString` | First-day-of-visible-month. |
| `setViewMonth` | `(iso: ISODateString) => void` | Jump to a month. |
| `calendar` | `CalendarGrid` | 6×7 grid of `CalendarDay`s. |
| `focusedDate` | `ISODateString` | Currently keyboard-focused day. |
| `setFocusedDate` | `(iso: ISODateString) => void` | Move focus. |
| `previousMonth` | `() => void` | Shorthand for `setViewMonth(prev)`. |
| `nextMonth` | `() => void` | Shorthand for `setViewMonth(next)`. |
| `pickerId` | `string` | Stable `useId`-based ID for ARIA wiring. |
| `adapter` | `DateAdapter` | The resolved adapter. |

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
  isRangeStart: boolean;       // always false for useDatePicker
  isRangeEnd: boolean;         // always false for useDatePicker
  isInRange: boolean;          // always false for useDatePicker
};
```

## Example — custom grid

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
        <button onClick={previousMonth} aria-label="Previous">◀</button>
        <span>{viewMonth.slice(0, 7)}</span>
        <button onClick={nextMonth} aria-label="Next">▶</button>
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

## When to use the hook vs components

| Need | Use |
| --- | --- |
| Standard calendar, some styling | `<DatePicker.Calendar classNames={…}>` |
| Standard calendar, custom DOM slots | `<DatePicker>` + custom `className`s |
| Non-grid layout (week view, agenda, inline list) | `useDatePicker` |
| Embedded in a design-system primitive | `useDatePicker` wrapped in your component |

## Related

- [useRangePicker →](./use-range-picker.md)
- [DatePicker component →](../components/datepicker.md)
