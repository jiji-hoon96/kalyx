---
id: tailwind
title: Tailwind CSS
sidebar_position: 1
---

# Tailwind CSS

Kalyx에는 내장 스타일이 없으므로 Tailwind와 자연스럽게 어울립니다. 모든 컴포넌트는 `classNames` 슬롯 맵을 노출하거나 `className`을 그대로 전달합니다.

## 풀 기능 DatePicker

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

## 프리셋이 있는 RangePicker

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
      <RangePicker.Preset value="today">오늘</RangePicker.Preset>
      <RangePicker.Preset value="last7days">지난 7일</RangePicker.Preset>
      <RangePicker.Preset value="last30days">지난 30일</RangePicker.Preset>
      <RangePicker.Preset value="thisMonth">이번 달</RangePicker.Preset>
      <RangePicker.Preset value="lastMonth">지난 달</RangePicker.Preset>
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

## 디자인 토큰 팁

- `!` 변형은 Kalyx가 자체 디폴트를 넣는 곳 (예: `daySelected`)에만 사용.
- 원시 색상 대신 의미적 토큰 (`bg-primary`, `text-on-primary`)을 써야 두 테마가 함께 따라옵니다.
- Kalyx가 모든 슬롯에 ARIA 속성을 붙이므로, 추가 클래스 대신 속성을 직접 타깃해도 됩니다.

```css
[aria-selected='true'] { @apply bg-indigo-600 text-white; }
[aria-disabled='true'] { @apply pointer-events-none opacity-40; }
```

## 다음

- [shadcn/ui →](./shadcn.md)
- [React Hook Form →](./react-hook-form.md)
