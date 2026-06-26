---
id: styling
title: Styling
sidebar_position: 2
---

# Styling

Kalyx ships **zero CSS**. Every part renders semantic, unstyled HTML and exposes two styling contracts:

1. **`classNames` prop** — a typed map of slot names → class strings, on each sub-component.
2. **`data-*` state attributes** — emitted on interactive elements so you can style by state in CSS / Tailwind without re-rendering.

Either works alone; combine them when you want a stable class plus state-based variants.

## 1. The `classNames` prop

Every sub-component accepts a `classNames` object keyed by internal slot. Pass only the slots you care about.

```tsx
<DatePicker.Calendar
  classNames={{
    grid: 'grid grid-cols-7 gap-1',
    day: 'rounded p-2 hover:bg-gray-100',
    daySelected: 'bg-blue-600 text-white',
    dayToday: 'ring-1 ring-blue-400',
    dayDisabled: 'opacity-40 cursor-not-allowed',
    dayOutsideMonth: 'text-gray-300',
  }}
/>
```

Slot keys are documented per sub-component on each [component page](../components/datepicker.md). The state slots (`daySelected`, `dayToday`, …) are applied **in addition to** the base slot (`day`) when that state is active — so a selected day gets both `day` and `daySelected` classes.

## 2. `data-*` state attributes

For Tailwind (`data-[selected]:…`) or plain CSS attribute selectors, every stateful element also carries `data-*` attributes. They are **present only when the state is active** (omitted otherwise — never `data-selected="false"`), so `[data-selected]` is a reliable selector.

```css
/* plain CSS */
.day[data-selected] { background: #2563eb; color: white; }
.day[data-today]    { outline: 1px solid #60a5fa; }
.day[data-in-range] { background: #dbeafe; }
```

```tsx
/* Tailwind v3.1+ data variants — no classNames needed */
<DatePicker.Calendar
  classNames={{
    day: 'rounded p-2 data-[selected]:bg-blue-600 data-[selected]:text-white data-[today]:ring-1',
  }}
/>
```

### Attribute reference

These are the attributes Kalyx emits. `disabled` days use the native `disabled` attribute **and** `aria-disabled` (not a `data-*` flag), so style them with `:disabled` or the `dayDisabled` slot.

#### Calendar day cells

| Attribute | Emitted by | Active when |
| --- | --- | --- |
| `data-focused` | `DatePicker` / `RangePicker` / `WeekPicker` / `DateTimePicker` `.Calendar` | Day holds keyboard focus (roving tabindex). |
| `data-selected` | `DatePicker` / `DateTimePicker` `.Calendar` | Day is the selected date. |
| `data-today` | all `.Calendar` | Day is today (in `displayTimezone` if set). |
| `data-outside-month` | all `.Calendar` | Day pads the 6-week view from an adjacent month. |
| `data-range-start` | `RangePicker` / `WeekPicker` `.Calendar` | Day is the range's start. |
| `data-range-end` | `RangePicker` / `WeekPicker` `.Calendar` | Day is the range's end. |
| `data-in-range` | `RangePicker` / `WeekPicker` `.Calendar` | Day is strictly between start and end. |
| `data-week-number` | all `.Calendar` (on the row `<th>`) | Present when week numbers are shown. |

#### Month / year cells

| Attribute | Emitted by | Active when |
| --- | --- | --- |
| `data-selected` | `DatePicker.MonthGrid` / `.YearGrid`, `MonthPicker.Grid`, `YearPicker.Grid` | Cell is the selected month / year. |
| `data-current` | same as above | Cell is the current month / year (today). |
| `data-focused` | same as above | Cell holds keyboard focus. |

#### Time cells

| Attribute | Emitted by | Active when |
| --- | --- | --- |
| `data-selected` | `TimePicker.HourList` / `.MinuteList` / `.AmPmToggle` (and `DateTimePicker` equivalents) | The hour / minute / meridiem is the current value. |

#### Presets & inputs

| Attribute | Emitted by | Active when |
| --- | --- | --- |
| `data-active` | `DatePicker` / `RangePicker` / `DateTimePicker` `.Preset` | The preset's resolved date matches the current value. |
| `data-part` | `RangePicker` / `WeekPicker` `.Input` | Always — value is `"start"` or `"end"`, to target each input. |

## Which should I use?

- **Static look** → `classNames` base slots (`day`, `grid`, …).
- **State variants in Tailwind** → `data-[selected]:` / `data-[today]:` utilities inside a single slot class.
- **Plain CSS / design tokens** → `data-*` attribute selectors in your stylesheet.

See the [Tailwind recipe](../recipes/tailwind.md) and [shadcn recipe](../recipes/shadcn.md) for end-to-end examples.
