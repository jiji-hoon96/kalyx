---
id: timepicker
title: TimePicker
sidebar_position: 3
---

# TimePicker

Hour + minute (+ optional seconds) selection. 12- or 24-hour mode.

```tsx
import { TimePicker } from '@kalyx/react';
```

## Basic usage

```tsx
import { useState } from 'react';
import { TimePicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [time, setTime] = useState<ISODateString | null>(null);
  return (
    <TimePicker value={time} onChange={setTime} format="24h" step={15}>
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
    </TimePicker>
  );
}
```

The value is still an ISO 8601 UTC string — the date part acts as a placeholder. Use `getTime(iso)` from `@kalyx/core` if you need just the hours/minutes.

### Try it live

```jsx live
function Basic24h() {
  const [time, setTime] = React.useState(null);
  return (
    <TimePicker value={time} onChange={setTime} format="24h" step={15}>
      <TimePicker.Input className="kx-live-input" style={{ minWidth: '8rem' }} />
      <div className="kx-live-row" style={{ marginTop: 8 }}>
        <TimePicker.HourList
          classNames={{
            root: 'kx-live-list',
            option: 'kx-live-option',
            optionSelected: 'kx-live-option-selected',
          }}
        />
        <TimePicker.MinuteList
          classNames={{
            root: 'kx-live-list',
            option: 'kx-live-option',
            optionSelected: 'kx-live-option-selected',
          }}
        />
      </div>
      <div className="kx-live-value" style={{ marginTop: 8 }}>
        Selected: <code>{time ?? 'null'}</code>
      </div>
    </TimePicker>
  );
}
```

## `<TimePicker>` (Root)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `ISODateString \| null` | — | Controlled time. |
| `defaultValue` | `ISODateString` | — | Uncontrolled initial value. |
| `onChange` | `(value: ISODateString \| null) => void` | — | Fires on any hour / minute / period change. |
| `format` | `'12h' \| '24h'` | `'24h'` | Time format. |
| `step` | `number` | `1` | Minute granularity (e.g. `5`, `15`, `30`). |
| `withSeconds` | `boolean` | `false` | Show seconds in display + input. |
| `disabled` | `boolean` | `false` | Disable the whole picker. |
| `readOnly` | `boolean` | `false` | Prevent changes. |
| `children` | `ReactNode` | — | Sub-components. |

## `<TimePicker.Input>`

A text input showing `HH:MM` (or `HH:MM:SS` when `withSeconds`). Parses on Enter / blur.

- Extends `<input>` attributes except `value`, `onChange`, `type`.
- `aria-label` defaults to `"Time input"`.

## `<TimePicker.HourList>`

A `role="listbox"` of available hours.

| Prop | Type | Description |
| --- | --- | --- |
| `classNames` | `TimePickerHourListClassNames` | Styling. |

```ts
type TimePickerHourListClassNames = {
  root?: string;         // <ul>
  option?: string;       // <li role="option">
  optionSelected?: string;
};
```

Hour set:

- `format="24h"` → `0–23`
- `format="12h"` → `1–12` (AM/PM managed by `<AmPmToggle>`)

## `<TimePicker.MinuteList>`

A `role="listbox"` of minutes, filtered by `step`.

| Prop | Type | Description |
| --- | --- | --- |
| `classNames` | `TimePickerMinuteListClassNames` | Styling (same shape as HourList). |

## `<TimePicker.AmPmToggle>`

A `role="radiogroup"` with two `role="radio"` buttons — only renders in `format="12h"`.

| Prop | Type | Description |
| --- | --- | --- |
| `classNames` | `TimePickerAmPmToggleClassNames` | Styling. |

```ts
type TimePickerAmPmToggleClassNames = {
  root?: string;
  button?: string;
  buttonSelected?: string;
};
```

## Patterns

### 12-hour mode

```tsx
<TimePicker value={time} onChange={setTime} format="12h" step={15}>
  <TimePicker.Input />
  <div className="flex gap-2">
    <TimePicker.HourList />
    <TimePicker.MinuteList />
    <TimePicker.AmPmToggle />
  </div>
</TimePicker>
```

```jsx live
function TwelveHour() {
  const [time, setTime] = React.useState(null);
  return (
    <TimePicker value={time} onChange={setTime} format="12h" step={15}>
      <TimePicker.Input className="kx-live-input" style={{ minWidth: '8rem' }} />
      <div className="kx-live-row" style={{ marginTop: 8 }}>
        <TimePicker.HourList
          classNames={{
            root: 'kx-live-list',
            option: 'kx-live-option',
            optionSelected: 'kx-live-option-selected',
          }}
        />
        <TimePicker.MinuteList
          classNames={{
            root: 'kx-live-list',
            option: 'kx-live-option',
            optionSelected: 'kx-live-option-selected',
          }}
        />
        <TimePicker.AmPmToggle
          classNames={{
            root: 'kx-live-ampm',
            button: 'kx-live-ampm-btn',
            buttonSelected: 'kx-live-ampm-selected',
          }}
        />
      </div>
    </TimePicker>
  );
}
```

### With seconds

```tsx
<TimePicker value={time} onChange={setTime} withSeconds>
  <TimePicker.Input />
</TimePicker>
```

```jsx live
function WithSeconds() {
  const [time, setTime] = React.useState(null);
  return (
    <TimePicker value={time} onChange={setTime} withSeconds>
      <TimePicker.Input className="kx-live-input" style={{ minWidth: '8rem' }} />
      <div className="kx-live-value" style={{ marginTop: 8 }}>
        Selected: <code>{time ?? 'null'}</code>
      </div>
    </TimePicker>
  );
}
```

### Extracting `TimeValue` for logic

```tsx
import { TimePicker } from '@kalyx/react';
import { getTime } from '@kalyx/core';

function Example() {
  const [time, setTime] = useState<ISODateString | null>(null);

  useEffect(() => {
    if (!time) return;
    const { hours, minutes } = getTime(time); // { hours: 9, minutes: 30, seconds: 0 }
    analytics.track('time_set', { hours, minutes });
  }, [time]);

  return (
    <TimePicker value={time} onChange={setTime}>
      <TimePicker.Input />
    </TimePicker>
  );
}
```

## Related

- [DateTimePicker →](./datetimepicker.md)
- [useTimePicker →](../hooks/use-time-picker.md)
