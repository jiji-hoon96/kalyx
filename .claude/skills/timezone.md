---
name: timezone
version: 1.0.0
description: DatePicker의 timezone 처리 원칙과 Adapter 구현. react-datepicker #1018 버그를 설계 시점에 방지한다.
triggers:
  - "날짜 값을 처리할 때"
  - "timezone 관련 코드를 작성할 때"
  - "Date 객체를 다룰 때"
  - "서버-클라이언트 날짜 동기화 문제"
  - "displayTimezone prop을 구현할 때"
---

# Skill: Timezone 처리

## 왜 이것이 중요한가

react-datepicker의 만성 이슈 #1018 "날짜 하루 밀림"은 timezone 처리 실수에서 비롯됐다.
2014년부터 지금까지 수백 개의 댓글이 달린 미해결 이슈다.

우리는 이 버그를 **설계 시점에 구조적으로 방지한다.**

---

## 왜 버그가 생기는가

```tsx
// 이 코드가 왜 위험한가
const date = new Date('2026-01-15');
const iso  = date.toISOString();

// 서울(UTC+9)에서 실행:
// → new Date('2026-01-15') = 2026-01-15T00:00:00+09:00
// → .toISOString()         = "2026-01-14T15:00:00.000Z"  ← 하루 밀렸다!

// UTC에서 실행:
// → new Date('2026-01-15') = 2026-01-15T00:00:00+00:00
// → .toISOString()         = "2026-01-15T00:00:00.000Z"  ← 정확

// 사용자는 "2026-01-15"를 선택했는데 서버에는 "2026-01-14"가 저장된다.
```

---

## 해결책: 저장과 표시의 완전한 분리

```
사용자가 보는 것 (displayTimezone) ≠ 저장되는 것 (UTC)

표시: "2026년 1월 15일" (서울 시간으로 표시)
저장: "2026-01-15T00:00:00.000Z" (UTC, 서울 자정 = UTC 전날 15시가 아님)
```

**핵심:** 우리는 날짜 선택 시 "이 timezone에서 이 날짜의 자정"을 UTC로 변환한다.

---

## 내부 날짜 표현 원칙

```tsx
// ✅ 모든 날짜 값은 이 타입
type ISODateString = string;  // "2026-01-15T00:00:00.000Z"

// ✅ 날짜만 (시간 없는 경우)도 정규화
type ISODateOnly = string;    // "2026-01-15"
// → 내부에서 자동으로 "2026-01-15T00:00:00.000Z"로 처리

// ❌ 절대 사용하지 않는 것
type BadDate  = Date;    // native Date — timezone 버그 근원
type BadDate2 = number;  // Unix timestamp — timezone 정보 없음
```

---

## Adapter 인터페이스

```tsx
interface DateAdapter {
  // ─── 파싱 ───
  // 어떤 형식이든 → ISO 8601 UTC string
  parse(value: string, format?: string): string;

  // ─── 포맷팅 ───
  // ISO string → 화면 표시용 string
  format(iso: string, formatStr: string, timezone?: string): string;

  // ─── 날짜 계산 (항상 ISO string 입출력) ───
  addDays(iso: string, n: number): string;
  subDays(iso: string, n: number): string;
  addMonths(iso: string, n: number): string;
  subMonths(iso: string, n: number): string;
  addYears(iso: string, n: number): string;

  // ─── 비교 ───
  isBefore(a: string, b: string): boolean;
  isAfter(a: string, b: string): boolean;
  // 중요: timezone을 고려한 "같은 날" 비교
  isSameDay(a: string, b: string, timezone?: string): boolean;

  // ─── 경계 ───
  startOfDay(iso: string, timezone?: string): string;
  endOfDay(iso: string, timezone?: string): string;
  startOfMonth(iso: string, timezone?: string): string;
  endOfMonth(iso: string, timezone?: string): string;
  startOfWeek(iso: string, weekStartsOn?: 0 | 1): string;
  endOfWeek(iso: string, weekStartsOn?: 0 | 1): string;

  // ─── 현재 ───
  now(): string;                      // 현재 UTC ISO string
  today(timezone?: string): string;   // 오늘 자정 UTC ISO string
}
```

---

## date-fns Adapter 구현 (핵심 메서드)

```tsx
import { parseISO, formatISO, addDays, isSameDay, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime, format as tzFormat } from 'date-fns-tz';

export const DateFnsAdapter: DateAdapter = {
  parse(value) {
    if (!value) return '';
    // 이미 ISO 형식
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
    // YYYY-MM-DD → UTC 자정으로 정규화
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00.000Z`;
    return value;
  },

  format(iso, formatStr, timezone) {
    const date = parseISO(iso);
    if (timezone) {
      // 지정된 timezone의 로컬 시간으로 포맷
      const zonedDate = toZonedTime(date, timezone);
      return tzFormat(zonedDate, formatStr, { timeZone: timezone });
    }
    return format(date, formatStr);
  },

  // ← 핵심: timezone을 고려해 "같은 날"을 판단
  isSameDay(a, b, timezone) {
    if (!a || !b) return false;
    const dateA = parseISO(a);
    const dateB = parseISO(b);
    if (timezone) {
      return isSameDay(
        toZonedTime(dateA, timezone),
        toZonedTime(dateB, timezone)
      );
    }
    return isSameDay(dateA, dateB);
  },

  // ← 핵심: "오늘" = 지정된 timezone 기준 오늘 자정의 UTC
  today(timezone) {
    const now = new Date();
    if (timezone) {
      const zonedNow = toZonedTime(now, timezone);
      const startOfToday = startOfDay(zonedNow);
      return fromZonedTime(startOfToday, timezone).toISOString();
    }
    return startOfDay(now).toISOString();
  },

  // ... 나머지는 패턴 동일
};
```

---

## 사용자 API 설계

```tsx
// 기본 (timezone 명시 없음 — UTC 기준)
<DatePicker
  value="2026-01-15T00:00:00.000Z"
  onChange={(iso) => {
    // iso = "2026-01-15T00:00:00.000Z"
    // 날짜 문자열만 필요하면: iso?.split('T')[0]
  }}
