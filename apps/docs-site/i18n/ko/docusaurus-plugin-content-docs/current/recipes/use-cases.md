---
id: use-cases
title: 유스케이스 레시피
sidebar_position: 0
---

# 유스케이스 레시피

실제로 자주 마주치는 날짜 선택 문제에 대한 복붙 가능한 해법입니다. 각 레시피는 완성된 동작 컴포넌트입니다 — 라이브로 시험해 본 뒤 아래 소스를 복사하세요.

간결함을 위해 Tailwind 스타일 클래스를 쓰지만, 중요한 건 **조합(composition)** 과 **props** 입니다. 클래스는 여러분 것으로 바꾸거나 [`classNames` 스타일링 계약](../concepts/styling.md)을 사용하세요.

---

## 생년월일

생일 선택기는 수십 년을 빠르게 건너뛸 수 있어야 합니다 — "이전 달"을 300번 누르고 싶은 사람은 없습니다. `Calendar → MonthGrid → YearGrid` 를 연결해 타이틀을 드릴업 컨트롤로 만들고, 미래 날짜를 비활성화하세요.

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
      <div className="kx-live-value">생년월일: <code>{dob?.slice(0, 10) ?? 'null'}</code> — 타이틀을 눌러 월 / 연도로 점프하세요.</div>
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
      disabled={[{ after: today }]} // 미래 생일 금지
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

**동작 원리:** 타이틀이 드릴업 컨트롤(`onTitleClick`)이 되고, 각 그리드의 `onSelect`가 다시 아래로 내려갑니다. `disabled={[{ after: today }]}` 는 `maxDate` prop 없이 미래 날짜를 막습니다. [DatePicker](../components/datepicker.md) 의 월 / 연도 내비게이션 섹션 참고.

---

## 프리셋이 있는 예약 범위

예약 플로우는 시작/종료 범위 *와* 원탭 공통 범위를 원합니다. `RangePicker.Presets` 를 범위 캘린더와 조합하세요. 프리셋은 커밋 후 닫힙니다.

```jsx live
function BookingRange() {
  const [range, setRange] = React.useState({ start: null, end: null });
  const iso = (d) => { const x = new Date(); x.setUTCHours(0,0,0,0); x.setUTCDate(x.getUTCDate() + d); return x.toISOString(); };
  return (
    <RangePicker value={range} onChange={setRange}>
      <div className="kx-live-row">
        <RangePicker.Input part="start" className="kx-live-input" placeholder="체크인" />
        <span aria-hidden>→</span>
        <RangePicker.Input part="end" className="kx-live-input" placeholder="체크아웃" />
      </div>
      <RangePicker.Popover className="kx-live-popover">
        <RangePicker.Presets className="kx-live-presets">
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(2) }}>주말</RangePicker.Preset>
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(6) }}>1주</RangePicker.Preset>
          <RangePicker.Preset className="kx-live-preset" range={{ start: iso(0), end: iso(13) }}>2주</RangePicker.Preset>
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
      <RangePicker.Input part="start" placeholder="체크인" />
      <RangePicker.Input part="end" placeholder="체크아웃" />
      <RangePicker.Popover>
        <RangePicker.Presets>
          <RangePicker.Preset range={{ start: day(0), end: day(2) }}>주말</RangePicker.Preset>
          <RangePicker.Preset range={{ start: day(0), end: day(6) }}>1주</RangePicker.Preset>
          <RangePicker.Preset range={{ start: day(0), end: day(13) }}>2주</RangePicker.Preset>
        </RangePicker.Presets>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}
```

**동작 원리:** 각 `RangePicker.Preset` 은 ISO-UTC 문자열의 `range={{ start, end }}` 를 받아 양 끝을 커밋하고 popover를 닫습니다. 활성 프리셋은 `data-active` 를 받아 현재 선택을 강조할 수 있습니다. [RangePicker → Presets](../components/rangepicker.md) 참고.

---

## 고정 타임존의 DateTime

스케줄링 UI는 명확한 순간(instant)을 저장하면서도 특정 현지 시각을 *보여줘야* 합니다. `displayTimezone` 을 설정하면 Input과 Calendar는 그 존으로 렌더링되지만 `onChange` 는 여전히 UTC 순간을 방출합니다.

```jsx live
function MeetingTime() {
  const [dt, setDt] = React.useState(null);
  return (
    <DateTimePicker value={dt} onChange={setDt} format="24h" step={30} displayTimezone="Asia/Seoul">
      <DateTimePicker.Input className="kx-live-input" placeholder="회의 시간 선택 (KST)" />
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
      <div className="kx-live-value">저장된 UTC: <code>{dt ?? 'null'}</code></div>
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
      onChange={setDt}      // 항상 UTC ISO 문자열
      format="24h"
      step={30}
      displayTimezone="Asia/Seoul" // KST로 표시, UTC로 저장
    >
      <DateTimePicker.Input placeholder="회의 시간 선택 (KST)" />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}
```

**동작 원리:** `displayTimezone` 은 *표시* 와 *저장* 을 분리합니다. 사용자가 14:00 KST를 고르면 `onChange` 는 대응하는 UTC 순간(`05:00Z`)을 받습니다. off-by-one 버그가 없습니다. [타임존](../concepts/timezone.md) 과 [DateTimePicker](../components/datetimepicker.md) 참고.

---

## 더 보기

- [DatePicker 패턴](../components/datepicker.md) — 폼 제출, `disabled` 를 통한 min/max.
- [React Hook Form](./react-hook-form.md) — 검증과 함께 controlled 통합.
- [Tailwind](./tailwind.md) / [shadcn](./shadcn.md) — 전체 스타일링 가이드.
