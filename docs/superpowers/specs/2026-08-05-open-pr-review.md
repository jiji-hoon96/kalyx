# 열린 PR 4종 리뷰·검증 — 2026-08-05

> ## ✅ 2026-08-06 후속: 4종 전부 머지됨 (main `0176b43`)
> 권고한 순서(`#187 → #190 → #189 → #188`) 그대로 머지 완료. **npm latest 는 여전히 `1.4.1`** — `#191` Version PR(1.4.2)만 남았고 상태 **DIRTY**(#188·#190 이 `packages/react/package.json` description 을 건드려 버전 범프와 충돌). main push 후 Release 워크플로가 큐 대기 중이라 재생성되면 자동 해소 예상.
>
> **머지 후 로컬 전수 검증 — 전부 통과**: `pnpm build` ✅ (headless 게이트가 이제 **fatal** 인데 통과) · typecheck·lint·format ✅ · **913 tests** ✅ · `check-doc-examples` 36예제 ✅ · `check-a11y` 17파일/411테스트 ✅ · `check-tree-shaking` ✅ · `check-package-tarballs` 5패키지/7엔트리 ESM+CJS ✅ · `verify-entry-split` ✅.
>
> **번들 실측 (네 아티팩트 전부 게이트·fatal)**: index 18,895 / 19,010 B (여유 1,585 / 1,470 B) · **headless 20,161 / 20,285 B (여유 319 / 195 B)**.
>
> **아래 "수정 리스트" 는 여전히 유효** — main 에서 실측으로 재확인함: `installation.md:30`·`FeatureGrid/data.ts:38`·ko `code.json` 의 `date-fns-tz` 잔존, 16KB 잔재 3곳, export 4종 미문서화, D1 4건(raw-UTC `value` 계약·min/max 경계·`isDateDisabled` footgun·Month/Year 커밋 미가드) 전부 그대로.


> **대상**: `#187`(timezone+focus) · `#188`(docs accuracy) · `#189`(release path) · `#190`(validation tooling). 전부 Codex 작성, base = `main` @ `a71c43a`, CI 전부 green.
> **선행 문서**: [`2026-08-04-post-fix-rescore.md`](2026-08-04-post-fix-rescore.md) — 이 4개 PR은 그 리포트가 지목한 결함을 겨냥한다.
> **원칙**: CI green 은 "스크립트가 돌았다"만 증명한다. 각 PR의 주장을 **실행·재현**으로 검증했고, 워킹트리는 `main` 에 둔 채 `git archive` + esbuild 로 브랜치 소스를 격리 번들해 테스트했다.

---

## 요약

| PR | 주장 | 판정 | 머지 권고 |
|---|---|---|---|
| **#187** | +12~+14 timezone 수정 + 월 이동 focus 수정 | ✅ **코어 수정 완전 검증** / 🟠 focus 수정에 **신규 결함 1건** + 3개 훅 미커버 | **조건부 머지** — 후속 필수 |
| **#188** | Core API 예제 컴파일 검증 + 문서 오류 수정 | *(에이전트 검증 반영)* | |
| **#189** | 릴리즈 경로 tarball smoke + provenance | ✅ 게이트 실효성 확인 / 🟠 커버리지 갭 3건 | **머지 + 후속** |
| **#190** | a11y·번들 검증 강화 | *(에이전트 검증 반영)* | |

**파일 충돌**: `#187`은 **완전 독립**(다른 3개와 겹치는 파일 0). `#188`/`#189`/`#190`은 `.github/workflows/pr-check.yml`·루트 `package.json`을 **셋 다** 건드려 서로 충돌한다(#190은 `packages/react/package.json`, #189는 `release.yml`도). → **머지 순서: #187 먼저(무충돌) → 나머지는 하나 머지할 때마다 rebase 필요.**

---

## PR #187 — `fix: harden timezone conversion and calendar focus`

### ✅ 코어 timezone 수정 — 전수 검증 통과

수정 방식은 정오 UTC 프로브를 버리고 `setTimeInTimezone` 의 2-pass offset 해석을 `resolveCivilDateTime` 으로 추출해 공유하는 것. **이전 리포트에서 제안한 방향과 동일**하다.

브랜치 core 소스를 격리 번들해 직접 실행:

| 검증 | 케이스 수 | 결과 |
|---|---|---|
| A. `civilMidnightFromUtcDay` — 418 IANA 존 × 2026년 365일 | 152,570 | **오답 0** ✅ (main 은 19존 × 365일 오답) |
| B. 다년도 — 2020·2024(윤)·2030·2045 × 12개월 × 1·15·28일 × 전 존 | 60,192 | **오답 0** ✅ |
| C. 윤일 2/29 — 2024·2028·2032·2044 × 전 존 | 1,672 | **오답 0** ✅ |
| D. **`setTimeInTimezone` 회귀** — main vs PR 결과 비교(60존 × 5 instant × 4 시각) | 1,200 | **차이 0** ✅ 리팩터가 동작을 보존 |
| E. round-trip property `calendarDayFromInstant(civilMidnight(c)) === c` | 1,672 | **깨짐 0** ✅ |
| F. DST gap(자정 전이 5존)·fall-back 정책 | 5+2 | `civilMidnight` 과 `setTime(0:00)` **완전 일치** ✅ |

DST-gap snap-forward 5존(Cairo·Havana·Santiago·Beirut·Azores)은 수정 전후 **동일하게 01:00** — 의도된 기존 정책이 보존됐다.

### ✅ 회귀 테스트 품질

`timezone.property.test.ts` 에 **all-IANA round-trip property** 추가. 중요한 점: `expect(IANA_ZONES).toEqual(expect.arrayContaining(['Pacific/Auckland','Pacific/Chatham','Pacific/Kiritimati']))` 로 **존 목록 자체를 단언**한다 → 목록이 축소돼 테스트가 조용히 무의미해지는 것을 막는다. 이전 리포트의 "ZONES 에 극단값이 있어도 그걸 태우는 property 가 없으면 무의미" 교훈이 정확히 반영됐다.

**이빨 검증(직접 실행 — PR body 주장 재현이 아니라 실측):** 브랜치 core 소스를 격리 복사한 뒤 `civilMidnightFromUtcDay` 만 main 의 정오 프로브로 되돌리고 브랜치 테스트를 실행.

```
대조군(브랜치 코드 그대로) : 14 passed              ✅
정오 프로브로 revert        : 2 failed | 12 passed  ✅ RED
  × round-trips every UTC calendar coordinate through civil midnight
    Counterexample: ["2020-01-01T00:00:00.000Z","Pacific/Kiritimati"]
  × round-trips calendar coordinates in every supported IANA timezone
    Antarctica/McMurdo: expected '2020-01-02…' to be '2020-01-01…'
```

→ **장식용 테스트가 아니다.** 이 property 가 이 결함 클래스의 재발을 실제로 막는다.

### 🟠 신규 결함 — 전면 disabled 월을 지나 **뒤로 이동이 불가능** → ✅ **2026-08-05 수정 완료 (커밋 `e763564`, #187 에 반영)**

> **수정 요약**: `resolveEnabledCalendarFocus` 에 `'backward'` 모드 추가(대상 월 내부를 먼저 오름차순 탐색 → 없으면 **이전 월로** 계속) + `resolveMonthNavigation` 공유 헬퍼 추출 후 6개 호출부(`DatePicker.Calendar`·`RangePicker.Calendar`·훅 4종)가 **이동 방향을 그대로 반영**하도록 변경. 아래 P0 ② 도 같은 커밋에서 처리.
> **TDD**: 단위 8건 + 훅 7건 + 컴포넌트 2건을 **먼저 RED 로 확인한 뒤** 구현. 독립 하네스 재현: `March 10 → March 1 → March 1 → March 1` (버그) → **`March 10 → January 31 → December 1 → November 1`** (수정 후).
> **전체 검증**: typecheck·lint·format ✅ / **882 tests pass**(776→855→882) / 4개 아티팩트 전부 20KB 이하 / entry-split·tree-shaking ✅.
> **번들**: index 18.45/18.56KB, headless 19.66/**19.77KB**. 공유 헬퍼가 중복을 제거해 훅 3종 추가 가드에도 순증가는 미미(headless.cjs 20,213 → 20,248 B). **다만 headless.cjs 여유가 232 B 로 줄었다** — #190 이 headless 를 게이트하므로 이후 런타임 추가는 여기가 먼저 막힌다.

아래는 수정 전 진단 기록이다.

`navigateMonth` 가 방향과 무관하게 항상 `'forward'` 검색을 쓴다(`DatePicker/Calendar.tsx`·`RangePicker/Calendar.tsx`·`useDatePicker.ts` 3곳 동일).

브랜치 react 소스를 번들해 실제 렌더로 재현 (`disabled=[{filter: iso => iso.startsWith('2026-02')}]` = 2026년 2월만 블랙아웃):

```
열기      → focus: Tuesday, March 10, 2026
prev ×1   → focus: Sunday, March 1, 2026     ← 2월로 못 감
prev ×2   → focus: Sunday, March 1, 2026     ← 그대로
prev ×3   → focus: Sunday, March 1, 2026     ← 영구 정지

(대조군, 규칙 없음) 3월 → 2월 → 1월 → 2025년 12월  ✅ 정상
```

**"이전 달" 버튼이 영구 데드엔드**가 된다. 사용자는 블랙아웃 월 이전으로 **절대 이동할 수 없다**. 예약 시스템의 휴무 월, 공휴일 폐쇄 기간 같은 실제 사용 패턴에서 발생한다.

main 대비로는 개선이긴 하다(main = 키보드 그리드 사망, PR = 버튼 무반응). 하지만 **방향 인지 검색**이면 둘 다 피할 수 있다:

```ts
// navigateMonth(direction) 안에서
resolveEnabledCalendarFocus(monthStart, disabled, adapter, tz,
  direction < 0 ? 'backward' : 'forward')
// → resolveEnabledCalendarFocus 에 'backward' 모드 추가 필요
```

부수 확인: 부분 disabled 월(2월 Sun+Mon 비활성)에서 focus 가 **2월 3일**에 안착하는 PR 주장은 실측 확인 ✅. 월 이동 후 ArrowRight 키보드 동작도 확인 ✅. 전부 disabled 인 극단 케이스는 여전히 disabled 좌표를 반환(기존 fallback, 낮은 우선순위).

### 🟠 미커버 — 헤드리스 훅 3종 → ✅ **2026-08-05 수정 완료 (같은 커밋 `e763564`)**

수정 전: `useDatePicker` 만 고쳐져 있었고 **`useRangePicker`·`useWeekPicker`·`useDateTimePicker` 는** `setFocusedDate(adapter.startOfMonth(newMonth))` 를 무검사로 호출 → `/headless` 소비자에게 원 버그 잔존. 세 훅 모두 `resolveMonthNavigation` 을 쓰도록 통일했고, 부수적으로 `useWeekPicker`·`useDateTimePicker` 가 `setViewMonth` **업데이터 안에서 `setFocusedDate` 를 호출하던 React 안티패턴**도 제거했다(직접 `viewMonth` 참조 + deps 정정).

> **클로저 시맨틱 변경 고지**: `useWeekPicker`·`useDateTimePicker` 가 함수형 업데이터(`deps: [adapter]`)에서 `viewMonth` 직접 참조(`deps: [adapter, viewMonth, disabled, displayTimezone]`)로 바뀌었다. 따라서 **리렌더 없이 같은 틱에서 `nextMonth()` 를 두 번 호출하면 두 번 모두 같은 `viewMonth` 를 읽는다.** 이는 `useDatePicker`·`useRangePicker` 가 원래 갖고 있던 형태라 **네 훅을 일치시킨 것**이지 새 위험을 도입한 게 아니다. 레포 테스트 중 한 `act()` 안에서 월 이동을 두 번 호출하는 케이스는 **없음**(grep 확인).

### ❌ 범위 밖 (PR body 의 non-goals 와 일치 — 미해결로 계속 추적)

`git diff --name-only` 로 확인: `DatePicker/Root.tsx`·`core/utils/calendar.ts`·`useMonthPicker.ts`·`useYearPicker.ts` **전부 미변경**. 따라서 이전 리포트의 다음 항목은 그대로 남는다.

- raw UTC `value` 계약 불일치 (문서 형식대로 넘기면 음수 offset 존에서 하루 앞 셀 선택)
- `{before}`/`{after}` min·max 경계 어긋남
- `isDateDisabled` 공개 API footgun (문서화만 됨)
- `useMonthPicker`/`useYearPicker` 커밋 미가드

### 번들

PR 보고: ESM 18.42KB / CJS 18.55KB (main 18.28/18.38 대비 **+0.14/+0.17KB**). 20KB 게이트 통과, CI `Bundle Size` green. index 엔트리는 독립 측정 안 함(tsup 재현 필요) — CI 결과로 갈음.

**⚠️ headless 상호작용은 직접 측정했다** (`#190` 이 headless 를 게이트하고 여유가 353 B 뿐이라 머지 순서에 영향):

| | headless gzip (esbuild 프록시) |
|---|---|
| main | 26,757 B |
| #187 | 26,843 B (**+86 B**) |

tsup 실측 `headless.cjs` = 20,127 B / 천장 20,480 B 이므로 **#187 머지 후 예상 ≈ 20,213 B → 여유 약 267 B**. 즉 **#187 → #190 순서로 머지해도 빌드가 깨지지 않는다**(확인 완료). 다만 여유가 267 B 로 더 좁아지므로 이후 어떤 런타임 추가도 headless 를 먼저 넘긴다.

### 판정: **조건부 머지**

코어 수정은 정확하고 회귀 테스트도 훌륭하다. 정확성 P0 해소 가치가 크므로 **머지하되**, 위 🟠 2건을 후속 PR로 반드시 처리한다. 뒤로 이동 데드엔드는 머지 전에 고치는 편이 낫다 — 수정 비용이 작다(`'backward'` 모드 + 호출부 3곳).

---

## PR #188 — `docs: compile and correct Core API examples`

새 스크립트 `scripts/check-doc-code-examples.mjs` 가 문서의 ts/tsx 코드펜스를 **빌드된 .d.ts 에 대해 실제 컴파일**하고, `docs-site` CI 잡의 dist 빌드 이후·Docusaurus 빌드 이전에 실행된다. 아이디어는 좋고 구현도 vacuous-pass 가 없다(펜스 0개면 throw, 파일 없으면 ENOENT, `process.exitCode=1`).

### 이전 리포트의 D2 결함 11건 대조 (전부 브랜치 소스로 직접 확인)

| # | 결함 | 판정 |
|---|---|---|
| 1 | `api/core.md` 의 `DateFnsAdapter` from `@kalyx/core` (런타임 throw) | ✅ **수정** — `@kalyx/adapter-date-fns` 로 분리, EN+KO 동일, 5개 hunk |
| 2 | `packages/react/package.json` description "≤16 KB" | ⚠️ **레포만 수정** — 브랜치는 "≤20 KB" 확인. 그러나 **changeset 0개** → npm 페이지는 다음 publish 전까지 계속 16 KB |
| 5 | "6-week grid" / "6×7" 오기 | ✅ **수정** — "4–6 week grid… `fixedWeeks: true` 시 6×7" |
| 6 | `CalendarOptions` 에 `timezone`/`fixedWeeks` 누락 | 🟡 **부분** — 타입 블록엔 추가됐으나 `fixedWeeks` 는 **React 공개 prop**(`DatePicker/Calendar.tsx:50`)인데 컴포넌트 props 표엔 여전히 없음 |
| 3 | `installation.md` 가 **없는 의존성** `date-fns-tz` 자동설치 안내 | ❌ **미수정** — 브랜치 확인: `- date-fns + date-fns-tz — default date engine.` / `These are installed automatically.` **PR body 는 "installation guidance 를 교정했다"고 주장하나 사실이 아님** |
| 4 | `FeatureGrid/data.ts:35` "IANA timezones via date-fns-tz" | ❌ **미수정** — 문자열 그대로(랜딩 페이지) |
| 7 | `getISOWeekNumber`·`calendarDayFromInstant`·`getDayPeriodName`·`getWeekStartForLocale` 미문서화 | ❌ **미수정** (컴파일 기반 체커로는 원리적으로 탐지 불가 — 누락은 컴파일 에러가 아님) |
| 8 | PR 템플릿·`CLAUDE.md:512`·`check-bundle.md:41` 의 16 KB | ❌ **미수정** |
| 9 | date-fns 비용 "~5KB" vs "2 KB" 모순 | ❌ **미수정** |
| 10 | `isDateDisabled` footgun 이 컴포넌트 `disabled` 문서·`concepts/timezone.md`·troubleshooting 에 없음 | ❌ **미수정** |
| 11 | KO 6개 파일 미번역 | ❌ **미수정** + 새 parity 체크가 **코드펜스 바이트 동일**을 요구해 번역 자유도가 오히려 줄어듦 |

**11건 중 3.5건 수정.** 다만 7건은 PR 이 스코프로 선언하지 않았다 — 문제는 **#3 은 선언했는데 안 됐다**는 점.

### 체커 자체의 한계 (직접 확인)

| 심각도 | 내용 |
|---|---|
| 🔴 | **커버리지 = 70개 문서 중 2개.** `CORE_API_DOCUMENTS` 에 `api/core.md` EN/KO **두 경로만 하드코딩**(`:16-19` 확인). EN 문서 중 ts/tsx 펜스를 가진 파일은 **35개** — 즉 34 EN + 34 KO 가 미검증(컴포넌트 7종, 훅 7종, quick-start, migration, adapters, concepts, recipes, api/react.md 전부). **가장 많이 읽히는 페이지가 전부 미커버** |
| 🟠 | **`js`/`jsx` 우회로.** `EXECUTABLE_LANGUAGES` = `{ts, typescript, tsx}` 뿐(`:21-25` 확인). EN 문서에 이미 **```jsx 펜스 27개** 존재 — 깨진 예제를 ```jsx 로 옮기면 조용히 검증 대상에서 빠진다 |
| 🟠 | **타입 미러 블록은 공허하게 통과.** 문서 안 `type CalendarOptions = {…}` 는 import 가 아니라 **새 지역 선언**이라 소스와 얼마나 어긋나든 영원히 컴파일된다 → 이번에 손으로 고친 #6 을 체커가 지킬 수 없음. `// → "…"` 출력 주석도 미검증 |
| 🟡 | EN/KO parity 가 **바이트 동일** 요구 → 펜스 안 주석을 한국어로 옮기면 CI 실패. 지금 통과하는 건 KO 가 바이트 복사본이라서 |

CI 배선은 정확하다(dist 빌드 후 → Docusaurus 전, `all-pass` 를 통해 머지 게이트에 도달).

### 판정: **머지 + 후속 필수**

바꾼 것은 전부 정확하고 런타임 소스 변경 0. 다만 **"48 diagnostics 수정 + CI 배선"이 "문서 정확성 문제가 해결됐다"로 읽히는 게 가장 큰 리스크** — 실제로는 1개 페이지의 타입 레벨 오류만, 70개 중 2개 파일에서 해결됐다. 머지 전 요청할 것: (a) `installation.md` 수정 또는 PR body 에서 해당 주장 철회, (b) 스크립트 헤더에 커버리지 경계 명시.

---

## PR #189 — `ci: harden release path with tarball smoke tests`

### ✅ 검증된 것

- **게이트가 실제로 작동한다.** `pnpm pack` → 오프라인·frozen 소비자에 tarball 설치 → ESM `import` + CJS `require` 로 7개 공개 엔트리 실제 로드. `--offline` + 전체 그래프 `pnpm.overrides` 를 `file:<tarball>` 로 강제하므로 **레지스트리로 새어나가 published 패키지를 대신 검증하는 vacuous 실패 모드가 없다** — 이게 이런 게이트에서 가장 흔한 함정인데 막혀 있다.
- 7개 엔트리 계약이 브랜치의 실제 export map 과 정확히 일치(core `.`+`./test-helpers`, react `.`+`./headless`, 어댑터 3종 `.`). 누락 엔트리 없음.
- **provenance: `packages/adapter-dayjs/package.json`·`adapter-luxon/package.json` 에 `"provenance": true` 실제 추가** + CI 단언. 다만 `release.yml` 은 이미 `NPM_CONFIG_PROVENANCE=true` 였으므로, 실질 이득은 **CI 밖 수동 `pnpm publish` 가 이제 조용히 미서명 배포되지 않고 실패한다**는 것(원래 dayjs/luxon 이 provenance 를 잃은 경로가 정확히 그것).
- 어댑터 빌드가 의존성 순서대로 전부 돌도록 루트 스크립트 수정(기존엔 dayjs/luxon 이 `dist` 없이 남았음).
- `all-pass` 집계자는 이미 `contains(needs.*.result, 'failure')` 형태 — 과거 `toJSON(needs)` grep 버그 재발 없음. `Package Tarball Smoke` 자체는 required check 가 아니지만 `All Checks Pass` 를 통해 **전이적으로 게이트됨**. `release.yml` 도 publish 전에 실행.
- 런타임 소스·버전·changeset 변경 0.

### 🟠 커버리지 갭

| 심각도 | 내용 |
|---|---|
| 🟠 | **`workspace:` 치환 검사는 동어반복.** `pnpm pack` 이 항상 치환하므로 pnpm 이 보장하는 성질을 단언하는 것. **인용된 사고(사람이 `npm publish` 로 `workspace:^` 를 그대로 올려 400)는 이 경로를 안 타므로 여전히 못 잡는다** |
| 🟠 | **엔트리 삭제가 안 보인다.** 계약을 매니페스트 기준으로 순회하므로 `"./headless"` 를 export map 에서 지우면 6개만 검사하고 green. `entryPointCount === 7` 단언 없음 |
| 🟠 | **외부 의존성 range 미검증.** 모든 외부를 `link:` 로 override 하므로 `"@floating-ui/react": "^0.99.0"`(존재하지 않는 버전) 같은 오류가 통과한다 — 정작 실제 소비자는 설치 실패 |

### ❌ 미해결 (이전 리포트 D7 항목)

`@kalyx/react` → `@kalyx/core` **정확 핀** 문제 미해결이며, 오히려 `workspace:*` 는 exact 로 packed 돼야 한다고 **단언해 현상을 고착**시킨다. 이미 배포된 dayjs/luxon 0.1.0 은 여전히 미서명. `required_approving_review_count: 0` 과 OSV/License 미필수도 그대로.

### 판정: **머지 + 후속**

머지해도 publish 리스크 0(런타임/버전/changeset 무변경), 게이트는 실질적. 발견된 것은 전부 **커버리지 갭이지 회귀가 아니다** — 머지 후가 확실히 낫다.

---

## PR #190 — `ci: harden accessibility and bundle validation`

### ✅ 검증된 것

- **`/headless` 번들 게이트 신설** — 이전 리포트가 지적한 "index 2개만 게이트, headless 미게이트" 를 정확히 닫는다. `bundle-policy.js` 에 `HEADLESS_REACT_GZIP_CEILING_KB = 20` 추가, `BUNDLES` 가 4개 아티팩트로 확장.
- **"raw-byte 게이트" 문구는 느슨하지만 구현은 정확** — 실제 비교는 `gzipBytes <= ceilingKB * 1024` (gzip). `getRawKB` 는 **표시 전용**. raw/gzip 혼선 없음. 의미는 "KB 반올림이 아니라 바이트 정밀도" — main 은 소수점 2자리 반올림 비교라 20.004KB 가 통과했는데 이제 실패한다. **실질적 강화** ✅
- **번들 diff 코멘트 4행이 `BUNDLES` 데이터 구동** — label/path/baseEnv/ceiling 이 함께 이동하므로 행 교차 오류가 구조적으로 불가능. 게시된 PR 코멘트가 내 독립 측정과 일치(18.28/18.38/19.54/19.66KB).
- **a11y 발견이 진짜 AST 파싱** — 주석·문자열 리터럴로는 만족되지 않음(피셜 아니라 실측 확인됨). `all-pass` 의존성에 새 잡 포함, 집계자는 견고한 `contains(needs.*.result, …)` 형태.
- **tree-shaking 과대광고 제거** — `composition.md` "You pay for what you render", `api/react.md` "TimePicker 만 쓰면 DatePicker 코드가 빠진다", README "Tree-shakable — use only what you import", `adapters.md` "about 2 KB gzipped after tree-shaking" 전부 삭제·헤지 표현으로 교체(EN+KO). **새 과대광고로 대체하지 않았다** — 정직한 방향.
- 런타임 소스·버전 변경 0, ceiling 상수 20 유지.

### 🟠 결함·주의

| 심각도 | 내용 |
|---|---|
| 🟠 | **"관측된 비용을 정직하게 보고" 는 미달.** 23.85KB(픽커 1개 기준 소비자 실측)는 **CI 로그에만** 있고 사용자 문서 어디에도 없다. 동시에 정량 진술 2건("~5KB", "약 2KB")을 **삭제**하고 독자에게 `pnpm check-tree-shaking` 을 돌리라고 안내한다 → 배지의 18.3KB 와 실행 결과 23.85KB 사이 **30% 차이가 미해명**. 사용자가 "크기 주장이 틀렸다" 이슈를 낼 수 있는 구조 |
| 🟠 | **`pnpm build` 가 예산 초과 시 실패하도록 바뀜** — `tsup.config.ts` `onSuccess` 가 `assertBundleChecks` 를 throw. **`release` = `pnpm build && changeset publish`** 이므로 릴리즈 파이프라인 전체가 막힌다. 그런데 **headless CJS 여유는 353바이트**(실측: 20,127 / 20,480). 즉 **354바이트만 커져도 빌드·SSR·검증·릴리즈 잡이 전부 실패**한다. PR body 에 이 결과가 안 적혀 있음 |
| 🟡 | **tree-shaking 시나리오에 크기 임계값이 없다** — esbuild 에러·시나리오 누락만 잡는다. "DatePicker only" 가 23.85 → 40KB 가 돼도 green. 즉 "번들러가 죽었나" 스모크지 회귀 게이트가 아님 |
| 🟡 | **a11y 잡의 실질 추가 가치가 작다** — 루트 vitest 에 `include` 가 없어 기존 `test` 잡이 이미 그 17개 파일을 전부 돌린다. 새로 잡는 건 "jest-axe import 가 전부 사라졌을 때"뿐. 또 "17 files / 407 tests" 중 실제 axe 단언은 `packages/react` 8개 파일의 **15건**(나머지 9개 파일은 docs-site) — 숫자가 a11y 커버리지가 아니라 파일 수를 잰다 |
| 🟡 | a11y 발견이 **직접 `'jest-axe'` 모듈 지정자만** 인식 → axe 보일러플레이트를 `test-utils` 로 추출하면 해당 파일이 조용히 발견에서 빠진다. import 만 하고 단언이 없어도 카운트됨 |
| 🟡 | 과대광고 가드가 **문구 블랙리스트**(9개 파일 × 7개 정확 문자열)라 다른 표현이면 통과. 실제로 `apps/docs-site/docs/intro.md:61` 의 "Apps that care about **bundle size** and **tree-shaking**" 가 그대로 남아 있음(EN+KO) |

### 판정: **머지 + 후속**

Critical 없음. 내가 가장 의심했던 raw/gzip 혼선은 실측으로 해소됐고(혼선 없음, 오히려 강화), 4행 diff 도 구조적으로 안전하다. 머지 전 최소 1건 확인 권장: **headless 353바이트 여유에서 `pnpm build` 가 릴리즈까지 막는 게 의도인지** 명시적 결정.

---

## 머지 순서 (충돌 최소화)

```
1) #187   ← 파일 겹침 0, 정확성 가치 최대. (가능하면 backward-nav 수정 포함 후)
2) #190   ← pr-check.yml 변경량이 가장 큼. 먼저 넣고 나머지를 그 위로 rebase
3) #189   ← pr-check.yml + release.yml + package.json rebase 1회
4) #188   ← pr-check.yml + package.json rebase 1회
```
`#188`/`#189`/`#190` 은 `.github/workflows/pr-check.yml` 과 루트 `package.json` 을 셋 다 건드리므로 **하나 머지할 때마다 나머지는 rebase 필요**. `#190`·`#188` 은 `packages/react/package.json` 의 **같은 `description` 필드를 둘 다 수정**(양쪽 다 "≤20 KB")하므로 텍스트 충돌이 나되 해결은 자명하다.

**번들 상호작용 확인 완료**: `#190` 이 headless 를 20KB 로 게이트하고 현재 여유가 353 B 뿐인데, `#187` 이 headless 를 +86 B 늘린다(측정치). **#187 → #190 순서로도 빌드가 깨지지 않는다**(예상 여유 267 B).

⚠️ **거버넌스 주의**: 현재 `main-protection` 의 필수 승인이 **0명**이라 이 4개 PR(전부 같은 작성자)은 **리뷰 없이 self-merge 가 가능한 상태**다. 이번 머지는 이 검증 리포트가 리뷰 역할을 하지만, 승인 1명 복구(P3 #22)를 함께 처리하는 것이 맞다.

⚠️ `#188`/`#189`/`#190` 은 **changeset 0개**. `packages/react/package.json` description 수정은 **다음 publish 전까지 npm 페이지에 반영되지 않는다.** `#187` 만 changeset(core/react patch)을 포함한다.

---

## 재채점

**중요: 이 PR들은 아직 머지되지 않았다.** npm `1.4.1` 과 `main` 은 그대로다. 따라서 **출하 기준 점수는 어제와 동일**하고, 아래 "머지 후" 는 4개 전부 머지됐을 때의 예상치다.

| 차원 | #176 원본 | 교차평가 정정 | 현재 출하(main/npm) | **4개 머지 후 예상** | 머지가 바꾸는 것 |
|---|:-:|:-:|:-:|:-:|---|
| **D1 정확성** | 7 | 4–5 | **6** | **7** ↑ | +12~+14 19존 버그 해소(전수 검증), 월이동 focus 해결. ~~backward-nav 데드엔드~~·~~훅 3종 미커버~~ 는 `e763564` 로 해소. 남은 것: value 계약·min/max·`isDateDisabled` footgun·Month/Year 커밋 가드 4건 → 8 불가 |
| **D2 문서** | 8 | 7 | **5** | **6** ↑ | throw 하던 import 해소가 가장 큼. 그러나 11건 중 3.5건만 수정, 체커는 70개 중 2개 파일만 커버, `installation.md` 는 **주장했는데 미수정**, 18.3 vs 23.85 미해명 신규 |
| **D3 경쟁** | 4 | 4 | **4** | **4** = | 시장 포지션을 건드린 PR 없음 |
| **D4 번들** | 6 | 6 | **6** | **7** ↑ | `/headless` 게이트 신설(내 지적 해소), 바이트 정밀 비교, 4아티팩트 diff, 문서 과대광고 제거. 단 tree-shaking 임계값 없음 + headless 여유 **353 B** 가 이제 `pnpm build`·릴리즈를 막음 |
| **D5 접근성** | 7 | 7 | **7** | **8** ↑ | D5 를 7 로 눌렀던 **월이동 그리드 키보드 사망 해결**. `e763564` 로 훅 3종 미커버·"이전 달" 무반응까지 정리돼 이 축의 알려진 결함은 없음. 9 가 아닌 이유: 새 a11y CI 잡의 실질 추가가치가 작고(기존 `test` 잡이 이미 같은 파일을 돌림), axe 단언은 여전히 15건 |
| **D6 테스트** | 8 | 6–7 | **7** | **8** ↑ | **all-IANA round-trip property + 존 목록 자체를 단언**하는 락은 정확히 필요했던 것. tarball 스모크·doc 컴파일·a11y 발견 테스트도 실질. 단 PR body 과대표현 3건("raw-byte", "17 files/407 tests", "installation guidance") 은 감점 요인 |
| **D7 보안** | 8 | 7 | **7** | **7** = | provenance 매니페스트 강제·publish 양 경로 게이트는 진짜 개선. 그러나 **최대 리스크 2건(필수 승인 0명, OSV/License 미필수)이 그대로**이고 react→core 정확 핀도 미해결 → 이동 없음 |
| **종합** | ~7 | ~5.5–6 | **~6** | **~7** | 정확성 P0 계열이 닫히고 검증 인프라가 실질적으로 좋아진다. 홍보 가능선(D1 8 / D2 7)까지는 아직 |

> **점수 해석 주의**: 출하 기준(`main` = npm 1.4.1)은 **어제와 동일한 ~6**. 이 PR 4개 중 머지된 것이 없기 때문이다. `~7` 은 **머지 후 예상치**이며 아직 사용자에게 도달한 개선은 0이다.

---

## 수정 리스트 (우선순위)

### P0 — 머지 전 또는 머지 직후 (#187 관련, 비용 작음)

| # | 항목 | 위치 | 비고 |
|---|---|---|---|
| ~~1~~ | ~~backward-nav 데드엔드~~ → ✅ **완료** (`e763564`, #187) | `internal/calendarFocus.ts` + 6개 호출부 | `'backward'` 모드 + `resolveMonthNavigation` 공유 헬퍼. 단위 8 + 훅 7 + 컴포넌트 2 회귀 테스트 |
| ~~2~~ | ~~훅 3종 월이동 미가드~~ → ✅ **완료** (같은 커밋) | `useRangePicker`·`useWeekPicker`·`useDateTimePicker` | setState 업데이터 안 side-effect 안티패턴도 함께 제거 |
| 3 | **`installation.md` 에서 `date-fns-tz` 삭제**(EN+KO) | `apps/docs-site/docs/getting-started/installation.md:30,32` + ko | 존재하지 않는 의존성을 "자동 설치된다"고 안내 중. **별건으로** #188 body 의 "installation guidance 교정" 주장도 정정 필요(수정하지 않았음) |
| 4 | **`FeatureGrid` "via date-fns-tz"** 삭제 | `apps/docs-site/src/components/FeatureGrid/data.ts:35` + `i18n/ko/code.json:55` | 랜딩 페이지 |
| 5 | **headless 353 B 여유 의사결정** — 초과 시 `pnpm build`·릴리즈 전체가 막히는 게 의도인지 명시 | `packages/react/tsup.config.ts` | 아니라면 warn 유지 + CI 게이트만 fatal |

### P1 — 정확성 잔여 (이전 리포트에서 계속 이월)

> ⚠️ **바이트 예산이 P1 의 선결 조건이다.** `e763564` 이후 `headless.cjs` = 20,248 B, 천장 20,480 B → **여유 232 B**. `#190` 이 headless 를 **fatal** 게이트로 만들고 `release = pnpm build && changeset publish` 이므로, 병합 후에는 **headless 엔트리에 233 B 만 더해도 릴리즈 파이프라인이 막힌다.** 아래 6~9 는 전부 headless 에 실리는 런타임 추가다. → **P1 착수 전에 (a) 항목별 바이트 예산을 잡거나 (b) headless 천장을 먼저 재조정할 것.** 그렇지 않으면 두 번째·세 번째 항목에서 막힌다.

| # | 항목 | 비고 |
|---|---|---|
| 6 | **ISO-string 계약 결정** — `value`/`disabled`/min·max 를 Root 에서 inbound 정규화하거나, 계약을 "civil-midnight instant" 로 바꾸고 §3·컴포넌트 문서·`concepts/timezone.md` 에 명시 | 문서가 제시한 형식 그대로 쓰면 음수 offset 존에서 하루 앞 셀 선택. **권고: inbound 정규화** |
| 7 | `{before}`/`{after}` min·max 경계 정규화 | `displayTimezone` 사용 시 경계일이 offset 부호대로 새어나감 |
| 8 | `useMonthPicker`/`useYearPicker` 커밋 가드 (`isDateDisabled` 2줄) | "전 mutation 경계 parity" 주장을 실제로 참으로 만듦 |
| 9 | `isDateDisabled` 자기 정규화 (문서화만으로 부족) | 공개 API 가 오용 시 조용히 틀림 |

### P2 — 문서·검증 커버리지

| # | 항목 |
|---|---|
| 10 | doc 예제 체커를 **api/core.md 2개 → ts/tsx 펜스 보유 35개 EN + KO 전체**로 확대. 최소한 스크립트 헤더에 커버리지 경계 명시 |
| 11 | `jsx`/`js` 펜스도 검증 대상에 포함(현재 27개 우회 가능) |
| 12 | **18.3KB(배지) vs 23.85KB(소비자 실측)** 를 문서에서 화해 — "배지는 deps external 인 아티팩트 크기, 소비자 실측은 date-fns·floating-ui 포함" |
| 13 | tree-shaking 시나리오에 **크기 임계값** 추가(현재는 크래시만 잡음) |
| 14 | 16 KB 잔재 정리: `.github/PULL_REQUEST_TEMPLATE.md:31`, `CLAUDE.md:512`, `.claude/commands/check-bundle.md:41` |
| 15 | `intro.md:61` 의 "tree-shaking" 마케팅 문구 정리(EN+KO) |
| 16 | date-fns 비용 "~5KB" vs "2KB" 모순 해소 |
| 17 | 미문서화 export 4종 추가: `getISOWeekNumber`·`calendarDayFromInstant`·`getDayPeriodName`·`getWeekStartForLocale` |
| 18 | `fixedWeeks` 를 컴포넌트 props 표에 문서화(현재 core 타입 블록에만) |
| 19 | `isDateDisabled` tz 함정을 컴포넌트 `disabled` prop 문서·`concepts/timezone.md`·troubleshooting 에 노출 |
| 20 | KO 미번역 6개 파일 — 특히 `concepts/timezone.md`·`concepts/iso-string.md` |
| 21 | 1.4.1 CHANGELOG 소급 보완(emission 변경 3건 미고지) |

### P3 — 거버넌스·공급망 (점수 D7 를 움직이는 항목)

| # | 항목 |
|---|---|
| 22 | **`main-protection` 필수 승인 0 → 1 복구** (CLAUDE.md §13 문서와 불일치, 2026-08-04 변경됨) |
| 23 | **OSV Vulnerability Scan · License Compatibility 를 required check 로 승격** |
| 24 | `@kalyx/react` → `@kalyx/core` 핀 정책 결정(`workspace:*`=exact vs `workspace:^`) — 현재 core 패치가 react 사용자에게 자동 전달 불가 |
| 25 | tarball 게이트 보강: `entryPointCount === 7` 단언(엔트리 삭제 감지), 외부 의존성 range `satisfies` 검증 |
| 26 | 이미 배포된 `adapter-dayjs@0.1.0`·`adapter-luxon@0.1.0` 은 미서명 — 다음 배포부터 provenance 적용됨을 기록 |
| 27 | changeset 추가 여부 결정 — description 수정을 npm 에 반영하려면 필요 |


