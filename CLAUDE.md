# CLAUDE.md — DatePicker Library

> **Claude Code용 프로젝트 컨텍스트 파일.**  
> 이 파일은 모든 대화 시작 시 자동으로 읽힌다. 코드 생성·리뷰·설계는 전부 이 파일의 원칙을 따른다.

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

- **react-day-picker (11M/week, ~22KB gzip)**: Headless지만 Calendar Grid만. Input·TimePicker 없음. v9에서도 개발자가 3개 컴포넌트를 직접 조합해야 함.
- **react-datepicker (17.5M/week, ~40-60KB gzip)**: 통합됐지만 CSS 필수 import, timezone 이슈(#1018, native Date 의존), Props 100개 이상.
- **Ark UI**: Composition 패턴이지만 **TimePicker를 버그로 제거함**. 45개 이상 컴포넌트의 범용 UI 라이브러리.
- **React Aria**: 기능 완전하지만 복잡하고, `@internationalized/date` 의존 강제 (date-fns 비호환).
- **Headless UI**: DatePicker 구현 거부 ("유지보수가 너무 큼").

**우리가 채우는 공백:** Headless + Input·Calendar·TimePicker·RangePicker 통합 + date-fns 호환 + SSR 안전 + < 12KB

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
| 번들 목표 | **< 12KB gzip** | react-datepicker 62KB 대비 |
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
<DatePicker value={date} onChange={setDate}>
  <DatePicker.Input placeholder="날짜 선택" />
  <DatePicker.Popover>
    <DatePicker.Calendar disabled={[{ dayOfWeek: [0] }]} />
    <DatePicker.TimePicker step={15} />
  </DatePicker.Popover>
</DatePicker>
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
  Calendar: DatePickerCalendar,
  Popover: DatePickerPopover,
  TimePicker: DatePickerTimePicker,
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
├── CLAUDE.md                         ← 이 파일 (항상 읽힘)
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
│   │   └── oss-references.md
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
│   │       ├── adapters/
│   │       │   └── date-fns.ts      ← UTC 기반 DateFnsAdapter
│   │       ├── utils/
│   │       │   ├── calendar.ts      ← getCalendarDays, isDateDisabled
│   │       │   └── date.ts          ← normalizeISO, parseInputValue
│   │       ├── __tests__/           ← 단위 테스트
│   │       └── index.ts             ← 공개 API
│   └── react/                        ← React 컴포넌트 레이어
│       ├── CLAUDE.md                 ← 패키지별 컨텍스트
│       └── src/
│           ├── components/
│           │   ├── DatePicker/
│           │   │   ├── Root.tsx          ← Provider, 제어/비제어
│           │   │   ├── Input.tsx         ← role="combobox", 날짜 파싱
│           │   │   ├── Trigger.tsx       ← 캘린더 아이콘 버튼
│           │   │   ├── Popover.tsx       ← Floating UI 기반
│           │   │   ├── Calendar.tsx      ← role="grid", 키보드 내비게이션
│           │   │   ├── DatePicker.test.tsx
│           │   │   └── index.ts          ← Object.assign Dot Notation
│           │   └── RangePicker/          ← Phase 1 후반
│           ├── hooks/
│           │   └── useDatePicker.ts      ← 커스텀 UI용 Hook
│           ├── context/
│           │   └── DatePickerContext.ts
│           └── index.ts                  ← 패키지 공개 API
├── apps/
│   └── docs/                         ← 문서 사이트 (Next.js, 추후 구성)
├── scripts/
│   └── check-bundle-size.js          ← 번들 크기 측정
├── test/
│   └── setup.ts                      ← Vitest 전역 설정
└── package.json
```

---

## 5. MVP 범위 (Phase 1)

### 포함 ✅

- `<DatePicker.Root>` — Context, controlled/uncontrolled
- `<DatePicker.Input>` — 텍스트 입력, 날짜 파싱, 포맷팅
- `<DatePicker.Trigger>` — 캘린더 아이콘 버튼
- `<DatePicker.Popover>` — Floating UI 기반, SSR safe
- `<DatePicker.Calendar>` — 날짜 그리드, 키보드 내비게이션
- `<RangePicker>` — 날짜 범위 선택
- `useDatePicker` hook — 완전 커스텀 UI용
- 기본 접근성 (ARIA, 키보드, axe 통과)
- SSR 안전 (Next.js App Router 실제 테스트)
- date-fns adapter

### 제외 ❌ (나중에)

- TimePicker → v0.2
- DateTimePicker → v0.3
- 다국어 완전 지원 → v0.3
- Timezone 완전 지원 (DST 포함) → v0.4
- React Native adapter → v1.0 이후

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
export { DatePicker } from './components/DatePicker';
export { RangePicker } from './components/RangePicker';
export { useDatePicker } from './hooks/useDatePicker';
export type { DatePickerProps, DatePickerValue } from './types';
export { DateFnsAdapter } from './adapters/date-fns';

// ❌ 내부 구현 절대 export 금지
export { formatDateInternal } from './utils/internal';
```

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
| `/check-bundle` | 빌드 후 번들 크기 측정, 12KB 초과 시 실패 |
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
| `e2e-and-docs.yml` | main push | 크로스브라우저 E2E + GitHub Pages 배포 |
| `security.yml` | 매주 월·의존성 변경 | 취약점·라이선스 감사 |

**Branch Protection (main):**
- PR 필수, 1명 승인
- 필수 통과: `typecheck`, `lint`, `test`, `bundle-size`, `all-pass`
- 직접 push 불가

---

## 14. 현재 이니셔티브 (2026-04 기준)

> v1.0 정식 릴리즈까지의 두 축. 각 이니셔티브의 상세 실행 계획은 `.claude/skills/` 해당 파일 참조.

### A. v1.0 Release Candidate 공지

- **상태**: `1.0.0-rc.0` pre-mode 진입 완료 (`.changeset/pre.json`), main에 머지됨
- **남은 작업**: npm publish 검증, GitHub Release 드래프트, docs 공지 배너, README 배지 갱신, 피드백 채널(`v1-rc` 라벨) 설정
- **스킬 파일**: `.claude/skills/rc-announcement.md`
- **졸업 조건**: RC 기간 2주 + `v1-rc` open 이슈 0건 + 번들 ≤12KB + axe/SSR 그린

### C. 어댑터 중립 추출 (Option C — Hybrid)

- **상태**: C1 진단 완료. 구현 착수 전.
- **방향**: `@kalyx/core`에서 date-fns 제거 → `@kalyx/adapter-date-fns` 별도 패키지로 분리. `@kalyx/react`는 이중 엔트리(`.` / `./headless`)로 "그냥 쓰면 기본 어댑터 자동 주입 / 고급 사용 시 직접 선택"을 동시 제공.
- **결정 근거**: 사용자의 약 절반이 dayjs 사용 → baked-in은 번들 중복. 동시에 "설치하면 바로 동작" 경험은 유지해야 함. TanStack Query / Zustand의 entry-split 선례 채택.
- **Breaking 영향**: `@kalyx/react` 기본 엔트리는 **0건 breaking**. `@kalyx/core`만 major (직접 사용자 극소수).
- **스킬 파일**: `.claude/skills/adapter-extraction.md`
- **후속**: v1.1+에서 `@kalyx/adapter-dayjs`, `@kalyx/adapter-luxon` 추가

> 이 두 이니셔티브는 서로 독립. A는 RC 창 동안만 유효하고, C는 v1.1까지 이어짐. 우선순위는 A → C 순.

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
□ 번들에 불필요한 의존성을 추가하지 않았는가? (12KB 목표)
□ 내부 구현이 index.ts에 실수로 export되지 않았는가?
□ changeset 파일을 추가했는가? (공개 API 변경 시 필수)
```