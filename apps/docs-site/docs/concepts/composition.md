---
id: composition
title: Composition API
sidebar_position: 1
---

# Composition API

Kalyx is built around **composition over configuration**. Every picker is a small tree of primitives you arrange yourself.

## The anatomy

```tsx
<DatePicker value={...} onChange={...}>     {/* Root — holds state & context */}
  <DatePicker.Input />                       {/* Text input, parses typed dates */}
  <DatePicker.Trigger />                     {/* Calendar icon button */}
  <DatePicker.Popover>                       {/* Floating UI positioned portal */}
    <DatePicker.Calendar />                  {/* Month grid */}
    <DatePicker.MonthGrid />                 {/* (optional) quick month jump */}
    <DatePicker.YearGrid />                  {/* (optional) quick year jump */}
  </DatePicker.Popover>
</DatePicker>
```

Each leaf renders a single HTML element and takes its standard props (`className`, `ref`, `aria-*`, event handlers, etc.) plus a `classNames` map for internal slots.

## Why composition instead of props

Most DatePicker libraries grow props into a laundry list:

```tsx
// A different library — every feature is a new prop
<DatePicker
  showTimeSelect
  showMonthDropdown
  showYearDropdown
  renderCustomHeader={fn}
  excludeDates={[]}
  highlightDates={[]}
  {/* ...90 more */}
/>
```

Kalyx does the opposite — if you want a month dropdown, you mount one:

```tsx
<DatePicker.Popover>
  <DatePicker.Calendar onTitleClick={() => setView('months')} />
  {view === 'months' && <DatePicker.MonthGrid onSelect={() => setView('days')} />}
</DatePicker.Popover>
```

This means:

1. **You pay for what you render.** Tree-shaking removes what isn't on the page.
2. **No hidden state.** The structure of the tree *is* the feature set.
3. **Style per slot.** Every primitive is a DOM element you can target.

## Dot notation

Sub-components are attached to the Root via `Object.assign`:

```tsx
import { DatePicker } from '@kalyx/react';

DatePicker.Input;      // <input>
DatePicker.Trigger;    // <button>
DatePicker.Popover;    // <div role="dialog">
DatePicker.Calendar;   // <table role="grid">
DatePicker.MonthGrid;  // <div>
DatePicker.YearGrid;   // <div>
```

The same pattern applies to every family:

| Root | Sub-components |
| --- | --- |
| `<DatePicker>` | `.Input`, `.Trigger`, `.Popover`, `.Calendar`, `.MonthGrid`, `.YearGrid` |
| `<RangePicker>` | `.Input`, `.Popover`, `.Calendar`, `.Presets`, `.Preset` |
| `<TimePicker>` | `.Input`, `.HourList`, `.MinuteList`, `.AmPmToggle` |
| `<DateTimePicker>` | `.Input`, `.Popover`, `.Calendar`, `.HourList`, `.MinuteList`, `.AmPmToggle`, `.MonthGrid`, `.YearGrid` |

## Skipping slots

Every slot is optional. These are all valid DatePickers:

```tsx
{/* Just an input — no popover */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Input />
</DatePicker>

{/* Calendar-only, no input */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Calendar />
</DatePicker>

{/* Button that opens a calendar */}
<DatePicker value={v} onChange={setV}>
  <DatePicker.Trigger>Pick a date</DatePicker.Trigger>
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

## Going fully custom

When no combination of slots fits, drop down to the hook and render the exact markup you want:

```tsx
import { useDatePicker } from '@kalyx/react';

function MyPicker() {
  const { calendar, selectDate, previousMonth, nextMonth } = useDatePicker();

  return (
    <div>
      <button onClick={previousMonth}>◀</button>
      <button onClick={nextMonth}>▶</button>
      {calendar.flat().map((day) => (
        <button
          key={day.isoString}
          disabled={day.isDisabled}
          onClick={() => selectDate(day.isoString)}>
          {day.dayNumber}
        </button>
      ))}
    </div>
  );
}
```

See [useDatePicker →](../hooks/use-date-picker.md).

## Next

- [ISO strings as values →](./iso-string.md)
- [SSR safety →](./ssr.md)
- [Accessibility →](./accessibility.md)
