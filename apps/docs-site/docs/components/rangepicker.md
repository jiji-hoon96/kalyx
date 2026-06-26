---
id: rangepicker
title: RangePicker
sidebar_position: 2
---

import StackBlitzEmbed from '@site/src/components/StackBlitzEmbed';

# RangePicker

Two-date selection — a start and an end — with optional presets.

```tsx
import { RangePicker } from '@kalyx/react';
```

## Anatomy

```tsx
<RangePicker>            {/* Root — holds the { start, end } range */}
  <RangePicker.Input part="start" /> {/* start-date combobox input */}
  <RangePicker.Input part="end" />   {/* end-date combobox input */}
  <RangePicker.Popover> {/* Floating-UI portal, role="dialog" */}
    <RangePicker.Presets> {/* role="group" of quick-range buttons */}
      <RangePicker.Preset /> {/* one quick-range toggle button */}
    </RangePicker.Presets>
    <RangePicker.Calendar /> {/* range-aware month grid */}
  </RangePicker.Popover>
</RangePicker>
```

## Basic usage

```tsx
import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';

function Example() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <RangePicker.Input part="start" placeholder="Start" />
      <RangePicker.Input part="end" placeholder="End" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

**Selection flow:** first click sets `start`; second click sets `end`. If the second click is earlier than the first, the two swap automatically.

### Try it live

> The live editor runs with `React` and all Kalyx components in scope, so `import` lines are omitted. Copy them in when porting to your project — see the full imports in the non-live blocks above.

```jsx live
function BasicRange() {
  const [range, setRange] = React.useState({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <div className="kx-live-row">
        <RangePicker.Input part="start" className="kx-live-input" placeholder="Start" />
        <span aria-hidden>→</span>
        <RangePicker.Input part="end" className="kx-live-input" placeholder="End" />
      </div>
      <RangePicker.Popover className="kx-live-popover">
        <RangePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'kx-live-day-range',
            dayRangeStart: 'kx-live-range-start',
            dayRangeEnd: 'kx-live-range-end',
            dayInRange: 'kx-live-inrange',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
            dayDisabled: 'kx-live-disabled',
          }}
        />
      </RangePicker.Popover>
      <div className="kx-live-value">
        <code>{range.start?.slice(0, 10) ?? 'null'}</code> →
        <code>{range.end?.slice(0, 10) ?? 'null'}</code>
      </div>
    </RangePicker>
  );
}
```

<StackBlitzEmbed id="rangepicker-presets" />

## `<RangePicker>` (Root)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `DateRange` | — | Controlled range. |
| `defaultValue` | `DateRange` | — | Uncontrolled initial range. |
| `onChange` | `(range: DateRange) => void` | — | Fires on every change (including partial). |
| `disabled` | `DisabledRule[] \| boolean` | `false` | Disable rules or entire picker. |
| `readOnly` | `boolean` | `false` | Prevents changes. |
| `weekStartsOn` | `0 \| 1` | `0` | Week start. |
| `displayFormat` | `string` | `'yyyy-MM-dd'` | Format string. |
| `locale` | `string` | `'en-US'` | BCP 47 locale. |
| `displayTimezone` | `string` | — | IANA zone. When set, `start`/`end` are civil midnight of the clicked day in this zone. See [Timezone](../concepts/timezone.md). |
| `adapter` | `DateAdapter` | `DateFnsAdapter` | Custom adapter. |
| `labels` | `Partial<RangePickerLabels>` | — | Override ARIA labels. Adds `startInput`, `endInput`, `presetsGroup` on top of DatePicker's label keys. |
| `children` | `ReactNode` | — | Sub-components. |

### `DateRange`

```ts
type DateRange = {
  start: ISODateString | null;
  end: ISODateString | null;
};
```

Kalyx doesn't enforce that `end >= start` while the user is selecting — it auto-swaps on commit. You get both values via `onChange`; the shape is always `{ start, end }`.

## `<RangePicker.Input>`

Two inputs required — one for `start`, one for `end`. The first input rendered acts as the Floating UI reference for the popover.

| Prop | Type | Description |
| --- | --- | --- |
| `part` | `'start' \| 'end'` | **Required.** Which side of the range this input manages. |
| `format` | `string` | Overrides Root's `displayFormat`. |

## `<RangePicker.Popover>`

Same behavior as [`DatePicker.Popover`](./datepicker.md#datepickerpopover). `role="dialog"`, outside-click dismissal, Escape support.

## `<RangePicker.Calendar>`

Month grid with range highlighting.

| Prop | Type | Description |
| --- | --- | --- |
| `classNames` | `RangePickerCalendarClassNames` | Styling. |

```ts
type RangePickerCalendarClassNames = {
  root?: string;
  header?: string;
  title?: string;
  navButton?: string;
  grid?: string;
  gridRow?: string;
  gridCell?: string;
  day?: string;
  daySelected?: string;      // start or end day
  dayInRange?: string;       // days between start and end
  dayToday?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  weekdayHeader?: string;
};
```

### `data-*` attributes

Day buttons emit range-aware state attributes (active-only). See [Styling](../concepts/styling.md).

| Attribute | Active when |
| --- | --- |
| `data-range-start` | Day is the range start. |
| `data-range-end` | Day is the range end. |
| `data-in-range` | Day is strictly between start and end. |
| `data-today` | Day is today. |
| `data-focused` | Day holds keyboard focus. |
| `data-outside-month` | Day belongs to an adjacent month. |

## `<RangePicker.Presets>`

Container for quick-pick buttons.

| Prop | Type | Description |
| --- | --- | --- |
| `classNames` | `RangePickerPresetsClassNames` | Styling. |
| `children` | `ReactNode` | `<RangePicker.Preset>` children. |

```ts
type RangePickerPresetsClassNames = {
  root?: string;
  preset?: string;
  presetActive?: string;
};
```

## `<RangePicker.Preset>`

A single preset button. Provide **either** a built-in `value` key or a custom `range`:

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `PresetKey` | Built-in preset key. |
| `range` | `DateRange` | Custom range (use instead of `value`). |
| `children` | `ReactNode` | Button label. |

### Built-in `PresetKey`

```ts
type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear';
```

## Patterns

### Sidebar presets + calendar

```tsx
<RangePicker value={range} onChange={setRange}>
  <div className="flex gap-2">
    <RangePicker.Input part="start" />
    <RangePicker.Input part="end" />
  </div>
  <RangePicker.Popover className="flex gap-4 p-3">
    <RangePicker.Presets className="flex flex-col gap-1">
      <RangePicker.Preset value="today">Today</RangePicker.Preset>
      <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
      <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
      <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
    </RangePicker.Presets>
    <RangePicker.Calendar />
  </RangePicker.Popover>
