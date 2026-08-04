# Kalyx 종합 평가 — Claude 측 (dual-model)

> 공유 루브릭: [`2026-08-03-library-evaluation-rubric.md`](2026-08-03-library-evaluation-rubric.md)
> 작성 모델: Claude Opus 4.8 · 작성일 2026-08-03 · 대상: core/react **1.4.0**
> 방법: `pnpm typecheck/test:run/build/check-bundle` 실측 + 3개 병렬 서브에이전트(코드·문서·경쟁) + 핵심 findings 자체 코드 재검증

---

## 실측 baseline (직접 실행)

| 항목 | 결과 |
|---|---|
| `tsc -b` | ✅ 통과 |
| `vitest run` | ✅ **776 passed / 45 files** (~12s) |
| `pnpm build` | ✅ 성공 |
| 번들 main | ESM **16.64KB** / CJS **16.89KB** gzip (게이트 ≤17KB) |
| 번들 headless | ESM 17.58KB / CJS 17.85KB gzip (**게이트 없음** — `check-bundle-size.js` 는 index 만 검사) |
| main 마진 | **CJS ~110B / ESM ~360B** |

---

## 스코어카드 (Claude)

| 차원 | 점수 | 한 줄 근거 | Conf |
|------|:---:|------|:---:|
| D1 정확성·견고성 | **7** | 코어(DST/ISO-week/SSR/타입) 견고, but 타입드-input 검증 우회 등 실 버그 2 HIGH | high |
| D2 DX·문서 | **8** | 진입·zero-CSS 정직성·tz/SSR/i18n 깊이 우수, but 검색 없음 + ko live-editor 비대칭 | high |
| D3 경쟁 적합성 | **4** | 기술 공백은 실재하나 shadcn 이 ~80% 커버 + 0유저·React19전용·1인 | high |
| D4 번들·성능 여유 | **6** | 7픽커 17KB 밀도는 우수, but main 마진 ~110B 로 기능 추가 사실상 봉쇄 | high |
| D5 접근성 | **7** | ARIA/키보드/axe 대체로 충실, but disabled-focused-day 시 그리드 키보드 사망 | high |
| D6 테스트 정직성 | **8** | 776개 + property test 진짜배기, but 2 HIGH 버그가 정확히 커버 갭에 위치 | high |
| D7 보안·공급망 | **8** | OSV 0 + 5패키지 OIDC/provenance, 표면 작음 (미갱신: 이번 세션 직접 재스캔 안 함) | med |
| **종합** | **~7 / 견고하나 흠 있음** | 코어는 craft 수준, 커밋 경로 검증 구멍이 완성도를 깎음 | high |

---

## D1 정확성 — 발견 버그 (자체 코드 재검증 완료)

### 🔴 HIGH-1 — 텍스트 입력이 disabled/min-max 검증을 전면 우회 (데이터 정합성 구멍)
- **경로**: `DatePicker/Input.tsx:80-84` (`commitText`) → `DatePicker/Root.tsx:152-171` (`selectDate`).
- `selectDate` 는 `isDisabled || readOnly` 불리언만 가드하고 **`isDateDisabled(iso, disabledRules)` 를 절대 호출하지 않는다**. `disabledRules` 는 Root 에서 계산(`Root.tsx:147`)만 되고 검증엔 안 쓰임.
- 그리드 클릭(`Calendar.tsx:133`)·Enter(`Calendar.tsx:183`)·화살표(`:209`)는 전부 `isDateDisabled` 가드 O. **오직 텍스트 Input 커밋 경로만 빠짐.**
- **재현**: `disabled={[{ dayOfWeek:[0,6] }]}` 또는 min/max(`{before}/{after}` 규칙) 설정 → 주말/범위밖 날짜를 **타이핑 후 blur/Enter** → 조용히 커밋됨.
- **blast radius**: `MonthPicker`/`YearPicker` 가 `DatePickerInput` 을 그대로 재사용(`*/index.ts:2,31`) → 동일 결함 상속. RangePicker/WeekPicker 는 Input 이 `readOnly` 라 안전.
- **자체검증**: Input.tsx / Root.tsx / index.ts 직접 read 로 확인. **CONFIRMED.**

