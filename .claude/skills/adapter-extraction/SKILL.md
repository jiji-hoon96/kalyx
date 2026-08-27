---
name: adapter-extraction
description: date-fns 의존성을 @kalyx/core에서 제거하고 dayjs/luxon 등 다른 날짜 라이브러리로 확장 가능하게 만드는
---

# Skill: 다중 어댑터 추출 (Option C — Hybrid)

## 왜 필요한가 (한 문단)

현재 `@kalyx/core`는 `date-fns` / `date-fns-tz`를 `dependencies`로 껴안고 있다. CLAUDE.md §2는 "Adapter 패턴으로 제공, dayjs/luxon을 dependencies에 추가 금지"라고 명시하지만 실제 의존성 그래프는 이를 반영하지 못한 상태다. 사용자 중 약 절반이 dayjs를 쓰는 현실(date-fns와 npm 다운로드 수 동등)에서, 이들은 두 date 라이브러리를 동시에 번들링하게 된다. 본 스킬은 이 구조를 해소하면서도 "그냥 쓰고 싶다"는 사용자 경험을 깨지 않는다.

---

## 옵션 비교 (간단 복습)

| | A. Strict | B. Baked-in (현행) | **C. Hybrid (채택)** |
|---|---|---|---|
| 설치 마찰 | 높음 (adapter 필수) | 없음 | **없음 (기본 엔트리)** |
| 진짜 neutral 코어 | ✅ | ❌ | ✅ |
| dayjs 사용자 번들 | 최소 | 중복 발생 | **`/headless` 엔트리로 최소** |
| Breaking change | 필요 | 없음 | **없음 (신규 엔트리만 추가)** |

**최종 결정: Option C**. 근거: TanStack Query / Zustand 패턴의 entry-split이 동일한 긴장을 성공적으로 해결한 선례. v1.0 public surface를 유지하면서도 "진짜 neutral + 선택 가능" 목표를 모두 달성.

---

## C1 진단 결과 (2026-04-21 실측)

> 새 세션에서 착수 전, "재검증 체크리스트"로 변경 여부 먼저 확인할 것.

### date-fns import 위치

**Core** (`packages/core/src/`):
| 파일 | 사용 | 성격 |
|---|---|---|
| `adapters/date-fns.ts` | `parseISO, addDays, addMonths, addYears, isBefore, isAfter, isValid` | 정당 (어댑터 본체) |
| `utils/timezone.ts` | `parseISO` (line 1) | **누수 — 제거 대상** |
| `utils/date.ts`, `calendar.ts`, `time.ts`, `locale.ts`, `labels.ts` | 없음 | 이미 순수 |

**React** (`packages/react/src/`): date-fns를 **직접 import하지 않음**. 전부 `@kalyx/core`의 `DateFnsAdapter`를 경유. 다음 파일들에서 기본값으로 참조:
- `components/DatePicker/Root.tsx` (line 79)
- `components/RangePicker/Root.tsx` (line 85)
- `components/DateTimePicker/Root.tsx` (line 119, `DateFnsAdapter.today()` line 90도 직접 호출)
- `components/TimePicker/Root.tsx` (`DateFnsAdapter.today()` line 61 직접 호출)
- `hooks/useDatePicker.ts` (line 82)
- `hooks/useRangePicker.ts` (line 89)
- `hooks/useTimePicker.ts` (line 63 직접 호출)
- `src/index.ts` (line 92, re-export)

### DateAdapter interface 확장성

24개 메서드 (`parse, format, addDays/Months/Years, isBefore/After/SameDay/SameMonth, startOfDay/Month/Week, endOfMonth/Week, now, today, isValid, getYear/Month/Date/Day`) 전부 date-fns / dayjs / luxon에 1:1 매핑됨. 인터페이스 수정 없이 어댑터 추가 가능.

**유일한 어댑터 내부 디테일**: `format`이 date-fns 토큰(`yyyy`, `dd`) 규약 사용 — dayjs는 `YYYY`, `DD`. 어댑터가 내부에서 토큰 변환 흡수 (사용자 surface에는 영향 없음).

### tsup 이중 엔트리 가능성

현재 `packages/react/tsup.config.ts`는 `entry: ["src/index.ts"]` + `splitting: false`. `entry: { index, headless }` 객체 형태로 전환 + `splitting: false` 유지 시, 엔트리가 물리적으로 다른 파일로 분리돼 import path 기반 tree-shaking 성립. 빌드러(webpack/vite/rollup)가 tree-shake할 필요 없음.

### 착수 전 재검증 체크리스트