</RangePicker>
```

```jsx live
function RangeWithPresets() {
  const [range, setRange] = React.useState({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <div className="kx-live-row">
        <RangePicker.Input part="start" className="kx-live-input" placeholder="Start" />
        <RangePicker.Input part="end" className="kx-live-input" placeholder="End" />
      </div>
      <RangePicker.Popover className="kx-live-popover kx-live-popover--split">
        <RangePicker.Presets
          classNames={{
            root: 'kx-live-presets',
            preset: 'kx-live-preset',
            presetActive: 'kx-live-preset-active',
          }}
        >
          <RangePicker.Preset value="today">Today</RangePicker.Preset>
          <RangePicker.Preset value="yesterday">Yesterday</RangePicker.Preset>
          <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
          <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
          <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
          <RangePicker.Preset value="lastMonth">Last month</RangePicker.Preset>
        </RangePicker.Presets>
        <RangePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            gridCell: 'kx-live-cell',
            weekdayHeader: 'kx-live-weekday',
            day: 'kx-live-day-range',
            dayRangeStart: 'kx-live-range-start',
            dayRangeEnd: 'kx-live-range-end',
            dayInRange: 'kx-live-inrange',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
            dayDisabled: 'kx-live-disabled',
          }}
        />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

### Custom preset

```tsx
<RangePicker.Preset
  range={{
    start: '2026-01-01T00:00:00.000Z',
    end: '2026-06-30T00:00:00.000Z',
  }}>
  H1 2026
</RangePicker.Preset>
```

### Constraining the range

```tsx
<RangePicker
  value={range}
  onChange={setRange}
  disabled={[{ before: '2026-01-01T00:00:00.000Z' }]}>
  ...
</RangePicker>
```

## Event callbacks

| Prop | Signature | Fires when |
| --- | --- | --- |
| `onChange` | `(range: DateRange) => void` | The range changes (start click, end click, preset, input). |
| `onOpenChange` | `(isOpen: boolean) => void` | The popover opens or closes. Not fired on initial mount. |
| `onCalendarNavigate` | `(viewMonth: ISODateString) => void` | The calendar view moves to a different month. Not fired on initial mount. |

## Related

- [DatePicker →](./datepicker.md)
- [WeekPicker →](./weekpicker.md)
- [useRangePicker →](../hooks/use-range-picker.md)