### 🔴 HIGH-2 — disabled 된 focus 대상 날짜로 열면 키보드 그리드 사망
- **경로**: `DatePicker/Calendar.tsx:113-117` focus effect → `[data-focused="true"]` 버튼 `.focus()`. 그 버튼이 `disabled`(`Calendar.tsx:338 disabled={day.isDisabled}`)면 `.focus()` no-op.
- `open()`(`Root.tsx:173-180`)이 `focusedDate = currentValue ?? today` 로 두는데 **disabled 여부 미검사**. roving tabindex 상 유일한 `tabIndex=0` 이 disabled 셀 → **어떤 날짜 셀도 키보드로 도달 불가**, 그리드 `onKeyDown` 안 뜸.
- **흔한 트리거**: 주말 disable 픽커를 주말에 open; `disabled={[{before: tomorrow}]}` + `value=null` → focusedDate=today=disabled.
- **완화**: Tab 으로 이전/다음달 버튼은 도달 → 달 이동 시 `startOfMonth` 로 재시드되어 부활. 총-잠금 아닌 HIGH-recoverable.
- **아이러니**: 3×4 Month/Year 그리드(`_shared/grid-keyboard.ts:150`)는 disabled 셀 재앵커 O — day 캘린더만 open 시 재앵커 누락. **일관성 결함.**

### 🟡 MEDIUM
- **M-3** TimePicker 타입드 입력이 `filterTime` 우회 (`TimePicker/Input.tsx:31` → `Root.tsx setTime` 가 filterTime 미참조). HIGH-1 의 시간 도메인 판박이.
- **M-4** `isDateDisabled` 의 `{date}` 규칙 비교가 `displayTimezone` 인자 누락 (`calendar.ts:194` `isSameDay(iso, rule.date)` — selected/today/range 는 tz 넘김). displayTimezone + civil-midnight 형식 규칙일 때 disable 이 조용히 안 먹음.
- **M-5** controlled↔uncontrolled 가 mount 시 `useRef` 로 고정되는데 **dev 경고 없음**. `value` 를 undefined 로 흘리면 영구 오모드.

### 🟢 CORRECT 로 검증 (비-버그도 신호)
- `timezone.ts` DST spring-forward/fall-back 2-pass offset — TC39 `disambiguation:'earlier'` 와 일치. **견고.**
- `getISOWeekNumber` Thursday-anchor 정확, cross-year 포함.
- SSR: 모든 `document` 참조가 `useEffect`(usePopover) 안. `window`/`Math.random`/`useLayoutEffect` 소스 0. **주장대로.**
- 타입: `any` 0, `@ts-ignore` 0, 모든 `as` 는 DOM narrowing. **strict 만족.**

---

## D2 DX·문서 (8/10)

**강점**: 설치→첫 픽커 3스텝, zero-CSS 를 "raw HTML + 네 classNames" 로 **정직하게** 설명, "styles 없음 = by design" 트러블슈팅으로 #1 혼란 선제 차단. ISO-UTC·timezone/DST·SSR(App Router)·i18n/RTL·3-라이브러리 마이그레이션·"off-by-one day" 가이드까지 깊이 O. API 표는 소스와 일치. en/ko 파일 패리티 35/35.

**갭**:
1. **[HIGH] 문서 사이트 검색 없음** — 35페이지인데 Algolia/local-search 미설치. Cmd-K 불가 → 평가자가 사이드바 수동 탐색. **최저비용 최고효과 수정.**
2. **[HIGH] ko live-editor 비대칭** — inline `jsx live`: EN 27블록/13파일 vs **KO 4블록/2파일**. ko 컴포넌트 7페이지·quick-start 가 인터랙티브 프리뷰 상실. CLAUDE.md 가 주 성장 오디언스로 지목한 한국어가 2등 시민.
3. **[MOD] 비교 매트릭스 페이지 부재** — "왜 shadcn/react-day-picker/MUI 대신 Kalyx" 가 스캔 가능한 표로 없음(2026-06-18 마케팅 철수로 의도적 제거). 평가자가 직접 조립해야.
4. **[LOW]** migration.md:159 stale count, 미문서화 `data-*`(TimePicker) 몇 개.

---

## D3 경쟁 적합성 (market-fit 4/10)

**검증된 공백(실재)**: "headless + 7픽커 통합 API + 진짜 standalone TimePicker + `@internationalized/date` 비종속(ISO/어댑터) + ~17KB" 를 한 번에 채우는 경쟁자 없음. Ark UI 는 TimePicker 를 *못 만들어 제거*(locale/AM-PM/DST 어려움), react-day-picker v10 은 여전히 calendar-only, Radix/Headless UI 는 datepicker 거부 — **헤드리스 리더들이 안 건드리는 영역**이라는 점이 thesis 를 지지.

