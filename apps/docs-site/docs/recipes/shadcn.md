---
id: shadcn
title: shadcn/ui
sidebar_position: 2
---

# shadcn/ui

shadcn doesn't ship a DatePicker — its tutorial advises pairing a headless library with a shadcn `Popover` shell. Kalyx slots in cleanly.

## Input + Popover + Calendar

```tsx
'use client';

import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function ShadcnDatePicker() {
  const [date, setDate] = useState<ISODateString | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <div className="flex items-center gap-2">
        <DatePicker.Input asChild>
          <Input placeholder="YYYY-MM-DD" className="w-44" />
        </DatePicker.Input>
        <DatePicker.Trigger asChild>
          <Button variant="outline" size="icon">📅</Button>
        </DatePicker.Trigger>
      </div>

      <DatePicker.Popover
        className={cn(
          'z-50 w-auto p-3 rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
        )}>
        <DatePicker.Calendar
          classNames={{
            header: 'flex items-center justify-between pb-2',
            title: 'text-sm font-medium',
            navButton: cn(
              'inline-flex items-center justify-center rounded-md h-7 w-7',
              'bg-transparent hover:bg-accent hover:text-accent-foreground',
            ),
            weekdayHeader: 'text-muted-foreground text-[0.8rem] font-normal',
            day: cn(
              'inline-flex items-center justify-center rounded-md h-9 w-9 text-sm',
              'hover:bg-accent hover:text-accent-foreground',
              'aria-selected:opacity-100',
            ),
            daySelected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            dayToday: 'bg-accent text-accent-foreground',
            dayDisabled: 'text-muted-foreground opacity-50 pointer-events-none',
            dayOutsideMonth: 'text-muted-foreground opacity-50',
          }}
        />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

:::note
Kalyx's `.Input` and `.Trigger` don't support `asChild` natively (they render actual `<input>` / `<button>`). If you need true `asChild`, wrap your shadcn primitive and pass the className — as above — or drop to `useDatePicker` and render the shadcn pieces directly.
:::

## RangePicker in a shadcn Popover

Using the shadcn `Popover` wrapper instead of Kalyx's popover:

```tsx
'use client';

import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function ShadcnRange() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {range.start ?? 'Start'} → {range.end ?? 'End'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <RangePicker value={range} onChange={setRange}>
          <RangePicker.Calendar
            classNames={{
              day: 'h-9 w-9 rounded-md text-sm hover:bg-accent',
              daySelected: '!bg-primary !text-primary-foreground',
              dayInRange: 'bg-accent text-accent-foreground',
              dayToday: 'ring-1 ring-ring',
              dayDisabled: 'text-muted-foreground opacity-50 pointer-events-none',
              dayOutsideMonth: 'text-muted-foreground opacity-50',
            }}
          />
        </RangePicker>
      </PopoverContent>
    </Popover>
  );
}
```

## Form integration

Pair with `react-hook-form` — see the [React Hook Form recipe →](./react-hook-form.md).

## Related

- [Tailwind →](./tailwind.md)
- [Accessibility →](../concepts/accessibility.md)