새 세션에서 아래 항목이 여전히 유효한지 먼저 확인:

```bash
# (1) date-fns 사용 위치 재전수조사 (새로 생긴 누수 확인)
grep -rn "from 'date-fns" packages/core/src packages/react/src

# (2) DateAdapter interface 수정 여부
grep -n "^export interface DateAdapter" packages/core/src/types.ts && \
  grep -c ":" packages/core/src/types.ts     # 메서드 수 변화 확인용 sanity

# (3) tsup config 변경 여부
cat packages/react/tsup.config.ts

# (4) 기본값 하드코딩 위치
grep -rn "adapter = DateFnsAdapter\|DateFnsAdapter\.today" packages/react/src
```

---

## 목표 구조

```
packages/
├── core/                        (neutral — date-fns 의존 제거)
│   ├── src/
│   │   ├── types.ts            (DateAdapter interface — 유지)
│   │   ├── utils/
│   │   │   ├── timezone.ts     (parseISO → native Date 파서로 교체)
│   │   │   ├── calendar.ts     (이미 순수)
│   │   │   ├── date.ts         (이미 순수)
│   │   │   ├── time.ts         (이미 순수)
│   │   │   ├── locale.ts       (이미 순수)
│   │   │   └── labels.ts       (이미 순수)
│   │   └── index.ts            (DateFnsAdapter export 제거)
│   └── package.json            (dependencies에서 date-fns, date-fns-tz 제거)
│
├── adapter-date-fns/            (신규)
│   ├── src/
│   │   └── index.ts            (DateFnsAdapter 이전)
│   └── package.json            (dependencies: date-fns, date-fns-tz, @kalyx/core)
│
├── adapter-dayjs/               (v1.1 또는 C4 후속)
├── adapter-luxon/               (v1.2 또는 커뮤니티)
│
└── react/                       (이중 엔트리)
    ├── src/
    │   ├── index.ts            (기본: adapter-date-fns 기본값 자동 주입)
    │   └── headless.ts         (신규: adapter prop 필수, DateFnsAdapter 비참조)
    └── tsup.config.ts          (entry: { index, headless })
```

---

## 실행 계획 (4개 커밋)

### Commit 1 — `refactor(core): remove date-fns from timezone util`

**파일**: `packages/core/src/utils/timezone.ts`

**교체**: `import { parseISO } from 'date-fns'` 제거 후 `parseISO(x)` 호출을 native `new Date(x)`로 치환.

근거: 모든 호출 지점의 입력은 이미 `normalizeISO` / `DateAdapter.parse`를 거친 ISO 8601 UTC 문자열이므로 native `Date(string)`의 애매성(브라우저별 파싱 차이)이 발생하지 않음.

```ts
// Before
import { parseISO } from 'date-fns';
const utc = parseISO(iso);

// After
const utc = new Date(iso);
```

**검증**:
```bash
pnpm --filter @kalyx/core test   # 기존 timezone 테스트 전부 그린이어야 함
```

---

### Commit 2 — `feat: extract @kalyx/adapter-date-fns package`

**신규 워크스페이스 추가**:
- `packages/adapter-date-fns/package.json`:
  ```json
  {
    "name": "@kalyx/adapter-date-fns",
    "version": "1.0.0-rc.0",
    "type": "module",
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
        "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
      }
    },
    "files": ["dist"],
    "scripts": {
      "build": "tsup src/index.ts --format esm,cjs --dts --clean",
      "typecheck": "tsc --noEmit"
    },
    "dependencies": {
      "date-fns": "^4.0.0",
      "date-fns-tz": "^3.0.0"
    },
    "peerDependencies": {
      "@kalyx/core": "workspace:^"
    }
  }
  ```
- `packages/adapter-date-fns/src/index.ts`: `packages/core/src/adapters/date-fns.ts` 전체 이동. import를 `import type { DateAdapter } from '@kalyx/core'`로 변경.

**core 수정**:
- `packages/core/src/adapters/` 디렉터리 제거
- `packages/core/src/index.ts`에서 `export { DateFnsAdapter }` 라인 제거
- `packages/core/package.json`의 `dependencies`에서 `date-fns`, `date-fns-tz` 제거

**react 수정**:
- `packages/react/package.json`의 `dependencies`에 `@kalyx/adapter-date-fns: workspace:*` 추가 (기본 엔트리가 여전히 기본값 주입하므로)
- 기존 `date-fns`, `date-fns-tz`는 제거 (react에 직접 의존 없음)
- `packages/react/src/index.ts`의 `export { DateFnsAdapter } from '@kalyx/core'` → `from '@kalyx/adapter-date-fns'`
- Root / hook 7곳의 `import { DateFnsAdapter } from '@kalyx/core'` → `from '@kalyx/adapter-date-fns'`

