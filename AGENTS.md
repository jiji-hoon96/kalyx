# CLAUDE.md — DatePicker Library

> **AI 에이전트 프로젝트 컨텍스트 파일 (opencode · Claude Code 공용).**
> opencode 는 이 `AGENTS.md` 를 자동 로드하고, Claude Code 는 `CLAUDE.md`(→ `@AGENTS.md` import)로 동일 내용을 읽는다. 코드 생성·리뷰·설계는 전부 이 파일의 원칙을 따른다.
>
> **opencode 사용 시 주의:** 본문에서 참조하는 `.claude/skills/*.md` 와 `.claude/commands/*.md` (슬래시 커맨드)는 Claude Code 전용 자동 발견 경로다. opencode 에서는 자동 노출되지 않으므로, §15 체크리스트의 스킬이 필요하면 `@.claude/skills/<name>.md` 처럼 명시적으로 참조해서 읽는다. 패키지별 세부 컨텍스트는 `packages/core/AGENTS.md`, `packages/react/AGENTS.md` 참조.

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

**우리가 채우는 공백:** Headless + Input·Calendar·TimePicker·RangePicker 통합 + date-fns 호환 + SSR 안전 + ≤ 16KB

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
| 날짜 코어 | Adapter 패턴 + date-fns 기본 (v1.1에서 `@kalyx/adapter-date-fns`로 분리 예정 — [§14](#14-현재-이니셔티브-2026-04-기준)) | Temporal API 전환 대비, 사용자가 dayjs/luxon 선택 가능 |
| 포지셔닝 | Floating UI | 3KB, SSR 안전, Popper.js 후계자 |
| 번들 목표 | **≤ 16KB gzip** | react-datepicker 62KB 대비. RC 단계 12 → 13KB 상향(commit e93d082), v1.0-rc.3 grid 키보드 내비게이션 추가하면서 13 → 14KB 상향, v1.0-rc.4 MonthPicker/YearPicker disabled month/year 추가하면서 14 → 15KB 상향, v1.0-rc.8 TimePicker `filterTime` 프로그래밍 콜백 추가하면서 15 → 16KB 상향 |
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
├── AGENTS.md                         ← 이 파일 (opencode 자동 로드 · 항상 읽힘)
├── CLAUDE.md                         ← @AGENTS.md import (Claude Code 호환)
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
│   │   ├── AGENTS.md                 ← 패키지별 컨텍스트 (+ CLAUDE.md = @AGENTS.md)
│   │   └── src/
│   │       ├── types.ts             ← 타입 정의 (DateAdapter, CalendarDay 등)
│   │       ├── adapters/
│   │       │   └── date-fns.ts      ← UTC 기반 DateFnsAdapter
│   │       ├── utils/
│   │       │   ├── calendar.ts      ← getCalendarDays, isDateDisabled
│   │       │   ├── date.ts          ← normalizeISO, parseInputValue
│   │       │   ├── time.ts          ← setTime, parseTimeString, 12h/24h 변환
│   │       │   ├── locale.ts        ← Intl 기반 다국어 월/요일명
│   │       │   ├── timezone.ts      ← DST-aware timezone 유틸
│   │       │   └── labels.ts        ← 접근성 ARIA 라벨 기본값
│   │       ├── __tests__/           ← 단위 테스트 (~149 케이스, 462 전체 vitest)
│   │       └── index.ts             ← 공개 API
│   └── react/                        ← React 컴포넌트 레이어
│       ├── AGENTS.md                 ← 패키지별 컨텍스트 (+ CLAUDE.md = @AGENTS.md)
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
│           │   └── useTimePicker.ts  ← 커스텀 TimePicker UI용 Hook
│           ├── context/
│           │   ├── DatePickerContext.ts
│           │   ├── RangePickerContext.ts
│           │   └── TimePickerContext.ts
│           └── index.ts              ← 패키지 공개 API
├── apps/
│   ├── docs/                         ← 데모 사이트 (Next.js, 정적 빌드)
│   └── docs-site/                    ← 문서 사이트 (Docusaurus, i18n)
├── scripts/
│   ├── check-bundle-size.js          ← 번들 크기 측정 (16KB 제한)
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

### Headless Hooks (3종 — 모두 구현 완료 ✅)

| Hook | 용도 |
|------|------|
| `useDatePicker(options)` | 완전 커스텀 DatePicker UI |
| `useRangePicker(options)` | 완전 커스텀 RangePicker UI |
| `useTimePicker(options)` | 완전 커스텀 TimePicker UI |

### 코어 유틸 (6개 모듈 — 모두 구현 완료 ✅)

| 모듈 | 주요 함수 |
|------|----------|
| `adapters/date-fns` | DateFnsAdapter (17개 DateAdapter 메서드) |
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
// 어댑터 + 코어 타입/유틸 (re-export from @kalyx/core)
export { DateFnsAdapter } from '@kalyx/core';
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

> **⚠️ 실행 순서는 2026-06-18 spec을 따른다** (위 §14 intro): ①fast-check 속성테스트(1.0.4, 아래 Track C에서 끌어올림) → ②B2 conformance → ③B4 hooks → ④(선택) B1 dayjs. **B6 temporal·B11 comparison 랜딩은 드롭됨** (아래 표 참조).

| # | 항목 | 근거 |
|---|---|---|
| B1 | `@kalyx/adapter-dayjs` 출시 (P0) | Mantine + ~50% dayjs 사용자에게 drop-in headless 옵션 |
| B2 | `@kalyx/core/test-helpers` 어댑터 conformance test suite | B1/B3/B6 unblock — adapter 작성자 테스트 부담 제거 |
| B3 | `@kalyx/adapter-luxon` | B2 후 비용 낮음. enterprise/timezone 사용자 |
| B4 | `useMonthPicker` / `useYearPicker` / `useWeekPicker` / `useDateTimePicker` hooks (`/headless` 전용) | audit API-G1. 기본 entry 번들 압력 회피 |
| ~~B5~~ | ~~`DateTimePicker.Presets` (`/headless`에서 RangePicker.Presets 패턴 재사용)~~ → **완료** | audit API-G2 — `DateTimePicker.Presets`/`.Preset` 가 datetime 전체(날짜+시간)를 원자적으로 커밋. `/headless` 전용 배치(기본 엔트리 천장 회피), `selectDateTime` Root 메서드는 양쪽 엔트리 공통 (+~40 B CJS) |
| ~~B6~~ | ~~`@kalyx/adapter-temporal@0.x`~~ → **드롭** (2026-06-18) | 정확성 0 검증: 어댑터 인터페이스는 ISO-string in/out이라 Temporal 역량 운반 불가, core Intl로 재위임. 홍보 접어 optics 청중도 없음. Temporal **전략**은 core 레벨 Track D demand-gate로 보존 |
| ~~B7~~ | ~~`weekStartsOn` locale 자동 추론 (명시 prop override)~~ → **완료** | audit T-G2 — `getWeekStartForLocale` (core) + DatePicker/RangePicker Root 가 `weekStartsOn` 미지정 시 locale 추론 (명시 prop 우선). +44 B CJS |
| B8 | `/headless` adapter guide 한국어 번역 | 주 성장 오디언스 KO 부재 |
| ~~B9~~ | ~~번들 margin 도구: `scripts/bundle-diff.mjs` + PR comment~~ → **완료** (PR #153) | audit B-D2 — `scripts/bundle-diff.mjs` 가 base 대비 byte-level delta + 남은 마진(**CJS 126 B / ESM 221 B**)을 PR 코멘트로 가시화. gzip 측정은 `check-bundle-size.js` 의 `getGzipBytes` 재사용(B-R1 단일 소스) |
| B10 | a11y polish set: A-G1..A-G5 | DatePicker `announce()` 패리티, WeekPicker nav 결정, axe-when-open, Trigger focus-restore 테스트, week-mode aria-label. **부분 완료:** A-G3(axe-when-open, 이미 7픽커 충족) · A-G4(focus-restore 테스트 Month/Year/Week/DateTime 추가) · A-G2(WeekPicker day-granular focus + week-commit 설계 확정·테스트 락). **잔여(bundle-positive):** A-G1(announce 패리티) · A-G5(week-mode aria-label) |
| ~~B11~~ | ~~docs-site comparison 랜딩 비교~~ → **드롭** (2026-06-18) | 홍보 접음. comparison 페이지 자체도 제거 (마케팅 모먼트 폐기) |

### Track C — v1.2 (다음 분기)

- RTL 지원 + 테스트 (audit TC-M4)
- ~~`fast-check` property test 도입 (audit TC-H2)~~ → **#1로 끌어올림** (2026-06-18, 1.0.4 patch — 해자 강화 최우선). 2026-06-18 spec 참조
- `DisabledRule` 타입 narrowing per picker 또는 시맨틱 명시 (audit API-G3)
- e2e 확장: mid-flight prop 변경, locale switch
- per-dependency 번들 크기 리포트 (audit B-R2, 특히 `@floating-ui/react` 기여도)

### Track D — Strategic watch (착수 보류)

- **Persian/Buddhist/Islamic/Hebrew 등 비-Gregorian 캘린더**: 사용자 GitHub issue ≥3 또는 enterprise sponsor 1 시 착수. 현재 docs는 "Gregorian-only v1" 명시.
- **React Native adapter**: 동일하게 보류.
- **Storybook / visual regression**: 1.0.x ~ 1.1에서 시각 회귀 3건 이상 시 escalation.

### v1.0 직후 처리 필요 (1.0 cleanup follow-up)

1. `@kalyx/adapter-date-fns` npmjs.com Trusted Publisher 등록 — 1.0.0 publish는 토큰 수동이라 다음부터 OIDC + provenance 자동화.
2. `@kalyx/adapter-date-fns@1.0.0` GitHub Release 수동 backfill (토큰 publish는 GH Release 미생성).
3. `release.yml` 견고화 — ignored 패키지 changeset이 publish 차단 안 하도록 사전 검증 step.
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