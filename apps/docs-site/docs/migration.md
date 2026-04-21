---
id: migration
title: Migration guide
sidebar_position: 20
---

# Migration guide

How to move to Kalyx from the three libraries you're most likely coming from.

## From `react-datepicker`

`react-datepicker` uses a single component with dozens of props — Kalyx splits each into a sub-component.

### Before

```tsx
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

<DatePicker
  selected={date}
  onChange={setDate}
  showMonthDropdown
  showYearDropdown
  dateFormat="yyyy-MM-dd"
/>
```

### After

```tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

const [view, setView] = useState<'days' | 'months' | 'years'>('days');

<DatePicker
  value={date ? date.toISOString() : null}
  onChange={(iso) => setDate(iso ? new Date(iso) : null)}
  displayFormat="yyyy-MM-dd">
  <DatePicker.Input />
  <DatePicker.Popover>
    {view === 'days' && <DatePicker.Calendar onTitleClick={() => setView('months')} />}
    {view === 'months' && <DatePicker.MonthGrid onSelect={() => setView('days')} onTitleClick={() => setView('years')} />}
    {view === 'years' && <DatePicker.YearGrid onSelect={() => setView('months')} />}
  </DatePicker.Popover>
</DatePicker>
```

Key translations:

| `react-datepicker` | Kalyx |
| --- | --- |
| `selected` / `onChange` (`Date`) | `value` / `onChange` (`ISODateString \| null`) |
| `minDate` / `maxDate` | `disabled={[{ before }, { after }]}` |
| `excludeDates={[d1, d2]}` | `disabled={[{ date: d1 }, { date: d2 }]}` |
| `showMonthDropdown` | Mount `<DatePicker.MonthGrid>` |
| `showYearDropdown` | Mount `<DatePicker.YearGrid>` |
| `dateFormat` | `displayFormat` |
| `locale` | `locale` (BCP 47 tag) |
| CSS import | Remove — no stylesheet needed |

### TimePicker translation

`react-datepicker`'s `showTimeSelect` becomes a dedicated component:

```tsx
// Before
<DatePicker selected={dt} onChange={setDt} showTimeSelect />

// After
<DateTimePicker value={iso} onChange={setIso}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList />
  </DateTimePicker.Popover>
</DateTimePicker>
```

## From `react-day-picker`

Already composition-based — the mapping is mostly renames.

| `react-day-picker` | Kalyx |
| --- | --- |
| `<DayPicker mode="single">` | `<DatePicker>` + `<DatePicker.Calendar>` |
| `<DayPicker mode="range">` | `<RangePicker>` + `<RangePicker.Calendar>` |
| `selected` (`Date`) | `value` (`ISODateString`) |
| `onSelect` | `onChange` |
| `disabled` matcher | `DisabledRule[]` — same shape for `before`/`after`/`dayOfWeek` |
| `classNames` | `classNames` (different keys, see [DatePicker](./components/datepicker.md)) |

`react-day-picker` doesn't ship Input/TimePicker — that's the gap Kalyx fills. If you were pairing `react-day-picker` with a separate text input and a time component, you can collapse both into `<DatePicker.Input>` + `<DatePicker.TimePicker>` or move to `<DateTimePicker>`.

## From React Aria's `DatePicker`

React Aria is the closest in philosophy but forces `@internationalized/date` throughout. Kalyx uses plain ISO strings.

| React Aria | Kalyx |
| --- | --- |
| `CalendarDate`, `DateValue` | `ISODateString` |
| `useDatePicker` | `useDatePicker` (different return shape — see [hook docs](./hooks/use-date-picker.md)) |
| `<DatePicker>` + `<Group>` + `<DateInput>` + `<Popover>` + `<Calendar>` | `<DatePicker>` + `<DatePicker.Input>` + `<DatePicker.Popover>` + `<DatePicker.Calendar>` |

Conversion shim:

```ts
import { parseDate, type CalendarDate } from '@internationalized/date';

const toAria = (iso: ISODateString | null): CalendarDate | null =>
  iso ? parseDate(iso.slice(0, 10)) : null;

const toISO = (cal: CalendarDate | null): ISODateString | null =>
  cal ? new Date(Date.UTC(cal.year, cal.month - 1, cal.day)).toISOString() : null;
```

## v0.2 → v0.3 — ARIA labels i18n

v0.3 changes the default ARIA labels from Korean to English. If your app targets Korean users, restore the labels with the `labels` prop.

### Breaking change

All hardcoded Korean aria-labels (`"캘린더 열기"`, `"이전 달"`, etc.) are now English by default.

### Restore Korean labels

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  labels={{
    triggerOpen: '캘린더 열기',
    triggerClose: '캘린더 닫기',
    popoverLabel: '날짜 선택',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
    prevYear: '이전 년',
    nextYear: '다음 년',
    prevDecade: '이전 10년',
    nextDecade: '다음 10년',
  }}
>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

You only need to override the keys you care about — unspecified keys keep the English defaults.

For the full key reference and reusable locale presets, see the [Internationalization guide](./concepts/internationalization.md).

## v0.3 → v0.4 — adding `displayTimezone`

v0.4 introduces `displayTimezone` on all four pickers (plus the matching hooks). No breaking changes — omitting the prop keeps v0.3 semantics. Adopt it when the user's displayed zone differs from the server runtime, or when you want an explicit barrier against "day off by one" bugs.

### Before (v0.3, implicit UTC / runtime local)

```tsx
<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

### After (v0.4)

```tsx
<DatePicker
  value={iso}
  onChange={setIso}
  displayTimezone={user.timezone ?? 'UTC'}
>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

The ISO contract does not change. What *does* change with the prop set:

- The `Input` formats the value in `displayTimezone`.
- The `Calendar` highlights today / selected by civil-day equality in the zone.
- `onChange` on a calendar click now emits the civil midnight of the clicked day *in the zone* (not UTC midnight of the clicked cell).
- `TimePicker` / `DateTimePicker` hour+minute controls read and write time-of-day as observed in the zone, DST-aware.

Custom `DateAdapter` implementations should honor the `timezone?: string` argument on `format`, `isSameDay`, `startOfDay`, and `today` — the built-in `DateFnsAdapter` already does.

See the [Timezone concept page](./concepts/timezone.md) for the full story.

## General checklist

When migrating:

1. Replace all `Date` props with ISO strings.
2. Remove CSS imports from the old library.
3. Translate feature flags into mounted sub-components.
4. Copy custom styling onto `classNames` slot maps.
5. Test SSR rendering and form submission.
6. Run axe against the new component — styling changes can regress contrast.

## Getting help

- Open an issue at [github.com/jiji-hoon96/kalyx/issues](https://github.com/jiji-hoon96/kalyx/issues)
- Check existing [Discussions](https://github.com/jiji-hoon96/kalyx/discussions)