**changeset** (`.changeset/adapter-extraction.md`):
```md
---
"@kalyx/core": major
"@kalyx/react": minor
"@kalyx/adapter-date-fns": major
---

Extract `@kalyx/adapter-date-fns` as a separate package. `@kalyx/core` is now fully date-library-agnostic. `@kalyx/react` continues to ship with the date-fns adapter as the default, so no user-facing change unless you import `DateFnsAdapter` directly from `@kalyx/core` — use `@kalyx/adapter-date-fns` instead.
```

> `@kalyx/core`가 major인 이유: `DateFnsAdapter`가 core의 public API에서 사라짐. 하지만 core를 직접 쓰는 사용자는 극소수.

---

### Commit 3 — `feat(react): add /headless entry with explicit adapter contract`

**신규 파일**: `packages/react/src/headless.ts`
- 기본 엔트리와 동일한 공개 API를 re-export하되, Root/hook의 기본 adapter 주입 로직만 제거
- Adapter 미주입 시 friendly 에러:
  ```ts
  throw new Error(
    '[@kalyx/react/headless] DatePicker requires an adapter. ' +
    "Pass one via <DatePicker adapter={...}> or <KalyxProvider adapter={...}>. " +
    "If you don't need a custom adapter, import from '@kalyx/react' instead."
  );
  ```

**구현 접근**: Root 컴포넌트는 공유하되, "기본 adapter 주입" 부분만 조건부로 분리하는 유틸을 도입:
```ts
// packages/react/src/internal/defaultAdapter.ts
export function resolveAdapter(
  passed: DateAdapter | undefined,
  fallback: DateAdapter | null,
  componentName: string,
): DateAdapter {
  if (passed) return passed;
  if (fallback) return fallback;
  throw new Error(`[${componentName}] ...`);
}
```
- `src/index.ts`: `fallback = DateFnsAdapter` 주입
- `src/headless.ts`: `fallback = null` 주입

**tsup 설정**: `packages/react/tsup.config.ts`
```ts
entry: {
  index: 'src/index.ts',
  headless: 'src/headless.ts',
},
splitting: false,
```

**package.json exports 추가**:
```json
"exports": {
  ".": { "import": "./dist/index.js", "require": "./dist/index.cjs", ... },
  "./headless": {
    "import": { "types": "./dist/headless.d.ts", "default": "./dist/headless.js" },
    "require": { "types": "./dist/headless.d.cts", "default": "./dist/headless.cjs" }
  }
}
```

**검증 스크립트**: `scripts/verify-entry-split.mjs` (esbuild로 두 엔트리 gzip 실측)
```bash
node scripts/verify-entry-split.mjs
# 예상 출력:
# ✅ @kalyx/react         gzip: ~11KB (date-fns 포함)
# ✅ @kalyx/react/headless gzip: ~5-6KB (date-fns 없음)
```

목표: `/headless` 엔트리 gzip이 기본 엔트리 대비 최소 30% 감소. 미달 시 code path가 엔트리 경계를 넘어 누수된 것 — `splitting` 설정 재확인.

---

### Commit 4 — `docs: document adapter selection and headless entry`

**업데이트 파일**:
- `apps/docs-site/docs/guides/` 하위에 `adapters.md` 신규 생성
- `packages/react/README.md`에 "Bring your own adapter" 섹션 추가
- `.claude/skills/api-design.md`에 adapter 작성 template 추가 (dayjs 예제)

**adapters.md 주요 내용**:
1. "Default (date-fns)" — 대부분 사용자가 이걸 씀. 추가 설치 불필요.
2. "Why would I switch?" — 이미 dayjs/luxon 쓰는 앱의 번들 중복 감소.
3. "Using a custom adapter" — `@kalyx/react/headless` import + `<KalyxProvider>` 예제.
4. "Writing your own adapter" — `DateAdapter` interface 24 메서드 구현 가이드, dayjs 참조 구현.

---

## dayjs / luxon 어댑터 매핑 (참조)

인터페이스 수정 없이 구현 가능함을 미리 검증.

