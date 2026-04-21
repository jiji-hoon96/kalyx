---
id: monthpicker
title: MonthPicker
sidebar_position: 5
---

# MonthPicker

Month selector. The value is the first day of the selected month in UTC-ISO form — for example, picking April 2026 yields `"2026-04-01T00:00:00.000Z"`.

```tsx
import { MonthPicker } from '@kalyx/react';
```

## Basic usage

```tsx
import { useState } from 'react';
import { MonthPicker, type ISODateString } from '@kalyx/react';

function Example() {
  const [month, setMonth] = useState<ISODateString | null>(null);
  return (
    <MonthPicker value={month} onChange={setMonth}>
      <MonthPicker.Input placeholder="YYYY-MM" />
      <MonthPicker.Popover>
        <MonthPicker.Grid />
      </MonthPicker.Popover>
    </MonthPicker>
  );
}
```

The default `displayFormat` is `"yyyy-MM"`. Override it if you prefer a different representation (e.g., `"MMMM yyyy"` for `"April 2026"`).

## Parts

`MonthPicker` reuses `DatePicker`'s building blocks for everything except the grid:

| Part | Source | Purpose |
|------|--------|---------|
| `MonthPicker.Root` | wraps `DatePicker.Root` | controlled/uncontrolled state, `displayTimezone`, `disabled` rules |
| `MonthPicker.Input` | = `DatePicker.Input` | text input (combobox role) |
| `MonthPicker.Trigger` | = `DatePicker.Trigger` | icon button |
| `MonthPicker.Popover` | = `DatePicker.Popover` | Floating UI positioning |
| **`MonthPicker.Grid`** | new | 12-month grid with prev/next year navigation |

## Timezone

When `displayTimezone` is set, the committed value is the civil midnight of the selected month's first day in that zone (UTC-ISO form). The grid highlighting honors the timezone so the right month stays marked as selected even when stored as a zone-adjusted UTC string.

```tsx
<MonthPicker value={month} onChange={setMonth} displayTimezone="Asia/Seoul">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## Locale

Month names follow the `locale` prop (BCP 47). The built-in `getMonthName` helper uses `Intl.DateTimeFormat` so any locale supported by the JS runtime works without extra dependencies.

```tsx
<MonthPicker locale="ko-KR">
  <MonthPicker.Input />
  <MonthPicker.Popover>
    <MonthPicker.Grid />
  </MonthPicker.Popover>
</MonthPicker>
```

## Props

`MonthPicker` Root accepts the same props as `DatePicker.Root`. The only difference is the default `displayFormat` — otherwise `disabled`, `readOnly`, `weekStartsOn`, `locale`, `displayTimezone`, `labels`, `adapter`, `onOpenChange`, and `onCalendarNavigate` all behave identically. See [DatePicker](./datepicker.md) for the full reference.

### Grid classNames

```tsx
<MonthPicker.Grid
  classNames={{
    root: '',
    header: '',
    title: '',
    navButton: '',
    grid: '',
    gridRow: '',
    month: '',
    monthSelected: '',
    monthCurrent: '',
    monthDisabled: '',
  }}
/>
```
