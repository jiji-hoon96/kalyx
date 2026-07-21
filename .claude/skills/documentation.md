---
name: documentation
version: 1.0.0
description: 코드 문서화 기준. JSDoc, README, 예제, CHANGELOG 작성 규칙.
triggers:
  - "JSDoc 주석을 작성할 때"
  - "README를 업데이트할 때"
  - "예제 코드를 작성할 때"
  - "CHANGELOG를 작성할 때"
  - "릴리즈 노트를 만들 때"
---

# Skill: 문서화

## 핵심 원칙

1. **예제 먼저** — 설명보다 코드가 먼저
2. **복붙하면 바로 동작** — 예제는 그대로 실행 가능해야 함
3. **Why를 설명** — 어떻게보다 왜가 더 중요
4. **실패도 보여줘라** — "이럴 때 이렇게 하세요"
5. **짧게** — 3줄로 끝낼 수 있으면 5줄 쓰지 않는다

---

## JSDoc 기준

### 공개 컴포넌트 (필수)

```tsx
/**
 * 날짜 범위 선택 캘린더 그리드 컴포넌트.
 *
 * DatePicker.Root 안에서만 사용한다.
 * Headless — 스타일 없음. classNames로 외부에서 스타일링한다.
 *
 * @example
 * // 기본 사용
 * <DatePicker.Calendar />
 *
 * @example
 * // Tailwind 스타일링
 * <DatePicker.Calendar
 *   classNames={{
 *     day: 'p-2 hover:bg-blue-100 rounded text-sm',
 *     daySelected: 'bg-blue-600 text-white',
 *     dayToday: 'font-bold',
 *     dayDisabled: 'text-gray-300 cursor-not-allowed',
 *   }}
 * />
 *
 * @example
 * // 특정 날짜/요일 비활성화
 * <DatePicker.Calendar
 *   disabled={[
 *     { before: new Date().toISOString() }, // 오늘 이전
 *     { dayOfWeek: [0, 6] },               // 주말
 *   ]}
 * />
 */
export function DatePickerCalendar(props: DatePickerCalendarProps) {}
```

### 공개 Hook (필수)

```tsx
/**
 * DatePicker 상태와 동작을 직접 제어하는 훅.
 * 컴포넌트 대신 완전 커스텀 UI를 만들 때 사용한다.
 *
 * @param options - DatePicker 설정
 * @returns 상태, 캘린더 데이터, 핸들러 모음
 *
 * @example
 * function MyDatePicker() {
 *   const { value, isOpen, calendar, open, close, selectDate } =
 *     useDatePicker({ value: date, onChange: setDate });
 *
 *   return (
 *     <div>
 *       <button onClick={open}>{value ?? '날짜 선택'}</button>
 *       {isOpen && (
 *         <div>
 *           {calendar.weeks.map((week) =>
 *             week.map((day) => (
 *               <button
 *                 key={day.isoString}
 *                 onClick={() => selectDate(day.isoString)}
 *               >
 *                 {day.dayNumber}
 *               </button>
 *             ))
 *           )}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useDatePicker(options: UseDatePickerOptions) {}
```

### 내부 함수 (선택적)

```tsx
// 복잡한 로직만 주석 추가
// 단순한 함수는 이름이 설명이다
function getCalendarWeeks(month: string, weekStartsOn: 0 | 1): CalendarWeek[] {
  // 날짜 그리드를 채우기 위해 이전/다음 달 날짜도 포함한다
  // 항상 6주(42일)를 반환해 캘린더 높이가 일정하게 유지되도록
  ...
}
```

---

## 예제 코드 품질 기준