/>

// 서울 timezone 표시
<DatePicker
  value="2026-01-15T00:00:00.000Z"   // 저장: UTC
  displayTimezone="Asia/Seoul"         // 표시: 서울 시간
  onChange={(iso) => {
    // iso = "2026-01-14T15:00:00.000Z"  (서울 자정 = UTC 전날 15시)
    // 사용자가 선택한 날짜: 서울 기준 2026-01-15
  }}
/>

// 날짜만 (시간 없음, mode="date")
<DatePicker
  mode="date"   // 시간 00:00:00 UTC로 정규화
  value="2026-01-15"  // YYYY-MM-DD도 허용
  onChange={(iso) => {
    // iso = "2026-01-15T00:00:00.000Z"  (항상 UTC 자정)
  }}
/>
```

---

## 흔한 실수 → 올바른 방법

### 실수 1: "오늘" 잘못 계산

```tsx
// ❌ 로컬 timezone 기준 "오늘" — 서버와 다를 수 있음
const today = new Date();

// ✅ 지정된 timezone 기준 "오늘 자정"
const today = adapter.today(displayTimezone);
```

### 실수 2: UTC 기준으로 날짜 비교

```tsx
// ❌ UTC 기준 비교 — 서울 자정(UTC 전날 15시)과 UTC 자정이 다른 날로 판정
const isSame = a.split('T')[0] === b.split('T')[0];  // 잘못됨

// ✅ timezone을 고려한 비교
const isSame = adapter.isSameDay(a, b, displayTimezone);
```

### 실수 3: Input에 직접 Date 포맷팅

```tsx
// ❌ new Date()가 로컬 timezone 적용
const display = format(new Date(iso), 'yyyy/MM/dd');

// ✅ adapter가 timezone 처리
const display = adapter.format(iso, 'yyyy/MM/dd', displayTimezone);
```

### 실수 4: "날짜만" 선택에서 시간이 UTC 자정이 아님

```tsx
// ❌ 로컬 timezone에 따라 날짜 자정이 다름
const iso = new Date('2026-01-15').toISOString();
// 서울: "2026-01-14T15:00:00.000Z" ← 하루 밀림!

// ✅ 항상 UTC 자정으로 정규화
const iso = '2026-01-15T00:00:00.000Z';  // 명시적 UTC
```

---

## DST(서머타임) 주의사항

```tsx
// 미국 동부 서머타임 전환일: 2026-03-08 오전 2시 → 3시로 점프
// 이 날 02:30은 존재하지 않는 시간!

// ❌ 위험 — 존재하지 않는 시간 생성 가능
const date = new Date('2026-03-08T02:30:00');

// ✅ date-fns-tz가 DST를 자동으로 올바르게 처리
import { fromZonedTime } from 'date-fns-tz';
const safeDate = fromZonedTime(
  new Date('2026-03-08T02:30:00'),
  'America/New_York'
);
// DST로 인해 자동으로 03:30으로 조정

// 캘린더에서 날짜 선택 시 항상 어댑터를 통해 처리
const selectedIso = adapter.startOfDay(iso, 'America/New_York');
```

---

## Timezone 테스트 케이스

```tsx
describe('timezone 처리', () => {
  it('서울(UTC+9)에서 2026-01-15 선택 → UTC로 저장', () => {
    const onChange = vi.fn();
    render(<DatePicker displayTimezone="Asia/Seoul" onChange={onChange} />);
    selectDate('2026-01-15');
    expect(onChange).toHaveBeenCalledWith('2026-01-14T15:00:00.000Z');
    //                              서울 2026-01-15 자정 = UTC 전날 15시
  });

  it('UTC 값 "2026-01-14T15:00:00.000Z" → 서울에서 "2026/01/15"로 표시', () => {
    render(
      <DatePicker
        value="2026-01-14T15:00:00.000Z"
        displayTimezone="Asia/Seoul"
      >
        <DatePicker.Input format="yyyy/MM/dd" />
      </DatePicker>
    );
    expect(screen.getByRole('combobox')).toHaveValue('2026/01/15');
  });

  it('"오늘"이 서울 timezone 기준으로 정확하다', () => {
    // ...
  });

  it('윤년의 날짜 계산이 정확하다 (2024-02-29)', () => {
    // ...
  });

  it('DST 전환일에 날짜 선택이 정확하다', () => {
    // ...
  });
});
```

---

## Timezone 체크리스트

- [ ] value prop은 항상 ISO 8601 UTC string인가?
- [ ] native Date 객체를 직접 사용하지 않는가?
- [ ] 날짜 비교에 adapter.isSameDay(a, b, timezone)를 쓰는가?
- [ ] "오늘"을 adapter.today(timezone)으로 계산하는가?
- [ ] 포맷팅에 adapter.format(iso, format, timezone)을 쓰는가?
- [ ] UTC+9, UTC+0, UTC-5 환경에서 테스트했는가?
- [ ] DST 전환일 테스트가 있는가?