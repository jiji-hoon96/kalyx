---
id: datetimepicker
title: DateTimePicker
sidebar_position: 4
---

# DateTimePicker

Combined date + time, one popover, one ISO string.

```tsx
import { DateTimePicker } from '@kalyx/react';
```

## Basic usage

```tsx
import { useState } from 'react';
import { DateTimePicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [dt, setDt] = useState<ISODateString | null>(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

Selecting a day **does not close the popover** — time can be adjusted after. Use your own close button or outside-click to confirm.

### Try it live

```jsx live
function BasicDateTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
      <DateTimePicker.Input className="kx-live-input" style={{ minWidth: '14rem' }} />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
      <div className="kx-live-value" style={{ marginTop: 8 }}>
        Selected: <code>{dt ?? 'null'}</code>
      </div>
    </DateTimePicker>
  );
}
```

## `<DateTimePicker>` (Root)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled datetime. |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial value. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Fires on any date or time change. |
| `format` | `'12h' \| '24h'` | `'24h'` | Time format. |
| `step` | `number` | `1` | Minute granularity. |
| `disabled` | `DisabledRule[] \| boolean` | `false` | Date disable rules. |
| `readOnly` | `boolean` | `false` | Prevent changes. |
| `weekStartsOn` | `0 \| 1` | `0` | Week start. |
| `displayFormat` | `string` | `'yyyy-MM-dd HH:mm'` | date-fns format. |
| `locale` | `string` | `'en-US'` | BCP 47 locale. |
| `displayTimezone` | `string` | — | IANA zone. Calendar highlights by civil day in this zone, TimePicker reads/writes time-of-day in this zone, and `onChange` emits the UTC instant that corresponds to the zone-local date+time. See [Timezone](../concepts/timezone.md). |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | Custom adapter. |
| `labels` | `Partial<DateTimePickerLabels>` | — | Override ARIA labels. Union of DatePicker + TimePicker label keys, plus `dateTimeInput`. |
| `children` | `ReactNode` | — | Sub-components. |

## Sub-components

DateTimePicker re-exports sub-components from both DatePicker and TimePicker under one namespace:

| Name | Behavior |
| --- | --- |
| `.Input` | Combined date + time input — parses both. |
| `.Popover` | Same as DatePicker.Popover. |
| `.Calendar` | Month grid (stays open on select). |
| `.MonthGrid` | Optional month jump. |
| `.YearGrid` | Optional year jump. |
| `.HourList` | Same as TimePicker.HourList. |
| `.MinuteList` | Same as TimePicker.MinuteList. |
| `.AmPmToggle` | Same as TimePicker.AmPmToggle (12h mode only). |

All `classNames` types are re-exported — see [DatePicker](./datepicker.md) and [TimePicker](./timepicker.md).

## Patterns

### 12-hour datetime

```tsx
<DateTimePicker value={dt} onChange={setDt} format="12h" step={5}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <div className="flex gap-2 p-2 border-t">
      <DateTimePicker.HourList />
      <DateTimePicker.MinuteList />
      <DateTimePicker.AmPmToggle />
    </div>
  </DateTimePicker.Popover>
</DateTimePicker>
```

```jsx live
function TwelveHourDateTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="12h" step={30}>
      <DateTimePicker.Input className="kx-live-input" style={{ minWidth: '14rem' }} />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.AmPmToggle
            classNames={{
              root: 'kx-live-ampm',
              button: 'kx-live-ampm-btn',
              buttonSelected: 'kx-live-ampm-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

### Forcing the minute to snap

Combine `step={15}` with a `displayFormat` that hides the minute if you want fixed-slot scheduling:

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  step={30}
  displayFormat="yyyy-MM-dd HH:mm">
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

### Booking flow

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  disabled={[
    { dayOfWeek: [0, 6] },                           // weekends off
    { before: new Date().toISOString() },            // no past
  ]}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

```jsx live
function BookingFlow() {
  const [dt, setDt] = React.useState(null);
  const today = new Date().toISOString();
  return (
    <DateTimePicker
      value={dt}
      onChange={setDt}
      format="12h"
      step={30}
      disabled={[{ dayOfWeek: [0, 6] }, { before: today }]}
    >
      <DateTimePicker.Input
        className="kx-live-input"
        style={{ minWidth: '16rem' }}
        placeholder="Weekday slots only"
      />
      <DateTimePicker.Popover className="kx-live-popover">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayDisabled: 'kx-live-disabled',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div
          className="kx-live-row"
          style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--kalyx-border)' }}
        >
          <DateTimePicker.HourList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.MinuteList
            classNames={{
              root: 'kx-live-list',
              option: 'kx-live-option',
              optionSelected: 'kx-live-option-selected',
            }}
          />
          <DateTimePicker.AmPmToggle
            classNames={{
              root: 'kx-live-ampm',
              button: 'kx-live-ampm-btn',
              buttonSelected: 'kx-live-ampm-selected',
            }}
          />
        </div>
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

## Event callbacks

| Prop | Signature | Fires when |
| --- | --- | --- |
| `onChange` | `(value: ISODateString \| null) => void` | Date or time changes. |
| `onOpenChange` | `(isOpen: boolean) => void` | The popover opens or closes. Not fired on initial mount. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | The calendar view moves to a different month. Not fired on initial mount. |

## Related

- [DatePicker →](./datepicker.md)
- [TimePicker →](./timepicker.md)
