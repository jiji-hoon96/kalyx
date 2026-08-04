# Dual-model 교차평가 종합 (Synthesis) — 2026-08-03

> **작성**: Claude 세션이 **Codex의 검증(#178/#179/#180/#176 PR 리뷰)을 적대적으로 재검증**하고, 양측 결과를 하나로 종합. 핸드오프 §3 산출물.
> **증거 원칙**: 모든 판정은 소스/실측. Codex 주장·Claude 이전 평가 모두 재현으로 검증. 이전 Claude 검증 리포트([`2026-08-03-claude-verification-of-fix-prs.md`](2026-08-03-claude-verification-of-fix-prs.md))는 이 문서로 **정정·보완**됨(특히 M-4·tz-gap 판정 뒤집힘).

---

## 0. 헤드라인 — Codex가 P0 timezone 버그를 찾았고, Claude 평가·수정이 놓쳤음

Codex의 #180/#176 리뷰가 지적한 **negative UTC offset에서 그리드 셀이 하루 밀리는 P0**를 Claude가 실측으로 **CONFIRMED**.

**근본 원인**: 그리드 셀(`current`)은 **UTC-midnight 좌표**(`startOfMonth`/`startOfWeek`/`addDays` 전부 UTC — `adapter-date-fns/src/index.ts:137,184,192`)로 생성되는데, 저장값은 `selectDate`가 `civilMidnightFromUtcDay`로 **civil-midnight-in-tz instant**로 변환해 emit(`DatePicker/Root.tsx:159-160`). 그리고 `isSameDay(current, value, timezone)`는 **양쪽을 tz civil-day로 변환**(`adapter isSameDay → isSameDayInTimezone`, `calendar.ts:66-69`) → 이미 좌표인 `current`가 한 번 더 shift돼 negative offset에서 하루 밀림.

**실측 (Claude 직접 실행, core 함수 호출):**

| tz | "Jan 15 선택" 저장값 | selected 찍히는 셀 | isDateDisabled({date}=저장값) |
|---|---|---|---|
| Asia/Seoul (+9) | `2026-01-14T15:00:00.000Z` | **15** ✓ | cell15 막힘 ✓ |
| America/New_York (−5) | `2026-01-15T05:00:00.000Z` | **16** ✗ **BUG** | cell15=false, **cell16=true** ✗ |

Seoul(+offset)은 civil-midnight가 전날 UTC로 넘어가며 두 shift가 상쇄돼 **우연히 맞아 보임**. Codex 지적 그대로: "added test covers only positive-offset Seoul, where this representation mismatch is hidden."

**영향 범위**: `getCalendarDays`의 `timezone` 인자를 쓰는 **모든 플래그** — selected · today · focused · range · (M-4 이후) disabled. + Root의 월-view seed(`startOfMonth(civil-midnight-in-tz)` → 서울 Jan 1(`2025-12-31T15:00Z`)이 **12월 view**로 열림, `Root.tsx:122-131`). **headline timezone 기능의 데이터/UI 정합성 P0. main에 pre-existing.**

---

## 1. PR 판정 (정정본)

| PR | 이전 Claude 판정 | **정정 판정** | 근거 |
|---|---|---|---|
| #178 HIGH-1 | ✅ CONFIRMED | ✅ **CONFIRMED (부분 수정 명시)** | 가드 로직은 tz-모델과 독립(dayOfWeek/before/after)이라 유효. 단 **DatePicker/Month/Year만 커버** — RangePicker presets·DateTimePicker·headless는 별도 미가드 커밋 경로(`RangePicker/Root.tsx:168`·`DateTimePicker/Root.tsx:200` 독자 selectDate, isDateDisabled 없음). Codex Claim D 유효 = "narrow partial fix". |
| #179 HIGH-2 | ✅ CONFIRMED | ✅ **CONFIRMED (nit 2개)** | focus-retarget 로직은 tz-모델 독립이라 유효. Codex Claim E(first-arrow: React `focusedDate` state 미갱신 → 첫 화살표가 DOM focus 아닌 원래 셀 기준 이동)는 **핸드오프 defer 항목과 수렴**, 유효. 추가 nit: "first-enabled-of-month" fallback이 mid-month disabled 값에 큰 점프 유발 → nearest/directional이 더 나음(설계 개선점). |
| #180 M-3 (filterTime) | ✅ CONFIRMED | ✅ **CONFIRMED** | tz-모델과 무관·직교. 이빨 검증 유효. (단 Codex Claim B: ctx.setTime·DateTimePicker·headless는 여전히 filterTime 우회 — input 경로만 가드. 스코프 nit.) |
| #180 M-4 (isDateDisabled tz) | ✅ CONFIRMED | ⚠️ **판정 뒤집힘 — 깨진 모델 위 밴드에이드** | M-4는 `isDateDisabled`에 tz를 전달해 **selected/today와 "일관"되게** 만들지만, 그 일관성의 대상이 바로 **버그난 UTC-cell-vs-civil-instant 비교**. → negative offset에서 disabled도 하루 밀림(위 표). 이전 "이빨 검증 통과"는 **Seoul-only 테스트라 깨진 모델이 맞아 보인 것**(이빨은 테스트가 코드를 건드림만 증명, 기대값이 옳음은 증명 못 함 — self-test 함정). **P0 수정에 흡수 재작업 필요.** |
| tz-gap follow-up (Claude 발견) | 🔧 FIXED | ❌ **철회(WITHDRAWN)** | 같은 결함 상속(UTC-cell 좌표에 displayTimezone 전달) — Seoul GREEN·NY 깨짐. 패치 삭제. P0 수정에 흡수. Codex Claim C가 이 gap을 독립 발견한 점은 **수렴**(양측 동일 지점 도달). |

> **이빨 검증의 교훈(자기비판)**: #178/#179 이빨은 여전히 유효(tz-모델 독립). 그러나 M-4·tz-gap의 이빨은 **Seoul 기대값 자체가 틀려** 무의미했다. revert→RED는 "테스트가 코드를 탄다"만 증명한다. **기대값의 정당성은 별도 검증**(음수 offset 반례)이 필요했고, 이걸 Codex가 잡았다.

---

## 2. 스코어카드 셀 단위 대조·중재 (#176 vs Codex 리뷰)

Codex는 수치 스코어카드를 아직 안 채웠으나(codex 브랜치 = 스켈레톤), #176 리뷰에서 방향성 반론 제시. 셀 단위 중재:

| 차원 | Claude #176 | Codex 반론 | 재검증 | **최종** |
|---|:---:|---|---|:---:|
| **D1 정확성** | 7 | P0 timezone 셀-밀림(negative offset) 놓침 | ✅ 실측 CONFIRMED (§0) | **4–5로 하향.** headline 기능 P0는 견고성 상한을 크게 낮춤 |
| D2 문서 | 8 | api/core.md가 `DateFnsAdapter`를 `@kalyx/core`서 import 안내(실제 `@kalyx/adapter-date-fns`), 6×7 grid 서술·`fixedWeeks`/`timezone` 누락, date-fns-tz 자동설치 오기 | ✅ import-path CONFIRMED(`api/core.md:76` vs export `adapter-date-fns/src/index.ts:106`). ⚠️ index.tsx typecheck 실패는 **기존 known·benign**(CLAUDE.md 기재, CI Type Check는 별 tsconfig로 통과) → 새 감점 불가 | **7로 소폭 하향** (실 doc 오류 존재, 단 index.tsx는 제외) |
| D3 경쟁 | 4 | "유일한 complete picker" 과장 — Ark/MUI X/RDP도 상당 커버. 진짜 차별점 = zero-CSS + 7-picker + ISO-string + standalone TimePicker + MIT range 조합. "사용자 0"도 npm ~73 weekly와 구분 | 부분 타당(카피 정밀화 필요), 점수 자체는 이미 낮음(4) | **4 유지** (서술만 정정) |
| D4 번들 | 6 | 17KB는 artifact-only(deps external). consumer harness 실측 single picker 23.42KB / all 24.25KB. tree-shaking은 CI gate 아님 | ⚠️ **framing 차이지 버그 아님**. 17KB는 유효한 artifact 지표. 단 "필요한 것만 import" 소비자비용은 미입증·gate 부재는 사실 | **6 유지** (artifact vs consumer 분리 서술 추가) |
| D5 a11y | 7 | (반론 없음) | — | **7 유지** |
| D6 테스트 | 8 | (직접 반론 없음, 단 P0가 792-green에서 생존 = 커버 갭) | P0가 test-green 속에 생존한 건 D6 정직성 흠 | **6–7로 소폭 하향** (green≠정확) |
| D7 보안 | 8 | pnpm audit high 17/mod 10 (workspace). dayjs/luxon 0.1.0 provenance 미확인. docs Tailwind CDN SRI/CSP 없음 | ⚠️ audit high는 전부 **빌드/docs 의존**(Next.js·sharp·SVGO·js-yaml·shell-quote) — 공개 packages(core/react/adapter-date-fns) 런타임 그래프 **미도달**. Codex 스스로 hedge. → OSV-0(공개 pkg) 유지. provenance/CDN은 nit | **7로 소폭 하향** (nit 반영, audit 근거로 대폭 하향은 부당) |

**종합**: Claude ~7 → **~5.5–6**로 하향. 단일 최대 원인 = D1의 P0. Codex가 D1에서 명백히 이김.

---

## 3. P0 수정 방향 — 표현(representation) 결정 (유지보수자 판단 필요, 이번 턴 미구현)

버그는 `civilMidnightFromUtcDay` remap과 UTC-midnight 그리드 좌표의 **불일치**에서 발생. 두 가지 정합적 수정, 어느 쪽도 아직 확정 아님:

- **Fork A — remap 제거**: `selectDate`가 civil-midnight 변환 없이 **UTC-midnight 좌표를 그대로 emit**. CLAUDE.md §3 "value = UTC ISO string" 문서 계약과 일치. 그러면 그리드 비교가 이미 정렬됨. **단 `onChange` 출력이 바뀜**(breaking) + `today()`/rule도 UTC-midnight 좌표인지 확인 필요.
- **Fork B — 비교 정규화(Codex 제안)**: 모든 비교 전에 그리드 좌표를 tz civil-midnight instant로 변환(selected/today/focused/range/disabled) + Root 월-view seed도 tz 인지. civil-midnight emission 유지. **표면 넓음**(getCalendarDays 전 플래그 + Root).

**결정 기준**: emission 시맨틱을 **현재 무엇이 lock**하는지 확인(TC-M5, Seoul round-trip 테스트들). Codex가 제안했다고 B로 기본 선택 금지 — `selectDate` 주석 자체가 혼란스러움(intent 미확정). **+/- offset 양방향 테스트 필수**(현 테스트는 Seoul-only). 이 수정은 core(getCalendarDays)+Root+today() 교차라 **별도 세션에서 신중히**(밴드에이드 2탄 방지).

---

## 4. 액션 플랜

1. **#178 머지 가능** (부분 수정임을 PR/CHANGELOG에 명시 — RangePicker presets·DateTimePicker·headless 미커버).
2. **#179 머지 가능** (first-arrow + fallback nit은 P0/후속에서). core-only 0 byte.
3. **#180 분리 처리**: **M-3(filterTime)만 살리고**, **M-4(isDateDisabled tz)는 hold** — P0 수정과 함께 재작업(현 상태로 머지하면 negative offset 오동작을 "일관되게" 확산). → #180에서 M-4 커밋 분리 권장, 또는 P0 브랜치로 이관.
4. **tz-gap follow-up 폐기** (완료 — 패치 삭제).
5. **P0 timezone 수정** = 최우선 신규 작업. Fork A/B 결정 → 양방향 tz 테스트 → getCalendarDays+Root+today 교차 수정. 이게 D1 회복의 핵심.
6. **문서 정정**(D2): api/core.md `@kalyx/core`→`@kalyx/adapter-date-fns` import, grid 4–6주·`fixedWeeks`/`timezone` 반영, date-fns-tz 오기 제거.
7. **머지 순서**(이전 리포트 정정 유지): #178+#180(M-3만) 상호 클린 → #179 마지막(충돌 1회). ⚠️ #179가 test-file 충돌 허브.

---

## 4b. Codex Draft PR #181 평가 (`fix/codex-correctness`, head 8353702)

Codex가 P0를 포함한 **전면 수정**을 Draft PR #181로 제출(+2733/−192, 40파일). Claude 독립 검증:

### 실측 (Claude 직접 실행, #181 worktree)

| 검증 | 결과 |
|---|---|
| P0 NY selected 셀 (main=16 버그) | **[15]** ✅ 고쳐짐 (grid disable도 NY=[15] ✅) |
| `pnpm typecheck` | ✅ PASS |
| `pnpm test:run` | ✅ **852 tests / 45 files** (Codex 주장 확인) |
| `pnpm lint` | ✅ PASS |
| `check-bundle-size.js` | ❌ **ESM 18.28 / CJS 18.38KB** — 17KB 대비 **+1.3KB 초과** (Codex 주장 확인) |
| `verify-entry-split.mjs` | ❌ headless 1.1% < 2% gate |

→ Codex의 보고 CI 결과(정확성 green, 번들·entry-split fail)를 **전부 독립 확인**.

### P0 근본 수정 = core, 그리고 **0 byte** (분해 실측)

#181의 P0 수정은 **core `getCalendarDays`**에 있음: 각 그리드 셀 `current`(UTC-midnight 좌표)를 `civilMidnightFromUtcDay(current, tz)`로 **실제 civil-midnight instant(`candidateInstant`)로 변환한 뒤** selected/today/focused/range/disabled 비교(`calendar.ts:65-83`). 신규 core helper `calendarDayFromInstant`(dayOfWeek 좌표용). **Fork B 채택.**

**분해 측정 (main + #181의 core 3파일만, react=main):**
- 번들 **16.64/16.89KB = baseline 동일 = 0 byte** ✅
- 정확성 실측(core-only worktree): NY selected=[15], NY disabled=[15] ✅

→ **P0 근본 수정은 core에서 0 byte로 게이트를 통과.** +1.3KB 초과는 **전적으로 react-layer breadth**: month-view seed(Root), preset stale, typed-input candidate 정규화, Range/Week endpoint parity, **5 headless hook parity**, filterTime-at-merge, rejected-mutation 무부작용, disabled-focus state/DOM/first-arrow 동기화, 신규 `internal/calendarFocus.ts`.

### ⚠️ 이 분해는 **진단이지 머지 플랜이 아님**

core-only 서브셋은 **HIGH-1(react 가드)·HIGH-2(#181은 focus를 react `calendarFocus.ts`로 옮겨 core에 retarget 블록 없음 — grep 0 확인)·month-view seed(react Root)**를 **포함하지 않음**. 즉 "core-only만 머지"는 P0 셀-배치만 고치고 두 HIGH + 서울-12월-view 버그를 남김 → 단독 머지 경로 아님. (core-only + #178 + #179 조합은 calendar.ts에서 #179 vs #181이 같은 함수를 다르게 고쳐 충돌.)

### ⚠️ 공개 API `isDateDisabled` 시맨틱 이슈 (신규 지적)

#181은 그리드를 **`getCalendarDays` 호출부에서 candidateInstant를 넘겨** 고침 — 그러나 **export된 `isDateDisabled`는 여전히** 소비자(또는 Claude #178 가드)가 **raw UTC-midnight 좌표 + tz**로 호출하면 오답 반환(negative offset). 좌표 정규화를 함수 내부가 아니라 **모든 호출자에게 밀어냄**. 이는 실 API 결함이며 #178 가드가 어떻게 바뀌어야 하는지를 결정함(가드도 candidateInstant 변환 필요).

### 유지보수자 결정 (권고 — 선택은 사용자)

번들 +1.3KB는 **17KB 마케팅 약속(CLAUDE.md)** 판단이라 사용자 몫:
- **(A) #181 통째로** + 1.3KB 해소: ceiling 상향 / 다른 곳 diet / breadth 일부를 headless 전용으로 이관.
- **(B) 게이트 즉시 유지**: breadth 중 무엇을 뺄지 결정 필요(사용자 판단). 진단상 core P0는 공짜지만, month-view seed·preset·parity 등도 실 correctness라 "공짜만 취하기"는 완전한 수정이 아님.
- entry-split FAIL은 **bloat의 증상**(picker 코드가 커져 date-fns가 <2% 비중 — date-fns 여전히 headless서 제외됨). 독립 blocker로 이중계상 금지.

### 실험: "번들 유지하며 breadth를 headless 이관" — **불가 (실측)**

사용자 요청으로 실험. 두 엔트리가 **동일 7 컴포넌트 공유** + 컴포넌트는 standalone 훅을 내부 사용 안 함(grep 0). 이관 가능한 유일한 breadth = 3개 main 훅(useDatePicker/useRangePicker/useTimePicker)뿐(4개 headless-only 훅·DateTimePicker.Presets은 이미 headless). 실측:

| 상태 | ESM / CJS gzip | 게이트 |
|---|---|---|
| baseline (main, #181 전) | 16.64 / 16.89 | ✅ |
| #181 full | 18.28 / 18.38 | ❌ +1.6/+1.5 |
| **#181 − 3 훅 headless 이관(breaking)** | **17.23 / 17.31** | ❌ **여전히 초과 +0.23/+0.31** |

→ **이관 가능한 최대치(훅 3종, 공개 API breaking)를 다 빼도 main은 17KB 초과.** 잔여 초과(~0.3KB)는 **공유 컴포넌트 breadth**(Root의 month-view seed 정규화 `calendarDayFromInstant` + 타입드 가드 + `resolveEnabledCalendarFocus` disabled-focus/first-arrow, Calendar/Presets, contexts) — 이건 react 라이프사이클 로직이라 **core 이관 불가**, 3 Root 반복이나 dedup 여지 marginal. **결론: "headless 이관으로 게이트 유지"는 구조적으로 불가.** 게이트 유지하려면 (a) 컴포넌트 breadth의 실질 diet(≥0.3KB, 어려움) 또는 (b) core P0(0-byte)+최소 컴포넌트 수정만 스코프 축소(전면 parity 포기). 그 외엔 (c) 17KB ceiling 상향(12→…→17 전례 있음, 마케팅 약속 판단).

### #181 vs Claude #178/#179/#180 (Codex supersede 권고에 대한 판정)

Codex #181은 #178/#179/#180의 **상위집합**(같은 P0 + 모든 mutation 경계 parity). 정확성 축에선 #181이 우위(전면). 단 **#181은 번들 게이트로 현재 머지 불가(Draft)**, #178/#179/#180은 게이트 통과하나 부분/일부(#180 M-4는 밴드에이드). → Codex의 "#181 → #176(문서) 순, #178/#179/#180 supersede/close" 권고는 **정확성 관점에선 타당하나 번들 결정이 선결**. 번들 결정을 미루려면 게이트를 통과하는 #178/#179 + core-P0-only(0-byte)로 부분 전진하는 절충도 가능(단 위 충돌·부분성 감안).

---

## 5. 교차평가 메타 — 이번 라운드의 가치

- **Codex 우위**: D1 P0(negative-offset 셀 밀림) — Claude 평가·수정·이빨검증이 전부 Seoul-only에 갇혀 놓친 실 버그. dual-model의 정당성 입증 사례.
- **Claude 우위/유효**: HIGH-1(#178)·HIGH-2(#179) 실 버그 발견은 Codex도 "유효하고 중요"라 인정. combined 번들·이빨 방법론은 유효(단 tz 기대값 검증 누락이 약점).
- **수렴**: tz-gap(#178 Claim C)·first-arrow(#179 Claim E)를 양측 독립 도달.
- **남은 것**: Codex 수치 스코어카드 미완(스켈레톤) → 완전한 셀 대조는 Codex가 수치 채우면 갱신. 위 §2는 Codex 리뷰 기반 중재.