**냉정한 현실**:
- **진짜 상대는 shadcn** — Popover+Calendar(react-day-picker)+native `<input type=time>` 조합이 피치의 ~80% 를 커뮤니티와 함께 무료 제공. Kalyx 우위는 딱 3개: (a) 7픽커 일관 API, (b) 진짜 TimePicker, (c) SSR-safe ISO-UTC 계약.
- **GTM 역풍**: 사용자 0 · **React 19 전용**(18 shop 전면 배제) · 1인 메인테이너 · Gregorian only. datepicker 는 load-bearing 이라 리스크 회피 팀은 35M 다운로드 쪽을 택함.
- `@internationalized/date` lock-in 에 대한 개발자 *고통*은 웹 조사상 얇음 — 차별점이 종이 위엔 실재하나 **수요 근거는 약함.**

**가장 날카로운 포지셔닝**: *"shadcn 이 가졌으면 하는 headless date 툴킷 — Date/Range/Time/DateTime/Month/Year/Week 를 한 API 로, 진짜 TimePicker 와 함께, plain ISO-UTC 문자열 + date-fns/dayjs/luxon 선택. `@internationalized/date` lock-in 없음. ~17KB."*

---

## D4 번들 (6/10) · D5 a11y (7/10) · D6 테스트 (8/10) · D7 보안 (8/10)

- **D4**: 7픽커 17KB 밀도는 정당한 승리(vs react-datepicker 40-60KB, MUI heavy). but main 마진 ~110B(CJS) → **런타임 기능 추가 = 게이트 파손**. headless entry 는 무게이트라 `/headless` 전용 추가는 여유. "smaller than everyone" 아님(react-day-picker 코어가 절대값은 작음) — **밀도·통합**으로 팔 것.
- **D5**: 대체로 충실(role=grid/combobox/listbox, 키보드 10종, axe 통과). 단 HIGH-2 가 실제 WAI-ARIA 키보드 실패.
- **D6**: DatePicker 만 95 테스트, toHaveFocus·Escape focus-restore·property test 등 **진짜배기**. 하지만 2 HIGH 버그가 정확히 커버 갭(disabled-day open, disabled 타이핑)에 위치 — 그래서 살아남음.
- **D7**: 메모리상 OSV 0 + 5패키지 OIDC/provenance. **단 이번 세션에서 직접 재스캔 안 함** → Codex 측이 `osv-scanner`/`pnpm audit` 실측 권장.

---

## 방향 결정 (Claude 권고)

> **결론: A(정확성 수정) 최우선 → 그 다음 D2 문서 저비용 수정. B(기능)·C(홍보)는 지금 아님.**

- **A. 정확성 우선 (강력 추천, 1.4.1 patch)**: HIGH-1/M-3(커밋 경로 검증) + HIGH-2(open 시 disabled 재앵커)는 **헤드라인 기능(disabled/min-max, 키보드 a11y)의 실 버그**. 수정은 국소적(이미 있는 `isDateDisabled`/`filterTime` 로 라우팅, `grid-keyboard.ts` 재앵커 패턴 재사용) → 번들 중립~극소. "correctness first" 방향을 **구체 타깃으로 검증**함.
- **B. 기능 추가 (보류)**: main 번들 마진 ~110B 로 사실상 봉쇄. 굳이 한다면 `/headless` 전용(무게이트)에서만. 우선순위 낮음.
- **C. 홍보 (지금 아님)**: 경쟁 분석(4/10) + 2026-06-18 "홍보 접는다" 결정이 **일치**. 광범위 HN/Reddit 런칭은 전환 실패. *판을 바꾸려면* 홍보가 아니라 (1) TimePicker 우수성 증명(locale/AM-PM/DST 데모 — 남들이 못 하는 유일 wedge), (2) "왜 shadcn 대신 Kalyx" 정직한 비교 페이지 두 개. 이건 홍보가 아니라 **제품/문서 작업**.

**실행 순서 제안**: (1) HIGH-1+M-3 검증 라우팅 → (2) HIGH-2 재앵커 → (3) 회귀 테스트로 커버 갭 봉합 → (4) 문서 검색 플러그인 + ko live-editor 복원 → (5) TimePicker wedge 데모 + vs-shadcn 페이지. 전부 번들 안전.

---

## Codex 가 특히 재검증할 것 (한쪽만 본 것 폐기 금지)
- HIGH-1/HIGH-2 재현을 **실제 테스트로** 재현 시도(내 판단은 코드 추적, 런타임 재현은 미실시).
- D7 보안 실측(`osv-scanner`, `pnpm audit`, 라이선스) — 나는 메모리 의존.
- D4 마진 수치 재측정 + headless 무게이트가 의도인지 판단.
- D3 다운로드/번들 경쟁 수치 최신성 재확인.
