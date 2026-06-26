---
id: internationalization
title: Internationalization (i18n)
sidebar_position: 6
---

# Internationalization (i18n)

Kalyx ships English ARIA labels by default. Override them per-component with the `labels` prop — no external i18n library required.

## How it works

Every Root component (`DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`) accepts a `labels` prop. Pass a **partial** object — only the keys you override are replaced; the rest keep their English defaults.

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  labels={{
    triggerOpen: '캘린더 열기',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
  }}
>
  {/* ... */}
</DatePicker>
```

## Label keys reference

### DatePicker

| Key | Default (English) | Used by |
| --- | --- | --- |
| `triggerOpen` | `"Open calendar"` | Trigger `aria-label` (closed) |
| `triggerClose` | `"Close calendar"` | Trigger `aria-label` (open) |
| `popoverLabel` | `"Choose date"` | Popover `aria-label` |
| `prevMonth` | `"Previous month"` | Calendar nav button |
| `nextMonth` | `"Next month"` | Calendar nav button |
| `prevYear` | `"Previous year"` | Calendar nav button |
| `nextYear` | `"Next year"` | Calendar nav button |
| `prevDecade` | `"Previous decade"` | YearGrid nav button |
| `nextDecade` | `"Next decade"` | YearGrid nav button |

### RangePicker (extends DatePicker)

| Key | Default | Used by |
| --- | --- | --- |
| `popoverLabel` | `"Choose date range"` | Popover `aria-label` |
| `startInput` | `"Start date"` | Start input `aria-label` |
| `endInput` | `"End date"` | End input `aria-label` |
| `presetsGroup` | `"Date range presets"` | Presets group `aria-label` |

### TimePicker

| Key | Default | Used by |
| --- | --- | --- |
| `timeInput` | `"Time"` | Input `aria-label` |
| `hourList` | `"Hour"` | Hour listbox `aria-label` |
| `minuteList` | `"Minute"` | Minute listbox `aria-label` |
| `amPmToggle` | `"AM/PM"` | AM/PM radiogroup `aria-label` |
| `hourOption(h)` | `` `${h} hours` `` | Hour option `aria-label` |
| `minuteOption(m)` | `` `${m} minutes` `` | Minute option `aria-label` |

### DateTimePicker (extends DatePicker + TimePicker)

| Key | Default | Used by |
| --- | --- | --- |
| `dateTimeInput` | `"Date and time"` | Input `aria-label` |

## Reusable locale presets

Create a shared labels file and import it across your app:

```ts title="lib/kalyx-labels.ts"
import type { DatePickerLabels, RangePickerLabels, TimePickerLabels } from '@kalyx/core';

export const ko: DatePickerLabels = {
  triggerOpen: '캘린더 열기',
  triggerClose: '캘린더 닫기',
  popoverLabel: '날짜 선택',
  prevMonth: '이전 달',
  nextMonth: '다음 달',
  prevYear: '이전 년',
  nextYear: '다음 년',
  prevDecade: '이전 10년',
  nextDecade: '다음 10년',
};

export const koRange: RangePickerLabels = {
  ...ko,
  popoverLabel: '날짜 범위 선택',
  startInput: '시작일',
  endInput: '종료일',
  presetsGroup: '날짜 범위 프리셋',
};

export const koTime: TimePickerLabels = {
  timeInput: '시간',
  hourList: '시',
  minuteList: '분',
  amPmToggle: '오전/오후',
  hourOption: (h) => `${h}시`,
  minuteOption: (m) => `${m}분`,
};
```

```tsx title="components/BookingPicker.tsx"
import { ko } from '@/lib/kalyx-labels';

<DatePicker labels={ko} value={date} onChange={setDate}>
  {/* ... */}
</DatePicker>
```

## Japanese example

```ts
import type { DatePickerLabels } from '@kalyx/core';

export const ja: DatePickerLabels = {
  triggerOpen: 'カレンダーを開く',
  triggerClose: 'カレンダーを閉じる',
  popoverLabel: '日付を選択',
  prevMonth: '前月',
  nextMonth: '翌月',
  prevYear: '前年',
  nextYear: '翌年',
  prevDecade: '前の10年',
  nextDecade: '次の10年',
};
```

## Calendar locale (weekday & month names)

Weekday headers and month names use `Intl.DateTimeFormat` under the hood. Pass the `locale` prop (BCP 47 tag) to render them in the target language:

```tsx
<DatePicker locale="ko-KR" labels={ko} value={date} onChange={setDate}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

- `locale` controls **display formatting** (weekday names, month names in the header).
- `labels` controls **ARIA attributes** (screen reader text).

Both are independent — you can use `locale="ko-KR"` with English labels, or vice versa.

## Right-to-left (RTL)

Kalyx renders semantic HTML and reads no layout direction of its own, so RTL "just works" — set `dir="rtl"` on any ancestor (or `<html dir="rtl">`) and the calendar grid, inputs, and popover mirror with the document. Use a matching `locale` (e.g. `ar-EG`) for Arabic weekday / month names.

Toggle the direction below to see the same picker mirror:

```jsx live
function RtlToggle() {
  const [date, setDate] = React.useState(null);
  const [dir, setDir] = React.useState('rtl');
  return (
    <div>
      <button
        className="kx-live-trigger"
        style={{ marginBottom: 12 }}
        onClick={() => setDir((d) => (d === 'rtl' ? 'ltr' : 'rtl'))}>
        dir = {dir} (toggle)
      </button>
      <div dir={dir}>
        <DatePicker value={date} onChange={setDate} locale={dir === 'rtl' ? 'ar-EG' : 'en-US'}>
          <DatePicker.Input className="kx-live-input" placeholder="YYYY-MM-DD" />
          <DatePicker.Popover className="kx-live-popover">
            <DatePicker.Calendar
              classNames={{
                header: 'kx-live-header', title: 'kx-live-title', navButton: 'kx-live-nav',
                grid: 'kx-live-grid', gridCell: 'kx-live-cell', weekdayHeader: 'kx-live-weekday',
                day: 'live-day', daySelected: 'live-day-selected', dayToday: 'live-day-today',
                dayOutsideMonth: 'kx-live-outside',
              }}
            />
          </DatePicker.Popover>
        </DatePicker>
      </div>
    </div>
  );
}
```

The navigation chevrons keep their visual "previous / next" meaning because the whole grid mirrors with `dir` — you don't need to swap them yourself. Provide localized `labels` (see [above](#label-keys-reference)) so screen-reader announcements match the language.

## Next

- [Accessibility →](./accessibility.md)
- [Migration guide (v0.2 → v0.3) →](../migration.md#v02--v03--aria-labels-i18n)
