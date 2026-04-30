---
id: tailwind
title: Tailwind CSS
sidebar_position: 1
---

# Tailwind CSS

Kalyx has no built-in styles — Tailwind is a natural pairing. Every component exposes either a `classNames` slot map or forwards `className` directly.

## Live preview

Tailwind is loaded via its Play CDN, scoped to the `tw-enable` wrapper, so every Tailwind utility you write below is rendered with the real `tailwindcss` at runtime.

```jsx live
function TailwindDate() {
  const [date, setDate] = React.useState(null);
  return (
    <div className="tw-enable">
      <DatePicker value={date} onChange={setDate}>
        <div className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900">
          <DatePicker.Input
            className="w-36 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 dark:text-neutral-100 dark:placeholder-neutral-500"
            placeholder="YYYY-MM-DD"
          />
          <DatePicker.Trigger
            className="inline-flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Open calendar"
          >
            📅
          </DatePicker.Trigger>
        </div>

        <DatePicker.Popover className="z-50 mt-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:ring-white/10">
          <DatePicker.Calendar
            classNames={{
              root: 'space-y-3',
              header: 'flex items-center justify-between',
              title: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100',
              navButton: 'inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              grid: 'w-full border-separate border-spacing-1',
              gridCell: 'p-0 text-center',
              weekdayHeader: 'pb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400',
              day: 'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
              daySelected: '!bg-indigo-600 !text-white hover:!bg-indigo-700 !font-semibold',
              dayToday: '!font-semibold !text-indigo-600 dark:!text-indigo-400',
              dayDisabled: 'opacity-30 pointer-events-none',
              dayOutsideMonth: 'text-neutral-300 dark:text-neutral-600',
            }}
          />
        </DatePicker.Popover>
      </DatePicker>
    </div>
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
    <div className="tw-enable">
      <RangePicker value={range} onChange={setRange}>
        <div className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900">
          <RangePicker.Input
            part="start"
            className="w-28 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 dark:text-neutral-100 dark:placeholder-neutral-500"
            placeholder="Start"
          />
          <span className="text-neutral-400 dark:text-neutral-500">→</span>
          <RangePicker.Input
            part="end"
            className="w-28 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 dark:text-neutral-100 dark:placeholder-neutral-500"
            placeholder="End"
          />
        </div>

        <RangePicker.Popover className="z-50 mt-2 flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:ring-white/10">
          <RangePicker.Presets
            classNames={{
              root: 'flex flex-col gap-0.5 border-r border-neutral-200 pr-4 text-sm min-w-[7.5rem] dark:border-neutral-800',
              preset: 'rounded-md px-2.5 py-1.5 text-left text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
              presetActive: '!bg-indigo-50 !text-indigo-700 !font-medium dark:!bg-indigo-950/60 dark:!text-indigo-300',
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
              root: 'space-y-3',
              header: 'flex items-center justify-between',
              title: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100',
              navButton: 'inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              grid: 'w-full',
              gridCell: 'p-0 text-center',
              weekdayHeader: 'pb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400',
              day: 'inline-flex h-8 w-8 items-center justify-center text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
              dayRangeStart: '!bg-indigo-600 !text-white !rounded-l-full hover:!bg-indigo-700',
              dayRangeEnd: '!bg-indigo-600 !text-white !rounded-r-full hover:!bg-indigo-700',
              dayInRange: '!bg-indigo-50 !text-indigo-900 dark:!bg-indigo-950/60 dark:!text-indigo-200',
              dayToday: '!font-semibold !text-indigo-600 dark:!text-indigo-400',
              dayDisabled: 'opacity-30 pointer-events-none',
              dayOutsideMonth: 'text-neutral-300 dark:text-neutral-600',
            }}
          />
        </RangePicker.Popover>
      </RangePicker>
    </div>
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
    <div className="tw-enable">
      <TimePicker value={time} onChange={setTime} format="12h" step={15}>
        <TimePicker.Input className="w-24 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900" />
        <div className="mt-2 flex gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 p-2">
          <TimePicker.HourList
            classNames={{
              root: 'h-40 overflow-y-auto text-sm list-none m-0 p-1',
              option: 'cursor-pointer rounded px-3 py-1 text-center hover:bg-neutral-100 dark:hover:bg-neutral-800 list-none',
              optionSelected: '!bg-indigo-600 !text-white',
            }}
          />
          <TimePicker.MinuteList
            classNames={{
              root: 'h-40 overflow-y-auto text-sm list-none m-0 p-1',
              option: 'cursor-pointer rounded px-3 py-1 text-center hover:bg-neutral-100 dark:hover:bg-neutral-800 list-none',
              optionSelected: '!bg-indigo-600 !text-white',
            }}
          />
          <TimePicker.AmPmToggle
            classNames={{
              root: 'flex flex-col gap-1',
              button: 'rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs',
              buttonSelected: '!bg-indigo-600 !text-white !border-indigo-600',
            }}
          />
        </div>
      </TimePicker>
    </div>
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