| DateAdapter | date-fns | dayjs (`dayjs`, `utc`, `timezone` plugin) | luxon |
|---|---|---|---|
| `parse(iso)` | `parseISO(iso)` | `dayjs.utc(iso)` | `DateTime.fromISO(iso, { zone: 'utc' })` |
| `format(iso, fmt, tz)` | native 토큰 매퍼 | `dayjs.utc(iso).tz(tz).format(fmt)` | `DateTime.fromISO(iso).setZone(tz).toFormat(fmt)` |
| `addDays(iso, n)` | `addDays(d, n)` | `dayjs.utc(iso).add(n, 'day').toISOString()` | `.plus({ days: n }).toISO()` |
| `isSameDay(a, b, tz)` | Intl 비교 | `dayjs.utc(a).tz(tz).isSame(dayjs.utc(b).tz(tz), 'day')` | `.setZone(tz).hasSame(b, 'day')` |
| `startOfDay(iso, tz)` | Intl offset 계산 | `dayjs.utc(iso).tz(tz).startOf('day').utc().toISOString()` | `.setZone(tz).startOf('day').toUTC().toISO()` |
| `today(tz)` | `todayInTimezone` | 동일 | 동일 |
| `getYear/Month/Date/Day` | `getUTCFullYear` 등 | `.utc().year()` 등 | `.toUTC().year` 등 |

토큰 주의: dayjs는 `YYYY/DD`, date-fns는 `yyyy/dd`. 어댑터 안에서 `fmt.replace(/yyyy/g, 'YYYY')` 수준으로 변환.

---

## Breaking change 정책

| 패키지 | 변화 | 영향 |
|---|---|---|
| `@kalyx/core` | `DateFnsAdapter` export 제거 | core를 직접 import한 사용자 (거의 없음). migration: `@kalyx/adapter-date-fns`로 교체 |
| `@kalyx/react` | 기본 엔트리 동작 동일 | **0건 breaking** |
| `@kalyx/react/headless` | 신규 엔트리 | 선택적 사용 |
| 신규 `@kalyx/adapter-date-fns` | 신규 | — |

**권고 릴리즈 버전**:
- `@kalyx/core` 2.0.0 (또는 pre-mode 유지 중이면 1.0.0-rc.N)
- `@kalyx/react` 1.0.0 (변경 없음 — 기본 엔트리 surface 고정)
- `@kalyx/adapter-date-fns` 1.0.0 신규

---

## 최종 검증 체크리스트

- [ ] `pnpm --filter @kalyx/core build` 성공, dist에 date-fns 흔적 없음 (`grep -r "date-fns" packages/core/dist`)
- [ ] `pnpm --filter @kalyx/adapter-date-fns build` 성공
- [ ] `pnpm --filter @kalyx/react build` 성공, `dist/headless.js` 생성
- [ ] `node scripts/verify-entry-split.mjs` — 두 엔트리 gzip 측정값 리포트
- [ ] `/headless` 엔트리의 gzip이 기본 대비 30% 이상 감소
- [ ] 기존 테스트 전부 그린 (`pnpm test:run`)
- [ ] axe 접근성 그대로 (`/check-a11y`)
- [ ] SSR 스모크 테스트 통과
- [ ] `@kalyx/react`만 설치하는 사용자 DX 동일성 확인 (임시 디렉터리에서 재현)
- [ ] `@kalyx/react/headless` + mock adapter로 Root 렌더 가능
- [ ] Provider 없이 `/headless`에서 Root 렌더 시 friendly 에러 발생

---

## 후속 (v1.1+)

1. **`@kalyx/adapter-dayjs`** — 우선순위 1. dayjs 사용자가 `@kalyx/react/headless` + 본 어댑터로 전환 시 번들 크기 측정해 landing 페이지 비교표 업데이트.
2. **`@kalyx/adapter-luxon`** — 우선순위 2. 대체로 엔터프라이즈 / timezone 심화 요구.
3. **`@kalyx/adapter-temporal`** — Temporal API stable 도달 시 (Node 24 + 주요 브라우저 안정화 이후).

각 어댑터마다 단위 테스트는 공통 conformance suite(`@kalyx/core/test-helpers`)로 공유 — 한 번 구현된 테스트가 24개 메서드 계약을 검증.

---

## 세션 시작 체크리스트

새 세션에서 이 스킬을 열었다면:

- [ ] CLAUDE.md §14 "현재 이니셔티브" 확인 — 이미 완료된 commit이 있는지
- [ ] 위 "C1 재검증 체크리스트" 실행
- [ ] 상태에 따라 Commit 1~4 중 어디서 이어갈지 판정
- [ ] 새 worktree 또는 branch (`feat/adapter-extraction`) 분리 후 진행

---

## 출처

- 버전: 1.0.0
- 참고: engineering/dependency-auditor (alirezarezvani/claude-skills)
