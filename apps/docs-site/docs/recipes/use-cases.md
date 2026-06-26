---
id: use-cases
title: Use-case recipes
sidebar_position: 0
---

# Use-case recipes

Copy-pasteable solutions to the date-picking problems people actually have. Each recipe is a complete, working component — try it live, then copy the source below it.

These use Tailwind-style class names for brevity, but the only thing that matters is the **composition** and the **props**. Swap in your own classes or the [`classNames` styling contract](../concepts/styling.md).

---

## Date of birth

A birthday picker needs to jump across decades fast — nobody wants to click "previous month" 300 times. Wire `Calendar → MonthGrid → YearGrid` so the title is a drill-up control, and disable future dates.

```jsx live
function DateOfBirth() {
  const [dob, setDob] = React.useState(null);
  const [view, setView] = React.useState('days');
  const today = new Date().toISOString();
  const headerCls = { header: 'kx-live-header', title: 'kx-live-title', navButton: 'kx-live-nav' };
  return (
    <DatePicker
      value={dob}
      onChange={(v) => { setDob(v); setView('days'); }}
      disabled={[{ after: today }]}
    >
      <DatePicker.Input className="kx-live-input" placeholder="YYYY-MM-DD" />
      <DatePicker.Popover className="kx-live-popover">
        {view === 'days' && (
          <DatePicker.Calendar
            onTitleClick={() => setView('months')}
            classNames={{
              ...headerCls, grid: 'kx-live-grid', gridCell: 'kx-live-cell',
              weekdayHeader: 'kx-live-weekday', day: 'live-day',
              daySelected: 'live-day-selected', dayToday: 'live-day-today',
              dayDisabled: 'kx-live-disabled', dayOutsideMonth: 'kx-live-outside',
            }}
          />
        )}
        {view === 'months' && (
          <DatePicker.MonthGrid
            onSelect={() => setView('days')}
            onTitleClick={() => setView('years')}
            classNames={{ ...headerCls, grid: 'kx-live-month-grid', month: 'kx-live-my-cell', monthSelected: 'kx-live-my-selected', monthCurrent: 'kx-live-my-current' }}
          />
        )}
        {view === 'years' && (
          <DatePicker.YearGrid
            onSelect={() => setView('months')}
            classNames={{ ...headerCls, grid: 'kx-live-year-grid', year: 'kx-live-my-cell', yearSelected: 'kx-live-my-selected', yearCurrent: 'kx-live-my-current' }}
          />
        )}
      </DatePicker.Popover>
      <div className="kx-live-value">Born: <code>{dob?.slice(0, 10) ?? 'null'}</code> — tap the title to jump by month / year.</div>
    </DatePicker>
  );
}
```

```tsx title="DateOfBirth.tsx"
import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

export function DateOfBirth() {
  const [dob, setDob] = useState<ISODateString | null>(null);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const today = new Date().toISOString();

  return (
    <DatePicker
      value={dob}
      onChange={(v) => { setDob(v); setView('days'); }}
      disabled={[{ after: today }]} // no future birthdays
    >
      <DatePicker.Input placeholder="YYYY-MM-DD" />
      <DatePicker.Popover>
        {view === 'days' && (
          <DatePicker.Calendar onTitleClick={() => setView('months')} />
        )}
        {view === 'months' && (
          <DatePicker.MonthGrid
            onSelect={() => setView('days')}
            onTitleClick={() => setView('years')}
          />
        )}
        {view === 'years' && (
          <DatePicker.YearGrid onSelect={() => setView('months')} />
        )}
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

**Why this works:** the title becomes a drill-up control (`onTitleClick`), and each grid's `onSelect` drills back down. `disabled={[{ after: today }]}` blocks future dates without a `maxDate` prop. See [DatePicker → Month / Year navigation](../components/datepicker.md#month--year-navigation).

---

## Booking range with presets

A reservation flow wants a start/end range *and* one-tap common ranges. Combine `RangePicker.Presets` with the range calendar; presets commit and close.

```jsx live
function BookingRange() {
  const [range, setRange] = React.useState({ start: null, end: null });
  const iso = (d) => { const x = new Date(); x.setUTCHours(0,0,0,0); x.setUTCDate(x.getUTCDate() + d); return x.toISOString(); };
  return (
    <RangePicker value={range} onChange={setRange}>
      <div className="kx-live-row">
        <RangePicker.Input part="start" className="kx-live-input" placeholder="Check-in" />
        <span aria-hidden>→</span>
        <RangePicker.Input part="end" className="kx-live-input" placeholder="Check-out" />
      </div>
      <RangePicker.Popover className="kx-live-popover">
        <RangePicker.Presets className="kx-live-presets">
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(2) }}>Weekend</RangePicker.Preset>
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(6) }}>1 week</RangePicker.Preset>
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(13) }}>2 weeks</RangePicker.Preset>
        </RangePicker.Presets>
        <RangePicker.Calendar
          classNames={{
            header: 'kx-live-header', title: 'kx-live-title', navButton: 'kx-live-nav',
            grid: 'kx-live-grid', gridCell: 'kx-live-cell', weekdayHeader: 'kx-live-weekday',
            day: 'kx-live-day-range', dayRangeStart: 'kx-live-range-start',
            dayRangeEnd: 'kx-live-range-end', dayInRange: 'kx-live-inrange',
            dayToday: 'live-day-today', dayOutsideMonth: 'kx-live-outside',
          }}
        />
      </RangePicker.Popover>
      <div className="kx-live-value">
        <code>{range.start?.slice(0, 10) ?? 'null'}</code> → <code>{range.end?.slice(0, 10) ?? 'null'}</code>
      </div>
    </RangePicker>
  );
}
```

```tsx title="BookingRange.tsx"
import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';

