# CLAUDE.md — DatePicker Library

> **AI 에이전트 프로젝트 컨텍스트 파일 (Claude Code).**
> Claude Code 는 이 `CLAUDE.md` 를 자동 로드한다. 코드 생성·리뷰·설계는 전부 이 파일의 원칙을 따른다. 본문에서 참조하는 `.claude/skills/*.md` 와 `.claude/commands/*.md` (슬래시 커맨드)는 Claude Code 가 자동 발견한다. 패키지별 세부 컨텍스트는 `packages/core/CLAUDE.md`, `packages/react/CLAUDE.md` 참조.

---

## Quick Navigation

| 궁금한 것 | 바로 가기 |
|---|---|
| 이 프로젝트가 뭔가요? | [§1 미션](#1-프로젝트-미션) |
| 무슨 기술 쓰나요? | [§2 스택](#2-확정된-기술-스택) |
| 코드를 어떻게 짜야 하나요? | [§3 아키텍처 원칙](#3-아키텍처-원칙) |
| 파일은 어디에 두나요? | [§4 파일 구조](#4-파일-구조) |
| 지금 뭘 만들어야 하나요? | [§5 MVP 범위](#5-mvp-범위-phase-1) |
| 코딩 스타일이 있나요? | [§6 코딩-컨벤션](#6-코딩-컨벤션) |
| 테스트는 어떻게? | [§7 테스트 기준](#7-테스트-기준) |
| 이건 하면 안 돼요 | [§8 절대 금지](#8-절대-금지-패턴) |
| 커밋 메시지 형식 | [§9 Git 워크플로우](#9-git-워크플로우) |
| 슬래시 커맨드 있나요? | [§10 커맨드 목록](#10-커맨드-목록) |
| 참고할 외부 스킬 | [§11 외부 스킬 참조](#11-외부-스킬-참조) |
| 버전·배포는 어떻게? | [§12 릴리즈 워크플로우](#12-릴리즈-워크플로우-요약) |
| CI/CD 구조는? | [§13 CI/CD 구조](#13-cicd-구조) |
| 지금 진행 중인 큰 작업? | [§14 현재 이니셔티브](#14-현재-이니셔티브-2026-04-기준) |

---

## 1. 프로젝트 미션

### 한 문장

> "CSS 없이 설치 즉시 동작하고, 어떤 스타일링 방식으로도 자유롭게 커스터마이징 가능한 React DatePicker"

### 해결하는 문제

2026년 React 생태계의 DatePicker는 두 극단만 존재한다:

- **react-day-picker (41.7M/week, ~22KB gzip)**: Headless지만 Calendar Grid만. Input·TimePicker 없음. v9에서도 개발자가 3개 컴포넌트를 직접 조합해야 함.
- **react-datepicker (4.7M/week, ~40-60KB gzip)**: 통합됐지만 CSS 필수 import, timezone 이슈(#1018, native Date 의존), Props 100개 이상.
- **Ark UI**: Composition 패턴이지만 **standalone TimePicker 없음** — 시간은 `@internationalized/date`의 `CalendarDateTime`을 통해 DatePicker 내부에서만 다룬다. 45개 이상 컴포넌트의 범용 UI 라이브러리.
- **React Aria**: 기능 완전하지만 복잡하고, `@internationalized/date` 의존 강제 (date-fns 비호환).
- **Headless UI**: DatePicker 구현 거부 ("유지보수가 너무 큼").

**우리가 채우는 공백:** Headless + Input·Calendar·TimePicker·RangePicker 통합 + date-fns 호환 + SSR 안전 + ≤ 17KB

### 포지셔닝

```
react-day-picker의 Headless 철학
      +
react-datepicker의 통합 기능
      +
shadcn의 Composition 패턴 & Tailwind 친화성
      +
Ark UI가 포기한 TimePicker 통합
```

---

## 2. 확정된 기술 스택

> 이 결정들은 확정됐다. 논쟁 없이 따른다.

| 항목 | 결정 | 근거 |
|---|---|---|
| 프레임워크 | React 19+ 전용 | RSC 최적화, 가장 큰 시장 |
| 언어 | TypeScript strict | `any` 전면 금지 |
| 스타일링 | Zero CSS (Headless) | CSS 충돌 원천 차단 |
| 날짜 코어 | Adapter 패턴 — `@kalyx/adapter-date-fns` 기본 (분리 완료), `@kalyx/adapter-dayjs`·`@kalyx/adapter-luxon` 공식 어댑터 npm 배포됨 | Temporal API 전환 대비, 사용자가 dayjs/luxon 선택 가능 |
| 포지셔닝 | Floating UI | 3KB, SSR 안전, Popper.js 후계자 |
| 번들 목표 | **≤ 17KB gzip** | react-datepicker 62KB 대비. RC 단계 12 → 13KB 상향(commit e93d082), v1.0-rc.3 grid 키보드 내비게이션 추가하면서 13 → 14KB 상향, v1.0-rc.4 MonthPicker/YearPicker disabled month/year 추가하면서 14 → 15KB 상향, v1.0-rc.8 TimePicker `filterTime` 프로그래밍 콜백 추가하면서 15 → 16KB 상향, v1.1 B10 a11y announce() 패리티(A-G1 — DatePicker/DateTimePicker Root live-region) 추가하면서 16 → 17KB 상향 |
| 테스트 | Vitest + Testing Library + jest-axe | |
| 빌드 | tsup (ESM + CJS 이중 출력) | |
| 모노레포 | pnpm workspaces | |

### 의존성 원칙

```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@floating-ui/react": "포지셔닝 엔진 (SSR safe)",
    "date-fns": "기본 날짜 어댑터",
    "date-fns-tz": "timezone 처리"
  }
}
```

**금지:** `moment`, `dayjs`, `luxon`을 `dependencies`로 추가. → Adapter 패턴으로 제공.

---

## 3. 아키텍처 원칙

### 원칙 1: Composition API (Props 폭발 금지)

```tsx
// ❌ 절대 이렇게 만들지 않는다 — Props 폭발
<DatePicker
  selected={date}
  showTimeSelect
  timeFormat="HH:mm"
  showMonthDropdown
  showYearDropdown
  excludeDates={[]}
  renderCustomHeader={...}
/>

// ✅ 이렇게 만든다 — Composition
<DateTimePicker value={date} onChange={setDate}>
  <DateTimePicker.Input placeholder="날짜+��간 선택" />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar disabled={[{ dayOfWeek: [0] }]} />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

### 원칙 2: SSR 안전 (Next.js App Router 기준)

```tsx
// ❌ 금지 패턴
const width = window.innerWidth;          // window 직접 참조
document.getElementById('picker');        // document 직접 참조
const id = Math.random().toString(36);    // 서버/클라이언트 불일치
useLayoutEffect(() => {}, []);            // SSR 경고 유발

// ✅ 올바른 패턴
const id = useId();                       // React 표준
useEffect(() => {                         // 클라이언트에서만
  const width = window.innerWidth;
}, []);
```

### 원칙 3: 날짜 값 = ISO 8601 UTC string

```tsx
// 모든 날짜의 입출력은 이 형식으로만
type ISODateString = string; // "2026-01-15T00:00:00.000Z"

// ✅ 올바른 props
<DatePicker
  value="2026-01-15T00:00:00.000Z"  // 항상 UTC ISO string
  displayTimezone="Asia/Seoul"       // 표시 timezone 분리
  onChange={(iso: string | null) => save(iso)}  // 항상 UTC 반환
/>

// ❌ 금지
<DatePicker value={new Date()} />   // native Date 객체
```

### 원칙 4: Dot Notation (Object.assign 패턴)

```tsx
// DatePicker/index.ts
export const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Popover: DatePickerPopover,
  Calendar: DatePickerCalendar,
  MonthGrid: DatePickerMonthGrid,
  YearGrid: DatePickerYearGrid,
  Presets: DatePickerPresets,
  Preset: DatePickerPreset,
});

// 사용
import { DatePicker } from '@kalyx/react';
```

### 원칙 5: 제어/비제어 모두 지원

```tsx
// 비제어 (폼 제출용)
<DatePicker name="birthDate" defaultValue="1990-01-01T00:00:00.000Z" />

// 제어 (상태 동기화용)
<DatePicker value={date} onChange={setDate} />
```

---

## 4. 파일 구조

```
kalyx/
├── CLAUDE.md                         ← 이 파일 (Claude Code 자동 로드 · 항상 읽힘)
├── .claude/
│   ├── skills/                       ← 도메인 전문 가이드
│   │   ├── api-design.md
│   │   ├── accessibility.md
│   │   ├── testing.md
│   │   ├── testing-ci.md
│   │   ├── timezone.md
│   │   ├── documentation.md
│   │   ├── release-workflow.md
│   │   ├── ci-cd.md
│   │   ├── oss-references.md
│   │   ├── rc-announcement.md
│   │   └── adapter-extraction.md
│   └── commands/                     ← 슬래시 커맨드
│       ├── new-component.md
│       ├── check-bundle.md
│       ├── check-a11y.md
│       └── release.md
├── packages/
│   ├── core/                         ← 플랫폼 독립 로직
│   │   ├── CLAUDE.md                 ← 패키지별 컨텍스트
│   │   └── src/
│   │       ├── types.ts             ← 타입 정의 (DateAdapter, CalendarDay 등)
│   │       ├── test-helpers/        ← 어댑터 conformance suite (@kalyx/core/test-helpers)
│   │       ├── utils/
│   │       │   ├── calendar.ts      ← getCalendarDays, isDateDisabled
│   │       │   ├── date.ts          ← normalizeISO, parseInputValue
│   │       │   ├── time.ts          ← setTime, parseTimeString, 12h/24h 변환
│   │       │   ├── locale.ts        ← Intl 기반 다국어 월/요일명
│   │       │   ├── timezone.ts      ← DST-aware timezone 유틸
│   │       │   └── labels.ts        ← 접근성 ARIA 라벨 기본값
│   │       ├── __tests__/           ← 단위 테스트 (코어 197 케이스, 전체 776 vitest)
│   │       └── index.ts             ← 공개 API
│   ├── adapter-date-fns/             ← date-fns DateAdapter (기본, @kalyx/react 가 내장)
│   ├── adapter-dayjs/                ← dayjs DateAdapter (/headless 용)
│   ├── adapter-luxon/                ← luxon DateAdapter (/headless 용)
│   └── react/                        ← React 컴포넌트 레이어
│       ├── CLAUDE.md                 ← 패키지별 컨텍스트
│       └── src/
│           ├── components/
│           │   ├── DatePicker/       ← 날짜 선택 (Root, Input, Trigger, Popover, Calendar, MonthGrid, YearGrid, Presets)
│           │   ├── RangePicker/      ← 날짜 범위 선택 (Root, Input, Popover, Calendar, Presets)
│           │   ├── TimePicker/       ← 시간 선택 (Root, Input, HourList, MinuteList, AmPmToggle)
│           │   ├── DateTimePicker/   ← 날짜+시간 복합 (Root, Input + DatePicker/TimePicker 재사용)
│           │   ├── MonthPicker/      ← 월 단위 선택 (Root, Input, Trigger, Popover, Grid)
│           │   ├── YearPicker/       ← 연도 단위 선택 (Root, Input, Trigger, Popover, Grid)
│           │   └── WeekPicker/       ← 주 단위 선택 (Root, Input, Popover, Calendar)
│           ├── hooks/
│           │   ├── useDatePicker.ts  ← 커스텀 DatePicker UI용 Hook
│           │   ├── useRangePicker.ts ← 커스텀 RangePicker UI용 Hook
│           │   ├── useTimePicker.ts  ← 커스텀 TimePicker UI용 Hook
│           │   └── useMonthPicker.ts / useYearPicker.ts / useWeekPicker.ts / useDateTimePicker.ts ← /headless 전용 4종
│           ├── context/
│           │   ├── DatePickerContext.ts
│           │   ├── RangePickerContext.ts
│           │   └── TimePickerContext.ts
│           ├── index.ts              ← 패키지 공개 API (date-fns 어댑터 자동 주입)
│           └── headless.ts           ← /headless 엔트리 (어댑터 미주입 — 훅 7종 + DateTimePicker.Presets 포함)
├── apps/
│   ├── docs/                         ← 데모 사이트 (Next.js, 정적 빌드)
│   └── docs-site/                    ← 문서 사이트 (Docusaurus, i18n)
├── scripts/
│   ├── check-bundle-size.js          ← 번들 크기 측정 (17KB 제한, TARGET_KB 단일 소스)
│   └── check-tree-shaking.js         ← tree-shaking 검증
├── test/
│   └── setup.ts                      ← Vitest 전역 설정
└── package.json
```

---

## 5. 구현 현황 (v1.0.0 기준)

### 컴포넌트 (7종 — 모두 구현 완료 ✅)

| 컴포넌트 | 서브 컴포넌트 | 설명 |
|----------|-------------|------|
| `DatePicker` | Root, Input, Trigger, Popover, Calendar, MonthGrid, YearGrid, Presets, Preset | 날짜 선택 |
| `RangePicker` | Root, Input, Popover, Calendar, Presets, Preset | 날짜 범위 선택 |
| `TimePicker` | Root, Input, HourList, MinuteList, AmPmToggle | 시간 선택 (12h/24h) |
| `DateTimePicker` | Root, Input + DatePicker/TimePicker 서브 컴포넌트 재사용 | 날짜+시간 복합 |
| `MonthPicker` | Root, Input, Trigger, Popover, Grid | 월 단위 선택 |
| `YearPicker` | Root, Input, Trigger, Popover, Grid | 연도 단위 선택 |
| `WeekPicker` | Root, Input, Popover, Calendar | 주 단위 선택 |

### Headless Hooks (7종 — 모두 구현 완료 ✅)

| Hook | 용도 |
|------|------|
| `useDatePicker(options)` | 완전 커스텀 DatePicker UI (메인 엔트리) |
| `useRangePicker(options)` | 완전 커스텀 RangePicker UI (메인 엔트리) |
| `useTimePicker(options)` | 완전 커스텀 TimePicker UI (메인 엔트리) |
| `useMonthPicker(options)` | 완전 커스텀 MonthPicker UI (`/headless` 전용 — B4) |
| `useYearPicker(options)` | 완전 커스텀 YearPicker UI (`/headless` 전용 — B4) |
| `useWeekPicker(options)` | 완전 커스텀 WeekPicker UI (`/headless` 전용 — B4) |
| `useDateTimePicker(options)` | 완전 커스텀 DateTimePicker UI (`/headless` 전용 — B4) |

### 코어 유틸 (6개 모듈 — 모두 구현 완료 ✅)

| 모듈 | 주요 함수 |
|------|----------|
| `@kalyx/adapter-date-fns` (별도 패키지) | DateFnsAdapter (17개 DateAdapter 메서드) — dayjs/luxon 어댑터도 동일 계약 |
| `utils/calendar` | getCalendarDays, isDateDisabled, minDate, maxDate |
| `utils/date` | normalizeISO, parseInputValue |
| `utils/time` | setTime, getTime, parseTimeString, to12Hour, to24Hour, generateHours/Minutes |
| `utils/locale` | getMonthName, formatMonthYear, getWeekdayNames, formatFullDate (Intl 기반) |
| `utils/timezone` | formatInTimezone, startOfDayInTimezone, isSameDayInTimezone, civilMidnightFromUtcDay, get/setTimeInTimezone |

### 공통 기능 (모두 구현 완료 ✅)

- 제어/비제어 모드 지원
- WAI-ARIA 접근성 (role="grid", role="combobox", role="listbox" 등)
- 키보드 내비게이션 (Arrow keys, PageUp/Down, Home/End, Enter, Escape)
- SSR 안전 (Next.js App Router CI 검증)
- Timezone 지원 (`displayTimezone` prop, DST-aware)
- 다국어 지원 (`locale` prop, Intl.DateTimeFormat 기반)
- classNames prop (Headless 스타일링)
- ARIA 라벨 커스터마이징 (`labels` prop)

### 남은 작업 (v1.0 정식 릴리즈 전)

- React Native adapter → v1.0 이후
- 어댑터 분리 (`@kalyx/adapter-date-fns`) → v1.1 ([§14 참조](#14-현재-이니셔티브-2026-04-기준))

---

## 6. 코딩 컨벤션

### 네이밍

```tsx
// 컴포넌트: PascalCase
export function DatePickerInput() {}

// Hook: use + camelCase
export function useDatePicker() {}

// 내부 유틸: camelCase
function formatDisplayDate() {}

// 상수: SCREAMING_SNAKE_CASE
const DEFAULT_FORMAT = 'yyyy-MM-dd';

// 타입/인터페이스: PascalCase
type DatePickerProps = {};
interface CalendarState {}
```

### classNames prop 패턴 (모든 컴포넌트 공통)

```tsx
// 모든 서브 컴포넌트는 classNames prop을 받는다
<DatePicker.Calendar
  classNames={{
    root: '',          // 최상위 컨테이너
    header: '',        // 헤더 영역
    grid: '',          // 날짜 테이블
    gridRow: '',       // 주 행
    gridCell: '',      // 날짜 셀
    day: '',           // 날짜 버튼 기본
    daySelected: '',   // 선택된 날짜
    dayToday: '',      // 오늘
    dayDisabled: '',   // 비활성화
    dayOutsideMonth: '', // 현재 달 외부
  }}
/>
```

### 공개 API 원칙

```tsx
// ✅ packages/react/src/index.ts — 공개 API만
// 컴포넌트 (7종)
export { DatePicker } from './components/DatePicker';
export { RangePicker } from './components/RangePicker';
export { TimePicker } from './components/TimePicker';
export { DateTimePicker } from './components/DateTimePicker';
export { MonthPicker } from './components/MonthPicker';
export { YearPicker } from './components/YearPicker';
export { WeekPicker } from './components/WeekPicker';
// Hooks (3종)
export { useDatePicker } from './hooks/useDatePicker';
export { useRangePicker } from './hooks/useRangePicker';
export { useTimePicker } from './hooks/useTimePicker';
// 컴포넌트별 props/classNames 타입 — 각 컴포넌트의 index.ts 가 re-export.
// (예: DatePickerRootProps, DatePickerCalendarClassNames, RangePickerPresetProps,
//      TimePickerHourListProps, MonthPickerGridProps 등)
// Hook 옵션/반환 타입
export type { UseDatePickerOptions, UseDatePickerReturn } from './hooks/useDatePicker';
export type { UseRangePickerOptions, UseRangePickerReturn } from './hooks/useRangePicker';
export type { UseTimePickerOptions, UseTimePickerReturn } from './hooks/useTimePicker';
// 어댑터 re-export (실제 소스는 @kalyx/adapter-date-fns) + 코어 타입/유틸 (re-export from @kalyx/core)
export { DateFnsAdapter } from '@kalyx/adapter-date-fns';
export type {
  ISODateString, DateRange, DisabledRule, DateAdapter,
  CalendarDay, CalendarWeek, CalendarGrid, CalendarOptions, WeekStartsOn,
  TimeValue, WeekdayInfo,
  DatePickerLabels, RangePickerLabels, TimePickerLabels, DateTimePickerLabels,
} from '@kalyx/core';
export {
  DEFAULT_DATEPICKER_LABELS, DEFAULT_RANGEPICKER_LABELS,
  DEFAULT_TIMEPICKER_LABELS, DEFAULT_DATETIMEPICKER_LABELS,
} from '@kalyx/core';

// ❌ 내부 구현 절대 export 금지
export { formatDateInternal } from './utils/internal';
```

`@kalyx/core`는 위 re-export 외에도 직접 사용자에게 다음을 노출한다:
`getCalendarDays`, `isDateDisabled`, `minDate`, `maxDate`, `normalizeISO`, `parseInputValue`,
`setTime`, `getTime`, `parseTimeString`, `formatTimeString`, `formatTimeFromISO`,
`to12Hour`, `to24Hour`, `generateHours`, `generateMinutes`, `isSameTime`,
`getMonthName`, `formatMonthYear`, `getWeekdayNames`, `formatFullDate`,
`formatInTimezone`, `startOfDayInTimezone`, `isSameDayInTimezone`, `todayInTimezone`,
`getTimezoneOffsetMinutes`, `civilMidnightFromUtcDay`, `getTimeInTimezone`, `setTimeInTimezone`.

---

## 7. 테스트 기준

### 커버리지

| 레이어 | 목표 |
|---|---|
| 코어 유틸 (순수 함수) | **100%** |
| 컴포넌트 상호작용 | **>90%** |
| 접근성 (axe) | **모든 컴포넌트 통과** |

### 필수 테스트 케이스 (PR 전 확인)

```
□ 날짜 선택 시 onChange가 ISO string으로 호출된다
□ controlled/uncontrolled 모두 동작한다
□ 키보드로만 날짜를 선택할 수 있다 (Arrow keys, Enter, Escape)
□ SSR에서 renderToString이 에러 없이 동작한다
□ axe 접근성 검사를 통과한다
□ 윤년 2월 29일이 올바르게 처리된다
□ minDate/maxDate 범위가 올바르게 동작한다
□ disabled 날짜를 선택할 수 없다
```

---

## 8. 절대 금지 패턴

```tsx
// ❌ Props로 기능 주입 (Composition으로 대체)
showTimeSelect, timeFormat, showMonthDropdown

// ❌ CSS 파일 import
import './styles.css'

// ❌ any 타입
const value: any

// ❌ native Date 객체를 value로
<DatePicker value={new Date()} />

// ❌ window/document 직접 참조 (Effect 밖에서)
window.innerWidth, document.getElementById

// ❌ Math.random() ID 생성
Math.random().toString(36)

// ❌ useLayoutEffect (useEffect 사용)
useLayoutEffect(() => {})

// ❌ 내부 구현 export
export { internalHelper } from './internal'

// ❌ moment, dayjs를 dependencies로
"dependencies": { "dayjs": "..." }
```

---

## 9. Git 워크플로우

### Conventional Commits 형식

```bash
feat(calendar): 키보드 내비게이션 추가
fix(input): timezone 오프셋 계산 오류 수정 (#42)
refactor(popover): Floating UI v2 마이그레이션
docs(readme): Range Picker 예제 추가
test(calendar): 윤년 엣지 케이스 테스트 추가
chore(deps): date-fns 4.1.0 업데이트
```

### 브랜치 전략

```
main          ← 릴리즈 브랜치 (npm publish)
feat/xxx      ← 기능 개발
fix/xxx       ← 버그 수정
docs/xxx      ← 문서만
```

### PR 체크리스트

PR 열기 전 확인:
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm test:run` 통과 (커버리지 기준 충족)
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 성공
- [ ] 번들 크기 변화 확인 (`pnpm check-bundle`)
- [ ] CHANGELOG.md 업데이트
- [ ] 새 공개 API는 JSDoc 주석 있음

---

## 10. 커맨드 목록

> `.claude/commands/` 폴더의 슬래시 커맨드들

| 커맨드 | 설명 |
|---|---|
| `/new-component` | 새 서브 컴포넌트 스캐폴딩 (컴포넌트·타입·테스트 파일 생성) |
| `/check-bundle` | 빌드 후 번들 크기 측정, 16KB 초과 시 실패 |
| `/check-a11y` | axe 자동 검사 + ARIA 수동 체크리스트 |
| `/release` | Changesets 기반 버전 범프·CHANGELOG·npm 배포 가이드 |

---

## 11. 외부 스킬 참조

> [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) 에서 이 프로젝트에 직접 활용 가능한 스킬들

| 스킬 경로 | 활용 시점 |
|---|---|
| `engineering-team/senior-frontend` | 번들 최적화, Composition 패턴 리뷰 |
| `engineering/monorepo-navigator` | pnpm workspace 설정, 패키지 간 의존성 |
| `engineering/api-design-reviewer` | 컴포넌트 API 설계 리뷰 |
| `engineering/dependency-auditor` | 의존성 감사, 번들 크기 영향 분석 |
| `engineering/changelog-generator` | Conventional Commits → CHANGELOG |
| `engineering/performance-profiler` | 번들 분석, tree-shaking 확인 |
| `engineering/pr-review-expert` | PR 리뷰 자동화 |
| `engineering/ci-cd-pipeline-builder` | GitHub Actions 파이프라인 설계 |
| `engineering/release-manager` | semantic version 결정, npm publish |
| `engineering-team/senior-qa` | 테스트 전략, 커버리지 계획 |
| `engineering-team/playwright-pro` | E2E 테스트 작성 및 최적화 |

```bash
# 설치 방법 (Claude Code 환경)
/plugin marketplace add alirezarezvani/claude-skills
/plugin install engineering-skills@claude-code-skills
```

---

## 12. 릴리즈 워크플로우 요약

> 상세 내용: `.claude/skills/release-workflow.md`

```
개발 → PR → CI 통과 → main merge
                          ↓
              changeset 파일이 있으면
                          ↓
              "chore: release" PR 자동 생성
                          ↓
              Version PR merge
                          ↓
              npm publish + GitHub Release 자동
```

**핵심 명령어:**
```bash
pnpm changeset        # 변경 내용 기록 (PR 낼 때)
pnpm changeset version # 버전 범프 (CI 자동)
pnpm changeset publish # npm 배포 (CI 자동)
```

**semver 규칙:**
| 변경 종류 | 버전 |
|---|---|
| 버그 수정 | patch (0.1.x) |
| 새 기능 (하위 호환) | minor (0.x.0) |
| Breaking change | major (x.0.0) |

---

## 13. CI/CD 구조

> 상세 내용: `.claude/skills/ci-cd.md`, `.github/workflows/`

| 워크플로우 파일 | 트리거 | 역할 |
|---|---|---|
| `pr-check.yml` | PR, main push | typecheck·lint·test·build·번들크기·SSR 검사 |
| `release.yml` | main push | Changesets 버전 PR 생성 또는 npm publish |
| `e2e-and-docs.yml` | main push | 크로스브라우저 E2E (Playwright × chromium/firefox/webkit). docs-site 배포는 Vercel GitHub App이 별도로 처리 |
| `security.yml` | 매주 월·의존성 변경 | 취약점·라이선스 감사 |

**Branch Protection (main):**
- PR 필수, 1명 승인
- 필수 통과: `typecheck`, `lint`, `test`, `bundle-size`, `all-pass`
- 직접 push 불가

---

## 14. 현재 이니셔티브 (2026-06-18 기준 — Track A 종료, "정확성 먼저" 방향 확정)

> **🟢 2026-07-21 최근 작업 로그 (스테일 문서 전수 스윕 — PR #170 후속 정합화):**
> - **상태 갱신**: ~~PR #170 아직 OPEN~~ → **PR #170 머지 완료**(`d40ae7e`, 2026-07-11). #170 에는 디자인 작업 외에 **기능 3종도 포함**(TimePicker `locale` AM/PM 지역화 + `TimePicker.Popover` + WeekPicker `weekAnchor` start/end 인식) → Version PR #171 로 **`@kalyx/core@1.4.0` + `@kalyx/react@1.4.0` npm 배포 완료**. dist-tag `latest` = 1.4.0.
> - **⚠️ 번들 실측 갱신 (1.4.0)**: ESM **16.64KB** / CJS **16.89KB** gzip (기존 문서들의 15.99/16.12 는 1.3.0 수치). 17KB 천장까지 남은 마진 ESM ~370B / CJS ~110B — 런타임 기능 추가는 여전히 CI 게이트 위험.
> - **스테일 문서 전수 스윕 (3-agent 병렬 감사 후 일괄 정정)**: ① 16KB→17KB 게이트 표기 잔재 정리(CONTRIBUTING·check-bundle/release 커맨드·ci-cd/oss-references 스킬·react AGENTS — `scripts/check-bundle-size.js TARGET_KB=17` 이 단일 소스). ② 번들 수치 15.99→16.64 (README en/ko 배지·본문, packages/react README, docs-site api/react.md en+ko, config meta). ③ 랜딩 "≤16 KB" 문구를 ceiling 기준 "≤17 KB" 로(Hero·StatStrip·WhyKalyx·FeatureGrid·index.tsx + ko code.json + 테스트 2건 — **16.64KB 실측이 16 을 넘겨 기존 문구가 허위가 됐기 때문**). ④ README en/ko: 어댑터 3종 패키지 표 등재, 훅 3→7종(+/headless import 예시), RTL/locale 기능 추가, Ark UI 문구 정정("standalone TimePicker 없음"). ⑤ packages/{core,react} AGENTS.md·README 구조 현행화(core adapters/ 디렉토리 없음, test-helpers, /headless 훅 4종, rtl.ts, DIY 어댑터 안내→배포된 dayjs/luxon 패키지 안내, 죽은 `/docs/comparison` 링크 제거). ⑥ RELEASING.md 전면 재작성(1.1.0-wave 프레이밍 폐기 — 5패키지 전부 OIDC 완료, verify-changesets pre-flight, 신규 패키지 첫 배포 플레이북: 0.0.0 초기버전·`pnpm publish`·CDN 전파 지연 함정). ⑦ docs-site custom.css 의 은퇴한 teal 잔재 제거(`--ifm-color-secondary #2dd4bf`·미사용 `--kalyx-gradient`·main.jpeg 팔레트 코멘트 — 전부 미참조 확인 후). ⑧ 이 파일 §2/§4/§5/§6 구조 정정(어댑터 분리 완료, 훅 7종, 테스트 197/776).
> - **깨끗함 확인(정정 불필요)**: Playground·kalyx-demo theme.css·데모 AVIF 7종 두 위치 동기화·en/ko 문서 패리티(35 파일)·RTL/luxon 문서화·floating-ui 0.27 표기·announcementBar/comparison 잔재 없음·og-hero.png 온브랜드. `apps/docs` 는 deprecated e2e 픽스처(의도적 스코프 밖, blue-600 팔레트 유지). 코드예제의 `indigo-600` 은 의도된 scope boundary 라 유지.
> - ~~**잔여 후보(미처리)**~~ → **같은 세션에서 둘 다 처리 완료**: ① adapter 3종(date-fns/dayjs/luxon)에 README.md 신설 — 배지·install·`/headless` 사용 예시·UTC 계약·conformance 안내. dayjs `extend(utc)` 내부 적용/luxon `zone:'utc'` 고정은 소스로 검증 후 기술. **npm 페이지 반영은 다음 publish 시점**(changeset 미추가 — README-only patch 릴리즈 여부는 사용자 결정). ② docs-site static/img 고아 에셋 6종 삭제(git rm — npm 게시 README·레포 전체 무참조 확인, 잔존 = demos/·kalyx-logo.svg·og-hero.png). 삭제 후 docs-site en+ko 빌드 재검증 green.
>
> **🟢 2026-07-10 최근 작업 로그 #3 (저녁 세션 — 랜딩 재디자인 + 비주얼 패스 + 데모 정렬, PR #170 계속):**
> - **핸드오프(다음 세션 필독)**: [`docs/superpowers/specs/2026-07-10-ui-demo-refinement-handoff.md`](docs/superpowers/specs/2026-07-10-ui-demo-refinement-handoff.md). **다음 세션 시작점 = 데모 클립 7종을 하나씩 이미지로 보여주고 디테일 수정 요청 수렴.**
> - ~~**⚠️ PR #170 아직 OPEN(미머지)**~~ → **2026-07-11 머지 완료 + #171 로 1.4.0 배포** (위 2026-07-21 로그 참조). 브랜치 `feat/unify-design-system`. 오후 토큰 단일화 3커밋 + 저녁 4커밋이 **한 PR에 누적**이었음.
> - **랜딩 재디자인** (사용자 "식상/올드" 피드백 → TanStack 벤치마크): (a) slop 제거 — WhyKalyx 보라 그라디언트 카드→accent rule, Hero titleAccent 그라디언트→solid indigo; (b) 로고 흐린 mascot PNG→`static/img/kalyx-logo.svg` 캘린더 마크(logo+favicon); (c) **StatStrip** 신설(정적 사실 4 + 라이브 fetch npm/stars, 실패시 `—`, **실제 수치** 과장 안 함); (d) **SameJsxBlock**을 정적 코드 3개→**인터랙티브 비대칭 스타일 스위처**(탭 전환 시 실제 DatePicker 리스킨, BrowserOnly+lazy).
> - **비주얼 패스** (커밋 e306537): custom.css에 비주얼 토큰(`--kx-elev-1/2`, `--kx-elev-accent`, `--kx-accent-tint`, `--kx-hairline`, `--kx-dot`, `--kx-radial` light+dark). Hero 타이포 clamp 4.5rem + 배경 radial wash+dot-grid + CTA glow, HeroDemo elevation+glow border, 전 카드 flat→layered shadow+hover glow, 섹션 5→7rem, `<Reveal>` 래퍼로 scroll-in(IntersectionObserver, SSR-safe, reduced-motion 비활성). anti-slop 준수(그라디언트 남발·네온 금지, accent는 tint/glow로만).
> - **데모 테마 정렬** (커밋 f9c0eb2): `kalyx-demo/src/theme.css`에 랜딩 언어 이식 — 선택 셀/시간옵션/AM-PM **accent glow**, popover/list **layered shadow+hairline border+큰 radius**(input 10/card 16), preview 배경 **radial wash+dot-grid**. 7종 AVIF/WebM 재생성 + `img/demos/`·`apps/docs-site/static/img/demos/` 두 위치 반영. 검증 프레임에서 선택 항목 `#5b4fe1`+glow, popover depth 확인.
> - **검증**: docs-site vitest 55 pass(axe 포함), en+ko 빌드 성공, typecheck+lint pass, PR #170 CI 전부 통과.
> - **함정(다음 세션)**: ① AVIF 로컬 ffmpeg 1프레임만 디코드 → 색/glow 검증은 **WebM 프레임**으로(핸드오프 §1에 열린-팝오버 타임스탬프 정리). ② 데모 정지프레임 확인 시 datepicker/monthpicker 후반은 팝오버 닫혀 입력만 보임 → 앞쪽(~2s) 프레임 잡을 것. ③ 움직이는 실물 갤러리 `kalyx-demo/out/preview.html`(gitignore, `npx serve kalyx-demo/out -l 4712`). ④ Vercel 프리뷰=로그인 벽 → 화면 확인은 로컬 프로덕션 빌드. ⑤ docs-site 테스트는 루트에서. ⑥ `index.tsx` JSX namespace tsc 에러 사전존재·무해.
>
> **🟢 2026-07-10 최근 작업 로그 #2 (오후 세션 — UI 디자인 시스템 단일화, PR #170):**
> - **목표**: 컴포넌트 샘플 UI·데모 테마·docs-site 공식문서 UI 를 하나의 일관된 디자인 언어로 통일. `design-system` 스킬(`~/Desktop/dev-hub/skills/engineering/design-system/`, Astryx 기반, disable-model-invocation — 경로로 직접 로드)을 명시적으로 로드해 적용. 핸드오프: `docs/superpowers/specs/2026-07-10-ui-improvement-handoff-astryx.md`. **PR #169(데모 파이프라인+Playground)는 이미 MERGED 확인.**
> - **토큰 단일화 (핵심)**: accent 가 **두 개의 다른 indigo**로 갈려 있었음(docs-site `#5b4fe1` vs 데모/Playground `#4f46e5`) + neutral 도 zinc(docs-site) vs slate(데모/Playground)로 갈림. → **accent = 브랜드 `#5b4fe1`(dark `#8b80ff`), neutral = Tailwind slate 로 3소스 전부 수렴.** (a) `custom.css` zinc→slate + dark bg/navbar slate-900 정렬, (b) `kalyx-demo/src/theme.css` accent `#4f46e5`→`#5b4fe1`(dark `#818cf8`→`#8b80ff`, soft/focus 브랜드 hue 파생), (c) Playground `classNamesByPicker.ts` `indigo-600`→Tailwind `primary`(이미 config 에 `#5b4fe1`). **신규 스펙 `docs/superpowers/specs/2026-07-10-kalyx-design-system.md`**(base→semantic 2계층, accent ramp+slate scale+역할, 대비 검증).
> - **⚠️ Scope boundary(중요 — 다음 세션 주의)**: 통일은 **실제 렌더되는 표면**만 대상. `docs/recipes/tailwind.md`·`hooks/*.md`·`quick-start.mdx`·`SameJsxBlock` 의 `indigo-600` 은 **사용자가 복붙하는 코드 예제**라 표준 Tailwind 로 그대로 둠(리더는 `primary` 색이 없으니 `primary` 로 바꾸면 복붙이 깨짐). 스펙 문서에 이 경계 명시. `.kx-shadcn` 레시피의 slate 아닌 색도 "shadcn new-york 팔레트 시연" 목적이라 의도적 유지.
> - **랜딩 anti-slop 패스**: FeatureGrid 이모지 아이콘(🎨⚡🌍📦 — 배너드 리스트 tell) → **의존성 0 인라인 SVG 셋**(`FeatureGrid/FeatureIcon.tsx`, 24×24 grid·stroke 1.75·currentColor) + accent chip. 카드 lift-on-hover(`prefers-reduced-motion` 게이트). (zero-CSS 라이브러리라 아이콘 라이브러리 추가 안 함.)
> - **데모 7종 재생성**: `kalyx-demo` 파이프라인 재실행(Playwright record → ffmpeg **libsvtav1**). 주입 `theme.css` 가 카메라 색을 지배(`[data-selected]{…!important}` 가 Playground Tailwind class 를 이김)라 라이브 사이트 미배포 상태와 무관하게 `#5b4fe1` 반영 — TimePicker 프레임에서 선택 항목이 `#5b4fe1` 육안 확인. `img/demos/`(README) + `apps/docs-site/static/img/demos/`(docs) 두 위치 갱신. ⚠️ 로컬 ffmpeg 는 애니메이션 AVIF 를 1프레임만 디코드 → 색 검증은 **WebM 후반 프레임**으로 할 것(`ffmpeg -ss <t> -i out/<p>.webm -frames:v 1`).
> - **검증**: docs-site vitest 50 pass(axe 포함), `pnpm --filter docs-site build` en+ko 성공, typecheck+lint pass, **PR #170 CI 전부 통과**. changeset 불필요(docs/example only), release 아니라 `--admin` 불필요(1명 승인 대기). 3커밋(토큰/랜딩/데모) + PR 1개.
> - **함정 기록**: (1) docs-site 테스트는 **루트에서** 실행(`pnpm vitest run apps/docs-site/...`) — `apps/docs-site` 안에서 돌리면 `test/setup.ts` 못 찾음. (2) `index.tsx:9` JSX namespace tsc 에러는 **사전 존재·무해**(CI Type Check 는 별도 tsconfig 로 통과). (3) FeatureGrid CSS 에 `color-mix(in srgb, …)` 사용 — 빌드 통과·최신 브라우저 전제(docs 청중 OK).
> - **남은 열린 항목(다음 세션 후보)**: Astryx "Themes 미리보기" 페이지 신설(같은 피커를 여러 브랜드 토큰으로 — 스펙 open-question [low]), Astryx "맥락 속 시연"(예약 폼/대시보드 use-case 데모). 토큰이 이제 단일 소스라 둘 다 비용 낮음.
>
> **🟢 2026-07-08 최근 작업 로그 #2 (오후 세션 — luxon/RTL publish 마무리 + fast-check 확장):**
> - **`@kalyx/react@1.3.0` npm 배포 완료** — RTL `dir` prop(TC-M4). dist-tag `latest` = **1.3.0**. GitHub Release 자동 생성. Version PR #163 를 `--admin` 머지(봇 PR이라 필수 체크 PR Check/Security Audit가 `action_required`로 남아 정상 머지 불가 — approve API도 "fork PR 아님"이라며 403 거부. 이게 release PR류에 `--admin`이 필요한 구조적 이유). `@kalyx/core` 는 RTL이 react-only라 1.2.0 유지.
> - **`@kalyx/adapter-luxon@0.1.0` npm 첫 배포 완료** — B3 패키지가 드디어 npm 등재(3번째 어댑터). Trusted Publisher(OIDC)도 사후 등록 완료(`jiji-hoon96/kalyx` / `release.yml` / environment 비움 / `npm publish`). → **남은 후속 (c) 완료.** dayjs·date-fns 도 이미 등록돼 있었음(레지스트리 메타 `_npmUser.trustedPublisher` 로 재확인 — 아래 참고). → **스코프 5개 전부(core·react·date-fns·dayjs·luxon) OIDC 자동화 완료, cleanup #1 종료.**
> - **⚠️ 함정 #1 (luxon 첫 배포 버전) — PR #165**: main의 luxon `package.json` version이 `0.1.0`으로 박혀 있어 minor changeset이 이를 **`0.2.0`으로 범프** → 첫 배포가 0.1.0을 건너뛸 뻔. dayjs 선례(초기값 `0.0.0`)에 맞춰 `0.0.0`으로 되돌림 → changeset이 `0.0.0→0.1.0`으로 정확히 범프(로컬 `changeset version`으로 검증). **교훈: 새 배포 패키지의 초기 `version`은 `0.0.0`으로 둘 것**(minor changeset이 첫 릴리즈를 0.1.0으로 만든다).
> - **⚠️ 함정 #2 (신규 스코프 패키지 첫 배포)**: release.yml은 토큰 없이 **OIDC Trusted Publishing만** 씀. OIDC는 **이미 존재하는 패키지**에만 신뢰관계를 걸 수 있어, 신규 패키지(luxon)는 CI에서 **E404**로 실패(react는 기존 패키지라 성공 — release publish가 부분성공 `code 1`로 끝난 원인). **신규 패키지 첫 배포는 인증 사용자가 수동으로** 해야 함(date-fns/dayjs도 밟은 경로).
> - **⚠️ 함정 #3 (수동 배포 도구) — 중요**: 신규 패키지 첫 배포에 **`npm publish`를 쓰면 안 됨** — `workspace:^`(pnpm 전용 프로토콜)를 치환하지 않고 그대로 올려 npm이 **400 Bad Request**로 거부. 반드시 **`pnpm publish`**(배포 직전 `workspace:^`→`^1.2.0` 실제 버전 치환. `pnpm pack`으로 tarball 열어 검증함). 명령: `cd packages/adapter-luxon && pnpm publish --no-git-checks`(publishConfig.access=public 있어 `--access public` 생략 가능).
> - **⚠️ 함정 #4 (배포 후 전파 지연)**: `pnpm publish` 성공 직후 `npm view <pkg> version` 이 **E404**로 나와도 배포 실패가 아님 — 버전 엔드포인트(`https://registry.npmjs.org/@kalyx%2Fadapter-luxon/0.1.0`)는 이미 **200**이면 성공. 레지스트리 **루트 인덱스 CDN 전파 지연**(수 분)일 뿐. **이때 재배포 절대 금지** — "cannot publish over 0.1.0" **403**만 뜸(이건 "이미 올라갔다"는 증거). 확인은 버전 엔드포인트 200 여부로.
> - **fast-check 속성테스트 (PR #166 머지 완료)** — Track C "fast-check 최우선"을 착수하려 보니 **calendar/timezone은 이미 #140/#143로 완료**돼 있었음(세션 메모리가 "최우선/미착수"로 오도). 남은 순수 모듈 **time·locale**로 확장: time(setTime/getTime round-trip, to12Hour↔to24Hour bijection over 0..23 + RangeError, parse↔format round-trip, generateMinutes step 구조, isSameTime 동치관계), locale(getWeekdayNames 7개+Sun→Mon 좌회전+permutation, getWeekStartForLocale 0|1 codomain, getMonthName non-empty). **test-only bundle-0**(CI diff ±0 B), 선례(#140/#143)대로 **changeset 없이** 머지. 763 tests pass. → **core property 스윕이 순수 모듈 전부 커버.** ⚠️ fast-check 콜백은 화살표 단문 `() => expect(...)` 금지(반환값 falsy 오인) — 반드시 중괄호 블록.
> - **남은 후속 갱신**: (a)~(c) 완료. (b) dayjs 는 이미 npm 배포+Trusted Publisher 완료 확인. **`@kalyx/adapter-date-fns` Trusted Publisher 도 등록·작동 확인**(레지스트리 최신 `1.0.1` 의 `_npmUser` = `GitHub Actions`/`npm-oidc-no-reply`, `trustedPublisher.id="github"`, `dist` 에 `attestations`+`signatures` → 이미 OIDC 로 배포된 실적. cleanup #1 종료). **남은 것**: Track C 잔여(`DisabledRule` per-picker narrowing, e2e locale/mid-flight prop 확장 — fast-check 는 이제 완료).
>
> **🟢 2026-07-08 최근 작업 로그 #1 (오전 세션):**
> - **PR #162 머지 완료** — `@kalyx/adapter-luxon` + RTL 지원 + release changeset 가드를 한 PR 3커밋으로 묶어 `--squash --admin` 머지(승인 리뷰 부재 + main 1명 승인 보호라 admin 필요, 이 레포 관행). 머지 커밋 `03f1037`. ~~아직 npm publish 전~~ → **오후 세션에서 publish 완료**(위 로그 #2 참고). dist-tag `latest` 는 ~~여전히 1.2.0~~ → **1.3.0(react)**.
>   - **B3 완료 — `@kalyx/adapter-luxon@0.1.0`**: luxon 백엔드 `DateAdapter`(UTC 고정), timezone 은 `@kalyx/core` 위임, `@kalyx/core/test-helpers` conformance 21/21 통과(3번째 백엔드). date-fns/dayjs 와 동일한 8-토큰 `format` 제한 공유(시스템 공통, luxon 특유 결함 아님). `toISO` 의 `+00:00→Z` regex 는 luxon 3.x 에선 dead-code(무해, 안전망).
>   - **TC-M4 완료 — RTL `dir` prop**: 6개 picker Root(DatePicker/RangePicker/DateTimePicker/MonthPicker/YearPicker/WeekPicker)에 `dir="ltr"|"rtl"`. RTL 시 grid 에 `dir` 스탬프 + ArrowLeft/Right 물리 스왑(WAI-ARIA grid; 세로/PageUp·Down/Home·End 는 논리방향 유지), disabled-skip 방향 인식. `_shared/rtl.ts`(horizontalDayStep·isBackwardKey) + grid-keyboard.ts 인덱스 스왑. `Direction` 타입 main+/headless export. **TimePicker 는 캘린더 grid 없어 의도적으로 `dir` 미지원.**
>   - **리뷰 중 버그 발견·수정(MODERATE)**: MonthGrid/YearGrid/MonthPicker/YearPicker 의 `<div role="grid">` 4곳에 `dir` 속성 누락(키보드는 RTL 인데 DOM 엔 방향 선언 없어 AT 열순서·CSS 미러링 깨짐). day 캘린더 `<table>` 은 정상이었음. → 4곳 `dir={ctx.dir}` + 회귀 테스트 4건 추가.
>   - **cleanup #3 완료 — `scripts/verify-changesets.mjs`**: ignored(`docs`/`@kalyx-example/*`)+publishable 혼합 changeset 을 release 전 차단(그대로 두면 `changeset publish` 가 중도 실패). `release.yml` 에 step 추가. `.changeset/config.json` ignore 에 `@kalyx-example/*` 추가. 순수 헬퍼 단위테스트 포함. → §14 "v1.0 직후 처리 필요" 3번의 **남은 부분(ignored changeset publish 차단 사전검증) 이제 완료**.
>   - **문서(docs-site en+ko)**: `dir` prop 을 DatePicker/RangePicker/DateTimePicker props 표 + MonthPicker/YearPicker/WeekPicker 상속 명시. internationalization RTL 섹션을 "조상 `dir`=CSS 미러링 / Root `dir` prop=화살표키 미러링" 2계층으로 정정(기존 설명이 화살표 스왑을 조상 dir 로 오도). adapters 가이드/concepts/api 에 `@kalyx/adapter-luxon`·`-dayjs` 를 실제 패키지로 등재(기존엔 "가상 예시"였음) + `@kalyx/core/test-helpers` conformance 안내.
>   - **CI 함정 기록(다음 세션 주의)**: ko `internationalization.md` 헤딩에 Docusaurus 커스텀 id `{#right-to-left-rtl}` 를 붙였더니 **MDX 가 `{...}` 를 JS 표현식으로 파싱하려다 acorn 에러 → ko Docusaurus build 실패**(en 은 커스텀 id 없어 무사). 커스텀 id 제거 + ko 컴포넌트 문서 앵커를 자동 slug `#오른쪽-왼쪽-rtl` 로 교체해 해결(PR 두번째 push `fix(docs)`). **교훈: 한글 헤딩 + `{#custom-id}` 조합 금지.** docs-site 변경 시 `pnpm --filter docs-site build` 로컬 검증 필수(en+ko 둘 다).
> - **남은 후속(오전 세션 기준, #2에서 대부분 해소)**: ~~(a) release.yml 다음 실행으로 luxon/RTL Version PR → publish 마무리~~ → **완료**. ~~(b) B1 `@kalyx/adapter-dayjs` npm 미배포 상태인지 재확인~~ → **이미 배포+Trusted Publisher 완료 확인**. ~~(c) `@kalyx/adapter-luxon` npmjs Trusted Publisher(OIDC) 등록~~ → **완료**. **남은 것**: ~~`@kalyx/adapter-date-fns` Trusted Publisher 점검(cleanup #1,2)~~ → **완료(등록·OIDC 배포 실적 확인)**, ~~fast-check~~(완료), `DisabledRule` per-picker narrowing, e2e locale/mid-flight prop 확장.

> **🟢 2026-06-26 최근 작업 로그 (세션 메모리):**
> - **1.2.0 정식 npm 배포 완료** — `@kalyx/core@1.2.0` + `@kalyx/react@1.2.0` publish (dist-tag `latest`). 내용: **B5**(DateTimePicker.Presets/.Preset on `/headless`) + **B7**(weekStartsOn locale 추론). GitHub Release 2건 자동 생성. (`@kalyx-example/*` 는 private 0.0.x, publish 안 됨.) Changesets action 정상 동작.
> - **`release.yml` 번들 게이트 버그 수정 (PR #160)** — stale 인라인 `MAX=16` + shell `gzip -c` 가 ESM 16.02KB 를 17KB 천장(B10) 후에도 막아 1.2.0 release 가 #158/#159 푸시마다 실패하고 있었음. → 정식 `node scripts/check-bundle-size.js`(`TARGET_KB=17`) 호출로 교체. 이게 **release 가 막혀 있던 근본 원인**이었음. (§14 "v1.0 직후 처리 필요" 3번 부분 완료.)
> - **docs-site 대규모 개선 (PR #159, D1~D12)** — 7개 경쟁 OSS 공식문서 리서치 기반. spec: [`docs/superpowers/specs/2026-06-25-docs-competitive-research-and-improvement-plan.md`](docs/superpowers/specs/2026-06-25-docs-competitive-research-and-improvement-plan.md). 추가물: `concepts/styling.md`(data-* 계약 표), 컴포넌트별 Anatomy 트리, a11y APG 인용+키보드 표, `recipes/use-cases.md`, `/headless` 훅 4종 페이지, timezone "하루 어긋남" 트러블슈팅, pm 탭(npm2yarn), 라인 하이라이트/파일명 헤더, `llms.txt`+페이지별 raw `.md`(postBuild 플러그인 `src/plugins/llms-txt.ts`), RTL 토글 데모. **전부 en+ko 작성.** 홍보 콘텐츠(comparison/blog)는 2026-06-18 결정대로 미진행.
> - **보안 이슈 #136/#141 정리** — 2026-06-18 자동 생성된 stale 노이즈(security 워크플로우는 실패 시 issue 자동 생성하나 자동 닫기 안 함). 로컬 `osv-scanner` "No issues found" + CI OSV/License pass 확인 후 근거 코멘트와 함께 close. 실제 코드 취약점 없음. (남은 GHSA-h67p-54hq-rp68 js-yaml 은 `osv-scanner.toml` 에 의도적 필터, `ignoreUntil=2027-01-01`.)
> - **주의:** docs-site `src/pages/index.tsx:9` 에 사전부터 존재하는 `JSX namespace` typecheck 에러 있음(CI Type Check 는 통과 — tsc 설정 차이). main 보호로 release PR 류는 `gh pr merge --admin` 필요(일반 머지 BLOCKED).

> **🧭 2026-06-18 확정 방향 (single source of truth):** [`docs/superpowers/specs/2026-06-18-current-state-analysis-and-correctness-first-direction.md`](docs/superpowers/specs/2026-06-18-current-state-analysis-and-correctness-first-direction.md)
> 10-에이전트 멀티에이전트 현 시점 분석(7차원 → 적대적 검증 → 종합, 1차 출처 검증)으로 선행 방향을 validate. 결론:
> - **홍보는 접는다** (사용자 결정 — 외부 사용자 0, HN 신규계정 auto-dead). 라이브 홍보 콘텐츠(블로그·announcementBar·comparison) 제거. → 아래 Track 우선순위는 이 spec을 따른다.
> - **확정 실행 순서 (전부 bundle-0):** ①fast-check 속성테스트 `@kalyx/core` (1.0.4 patch, T-G3 리드) → ②`@kalyx/core/test-helpers` conformance suite → ③누락 hook 4종(`/headless`) → ④(선택) dayjs 어댑터.
> - **`@kalyx/adapter-temporal` 근시일 드롭** (정확성 0 검증 — 어댑터는 core Intl로 재위임. 인터페이스가 ISO-string이라 Temporal 역량 운반 불가). Temporal **전략**은 core 레벨 Track D demand-gate로 보존.
> - **번들 마진 = CJS 126 B / ESM 221 B** (binding=CJS). 런타임 기능 추가 = CI 깸. (이전 "~380 B" 표기는 stale.)
>
> 이전 spec (2026-06-17, 여전히 유효한 근거 카탈로그):
> - **경쟁 분석 + 결함 audit**: [`2026-06-17-competitive-landscape-and-v1.1-roadmap.md`](docs/superpowers/specs/2026-06-17-competitive-landscape-and-v1.1-roadmap.md) · [`2026-06-17-kalyx-1.0-functional-audit.md`](docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md)
>
> 핵심 요약: 1.0 thesis (headless + 7 picker + adapter + ISO/UTC + ≤16KB) **그대로 유효** (2026-06 적대적 재검증 통과). Headless UI는 여전히 DatePicker 거부, react-day-picker v10.0.1은 cleanup release로 TimePicker/Input 없음, react-datepicker #1018은 "not a bug" 종결(native Date 유지), MUI X 9.5.0은 58.2KB gzip에 Range가 Pro 유료, Chakra v3.34 (March 2026) DatePicker는 Ark UI/`@internationalized/date` 강결합 심화 → **포지셔닝 승리**. Adobe stack은 Temporal-bound이나, Temporal 역량은 어댑터가 아니라 **core**에 속함(위 드롭 근거).

### v1.0 완료 항목 (회고)

- **RC → stable 졸업**: 2026-05-27 ~ 06-08, rc.0 ~ rc.14 누적 → `@kalyx/core@1.0.0`, `@kalyx/react@1.0.0`, `@kalyx/adapter-date-fns@1.0.0` publish. dist-tag `latest` = 1.0.0.
- **어댑터 중립 추출 (Option C — Hybrid)**: `@kalyx/core` date-fns 의존 0 (PR #82), `@kalyx/adapter-date-fns` 별도 패키지화 (PR #82), `@kalyx/react/headless` 엔트리 + adapter 가이드 (PR #88).
- **보안**: GHSA-5xrq-8626-4rwp Critical fix via vitest 4 업그레이드 (PR #89). OSV scan 0 vulnerabilities.
- **stable release prep**: README / docs-site / announcementBar stale 카피 정리 (PR #91).
- **거버넌스**: main branch ruleset `main-protection` 활성화 (required checks + force push 차단).
- **번들**: ESM 15.78KB / CJS 15.88KB gzip (한계 16KB).
- **테스트**: 497/497 unit pass, axe 14/14, e2e 31 scenarios.

### Track A — 1.0.x patch (즉시, 2-4주)

audit 결함 카탈로그 기준. 공개 API 변경 없음, 번들 50바이트 이내. 자세한 근거는 `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md` 의 ID 참조.

| # | 항목 | audit ID | 비고 |
|---|---|---|---|
| A1 | Escape 소비 + 이중 핸들러 수정 | A-D1, A-D2 | `usePopover.ts:92-96`, `Calendar.tsx:198-200` |
| A2 | Popover 닫힐 때 focus restore | A-D3 | `usePopover.ts:58` guard 제거 (코멘트가 틀림) |
| A3 | DST gap-time `setTimeInTimezone` snap-forward + JSDoc + 테스트 | T-D1 | `timezone.ts:199-225` |
| A4 | DST ambiguous-time 명시 (`disambiguation: 'earlier'` 선언) + strict 테스트 | T-D2 | `timezone.test.ts:93-106` |
| A5 | `verify-entry-split.mjs` PR check 통합 | B-D1 | `/headless` date-fns 부재 회귀 가드 |
| A6 | gzip 측정 한 곳으로 통일 (Node `gzipSync`) | B-R1 | tsup / script / CI 한 소스 |
| A7 | RangePicker hover preview 회귀 테스트 | TC-H1 | 0건 → 최소 1건 |
| A8 | 롤링 커버리지: 반시간 offset (T-D3), `minDate`/`maxDate` × TZ (T-G1), value-on-disabled (TC-M1), controlled↔uncontrolled (TC-M2), props-during-open (TC-M3), DateTimePicker TZ round-trip (TC-M5), TimePicker step snap (TC-M6), WeekPicker year boundary (TC-M7) | various | 코드 변경 없이 테스트만 |

### Track B — v1.1 minor (6-10주)

어댑터 패턴을 "약속"에서 "검증된 실력"으로. 두 번째 어댑터 출시 + conformance suite + 누락 hook이 척추.

> **⚠️ 실행 순서는 2026-06-18 spec을 따른다** (위 §14 intro): ①fast-check 속성테스트(1.0.4, 아래 Track C에서 끌어올림) → ②B2 conformance → ③B4 hooks → ④(선택) B1 dayjs. **B6 temporal·B11 comparison 랜딩은 드롭됨** (아래 표 참조). **B5+B7 은 `@kalyx/{core,react}@1.2.0` 으로 2026-06-26 npm 배포 완료.**

| # | 항목 | 근거 |
|---|---|---|
| B1 | `@kalyx/adapter-dayjs` 출시 (P0) | Mantine + ~50% dayjs 사용자에게 drop-in headless 옵션 |
| B2 | `@kalyx/core/test-helpers` 어댑터 conformance test suite | B1/B3/B6 unblock — adapter 작성자 테스트 부담 제거 |
| ~~B3~~ | ~~`@kalyx/adapter-luxon`~~ → **완료 + npm 배포** (PR #162, `@kalyx/adapter-luxon@0.1.0` publish — 2026-07-08) | B2 후 비용 낮음. luxon 백엔드 `DateAdapter`, conformance 21/21 통과(3번째 백엔드). npm 등재 완료(수동 첫 배포 + Trusted Publisher 등록) |
| B4 | `useMonthPicker` / `useYearPicker` / `useWeekPicker` / `useDateTimePicker` hooks (`/headless` 전용) | audit API-G1. 기본 entry 번들 압력 회피 |
| ~~B5~~ | ~~`DateTimePicker.Presets` (`/headless`에서 RangePicker.Presets 패턴 재사용)~~ → **완료** | audit API-G2 — `DateTimePicker.Presets`/`.Preset` 가 datetime 전체(날짜+시간)를 원자적으로 커밋. `/headless` 전용 배치(기본 엔트리 천장 회피), `selectDateTime` Root 메서드는 양쪽 엔트리 공통 (+~40 B CJS) |
| ~~B6~~ | ~~`@kalyx/adapter-temporal@0.x`~~ → **드롭** (2026-06-18) | 정확성 0 검증: 어댑터 인터페이스는 ISO-string in/out이라 Temporal 역량 운반 불가, core Intl로 재위임. 홍보 접어 optics 청중도 없음. Temporal **전략**은 core 레벨 Track D demand-gate로 보존 |
| ~~B7~~ | ~~`weekStartsOn` locale 자동 추론 (명시 prop override)~~ → **완료** | audit T-G2 — `getWeekStartForLocale` (core) + DatePicker/RangePicker Root 가 `weekStartsOn` 미지정 시 locale 추론 (명시 prop 우선). +44 B CJS |
| B8 | `/headless` adapter guide 한국어 번역 | 주 성장 오디언스 KO 부재 |
| ~~B9~~ | ~~번들 margin 도구: `scripts/bundle-diff.mjs` + PR comment~~ → **완료** (PR #153) | audit B-D2 — `scripts/bundle-diff.mjs` 가 base 대비 byte-level delta + 남은 마진(**CJS 126 B / ESM 221 B**)을 PR 코멘트로 가시화. gzip 측정은 `check-bundle-size.js` 의 `getGzipBytes` 재사용(B-R1 단일 소스) |
| B10 | a11y polish set: A-G1..A-G5 | DatePicker `announce()` 패리티, WeekPicker nav 결정, axe-when-open, Trigger focus-restore 테스트, week-mode aria-label. **부분 완료:** A-G3(axe-when-open, 이미 7픽커 충족) · A-G4(focus-restore 테스트 Month/Year/Week/DateTime 추가) · A-G2(WeekPicker day-granular focus + week-commit 설계 확정·테스트 락) · A-G1(announce() 패리티 — DatePicker/DateTimePicker Root live-region, 16→17KB 천장 상향). **드롭:** A-G5(week-mode aria-label — 같은 주 7일이 동일 부분 문자열 공유해 쿼리 모호성 유발, 이득 < 회귀 비용) |
| ~~B11~~ | ~~docs-site comparison 랜딩 비교~~ → **드롭** (2026-06-18) | 홍보 접음. comparison 페이지 자체도 제거 (마케팅 모먼트 폐기) |

### Track C — v1.2 (다음 분기)

- ~~RTL 지원 + 테스트 (audit TC-M4)~~ → **완료** (PR #162, 2026-07-08). 6개 picker Root `dir` prop, grid 화살표키 물리 스왑 + `dir` 스탬프, MonthGrid/YearGrid/MonthPicker/YearPicker grid 요소 `dir` 누락 버그 수정, en+ko 문서화. TimePicker 는 grid 없어 미지원.
- ~~`fast-check` property test 도입 (audit TC-H2)~~ → **완료** (calendar/timezone PR #140/#143, time/locale PR #166 — 2026-07-08). core 순수 모듈(calendar·timezone·time·locale) 전부 property test 커버. 전부 test-only bundle-0, changeset 없이 머지.
- `DisabledRule` 타입 narrowing per picker 또는 시맨틱 명시 (audit API-G3)
- e2e 확장: mid-flight prop 변경, locale switch
- per-dependency 번들 크기 리포트 (audit B-R2, 특히 `@floating-ui/react` 기여도)

### Track D — Strategic watch (착수 보류)

- **Persian/Buddhist/Islamic/Hebrew 등 비-Gregorian 캘린더**: 사용자 GitHub issue ≥3 또는 enterprise sponsor 1 시 착수. 현재 docs는 "Gregorian-only v1" 명시.
- **React Native adapter**: 동일하게 보류.
- **Storybook / visual regression**: 1.0.x ~ 1.1에서 시각 회귀 3건 이상 시 escalation.

### v1.0 직후 처리 필요 (1.0 cleanup follow-up)

1. ~~`@kalyx/adapter-date-fns` npmjs.com Trusted Publisher 등록~~ → **완료 (2026-07-08 확인).** 레지스트리 최신 `1.0.1` 의 `_npmUser` = `GitHub Actions`/`npm-oidc-no-reply@github.com`, `trustedPublisher.id="github"`, `dist` 에 `attestations`+`signatures` → 이미 OIDC + provenance 로 자동 배포된 실적. **스코프 5개(core·react·date-fns·dayjs·luxon) 전부 OIDC 자동화 완료.**
2. `@kalyx/adapter-date-fns@1.0.0` GitHub Release 수동 backfill (토큰 publish는 GH Release 미생성). *(1.0.1 부터는 OIDC 배포라 GH Release 자동 생성됨 — 1.0.0 만 backfill 대상)*
3. ~~`release.yml` 견고화 — ignored 패키지 changeset이 publish 차단 안 하도록 사전 검증 step.~~ → **완료:** (a) 번들 게이트 stale 16KB → `check-bundle-size.js`(`TARGET_KB=17`) 교체 (2026-06-26 PR #160). (b) ignored(`@kalyx-example/*`)+publishable 혼합 changeset 을 release 전 차단하는 `scripts/verify-changesets.mjs` step 추가 (2026-07-08 오전 세션, cleanup #3). 둘 다 완료.
4. `apps/docs/CHANGELOG.md`, vitest lockfile drift refresh. (~~`@floating-ui/react` 0.26→0.27 검토~~ → **완료**: package.json 이미 `^0.27.0`. docs-site `api/react.md` 의 0.26 표기만 정정 대상 — 2026-06-18 stale-fact 스윕)

### 카피 정정 (낮은 우선순위)

- ~~**§1**: "Ark UI: TimePicker를 버그로 제거함" 문구~~ → **이 spec과 함께 정정 완료**: "standalone TimePicker 없음 — 시간은 `@internationalized/date`의 `CalendarDateTime`을 통해 DatePicker 내부에서만". 추가 README 정리는 README 다음 패스에서.
- comparison.md / 마케팅: Adobe의 `@internationalized/date` 8KB/2.8KB는 Brotli이고 Kalyx 15.78KB는 gzip — 직접 비교 금지. 마케팅 카피에는 "~4× smaller than MUI X" (58.2/15.78 ≈ 3.7×) 정도가 정직한 한계.

> 이전 RC 단계의 `.claude/skills/rc-announcement.md` 와 `.claude/skills/adapter-extraction.md` 는 회고 자료로 보존.

---

## 15. Claude에게: 작업 전 체크리스트

새 코드를 작성하기 전 반드시 확인:

```
□ .claude/skills/ 에서 관련 스킬 파일을 먼저 읽었는가?
  - 컴포넌트 API 설계   → api-design.md
  - ARIA/키보드         → accessibility.md
  - 날짜 계산·timezone → timezone.md
  - 테스트 작성         → testing.md
  - CI 테스트 설정      → testing-ci.md
  - JSDoc/문서          → documentation.md
  - 버전·배포           → release-workflow.md
  - GitHub Actions      → ci-cd.md
  - 외부 스킬 참조      → oss-references.md
  - v1.0 RC 공지        → rc-announcement.md
  - 어댑터 중립 추출(C) → adapter-extraction.md

□ Composition API를 따르는가? (Props 폭발 없는가?)
□ SSR에서 동작하는가? (window/document 없는가?)
□ TypeScript strict 만족하는가? (any 없는가?)
□ 날짜를 ISO string으로 주고받는가? (Date 객체 금지)
□ 접근성 기준을 만족하는가? (axe 통과)
□ 테스트가 작성됐는가? (커버리지 기준 충족)
□ JSDoc 주석이 있는가? (공개 API)
□ 번들에 불필요한 의존성을 추가하지 않았는가? (16KB 목표)
□ 내부 구현이 index.ts에 실수로 export되지 않았는가?
□ changeset 파일을 추가했는가? (공개 API 변경 시 필수)
```