---
id: shadcn
title: shadcn/ui
sidebar_position: 2
description: 'shadcn/ui 의 class variant 를 빌려 같은 외형을 만들고, shadcn Popover 안에 Kalyx 를 조합합니다.'
---

# shadcn/ui

shadcn은 DatePicker를 직접 제공하지 않습니다 — 튜토리얼에서 "headless 라이브러리를 shadcn `Popover` 껍질에 끼워 쓰라"고 안내합니다. Kalyx가 딱 맞습니다.

## Input + Popover + Calendar

```tsx
'use client';

import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';
import { buttonVariants } from '@/components/ui/button';
import { inputVariants } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function ShadcnDatePicker() {
  const [date, setDate] = useState<ISODateString | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <div className="flex items-center gap-2">
        {/* Kalyx 에는 `asChild` 가 없다. `.Input` 은 실제 <input>, `.Trigger` 는 실제
            <button> 을 렌더하므로 shadcn 의 엘리먼트가 아니라 클래스를 빌려 쓴다. */}
        <DatePicker.Input placeholder="YYYY-MM-DD" className={cn(inputVariants(), 'w-44')} />
        <DatePicker.Trigger className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
          📅
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
Kalyx의 `.Input`과 `.Trigger`는 `asChild`를 네이티브로 지원하지 않습니다 (실제 `<input>` / `<button>`을 렌더). 진짜 `asChild`가 필요하면 위처럼 shadcn 프리미티브를 래핑해 className을 넘기거나, `useDatePicker`로 내려가서 shadcn 파츠를 직접 렌더하세요.
:::

## shadcn Popover 안에 RangePicker

Kalyx popover 대신 shadcn `Popover`를 쓰는 버전:

```tsx
'use client';

import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { buttonVariants } from '@/components/ui/button';

export function ShadcnRange() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {range.start ?? '시작'} → {range.end ?? '종료'}
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

## 폼 연동

`react-hook-form`과 짝 지워 쓰세요 — [React Hook Form 레시피 →](./react-hook-form.md).

## 관련

- [Tailwind →](./tailwind.md)
- [접근성 →](../concepts/accessibility.md)
