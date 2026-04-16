---
id: tailwind
title: Tailwind CSS
sidebar_position: 1
---

# Tailwind CSS

Kalyx has no built-in styles — Tailwind is a natural pairing. Every component exposes either a `classNames` slot map or forwards `className` directly.

## Live preview

The live editor below can't import Tailwind at runtime, so it renders a visually-equivalent version using the docs site's CSS variables. The Tailwind source (including dark-mode tokens) is right underneath.

```jsx live
function TailwindLike() {
  const [date, setDate] = React.useState(null);
  return (
    <DatePicker value={date} onChange={setDate}>
      <div className="kx-live-tw-field">
        <DatePicker.Input className="kx-live-tw-input" placeholder="YYYY-MM-DD" />
        <DatePicker.Trigger className="kx-live-trigger" aria-label="Open calendar" />
      </div>
      <DatePicker.Popover className="kx-live-popover">
        <DatePicker.Calendar
          classNames={{
            header: 'kx-live-header',
            title: 'kx-live-title',
            navButton: 'kx-live-nav',
            grid: 'kx-live-grid',
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayToday: 'live-day-today',
            dayDisabled: 'kx-live-disabled',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

## Full-featured DatePicker

```tsx
import { DatePicker } from '@kalyx/react';

<DatePicker value={iso} onChange={setIso}>
  <div className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900">
    <DatePicker.Input
      className="w-40 bg-transparent outline-none text-sm text-neutral-900 dark:text-neutral-100"
      placeholder="YYYY-MM-DD"
    />
    <DatePicker.Trigger
      className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    />
  </div>

  <DatePicker.Popover
    className="z-50 mt-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
    <DatePicker.Calendar
      classNames={{
        root: 'space-y-2',
        header: 'flex items-center justify-between mb-1',
        title: 'text-sm font-semibold',
        navButton: 'rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        grid: 'w-full border-separate border-spacing-0.5',
        gridRow: '',
        gridCell: '',
        weekdayHeader: 'text-xs font-medium text-neutral-500',
        day: 'h-8 w-8 rounded-md text-sm text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800',
        daySelected: '!bg-indigo-600 !text-white hover:!bg-indigo-700',
        dayToday: 'ring-1 ring-indigo-400',
        dayDisabled: 'opacity-40 pointer-events-none',
        dayOutsideMonth: 'text-neutral-400 dark:text-neutral-600',
      }}
    />
  </DatePicker.Popover>
</DatePicker>
```

## RangePicker with presets

```jsx live
function TailwindRange() {
  const [range, setRange] = React.useState({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <div className="kx-live-row">
        <RangePicker.Input part="start" className="kx-live-input" placeholder="Start" />
        <span aria-hidden>→</span>
        <RangePicker.Input part="end" className="kx-live-input" placeholder="End" />
      </div>
      <RangePicker.Popover
        className="kx-live-popover"
        style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
      >
        <RangePicker.Presets
          classNames={{
            root: 'kx-live-presets',
            preset: 'kx-live-preset',
            presetActive: 'kx-live-preset-active',
          }}
        >
          <RangePicker.Preset value="today">Today</RangePicker.Preset>
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
            weekdayHeader: 'kx-live-weekday',
            day: 'live-day',
            daySelected: 'live-day-selected',
            dayInRange: 'kx-live-inrange',
            dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

```tsx
<RangePicker value={range} onChange={setRange}>
  <div className="flex items-center gap-2">
    <RangePicker.Input
      part="start"
      className="w-32 rounded-md border px-3 py-1.5 text-sm"
    />
    <span className="text-neutral-400">→</span>
    <RangePicker.Input
      part="end"
      className="w-32 rounded-md border px-3 py-1.5 text-sm"
    />
  </div>

  <RangePicker.Popover className="flex gap-3 rounded-xl border bg-white p-3 shadow-xl">
    <RangePicker.Presets
      classNames={{
        root: 'flex flex-col gap-0.5 border-r pr-3 text-sm',
        preset: 'rounded px-2 py-1 text-left hover:bg-neutral-100',
        presetActive: '!bg-indigo-50 !text-indigo-700 font-medium',
      }}>
      <RangePicker.Preset value="today">Today</RangePicker.Preset>
      <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
      <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
      <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
      <RangePicker.Preset value="lastMonth">Last month</RangePicker.Preset>
    </RangePicker.Presets>

    <RangePicker.Calendar
      classNames={{
        day: 'h-8 w-8 rounded-md text-sm hover:bg-neutral-100',
        daySelected: '!bg-indigo-600 !text-white',
        dayInRange: 'bg-indigo-50 text-indigo-900',
        dayToday: 'ring-1 ring-indigo-400',
        dayDisabled: 'opacity-40 pointer-events-none',
        dayOutsideMonth: 'text-neutral-400',
      }}
    />
  </RangePicker.Popover>
</RangePicker>
```

## TimePicker (12h)

```jsx live
function TailwindTime() {
  const [time, setTime] = React.useState(null);
  return (
    <TimePicker value={time} onChange={setTime} format="12h" step={15}>
      <TimePicker.Input className="kx-live-input" style={{ minWidth: '6rem' }} />
      <div
        className="kx-live-row"
        style={{
          marginTop: 8,
          padding: 8,
          border: '1px solid var(--kalyx-border)',
          borderRadius: 8,
        }}
      >
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

```tsx
<TimePicker value={time} onChange={setTime} format="12h" step={15}>
  <TimePicker.Input className="w-24 rounded-md border px-3 py-1.5 text-sm" />
  <div className="mt-2 flex gap-2 rounded-md border p-2">
    <TimePicker.HourList
      classNames={{
        root: 'h-32 overflow-y-auto text-sm',
        option: 'cursor-pointer rounded px-3 py-1 hover:bg-neutral-100',
        optionSelected: '!bg-indigo-600 !text-white',
      }}
    />
    <TimePicker.MinuteList
      classNames={{
        root: 'h-32 overflow-y-auto text-sm',
        option: 'cursor-pointer rounded px-3 py-1 hover:bg-neutral-100',
        optionSelected: '!bg-indigo-600 !text-white',
      }}
    />
    <TimePicker.AmPmToggle
      classNames={{
        root: 'flex flex-col gap-1',
        button: 'rounded border px-2 py-1 text-xs',
        buttonSelected: '!bg-indigo-600 !text-white !border-indigo-600',
      }}
    />
  </div>
</TimePicker>
```

## Design-token tips

- Use `!` modifiers sparingly — only where Kalyx applies defaults that compete (e.g., `daySelected`).
- Prefer semantic tokens (`bg-primary`, `text-on-primary`) over raw colors so both themes follow automatically.
- Kalyx passes ARIA attributes on every slot — target them directly instead of adding extra classes:

```css
[aria-selected='true'] { @apply bg-indigo-600 text-white; }
[aria-disabled='true'] { @apply pointer-events-none opacity-40; }
```

## Next

- [shadcn/ui →](./shadcn.md)
- [React Hook Form →](./react-hook-form.md)
