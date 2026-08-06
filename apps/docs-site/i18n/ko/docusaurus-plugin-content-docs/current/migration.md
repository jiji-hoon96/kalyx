---
id: migration
title: 마이그레이션 가이드
sidebar_position: 20
---

# 마이그레이션 가이드

여러분이 넘어올 가능성이 가장 높은 세 라이브러리에서 Kalyx로 옮기는 방법입니다.

## `react-datepicker`에서

`react-datepicker`는 수십 개의 prop을 가진 단일 컴포넌트를 씁니다 — Kalyx는 그것들을 각각 서브 컴포넌트로 쪼갭니다.

### 이전

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

### 이후

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

주요 대응표:

| `react-datepicker` | Kalyx |
| --- | --- |
| `selected` / `onChange` (`Date`) | `value` / `onChange` (`ISODateString \| null`) |
| `minDate` / `maxDate` | `disabled={[{ before }, { after }]}` |
| `excludeDates={[d1, d2]}` | `disabled={[{ date: d1 }, { date: d2 }]}` |
| `showMonthDropdown` | `<DatePicker.MonthGrid>` 를 마운트 |
| `showYearDropdown` | `<DatePicker.YearGrid>` 를 마운트 |
| `dateFormat` | `displayFormat` |
| `locale` | `locale` (BCP 47 태그) |
| CSS import | 제거 — 스타일시트가 필요 없습니다 |

### TimePicker 대응

`react-datepicker`의 `showTimeSelect`는 전용 컴포넌트가 됩니다.

```tsx
// 이전
<DatePicker selected={dt} onChange={setDt} showTimeSelect />

// 이후
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

이미 composition 기반이라 대부분 이름 변경 수준입니다.

| `react-day-picker` | Kalyx |
| --- | --- |
| `<DayPicker mode="single">` | `<DatePicker>` + `<DatePicker.Calendar>` |
| `<DayPicker mode="range">` | `<RangePicker>` + `<RangePicker.Calendar>` |
| `selected` (`Date`) | `value` (`ISODateString`) |
| `onSelect` | `onChange` |
| `disabled` matcher | `DisabledRule[]` — `before`/`after`/`dayOfWeek`는 같은 형태 |
| `classNames` | `classNames` (키가 다릅니다. [DatePicker](./components/datepicker.md) 참고) |

`react-day-picker`는 Input과 TimePicker를 제공하지 않습니다 — 그게 바로 Kalyx가 메우는 공백입니다. `react-day-picker`에 별도 텍스트 입력과 시간 컴포넌트를 붙여 쓰고 있었다면, 날짜는 `<DatePicker.Input>` 하나로 합치고 날짜+시간은 `<DateTimePicker>`로 옮길 수 있습니다.

## React Aria의 `DatePicker`에서

React Aria는 철학적으로 가장 가깝지만 전 구간에 `@internationalized/date`를 강제합니다. Kalyx는 평범한 ISO string을 씁니다.

| React Aria | Kalyx |
| --- | --- |
| `CalendarDate`, `DateValue` | `ISODateString` |
| `useDatePicker` | `useDatePicker` (반환 형태가 다릅니다 — [훅 문서](./hooks/use-date-picker.md) 참고) |
| `<DatePicker>` + `<Group>` + `<DateInput>` + `<Popover>` + `<Calendar>` | `<DatePicker>` + `<DatePicker.Input>` + `<DatePicker.Popover>` + `<DatePicker.Calendar>` |

변환 shim:

```ts
import { parseDate, type CalendarDate } from '@internationalized/date';

const toAria = (iso: ISODateString | null): CalendarDate | null =>
  iso ? parseDate(iso.slice(0, 10)) : null;

const toISO = (cal: CalendarDate | null): ISODateString | null =>
  cal ? new Date(Date.UTC(cal.year, cal.month - 1, cal.day)).toISOString() : null;
```

## v0.2 → v0.3 — ARIA 라벨 i18n

v0.3부터 기본 ARIA 라벨이 한국어에서 영어로 바뀝니다. 앱이 한국 사용자를 대상으로 한다면 `labels` prop으로 라벨을 복원하세요.

### Breaking change

하드코딩돼 있던 한국어 aria-label(`"캘린더 열기"`, `"이전 달"` 등)이 이제 기본적으로 영어입니다.

### 한국어 라벨 복원

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

신경 쓰는 키만 덮어쓰면 됩니다 — 지정하지 않은 키는 영어 기본값을 유지합니다.

전체 키 레퍼런스와 재사용 가능한 locale 프리셋은 [국제화 가이드](./concepts/internationalization.md)를 참고하세요.

## v0.3 → v0.4 — `displayTimezone` 추가

v0.4는 네 피커 전부(및 대응 훅)에 `displayTimezone`을 도입합니다. Breaking change는 없습니다 — prop을 생략하면 v0.3 시맨틱이 유지됩니다. 사용자에게 표시할 존이 서버 런타임과 다르거나, "하루 어긋남" 버그에 명시적인 방벽을 세우고 싶을 때 채택하세요.

### 이전 (v0.3, 암묵적 UTC / 런타임 로컬)

```tsx
<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

### 이후 (v0.4)

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

ISO 계약은 바뀌지 않습니다. prop을 설정했을 때 *바뀌는* 것은 다음입니다.

- `Input`이 값을 `displayTimezone` 기준으로 포매팅합니다.
- `Calendar`가 today / selected 를 해당 존의 civil-day 동치로 하이라이트합니다.
- 캘린더 클릭 시 `onChange`가 클릭한 셀의 UTC 자정이 아니라 *그 존에서의* 클릭한 날의 civil 자정을 내보냅니다.
- `TimePicker` / `DateTimePicker`의 시·분 컨트롤이 해당 존에서 관측되는 시각을 DST를 인식하며 읽고 씁니다.

커스텀 `DateAdapter` 구현은 `format`·`isSameDay`·`startOfDay`·`today`의 `timezone?: string` 인자를 존중해야 합니다 — 내장 `DateFnsAdapter`는 이미 그렇게 합니다.

전체 맥락은 [Timezone 개념 문서](./concepts/timezone.md)를 참고하세요.

## 일반 체크리스트

마이그레이션할 때:

1. 모든 `Date` prop을 ISO string으로 교체합니다.
2. 이전 라이브러리의 CSS import를 제거합니다.
3. 기능 플래그를 마운트할 서브 컴포넌트로 번역합니다.
4. 커스텀 스타일을 `classNames` 슬롯 맵으로 옮깁니다.
5. SSR 렌더링과 폼 제출을 테스트합니다.
6. 새 컴포넌트에 axe를 돌립니다 — 스타일 변경이 대비(contrast)를 퇴행시킬 수 있습니다.

## 도움 받기

- [github.com/jiji-hoon96/kalyx/issues](https://github.com/jiji-hoon96/kalyx/issues)에 이슈를 열어 주세요
- 기존 [Discussions](https://github.com/jiji-hoon96/kalyx/discussions)도 확인해 보세요