const day = (offset: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString();
};

export function BookingRange() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <RangePicker value={range} onChange={setRange}>
      <RangePicker.Input part="start" placeholder="Check-in" />
      <RangePicker.Input part="end" placeholder="Check-out" />
      <RangePicker.Popover>
        <RangePicker.Presets>
          <RangePicker.Preset range={{ start: day(0), end: day(2) }}>Weekend</RangePicker.Preset>
          <RangePicker.Preset range={{ start: day(0), end: day(6) }}>1 week</RangePicker.Preset>
          <RangePicker.Preset range={{ start: day(0), end: day(13) }}>2 weeks</RangePicker.Preset>
        </RangePicker.Presets>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

**Why this works:** each `RangePicker.Preset` takes a `range={{ start, end }}` of ISO-UTC strings, commits both ends, and closes the popover. Active presets get `data-active` so you can highlight the current selection. See [RangePicker → Presets](../components/rangepicker.md).

---

## DateTime with a fixed timezone

Scheduling UIs must store an unambiguous instant while *showing* a specific civil time. Set `displayTimezone` — the Input and Calendar render in that zone, but `onChange` still emits a UTC instant.

```jsx live
function MeetingTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={30} displayTimezone="Asia/Seoul">
      <DateTimePicker.Input className="kx-live-input" placeholder="Pick a meeting time (KST)" />
      <DateTimePicker.Popover className="kx-live-popover kx-live-popover--split">
        <DateTimePicker.Calendar
          classNames={{
            header: 'kx-live-header', title: 'kx-live-title', navButton: 'kx-live-nav',
            grid: 'kx-live-grid', gridCell: 'kx-live-cell', weekdayHeader: 'kx-live-weekday',
            day: 'live-day', daySelected: 'live-day-selected', dayToday: 'live-day-today',
            dayOutsideMonth: 'kx-live-outside',
          }}
        />
        <div className="kx-live-stack">
          <DateTimePicker.HourList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
          <DateTimePicker.MinuteList classNames={{ root: 'kx-live-list', option: 'kx-live-option', optionSelected: 'kx-live-option-selected' }} />
        </div>
      </DateTimePicker.Popover>
      <div className="kx-live-value">UTC stored: <code>{dt ?? 'null'}</code></div>
    </DateTimePicker>
  );
}
```

```tsx title="MeetingTime.tsx"
import { useState } from 'react';
import { DateTimePicker, type ISODateString } from '@kalyx/react';

export function MeetingTime() {
  const [dt, setDt] = useState<ISODateString | null>(null);
  return (
    <DateTimePicker
      value={dt}
      onChange={setDt}      // always a UTC ISO string
      format="24h"
      step={30}
      displayTimezone="Asia/Seoul" // shown as KST, stored as UTC
    >
      <DateTimePicker.Input placeholder="Pick a meeting time (KST)" />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

**Why this works:** `displayTimezone` separates *display* from *storage*. The user picks 14:00 KST; `onChange` receives the matching UTC instant (`05:00Z`). No off-by-one bugs. See [Timezone](../concepts/timezone.md) and [DateTimePicker](../components/datetimepicker.md).

---

## More

- [DatePicker patterns](../components/datepicker.md#patterns) — form submission, min/max via `disabled`.
- [React Hook Form](./react-hook-form.md) — controlled integration with validation.
- [Tailwind](./tailwind.md) / [shadcn](./shadcn.md) — full styling walkthroughs.
