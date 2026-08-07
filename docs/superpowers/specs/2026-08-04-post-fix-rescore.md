# 수정 후 재검증 · 재채점 — 2026-08-04

> **대상**: `main` @ `a71c43a` (PR #181/#182/#183/#184/#185/#186 머지 후, npm `@kalyx/core@1.4.1` · `@kalyx/react@1.4.1` 라이브)
> **기준선**: [`2026-08-03-claude-library-evaluation.md`](2026-08-03-claude-library-evaluation.md) (원본 #176) → [`2026-08-03-cross-evaluation-synthesis.md`](2026-08-03-cross-evaluation-synthesis.md) (교차평가 정정본)
> **증거 원칙**: 아래 모든 수치는 이 세션에서 직접 실행한 실측. 서브에이전트 보고는 교차확인한 것만 채택.

---

## 0. 헤드라인 — P0는 진짜 고쳐졌다. 그런데 같은 결함이 반대쪽 끝에 남아 있다

> ### 종합 점수: **~7 (원본 #176) → ~5.5–6 (교차평가 정정) → ~6 (현재)**
> 회복은 했지만 원래대로는 아니다. 이유 한 줄: **P0(음수 offset)는 실제로 수정됐고, 같은 결함 클래스가 UTC+12 이상 19개 존에 그대로 살아 있다.**
> 차원별: D1 4–5→**6** ↑ · D2 7→**5** ↓ · D3 4→**4** = · D4 6→**6** = · D5 7→**7** = · D6 6–7→**7** ↑ · D7 7→**7** =


- ✅ **Codex가 찾은 P0(음수 UTC offset 셀 하루 밀림)는 실제로 수정됨.** 418개 IANA 존 중 **음수·분수 offset 전부 정상**(New_York −5, Niue −11, Kathmandu +5:45, Eucla +8:45, DST 전환일 포함). §1 매트릭스 실측.
- 🔴 **신규 발견 — 같은 결함 클래스가 UTC+12 이상 19개 존에 남아 있음.** `civilMidnightFromUtcDay`의 "정오 UTC 프로브" 방식이 offset ≥ +12 에서 구조적으로 하루 밀림. **Pacific/Auckland(뉴질랜드) 포함**, 2026년 **365일 전부** 오답. `#181`이 못 잡은 미커버 클래스.
- 결과: D1은 회복하되 **완전 회복은 아님**(4–5 → 6). 나머지 차원은 대체로 개선 또는 유지.

---

## 1. D1 정확성 — timezone 매트릭스 실측

### 1-1. #181 P0 수정 검증 (통과)

7개 대표 존 × 6개 날짜(월초/월말/윤년 2/29/DST 전환 양방향) × 6개 플래그 전수:

| 검사 | UTC | Seoul +9 | New_York −5 | Niue −11 | Kathmandu +5:45 | Eucla +8:45 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `isSelected` 셀 위치 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `isDisabled` `{date}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `isDisabled` `{dayOfWeek}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `isFocused` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| range start/middle/end | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `isToday` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 월-view seed (civil Jan 1 → 1월) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DST 전환일 round-trip (NY 3/8, 11/1) | — | — | ✅ | — | — | — |

교차평가 문서가 지목했던 **"서울 Jan 1이 12월 view로 열리는" seed 버그도 해소**됨.

### 1-2. 🔴 신규 HIGH — `civilMidnightFromUtcDay` UTC+12 이상 하루 밀림

**위치**: `packages/core/src/utils/timezone.ts:157-166`

```ts
const probe = new Date(Date.UTC(y, m, d, 12, 0, 0)).toISOString();  // ← 정오 UTC 프로브
return startOfDayInTimezone(probe, timeZone);
```

주석은 *"A probe at noon UTC is used so the target civil day is unambiguous across any zone"* 라고 주장하지만 **offset ≥ +12 에서는 정오 UTC가 이미 다음 civil day**다. offset 범위가 −12…+14(26시간 폭)라 **단일 UTC 프로브 시각으로는 구조적으로 불가능**하다.

**전수 스윕 실측** (418 IANA 존 × 2026년 365일):

| 결과 | 존 수 | 비고 |
|---|---|---|
| civil date 하루 밀림 | **19** | 365/365일 오답 (Norfolk만 183/365 — DST로 +11↔+12) |
| 날짜 정상, 시각 01:00 | 5 | Cairo·Havana·Santiago·Beirut·Azores — **자정 DST gap snap-forward, 정상 동작** |

**영향 존 19개**: `Pacific/Auckland`, `Pacific/Fiji`, `Pacific/Chatham`, `Pacific/Tongatapu`, `Pacific/Apia`, `Pacific/Kiritimati`, `Pacific/Majuro`, `Pacific/Kwajalein`, `Pacific/Tarawa`, `Pacific/Enderbury`, `Pacific/Fakaofo`, `Pacific/Funafuti`, `Pacific/Nauru`, `Pacific/Norfolk`, `Pacific/Wake`, `Pacific/Wallis`, `Asia/Kamchatka`, `Asia/Anadyr`, `Antarctica/McMurdo`

**사용자 영향 (Pacific/Auckland 실측)**

| 증상 | 관측값 | 기대값 |
|---|---|---|
| ① `onChange` 값 (조용한 데이터 오염) | "1월 15일" 클릭 → `2026-01-15T11:00:00.000Z` = Auckland **1월 16일 00:00** | `2026-01-14T11:00:00.000Z` |
| ② `isToday` 하이라이트 (눈에 보임) | civil today = 8/5 인데 그리드는 **4일** 셀에 표시 | 5일 |
| ③ `{before}` min 경계 | min = Auckland civil 1/15 → 첫 활성 셀 **14일** | 15일 |

①은 **그리드가 자기모순이 없어 UI로는 정상처럼 보인다**(선택 셀과 저장값이 같은 함수를 타서 동일하게 밀림). 즉 **UI는 맞고 DB만 틀리는** 유형이라 발견이 늦어진다. ②③은 화면에서 바로 보인다.

**도입 시점**: `104bbf2 feat(timezone): full displayTimezone support (v0.4)` — **#181이 만든 회귀가 아니라 v0.4부터의 pre-existing**. #181은 음수 offset 클래스만 고쳤다.

**약속 위반**: `README.md:55` — "**IANA timezone-aware** — opt-in `displayTimezone` handles DST without changing storage."

**수정 방향 (core 순수함수 = react 엔트리 0 byte)**: 프로브를 버리고, 같은 파일 `setTimeInTimezone`(`timezone.ts:225-`)이 이미 쓰는 **2-pass offset 해석**을 재사용해 좌표의 Y/M/D를 civil 자정으로 직접 매핑한다. DST gap/ambiguity 정책도 그대로 상속된다. 회귀 테스트는 **반드시 +12/+13/+14 존을 포함**해야 한다.

### 1-3. 🟠 ISO-string 계약 vs tz 비교 레이어 불일치 — `isDateDisabled` 뿐 아니라 **`value` 자체**

교차평가 §4b는 이걸 "`isDateDisabled` 한 함수의 footgun"으로 봤다. 더 넓다.

**(a) `isDateDisabled`** — 실측:

| 호출 방식 | Seoul | New_York | Kiritimati |
|---|:-:|:-:|:-:|
| civil-midnight instant 전달 (정상 용법) | `true` | `true` | `true` |
| raw `…T00:00:00Z` 좌표 전달 (직관적 오용) | `true` | **`false`** ⚠️ | **`false`** ⚠️ |

PR #185는 **JSDoc으로 문서화**만 하고 함수는 그대로 뒀다.

**(b) 더 중요 — controlled `value` 도 같은 문제.** `DatePicker/Calendar.tsx:84`는 `selected: ctx.value` 로 **사용자가 준 값을 그대로** `getCalendarDays`에 넘긴다. 그런데 `CLAUDE.md §3`과 docs 가 계약으로 제시하는 값 형식이 바로 `"2026-01-15T00:00:00.000Z"` 다. 실측:

```tsx
<DatePicker value="2026-01-15T00:00:00.000Z" displayTimezone="America/New_York">
```

| tz | 하이라이트되는 셀 |
|---|:-:|
| UTC | 15 ✅ |
| Asia/Seoul | 15 ✅ |
| **America/New_York** | **14** ⚠️ |
| **Pacific/Niue** | **14** ⚠️ |

DB `DATE` 컬럼을 직렬화하면 자연스럽게 `YYYY-MM-DDT00:00:00.000Z` 가 나온다. **문서가 제시한 형식 그대로 controlled 로 쓰면 음수 offset 존에서 하루 앞 셀이 선택된 것으로 보인다.**

→ 이건 "구현 버그" 라기보다 **계약 결정 사항**이다. 두 선택지: (i) inbound `value`/`disabled` 를 Root 에서 정규화(문서 계약 유지), (ii) "`displayTimezone` 사용 시 값은 civil-midnight instant 여야 한다"를 §3 계약과 모든 컴포넌트 문서에 명시. **지금은 둘 다 아니다** — 계약은 raw 를 보여주고 구현은 instant 를 기대한다.

### 1-4. 🟡 신규 MEDIUM — `{before}`/`{after}` min·max 경계일이 offset 부호에 따라 한 칸 어긋남

`{before}`/`{after}`는 설계상 **instant 비교**(#185 JSDoc: "timezone-independent")인데, 그리드 셀은 **civil-midnight instant**다. 그래서 사용자가 **문서가 예시로 보여주는 방식 그대로** raw UTC 자정을 경계로 넘기면 `displayTimezone` 아래서 경계일이 한쪽으로 새어나간다.

문서 예시: `apps/docs-site/docs/components/datepicker.md:432` → `{ before: '2026-01-01T00:00:00.000Z' }`

실측 (`view = 2026-01`):

| tz | `{before: '2026-01-15T00:00Z'}` → 첫 활성일 | `{after: '2026-01-20T00:00Z'}` → 마지막 활성일 |
|---|:-:|:-:|
| UTC | 15 ✅ | 20 ✅ |
| Asia/Seoul (+9) | **16** ⚠️ (15일이 잘림) | 20 ✅ |
| America/New_York (−5) | 15 ✅ | **19** ⚠️ (20일이 잘림) |

`displayTimezone` 미사용 시엔 정상. 즉 **headline 기능을 켤 때만 min/max가 하루 어긋나는** 유형이라 D1 감점 요인이다. 수정 옵션: (a) `{before}`/`{after}`도 tz 지정 시 civil-day 경계로 정규화, 또는 (b) 문서/예시를 "경계는 civil-midnight instant 로 넘기라"로 고치고 `displayTimezone` 페이지에 명시.

---

## 2. 실측 게이트 (전부 이 세션 직접 실행)

| 항목 | 결과 | 비고 |
|---|---|---|
| `pnpm build` | ✅ | |
| `pnpm test:run` | ✅ **855 passed / 46 files** | 1.4.0 시점 776 → **+79** |
| `pnpm typecheck` | ✅ | |
| `pnpm lint` | ✅ | |
| `pnpm --filter docs-site typecheck` | ✅ | **#186 주장대로 복구됨** — CLAUDE.md의 "index.tsx JSX namespace 에러는 사전존재·무해" 메모는 이제 스테일 |
| `node scripts/check-bundle-size.js` | ✅ **ESM 18.28KB / CJS 18.38KB** (≤20KB) | PR #186 본문의 18.30/18.43 과 미세 차이 — 이 수치가 실측 |
| `node scripts/verify-entry-split.mjs` | ✅ hard gate | date-fns 부재 확인. 크기 델타 1.1%는 informational |
| `pnpm test:e2e --project=chromium` | ✅ **31 passed** | 3 브라우저 × 31 = #186의 93건과 정합 |
| `pnpm test:coverage` (core) | calendar 94.66 / timezone 98.27 / date 100 / time 98.46 / locale 97.77 (stmts) | CLAUDE.md §7 "코어 순수함수 100%" 목표 **미달** |

**번들 마진**: 20KB 대비 ESM **1.72KB** / CJS **1.62KB** (직전 17KB 대비 ~110B 에서 대폭 완화).
**⚠️ 게이트 범위**: `check-bundle-size.js`는 **index 엔트리 2개만** 검사. `/headless`는 **19.54 / 19.66KB로 20KB에 0.35–0.46KB까지 근접했는데 게이트 대상이 아니다.**

---

## 1-5. #178/#179/#180 close(supersede) 검증 — #179만 부분 supersede

세 PR은 머지가 아니라 **close** 됐고 그 테스트도 함께 사라졌다. #181이 정말 상위집합인지 동작 단위로 확인:

| 동작 | 원 PR | main 에 존재? | main 테스트 락 |
|---|---|---|---|
| 타입드 input이 `dayOfWeek`/`before`/`after`/`date`/`filter` 위반 시 커밋 차단 | #178 | ✅ `DatePicker/Root.tsx:171` — **#178보다 나은 위치**(tz 정규화 *이후*) | ✅ `DatePicker.test.tsx:1273` (5개 규칙 it.each) |
| 유효한 타입드 값은 정상 커밋 / 빈 입력은 `null` clear | #178 | ✅ | ❌ **없음** (#178의 positive 2건이 대체 없이 소실) |
| RangePicker·DateTimePicker 커밋 검증 | (#178 미커버였음) | ✅ `RangePicker/Root.tsx:161-177`, `DateTimePicker/Root.tsx:194-220` | ✅ |
| headless `useDatePicker`/`useRangePicker`/`useWeekPicker`/`useDateTimePicker` | — | ✅ | ✅ |
| headless **`useMonthPicker`/`useYearPicker`** 커밋 검증 | 없음 | ❌ **미가드** — `useMonthPicker.ts:100`·`useYearPicker.ts:93` 이 `isDateDisabled` 호출 0회(직접 확인). 두 훅은 grid 용 disabled 플래그는 계산하면서(`useMonthPicker.ts:14,149`) 커밋은 무검증 | ❌ 없음 |
| TimePicker `filterTime` 타입드 차단 | #180 M-3 | ✅ **더 넓게** — Input 이 아니라 공유 `setTime` 경계(`TimePicker/Root.tsx:143`)라 HourList/AmPm/context/DateTimePicker/훅 전부 커버 | ✅ |
| `isDateDisabled` timezone | #180 M-4 | ✅ 더 넓게(셀별 civil 정규화, `{date}`+`{dayOfWeek}`+`{filter}`) | ✅ |
| **열 때** disabled 날짜 → focus 재타겟 | #179 | ✅ `internal/calendarFocus.ts` + Root 3곳 + 훅 4곳 | ✅ `DatePicker.test.tsx:435-458` (#179보다 강함) |
| **월 이동 후** focus 재앵커 | #179 (`getCalendarDays` 수정) | ❌ **없음** | ❌ 없음 |

### 🟠 재현 확인 — 월 이동 시 그리드 키보드 사망 (HIGH-2 와 동일 클래스, 미해결)

`DatePicker/Calendar.tsx:123-133` `navigateMonth`는 **enabled 검사 없이** `setFocusedDate(startOfMonth(newMonth))`. 반면 12칸 그리드(Month/Year)는 `_shared/grid-keyboard.ts:150-156`에 **정확히 이 위험을 막는 re-anchor `useEffect`**가 있고 `YearPicker.test.tsx:314`가 락한다. **day 캘린더에만 없다.**

실제 렌더로 재현(격리 테스트 실행 후 파일 삭제, 레포 무변경):

```
value=2026-02-10, disabled=[{before:'2026-02-01'}]
열기 직후      → tabbable 셀: ['10']            ✅ (open-time 재타겟 정상)
'이전 달' 클릭 → tabbable 셀: ['1(disabled)']   ❌
                 enabled tabbable 셀: 0          ❌ 키보드 진입점 소멸
```

**측정 범위 명시**: 위는 **jsdom** 실측이다. jsdom 은 disabled 버튼에도 focus 를 허용해 `activeElement` 가 그 버튼으로 잡혔다. 실제 브라우저에서는 HTML 명세상 **disabled 폼 컨트롤이 순차 포커스 내비게이션 대상에서 제외**되므로 `tabindex="0"` 이 무의미해지고 그리드에 진입점이 없어진다 — 이는 명세 근거 추론이며 **실브라우저로 직접 측정하지는 않았다**. 참고로 `onKeyDown`은 `<table>`에 있어(`Calendar.tsx:293`) 화살표키는 그리드 내부에 focus 가 있을 때만 도달한다.

**D6 시사점**: 이 플로우는 **chromium e2e 31건이 전부 통과하는 상태에서 살아 있다** — e2e 시나리오에 "제약이 걸린 월로 이동" 케이스가 없다.

**판정**: "#181이 #178/#179/#180 을 supersede 한다"는 **#178·#180엔 사실, #179엔 절반만 사실**. 또 "전 mutation 경계 parity" 주장은 `useMonthPicker`/`useYearPicker` 두 곳에서 성립하지 않는다.

---

## 2b. D2 문서 — 서브에이전트 감사 + 직접 교차확인

아래는 전부 **내가 재확인한 것만** 채택했다.

| 심각도 | 위치 | 문서가 말하는 것 | 사실 |
|---|---|---|---|
| 🔴 | `apps/docs-site/docs/api/core.md:76,86,100` (+ ko 동일) | `import { DateFnsAdapter } from '@kalyx/core'` | **런타임 throw.** `packages/core/src/index.ts:13-16`은 "다른 패키지로 추출됨" 주석만 있고 export 없음 — `'DateFnsAdapter' in coreModule === false` 직접 확인. **PR #185가 같은 파일 21줄 아래(:97-125)를 편집하면서 안 고침.** 단, `getting-started/quick-start.mdx`의 정상 경로는 `@kalyx/react`만 써서 **신규 사용자 진입은 무사** — core 유틸을 직접 쓰는 headless 사용자만 밟는다 |
| 🔴 | `packages/react/package.json` `description` | "…**≤16 KB gzipped**" | 실측 18.28KB. **npm 패키지 페이지에 노출되는 최고 도달률 문구** |
| 🔴 | `apps/docs-site/docs/getting-started/installation.md:30` (+ko) | "`date-fns` + **`date-fns-tz`** — 기본 엔진, 자동 설치됨" | `date-fns-tz`는 **어떤 package.json에도 없음** (직접 grep 확인). timezone은 `Intl` 기반 |
| 🔴 | `apps/docs-site/src/components/FeatureGrid/data.ts:35` (+ ko `code.json:55`) | 랜딩 기능 카드 "IANA timezones **via date-fns-tz**" | 동일 — 랜딩 페이지 |
| 🟠 | `api/core.md:83,95` (+ko) | "Build a **6-week** grid", "Returns `CalendarGrid` (**6×7**)" | 실제 4–6주. **함수 자신의 JSDoc**(`calendar.ts:19`)이 "4-6 weeks"라고 반대로 말함 |
| 🟠 | `api/core.md:50-58` `CalendarOptions` | `timezone`·`fixedWeeks` **미기재** | `types.ts:123,129`에 존재. `fixedWeeks`는 docs 전체 grep **0 hit**. `timezone`은 1.4.1 수정의 한복판 옵션인데 타입 문서에 없음 |
| 🟠 | `.github/PULL_REQUEST_TEMPLATE.md:31` / `CLAUDE.md:512` / `.claude/commands/check-bundle.md:41` | "≤ 16 KB" | 게이트는 20KB. PR 템플릿은 매 PR 마다 틀린 체크박스를 요구 |
| 🟠 | `packages/{core,react}/CHANGELOG.md` 1.4.1 | 한 문장 요약뿐 | **patch 릴리즈인데 emission 시맨틱이 바뀜**: (a) `DatePicker/Presets.tsx`가 `date` preset을 `calendarDayFromInstant`로 재정규화 → `displayTimezone` 사용자가 DB에 저장하던 값이 달라짐, (b) `Root.tsx:171` `selectDate`가 disabled 날짜에서 **조용히 no-op**(이전엔 onChange 발화), (c) `CalendarDay` 플래그 계산 기준이 civil instant로 변경 — 커스텀 그리드 렌더러 출력이 달라짐. **셋 다 CHANGELOG에 없음** |
| 🟡 | `CalendarDay.isoString` (`calendar.ts:82`, `types.ts:41`) | "ISO 8601 UTC string" | 플래그는 civil instant 기준인데 `isoString`만 **raw UTC 좌표**. headless 사용자가 `day.isoString`을 `isDateDisabled(..., timezone)`에 되먹이면 **#185가 문서화한 바로 그 버그를 재현**. 혼합 계약이 미문서화 |
| 🟡 | ko 번역 | 35/35 파일 존재 (수치 drift 없음) | 그러나 **6개 파일이 영어 그대로**: `api/core.md`, `api/react.md`, `concepts/iso-string.md`, `concepts/timezone.md`, `migration.md`, `recipes/testing.md`. 1.4.1이 바꾼 시맨틱을 한국 사용자가 찾아갈 두 페이지가 미번역 |
| 🟡 | `troubleshooting.md:216` vs `guides/adapters.md:68` | date-fns 비용 "~5KB" vs "약 2KB" | 라이브 두 페이지가 2.5배 다른 답 |

**#185 평가**: `isDateDisabled` JSDoc(`calendar.ts:196-211`)은 **잘 썼다** — 음수 offset 실패를 명시하고 `civilMidnightFromUtcDay`를 가리킨다. 그러나 (a) **함수는 안 고쳤고**, (b) 컴포넌트 `disabled` prop 문서(`components/datepicker.md:144` 등)·`concepts/timezone.md`·`troubleshooting.md`에는 **경고가 전혀 없어** 실제로 밟을 사용자는 도달 못 한다.

✅ **깨끗함**: 17→20KB 스윕 자체는 정확히 수행됨 — README en/ko, packages/react/README, CONTRIBUTING, RELEASING, docs-site intro/troubleshooting/api, docusaurus.config, Hero/StatStrip/WhyKalyx/FeatureGrid, ko code.json, ci-cd/oss-references 스킬 전부 정합. 실측치와 일치.

---

## 2c. D7 보안 — 서브에이전트 감사 + 직접 교차확인

**개선 (실측 확인)**

| 항목 | #184 이전 | 현재 |
|---|---|---|
| `pnpm audit` | High 20 / Mod 10 / Low 1 = **31** | **0** (직접 실행 확인) |
| `osv-scanner` | 31 vulns / 13 packages | "No issues found" |
| `osv-scanner.toml` 억제 목록 | js-yaml 1건 ignore | **0건** — 억제가 아니라 실제 해소 |

- 취약점 31건 **전부 dev/build/docs 경로**였음이 root-importer 전수(`. ×11`, `apps/docs ×12`, `apps/docs-site ×8`, `packages/* ×0`)로 확인 — 공개 패키지 런타임 도달 **0건**.
- **`@kalyx/core` 런타임 의존성 0개.** 이것이 31건이 사용자에게 못 닿은 구조적 이유. `files` allowlist·postinstall 없음도 확인.

**남은 리스크 (신규 발견 포함)**

| 심각도 | 항목 |
|---|---|
| 🔴 | **`main-protection` 룰셋의 `required_approving_review_count` = 0** (gh api 직접 확인, `updated_at` = **2026-08-04**). CLAUDE.md §13은 "PR 필수, **1명 승인**"이라고 문서화. 이번 세션 머지 편의로 낮춘 것으로 보이며 **되돌려야 함**. `require_code_owner_review: false` (CODEOWNERS 존재하는데도) |
| 🟠 | **OSV Vulnerability Scan · License Compatibility 둘 다 required check 아님** — CVE를 되살리는 PR이 green으로 머지 가능. required 목록은 Type Check/Lint/Test×2/Build/Docs Site Build/Bundle Size/SSR/All Checks Pass 뿐 |
| 🟠 | **`@kalyx/react@1.4.1`이 `@kalyx/core`를 `"1.4.1"` 정확히 핀**(npm 실측). 어댑터 3종은 `^1.x`. → **core-only 보안/정확성 패치가 react 사용자에게 자동으로 못 간다.** #181 수정이 어댑터엔 caret으로 흘렀지만 react는 재릴리즈 필요 |
| 🟡 | `@kalyx/adapter-dayjs` · `@kalyx/adapter-luxon`: **provenance/attestation 없음**(수동 첫 배포 + `publishConfig.provenance` 누락). core/react/adapter-date-fns 3종은 OIDC + SLSA v1 ✅ |
| 🟡 | `pnpm.overrides` 22건 중 **10건이 상한 없음**(`>=x`) — 이미 `joi` 17→18, `http-proxy-middleware` 2→4.1.1로 major 드리프트 발생. #184 커밋 메시지의 "major-bounded" 는 자기가 고친 12건에만 해당. (단 overrides 는 배포 안 되므로 **빌드 리스크지 사용자 리스크 아님**) |
| 🟡 | `changesets/action@v1` **mutable tag**가 `id-token: write` + `contents: write` 보유. 승인 0 + `--admin` 머지 관행과 겹침. `dependabot.yml` 없음 |

---

## 3. 재채점 (3단 비교)

| 차원 | #176 원본 | 교차평가 정정 | **현재 (2026-08-04)** | 이유 |
|---|:-:|:-:|:-:|---|
| **D1 정확성·견고성** | 7 | **4–5** | **6** ↑ | P0(음수 offset) 실제 수정 + seed·mutation parity 대폭 개선(✅). 잔존 5건: ① **UTC+12 이상 19존 하루 밀림**(Auckland, 365/365일) ② **문서 계약대로 raw UTC `value` 를 넘기면 음수 offset 존에서 하루 앞 셀 선택** ③ min/max 경계 어긋남 ④ Month/Year headless 훅 커밋 미가드 ⑤ 월이동 시 그리드 키보드 진입점 소멸 → 7 이상 불가 |
| **D2 DX·문서** | 8 | 7 | **5** ↓ | api reference 의 `DateFnsAdapter` import 가 **런타임 throw**(#185가 같은 파일 손대고도 미수정), npm description "≤16 KB", installation.md 가 **없는 의존성**(date-fns-tz) 자동설치 안내, 6×7 grid 오기, `timezone`/`fixedWeeks` 미문서화, patch 릴리즈가 **emission 변경을 CHANGELOG에 안 알림**. 20KB 스윕 자체는 정확·구조/i18n 골격은 여전히 강함 |
| **D3 경쟁 적합성** | 4 | 4 | **4** = | #181–#186 중 시장 포지션을 바꾼 것 없음. 유지 |
| **D4 번들·성능 여유** | 6 | 6 | **6** = | 마진 110B→**1.7KB**로 숨통(+). 반면 헤드라인 16.6→18.3KB, 천장 약속 17→20 재조정, entry-split 크기 델타가 자기 목표(2%) 미달인 채 **informational 강등**, `/headless` 19.54/19.66KB가 **게이트 밖**, 소비자 실측은 단일 픽커도 23.85KB(픽커별 tree-shaking 사실상 없음)(−). 상쇄 |
| **D5 접근성** | 7 | 7 | **7** = | open-time disabled-focus 재타겟 해결·axe 15건 전 픽커·RTL·focus restore(+). 그러나 **월 이동 시 키보드 진입점 소멸을 실제 렌더로 재현**(§1-5) — D5를 7로 눌렀던 HIGH-2와 같은 클래스라 상향 불가 |
| **D6 테스트 정직성** | 8 | 6–7 | **7** ↑ | +79 케이스·음수 offset 커버 2배·훅 parity 테스트(+). 그러나 ① property `ZONES`에 Kiritimati가 **있는데도** `civilMidnightFromUtcDay` round-trip property가 없어 19존 버그가 855-green 통과, ② 12칸 그리드엔 있는 focus 재앵커 테스트가 day 캘린더엔 없음, ③ `resolveEnabledCalendarFocus` 단위테스트 0, ④ 타입드 positive/clear 락 소실, ⑤ core 커버리지 94.66%(목표 100%) |
| **D7 보안·공급망** | 8 | 7 | **7** = | `pnpm audit`·`osv-scanner` **31 → 0**, 억제 아닌 실제 해소, core 런타임 의존성 0, 3패키지 OIDC+SLSA(+). 반면 **`main` 필수 승인 0명으로 오늘 변경**(문서는 1명), OSV/License가 required check 아님, dayjs/luxon provenance 없음, react 가 core 를 **정확히 핀**해 core 패치가 react 사용자에게 자동 전달 불가(−) |
| **종합** | **~7** | **~5.5–6** | **~6** | "P0는 실제로 고쳐졌다. 라이브러리는 정확성 축에서 확실히 좋아졌다. 그러나 **같은 결함 클래스의 반대쪽 끝**과 **문서 신뢰성**이 남아 홍보 단계는 아니다" |

---

## 4. 방향 결정 — 홍보는 아직, 정확성 마감이 먼저

**홍보 반대 근거 (데이터)**: headline 기능(`displayTimezone`)이 **뉴질랜드 전역 포함 19개 존에서 하루 틀린 날짜를 조용히 저장**하고, API 레퍼런스가 **첫 줄부터 throw 하는 import**를 준다. 홍보는 이 둘을 증폭시킨다. 첫 외부 사용자가 밟을 확률이 가장 높은 두 지점이 지금 깨져 있다.

### P0 — 다음 세션 착수 (전부 core 순수함수 = react 엔트리 0 byte 예상)

1. **`civilMidnightFromUtcDay` +12 이상 수정.** 정오 프로브 제거 → 같은 파일 `setTimeInTimezone`의 2-pass offset 해석 재사용.
   **프로토타입 검증 완료**: 418존 × 365일 = **152,570 케이스 중 오답 0**, DST-gap snap-forward 5존은 기존과 동일 유지, 현재 구현과 6,753 케이스에서만 차이(= 정확히 버그 케이스). §5 참조.
   **기존 테스트 충돌 없음(확인함)**: +12 이상 존을 하드코딩한 기대값은 테스트 전체에 **없다** — `Pacific/Kiritimati` 4회 등장이 전부이고 (`timezone.property.test.ts:37` ZONES 목록, `:137` `todayInTimezone` 루프, `:146,148` 주석·distinctness) `todayInTimezone` 은 문제의 프로브를 타지 않는다. 즉 수정이 기존 green 을 깨지 않을 것으로 예상되며, 만약 깨진다면 **그 테스트의 기대값이 틀린 것**이다.
2. **회귀 property 추가** — `civilMidnightFromUtcDay` ↔ `calendarDayFromInstant` round-trip, `ZONES`에 Auckland(+13)·Chatham(+13:45)·Kiritimati(+14) 필수. 이게 없었기에 855-green 을 통과했다.
3. **문서 3건 즉시 정정** (사용자 신뢰 직결, 비용 거의 0): `api/core.md` import 경로(en+ko), `packages/react/package.json` description "≤16 KB", `installation.md`+`FeatureGrid/data.ts`의 `date-fns-tz`.

### P1 — 이어서

4. **월 이동 focus 재앵커** — day 캘린더에 12칸 그리드와 동일한 re-anchor(`grid-keyboard.ts:150-156` 패턴) + `YearPicker.test.tsx:314` 스타일 테스트.
5. **`useMonthPicker`/`useYearPicker` 커밋 가드** — `isDateDisabled` 2줄. "전 mutation 경계 parity" 주장을 실제로 참으로 만든다.
6. **ISO-string 계약 결정 (§1-3)** — `isDateDisabled` 문서화(#185)만으로는 부족. **`value`·`disabled`·min/max 를 Root 에서 inbound 정규화**해 `CLAUDE.md §3` 계약(raw UTC ISO)을 그대로 지키거나, 계약을 "`displayTimezone` 사용 시 civil-midnight instant" 로 바꾸고 §3·모든 컴포넌트 문서·`concepts/timezone.md` 에 명시. **어느 쪽이든 결정이 필요**하며, 지금처럼 계약과 구현이 갈린 상태가 가장 나쁘다. (권고: (i) inbound 정규화 — 사용자가 이미 저장한 데이터를 안 건드려도 되고, headless 소비자의 오용도 자동 흡수)
7. **CHANGELOG 소급 보완** — 1.4.1이 바꾼 emission 3건 명시(preset 재정규화 / disabled 시 `selectDate` no-op / `CalendarDay` 플래그 기준). `api/core.md`의 6×7·`timezone`·`fixedWeeks` 보강.
8. **거버넌스 복구** — `main-protection` 필수 승인 **0 → 1** 되돌리기, OSV/License 를 required check 로 승격.

### P2 — 그 다음

9. `/headless` 엔트리도 번들 게이트 대상에 포함(현재 19.66KB, 천장 0.34KB 남음).
10. dayjs/luxon `publishConfig.provenance: true` + CI 재배포.
11. **그 후 재평가.** D1이 7–8, D2가 7 이상으로 회복되면 그때 홍보 트랙을 다시 판단한다.

---

## 4b. 이번 라운드 dual-model 메타

- **Codex 우위(직전 라운드)**: negative-offset P0. 실제로 수정됐고 검증됨.
- **이번 라운드 신규**: **+12 이상 반대쪽 끝**은 양쪽 모델 모두 놓쳤다(Codex 수정도, Claude 검증도 Seoul/NY 축에만 갇혀 있었다). 잡아낸 방법은 **모델 추론이 아니라 418존 × 365일 전수 스윕** — 교훈은 "대표 존 몇 개"가 아니라 **도메인 전수**로 검증할 것.
- **방법론 교훈 확정**: 이전 회고의 "revert→RED 는 기대값의 정당성을 증명 못 한다"에 하나 더 — **테스트 존 목록에 극단값이 들어 있어도 그 존을 태우는 property 가 없으면 무의미하다**(Kiritimati 가 `ZONES` 에 있었는데도 통과).

---

## 5. 재현 스크립트

이 세션에서 사용한 프로브는 세션 스크래치패드에 있음 (`tzmatrix.mjs` 매트릭스, `zonesweep.mjs`/`fullsweep.mjs` 전수 스윕, `auckland.mjs` 사용자영향). 회귀 테스트로 승격 시 `packages/core/src/__tests__/timezone.property.test.ts`에 다음 property 를 추가하는 형태를 권장:

```ts
it('civilMidnightFromUtcDay preserves the civil date in every zone', () => {
  fc.assert(fc.property(utcMidnightCoordinate(), zone(), (coord, tz) => {
    expect(calendarDayFromInstant(civilMidnightFromUtcDay(coord, tz), tz)).toBe(coord);
  }), { numRuns: 300 });
});
// ZONES 에 Pacific/Auckland(+13), Pacific/Chatham(+13:45), Pacific/Kiritimati(+14) 필수
```
