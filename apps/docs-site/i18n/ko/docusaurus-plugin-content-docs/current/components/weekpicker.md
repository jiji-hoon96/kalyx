---
id: weekpicker
title: WeekPicker
sidebar_position: 7
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# WeekPicker

Week selector. A single click commits the entire week containing the clicked day, based on `weekStartsOn`. The value is a `DateRange` spanning all seven days.

```tsx
import { WeekPicker, type DateRange } from '@kalyx/react';
```

## Basic usage

```tsx
import { useState } from 'react';
import { WeekPicker, type DateRange } from '@kalyx/react';

function Example() {
  const [week, setWeek] = useState<DateRange>({ start: null, end: null });
  return (
    <WeekPicker value={week} onChange={setWeek}>
      <WeekPicker.Input part="start" />
      <span>→</span>
      <WeekPicker.Input part="end" />
      <WeekPicker.Popover>
        <WeekPicker.Calendar />
      </WeekPicker.Popover>
    </WeekPicker>
  );
}
```

## 직접 사용해보기

<StackBlitzEmbed id="datepicker-basic" />

## weekStartsOn

The `weekStartsOn` prop (inherited from `RangePicker.Root`) controls which day the week begins on — `0` for Sunday (default), `1` for Monday.

```tsx
<WeekPicker weekStartsOn={1} value={week} onChange={setWeek}>
  {/* ... */}
</WeekPicker>
```

With `weekStartsOn={1}`, clicking any date in, for example, April 14 2026 (Tuesday) commits the range Apr 13 (Mon) → Apr 19 (Sun).

## Parts

| Part | Source | Purpose |
|------|--------|---------|
| `WeekPicker.Root` | wraps `RangePicker.Root` | controlled/uncontrolled `DateRange`, `displayTimezone`, `disabled` rules |
| `WeekPicker.Input` | = `RangePicker.Input` | start/end text inputs (`part="start" \| "end"`) |
| `WeekPicker.Popover` | = `RangePicker.Popover` | Floating UI positioning |
| **`WeekPicker.Calendar`** | wraps `RangePicker.Calendar` with `selectionMode="week"` | single-click selects the full week |

Because `WeekPicker.Calendar` is implemented via the shared `selectionMode="week"` prop on `RangePicker.Calendar`, keyboard navigation (arrow keys, Home/End, Page Up/Down) behaves the same as `RangePicker` — pressing Enter or Space on the focused day commits the full week containing it.

## Keyboard

- **Arrow keys** — move the focused day.
- **Home / End** — jump to the first / last day of the currently-focused week.
- **Page Up / Page Down** — previous / next month. Shift + Page Up/Down — previous / next year.
- **Enter / Space** — commit the full week containing the focused day.
- **Escape** — close the popover without committing.

## Disabled rules

Restrict selectable weeks. Any `DisabledRule` that matches at least one day in a week disables the entire week.

```tsx
<WeekPicker
  value={week}
  onChange={setWeek}
  disabled={[{ before: '2026-04-01T00:00:00.000Z' }]}
>
  <WeekPicker.Input part="start" placeholder="Start" />
  <WeekPicker.Input part="end" placeholder="End" />
  <WeekPicker.Popover>
    <WeekPicker.Calendar />
  </WeekPicker.Popover>
</WeekPicker>
```

## Uncontrolled

```tsx
<form action="/api/save" method="post">
  <WeekPicker name="sprintWeek" defaultValue={{ start: '2026-04-13T00:00:00.000Z', end: '2026-04-19T00:00:00.000Z' }}>
    <WeekPicker.Input part="start" />
    <WeekPicker.Input part="end" />
    <WeekPicker.Popover>
      <WeekPicker.Calendar />
    </WeekPicker.Popover>
  </WeekPicker>
  <button type="submit">Save</button>
</form>
```

## Timezone

Inherited from `RangePicker.Root`. With `displayTimezone` set, the start and end of the week are emitted as civil midnight in that zone (UTC-ISO form).

## Props

`WeekPicker` Root accepts the same props as `RangePicker.Root`. See [RangePicker](./rangepicker.md) for the full reference.

### Calendar classNames

Same shape as `RangePicker.Calendar` classNames, with an extra `dayInWeek` modifier that styles every cell of the selected week:

```tsx
<WeekPicker.Calendar
  classNames={{
    root: '',
    day: '',
    dayInWeek: 'bg-blue-100',
    dayRangeStart: 'rounded-l',
    dayRangeEnd: 'rounded-r',
    dayToday: 'font-bold',
    /* ...and all other RangePicker.Calendar classNames */
  }}
/>
```

## Related

- [RangePicker →](./rangepicker.md)
- [DatePicker →](./datepicker.md)
- [Accessibility →](../concepts/accessibility.md)
