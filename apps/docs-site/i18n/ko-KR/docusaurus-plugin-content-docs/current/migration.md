---
id: migration
title: 마이그레이션 가이드
sidebar_position: 20
---

# 마이그레이션 가이드

Kalyx로 이전할 때 가장 많이 오는 세 라이브러리별 전환 가이드입니다.

## `react-datepicker`에서

`react-datepicker`는 props가 수십 개인 단일 컴포넌트입니다 — Kalyx는 각 기능을 서브 컴포넌트로 나눕니다.

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

주요 변환:

| `react-datepicker` | Kalyx |
| --- | --- |
| `selected` / `onChange` (`Date`) | `value` / `onChange` (`ISODateString \| null`) |
| `minDate` / `maxDate` | `disabled={[{ before }, { after }]}` |
| `excludeDates={[d1, d2]}` | `disabled={[{ date: d1 }, { date: d2 }]}` |
| `showMonthDropdown` | `<DatePicker.MonthGrid>` mount |
| `showYearDropdown` | `<DatePicker.YearGrid>` mount |
| `dateFormat` | `displayFormat` |
| `locale` | `locale` (BCP 47 태그) |
| CSS import | 제거 — 스타일시트 불필요 |

### TimePicker 변환

`react-datepicker`의 `showTimeSelect`는 전용 컴포넌트가 됩니다.

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

## `react-day-picker`에서

이미 조합 기반이라 매핑은 주로 이름 변경입니다.

| `react-day-picker` | Kalyx |
| --- | --- |
| `<DayPicker mode="single">` | `<DatePicker>` + `<DatePicker.Calendar>` |
| `<DayPicker mode="range">` | `<RangePicker>` + `<RangePicker.Calendar>` |
| `selected` (`Date`) | `value` (`ISODateString`) |
| `onSelect` | `onChange` |
| `disabled` matcher | `DisabledRule[]` — `before`/`after`/`dayOfWeek` 모양 동일 |
| `classNames` | `classNames` (키가 다름, [DatePicker 문서](./components/datepicker.md) 참고) |

`react-day-picker`는 Input/TimePicker를 제공하지 않습니다 — 이 공백을 Kalyx가 채웁니다. `react-day-picker`에 별도 텍스트 입력과 시간 컴포넌트를 붙여 쓰고 있었다면, 둘을 `<DatePicker.Input>` + `<TimePicker>`로 묶거나 `<DateTimePicker>`로 통합할 수 있습니다.

## React Aria `DatePicker`에서

React Aria는 철학적으로 가장 비슷하지만 전반에 `@internationalized/date`를 강제합니다. Kalyx는 순수 ISO 문자열을 씁니다.

| React Aria | Kalyx |
| --- | --- |
| `CalendarDate`, `DateValue` | `ISODateString` |
| `useDatePicker` | `useDatePicker` (반환 구조 다름 — [훅 문서](./hooks/use-date-picker.md) 참고) |
| `<DatePicker>` + `<Group>` + `<DateInput>` + `<Popover>` + `<Calendar>` | `<DatePicker>` + `<DatePicker.Input>` + `<DatePicker.Popover>` + `<DatePicker.Calendar>` |

변환 어댑터 예시:

```ts
import { parseDate, type CalendarDate } from '@internationalized/date';

const toAria = (iso: ISODateString | null): CalendarDate | null =>
  iso ? parseDate(iso.slice(0, 10)) : null;

const toISO = (cal: CalendarDate | null): ISODateString | null =>
  cal ? new Date(Date.UTC(cal.year, cal.month - 1, cal.day)).toISOString() : null;
```

## 일반 체크리스트

이전 시:

1. 모든 `Date` prop을 ISO 문자열로 교체.
2. 이전 라이브러리의 CSS import 제거.
3. 기능 플래그를 mount된 서브 컴포넌트로 번역.
4. 커스텀 스타일을 `classNames` 슬롯 맵으로 옮김.
5. SSR 렌더링과 폼 제출을 테스트.
6. 새 컴포넌트에 axe 실행 — 스타일 변화가 대비를 퇴행시킬 수 있음.

## 도움 요청

- 이슈: [github.com/jiji-hoon96/kalyx/issues](https://github.com/jiji-hoon96/kalyx/issues)
- 기존 [Discussions](https://github.com/jiji-hoon96/kalyx/discussions) 확인