```tsx
// ❌ 나쁜 예제 — 주석이 코드를 설명, 불필요한 보일러플레이트
// 날짜피커 컴포넌트를 임포트합니다
import { DatePicker } from 'your-lib';

// 날짜 상태를 관리하는 컴포넌트입니다
function MyComponent() {
  // 날짜 상태를 useState로 관리합니다
  const [date, setDate] = React.useState<string | null>(null);
  // 날짜피커를 렌더링합니다
  return (
    <DatePicker
      value={date}  // 현재 날짜 값
      onChange={(newDate) => { setDate(newDate); }}  // 날짜가 변경될 때
    >
      <DatePicker.Input />
    </DatePicker>
  );
}

// ✅ 좋은 예제 — 실제 케이스, 코드가 자기 설명
import { DatePicker } from 'your-lib';
import { useState } from 'react';

function ReservationForm() {
  const [checkIn, setCheckIn] = useState<string | null>(null);

  return (
    <DatePicker value={checkIn} onChange={setCheckIn}>
      <DatePicker.Input
        className="border rounded px-3 py-2 w-48"
        placeholder="체크인 날짜"
      />
      <DatePicker.Popover>
        <DatePicker.Calendar
          disabled={[{ before: new Date().toISOString() }]}
          classNames={{
            day: 'p-2 hover:bg-blue-100 rounded',
            daySelected: 'bg-blue-600 text-white',
          }}
        />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

**예제 체크리스트:**
- [ ] 복붙하면 바로 실행되는가?
- [ ] 실제 사용 케이스를 보여주는가?
- [ ] TypeScript로 작성됐는가?
- [ ] 불필요한 주석이 없는가?
- [ ] 최소한인가? (해당 기능만 보여줌)

---

## README 구조

```markdown
# [라이브러리명]

> Headless + SSR-safe React DatePicker. Tailwind 완전 호환, TypeScript-first.

[![npm](badge)] [![bundlephobia](badge)] [![license](MIT)]

## 왜 이 라이브러리를?

| | react-datepicker | react-day-picker | [이름] |
|---|---|---|---|
| Headless | ❌ CSS 강제 | ✅ | ✅ |
| TimePicker | ✅ | ❌ | ✅ |
| SSR 안전 | ❌ | ✅ | ✅ |
| 번들 크기 | 62KB | 25KB | ~16.6KB |

## 설치

\```bash
npm install [이름]
\```

## 5분 퀵스타트

\```tsx
// 이 코드는 복붙하면 바로 동작한다
import { DatePicker } from '[이름]';
import { useState } from 'react';

function App() {
  const [date, setDate] = useState<string | null>(null);
  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input
        className="border rounded px-3 py-2"
        placeholder="날짜 선택"
      />
      <DatePicker.Popover>
        <DatePicker.Calendar
          classNames={{ daySelected: 'bg-blue-600 text-white' }}
        />
      </DatePicker.Popover>
    </DatePicker>
  );
}
\```

## react-datepicker에서 마이그레이션

... (마이그레이션 가이드)

## API 레퍼런스

... (각 컴포넌트/hook의 props 테이블)
```

---

## CHANGELOG 형식

[Keep a Changelog](https://keepachangelog.com/) + Conventional Commits

```markdown
# Changelog

## [Unreleased]

## [0.2.0] - 2026-05-01

### Added
- `<TimePicker>` 컴포넌트 (#42)
- `displayTimezone` prop 지원 (#38)
- react-datepicker 마이그레이션 가이드

### Fixed
- SSR에서 Popover 위치 계산 오류 (#41)
- Range 선택 시 종료일 hover 버그 (#39)

### Changed
- `onChange` 반환 타입: `Date` → `string` (ISO 8601)
  마이그레이션: `new Date(iso)` 로 변환

## [0.1.0] - 2026-04-15

### Added
- 첫 릴리즈
- Single DatePicker (Input + Calendar + Popover)
- Range DatePicker
- date-fns adapter
- 기본 접근성 (WCAG 2.2 AA 부분 지원)
```

---

## 공개 API 변경 시 필수 고지

```tsx
/**
 * @deprecated v0.2에서 제거 예정.
 * 대신 displayTimezone prop을 사용하세요.
 * @example
 * // Before:
 * <DatePicker timezone="Asia/Seoul" />
 * // After:
 * <DatePicker displayTimezone="Asia/Seoul" />
 */
export function DatePicker({ timezone, displayTimezone, ...props }) {
  if (timezone && process.env.NODE_ENV === 'development') {
    console.warn(
      '[DatePicker] `timezone` prop은 deprecated됐습니다. ' +
      '`displayTimezone`을 사용하세요.'
    );
  }
}
```