# 프로젝트 전체 재점검·재채점 — 2026-08-07

> **대상**: `main` @ `7592ad8` · 열린 PR 0 · npm `@kalyx/react@1.4.4` / `@kalyx/core@1.4.2`
> **기준선**: [`2026-08-04-post-fix-rescore.md`](2026-08-04-post-fix-rescore.md) (종합 ~6) →
> 그 뒤 출하된 묶음 A(#192)·B(#193)·tree-shaking(#194)·C(#197~#205)를 포함한 현재 상태
> **증거 원칙**: 아래 수치는 전부 이 세션에서 직접 실행한 실측. 서브에이전트 미사용.
>
> 이전 리포트들이 남긴 결함을 **재발견해서 다시 보고하지 않는다** — 각 항목을 실행 가능한
> 검사로 바꿔 현재 main 에 돌린 결과만 싣는다. 새 결함은 별도 §3.

---

## 0. 헤드라인

> ### 종합 점수: **~7 (#176) → ~5.5–6 (교차평가) → ~6 (08-04) → ~7 (현재)**
> 차원별: D1 6→**7** ↑ · D2 5→**8** ↑↑ · D3 4→**4** = · D4 6→**7** ↑ · D5 7→**7.5** ↑ · D6 7→**7.5** ↑ · D7 7→**8** ↑

- ✅ **08-04 리포트가 남긴 P0/P1 5건이 전부 실제로 해소됐다.** 주장만 확인한 게 아니라
  전수 스윕·렌더 재현으로 검증했다(§2).
- 🔴 **신규 P1 발견 — malformed `value` 하나가 React 트리 전체를 죽인다.** 픽커 7종 중 6종,
  훅 7종 중 6종, 그리고 **SSR(`renderToString`)** 까지. 이 세션에서 **수정 완료**(§3-1, §4).
- 🟠 **신규 P2 — `Input` 의 방어 `catch` 가 죽은 코드였다.** 어댑터가 throw 하지 않고
  `"NaN-NaN-NaN"` 을 렌더해서 사용자에게 그대로 노출됐다. **수정 완료**(§3-2).
- 문서 축(D2)이 5 → 8 로 가장 크게 회복했다. 08-04 이 지적한 문서 결함 10건이 전부 정리됐고
  **en/ko 35/35 완전 번역**(08-04 시점 6개 미번역)이 됐다.

---

## 1. 기준선 실측 (전부 이 세션 직접 실행)

| 항목 | 결과 | 08-04 대비 |
|---|---|---|
| `pnpm typecheck` | ✅ | = |
| `pnpm lint` | ✅ | = |
| `pnpm build` | ✅ | = |
| `pnpm test:run` | ✅ **960 passed / 54 files** (수정 후 **1107**) | 855 → **+105** |
| `pnpm --filter docs-site build` (en+ko) | ✅ | = |
| `node scripts/check-bundle-size.js` | ✅ index ESM **18.52** / CJS **18.76** (≤20) · headless ESM **19.80** / CJS **20.06** (≤22) | headless 가 이제 **게이트 대상**(08-04 지적 해소) |
| `node scripts/verify-entry-split.mjs` | ✅ hard gate (date-fns 부재) · 크기 델타 1.0% (informational) | = |
| `node scripts/check-doc-code-examples.mjs` | ✅ **112 예제 / 15 문서** (24 문서 사유 명시 후 미검사) | 46/2 → **112/15** |
| `pnpm check-tree-shaking` | ✅ 단일 픽커 16.23–19.97KB vs 전체 25.07KB | 픽커별 제거 **실제 동작**(08-04 "사실상 없음" 해소) |
| `pnpm check-a11y` | ✅ 411 passed / 17 files | = |
| `pnpm test:coverage` (core) | timezone **100** / date 100 / time 98.46 / locale 97.77 / calendar 94.66 (stmts) | timezone 98.27 → **100** |

**번들 마진**: index 1.24–1.48KB · headless 1.94KB. 병목은 여전히 `headless.cjs`.

---

## 2. 08-04 리포트 잔존 5건 — 실행 검사로 재확인

각 행은 "고쳤다는 주장"이 아니라 이 세션에서 돌린 검사의 결과다.

| # | 08-04 결함 | 검사 방법 | 결과 |
|---|---|---|---|
| 1 | `civilMidnightFromUtcDay` UTC+12 이상 **19개 존** 하루 밀림 | **418 IANA 존 × 374일 = 156,332 케이스 전수 스윕**, round-trip invariant | ✅ **해소.** 오답 존 19 → **1**(`Africa/Monrovia`, 1970년 LMT −0:44:30 한 건뿐 — §3-4). Auckland/Chatham/Kiritimati 전부 정상. DST-gap snap-forward 5존은 기존과 동일하게 의도된 동작 |
| 2 | 문서 3건 (api/core.md import·npm description·date-fns-tz) | export 실측 + `package.json` 조회 + 레포 전수 grep | ✅ **해소.** `DateFnsAdapter` 는 문서 전체가 `@kalyx/adapter-date-fns` 로 통일(또는 `@kalyx/react` re-export — 둘 다 유효). description = "≤20 KB". `date-fns-tz` 는 **라이브 문서·설정에 0건**(잔존은 `.claude/skills/` 회고 문서와 CLAUDE.md 이력 로그뿐) |
| 3 | 월 이동 시 그리드 키보드 진입점 소멸 | 실제 렌더 재현 — 제약 걸린 월로 이동 후 tabbable 셀 열거 | ✅ **해소.** `internal/calendarFocus.ts` 의 `resolveMonthNavigation` 이 DatePicker·RangePicker Calendar + 훅 4종에 적용. WeekPicker/DateTimePicker 는 위임이라 자동 상속. **완전히 disabled 된 월도 교착 없음**(backward 탐색이 방향을 유지) |
| 4 | `useMonthPicker`/`useYearPicker` 커밋 미가드 | 소스 확인 + 훅 테스트 | ✅ **해소** (#193). 두 훅에 커밋 가드 + discriminate 테스트 |
| 5 | 거버넌스 — 필수 승인 0명, OSV/License 미필수 | `gh api` 룰셋 직접 조회 | ✅ **해소.** `required_approving_review_count: 1`, `dismiss_stale_reviews_on_push: true`, required check **11개**(OSV·License 포함) |

**핸드오프 §7 "재론 금지" 항목**(ISO 계약 = instant, `{before}`/`{after}` 정규화,
`isDateDisabled` 자기 정규화)은 **결정으로 종결된 것**이지 미수정 결함이 아니다.
`civilMidnightFromUtcDay` 가 멱등이 아니라 inbound 정규화가 구조적으로 불가능하다는 측정
근거가 `CLAUDE.md §3` 에 있다. 이 리포트는 이들을 D1 감점 요인으로 재계상하지 않는다.

### 아직 평가된 적 없던 영역 (이번에 신규 검사)

| 영역 | 검사 | 결과 |
|---|---|---|
| **RSC / `"use client"`** | 배포 아티팩트 4종 선두 바이트 확인 | ✅ 4종 전부 `"use client"` 프리픽스 존재 |
| **`exports` 맵** | `import`/`require` × `types`/`default` 조건 확인 | ✅ 이중 진입 정상, `/headless` 별도 타입 선언 |
| **published tarball 의 `workspace:` 누출** | 레지스트리 실측 | ✅ 누출 0. adapter 3종 전부 `^1.1.0`/`^1.2.0` 실 범위. react@1.4.4 → core `^1.4.2` (캐럿 전환 반영됨) |
| **tree-shaking 게이트 배선** | `pr-check.yml` → `all-pass` needs 확인 | ✅ `validation-tools` 가 `all-pass` 의 needs 에 포함 → **required check 로 실효 게이트** |
| **`all-pass` 집계 버그** | 워크플로 소스 확인 | ✅ `contains(needs.*.result, …)` 빌트인으로 교체됨(과거 grep 정규식 버그 해소) |
| **en/ko 문서 패리티** | 파일셋 diff + 한글 포함 여부 스캔 | ✅ **35/35 동일 + 미번역 0건** (08-04 의 6건 미번역 해소) |

---

## 3. 신규 결함

### 3-1. 🔴 P1 — malformed `value` 가 React 트리 전체를 죽인다 (**이 세션에서 수정**)

**증상**: `value` 또는 `defaultValue` 가 파싱 불가능한 문자열이면 렌더 도중
`RangeError: Invalid time value` 가 던져져 **트리 전체가 언마운트**된다.
`renderToString` 에서는 요청 하나가 **500** 이 된다.

**재현** (수정 전 main):

```tsx
<DatePicker value="" onChange={save}>
  <DatePicker.Input />
</DatePicker>
// → RangeError: Invalid time value
```

**영향 범위** (실측 매트릭스):

| | `""` | `"not-a-date"` | `"2026-02-30T00:00:00.000Z"` | `"null"` |
|---|:-:|:-:|:-:|:-:|
| DatePicker · MonthPicker · YearPicker · WeekPicker · RangePicker · DateTimePicker (seed) | 💥 | 💥 | 💥 | 💥 |
| `getCalendarDays` 비교 레이어 (`displayTimezone` 사용 시) | ✅ | 💥 | ✅ | 💥 |
| `getTimeInTimezone` (TimePicker·DateTimePicker, `displayTimezone` 사용 시) | ✅ | 💥 | ✅ | 💥 |
| TimePicker (tz 없음) | ✅ | ✅ | ✅ | ✅ |
| `useDatePicker`·`useMonthPicker`·`useYearPicker`·`useWeekPicker`·`useRangePicker`·`useDateTimePicker` | 💥 | 💥 | 💥 | 💥 |
| `useTimePicker` | ✅ | ✅ | ✅ | ✅ |
| `renderToString` (SSR) | 💥 | 💥 | 💥 | 💥 |
| `disabled` 규칙에 malformed 값 (`{date}`/`{before}`/`{after}`/`{from,to}`) | ✅ | ✅ | ✅ | ✅ (이미 가드됨) |

**결함은 세 겹이다** (첫 수정 후 그리드를 실제로 마운트해서 재측정하며 드러났다 — §7):

1. **view seed** — Root/훅 24개 지점
2. **비교 레이어** — `getCalendarDays` 가 `selected`/`focusedDate`/`range` 를
   `adapter.isSameDay(..., timezone)` 에 넘기고, 그게
   `Intl.DateTimeFormat.formatToParts(Invalid Date)` 에 닿아 throw
3. **시각 추출** — `getTimeInTimezone(value, tz)` 도 같은 경로 (TimePicker·DateTimePicker)

2·3 은 **`displayTimezone` 을 켰을 때만** 터진다. 즉 headline 기능을 쓰는 사용자만 밟는다.

**근본 원인**: Root/훅의 view seed 가
`currentValue ?? adapter.today(tz)` 로 값을 그대로 `adapter.startOfDay()` 에 넘긴다.
어댑터는 `new Date(value).toISOString()` 으로 결과를 만들기 때문에 파싱 불가 문자열에서
`RangeError` 를 던진다. **`adapter.isValid()` 가 이미 존재하고 정확히 `false` 를 돌려주는데
seed 경로가 그걸 한 번도 호출하지 않았다.**

- `""` 는 `??` 를 통과한다(nullish 가 아님) — 그래서 폼의 빈 문자열이 바로 크래시가 된다.
- 관련 파일: `components/{DatePicker,RangePicker,DateTimePicker}/Root.tsx`,
  `hooks/use{Date,Range,Week,DateTime,Month,Year}Picker.ts` (총 24개 seed 지점)

**왜 이게 P1 인가**: `value` 는 프로그래머 상수가 아니라 **폼 필드·DB 행에서 오는 데이터**다.
아직 날짜가 없는 행 하나(`''`/`null` 직렬화)가 페이지 전체를 내린다. 그리고
`RangeError: Invalid time value` 는 **어느 prop 이 문제인지 전혀 알려주지 않는다.**

**수정**: §4.

### 3-2. 🟠 P2 — `Input` 의 방어 `catch` 가 죽은 코드 (**이 세션에서 수정**)

`DatePicker/Input.tsx` 등 3개 Input 은 이미 이런 의도를 갖고 있었다:

```ts
try { formattedValue = ctx.adapter.format(...); }
catch { formattedValue = ctx.value; }   // ← 원문 그대로 보여주려는 의도
```

그런데 어댑터의 `format` 은 **throw 하지 않는다** — `getUTCFullYear()` 등의 결과를
토큰 치환하므로 Invalid Date 에서 `"NaN-NaN-NaN"` 을 **정상 반환**한다.
그래서 catch 는 한 번도 실행되지 않았고 사용자는 입력창에서 `NaN-NaN-NaN` 을 봤다.

영향: `DatePicker/Input.tsx`, `RangePicker/Input.tsx`, `DateTimePicker/Input.tsx`.

**수정**: §4. (`try/catch` 는 **유지**했다 — throw 하는 서드파티 어댑터가 있을 수 있다.)

### 3-3. 🟡 P3 — invalid `displayTimezone` 은 여전히 throw

`displayTimezone="Not/AZone"` 또는 `"UTC+9"` → `RangeError: Invalid time zone specified: Not/AZone`.

**수정하지 않음**, 판단 근거: (a) 메시지가 **어느 값이 문제인지 스스로 밝힌다**(3-1 과 정반대),
(b) `displayTimezone` 은 DB 행이 아니라 개발자가 쓰는 상수에 가깝다, (c) 모든 `Intl` 호출을
감싸면 번들이 늘고 잘못된 존을 조용히 무시하는 게 더 나쁘다. **의도적 잔존**으로 기록한다.

### 3-4. 🟡 P3 — `Africa/Monrovia` 1970년 round-trip 하루 밀림

156,332 케이스 중 **유일한** 오답: `civilMidnightFromUtcDay('1970-01-01T00:00:00.000Z',
'Africa/Monrovia')` 가 1969-12-31 로 돌아온다. Monrovia 는 1972년까지 **UTC−0:44:30** 이라
offset 이 분 단위로 안 떨어지고, `getTimezoneOffsetMinutes` 가 분 해상도라 −44.5분을 처리 못 한다.

미수정. 근거: 1972년 이전 라이베리아 날짜에만 발생하고, 초 단위 offset 을 지원하려면
timezone 유틸 전체의 해상도를 바꿔야 한다. **DatePicker 의 현실적 사용 범위 밖**이다.

### 3-5. 🟡 P3 — 어댑터가 `@kalyx/core` 를 dependency 와 peerDependency 양쪽에 선언

adapter 3종 모두 `dependencies` 와 `peerDependencies` 에 `@kalyx/core` 를 중복 선언한다.
`^1.x` 범위가 같아 실무상 dedupe 되지만, peer 의 취지(호스트의 사본을 쓴다)를 무력화한다.
미수정 — 동작 결함이 아니라 선언 위생 문제이고, 고치면 배포 3건이 필요하다.

### 3-6. 🟡 P3 — core 순수함수 커버리지가 선언 목표에 미달

`CLAUDE.md §7` 은 코어 순수함수 **100%** 를 목표로 명시하는데 `calendar.ts` 는 **94.66%**
(미커버 158–162, 186). timezone.ts 는 이번에 100% 도달. 목표와 실제의 차이가 문서화돼 있지 않다.

---

## 4. 이 세션에서 수정한 것

**신규 파일** `packages/react/src/internal/usableDate.ts` — 어댑터가 실제로 파싱할 수 있을
때만 값을 돌려주는 가드. 세 겹 전부에 적용했다:

1. **seed** — 24개 지점이 `usableDate(currentValue, adapter) ?? adapter.today(tz)` 로
2. **비교 레이어** — `packages/core/src/utils/calendar.ts` 의 `getCalendarDays` 가
   `selected`/`focusedDate`/`range`/`rangeHover` 중 파싱 불가한 것을 **없는 것으로 취급**.
   core 에 둔 이유: `getCalendarDays` 는 공개 API 라 headless 소비자가 직접 호출해도
   같은 크래시를 밟는다. 계약은 "계산할 수 없는 플래그는 false"
3. **시각 추출** — TimePicker·DateTimePicker Root 의 `currentTime` 폴백

동작 계약:
- 파싱 불가 값 → **뷰는 이번 달로 폴백**, 트리는 살아 있음
- **값 자체는 건드리지 않는다** — `Input` 이 원문을 그대로 표시해 실수가 눈에 남는다
  (조용히 `null` 로 바꾸면 사용자 데이터를 지우는 셈이라 일부러 피했다)

**검증**:

| 단계 | 결과 |
|---|---|
| RED (수정 전) | 신규 테스트 **72 failed / 5 passed** |
| GREEN (수정 후) | 신규 테스트 **147 passed** |
| **discriminate ①** — seed 의 `isValid` 검사 제거 | **58 failed** ✅ |
| **discriminate ②** — `usableDate` 가 항상 `null` | 신규 파일은 통과하지만 **기존 스위트가 157 failed** 로 잡음 ✅ 양방향 판별 |
| **discriminate ③** — core `getCalendarDays` 가드 제거 (+ core 재빌드) | **9 failed** ✅ |
| **discriminate ④** — 시각 추출 가드 제거 | **6 failed** ✅ |
| 전체 회귀 | **1107 passed / 55 files** (960 + 147, 실패 0) |
| typecheck / lint / docs build(en+ko) / doc 예제 112 | ✅ 전부 통과 |
| 번들 | index ESM 18.52→**18.62** / CJS 18.76→**18.87** · headless ESM 19.80→**19.91** / CJS 20.06→**20.18** — **+100~120 B**, 전 천장 통과 (병목 `headless.cjs` 여유 1.82KB) |

**문서·릴리즈**: changeset(`@kalyx/react` patch) 추가, `troubleshooting.md` **en+ko** 에
"입력창에 원문이 그대로 보일 때" 항목 추가(`''` 대신 `null` 을 쓰라는 안내 포함).

---

## 5. 재채점 (4단 비교)

| 차원 | #176 | 교차평가 | 08-04 | **현재** | 이유 |
|---|:-:|:-:|:-:|:-:|---|
| **D1 정확성** | 7 | 4–5 | 6 | **7** ↑ | +12 존 19개가 **전수 스윕으로** 해소(156,332 중 오답 1, 그것도 1970년 LMT). 월이동 focus·훅 커밋 가드 해소. **신규 P1(malformed value 크래시)을 이번에 발견·수정**. 8 이상 못 가는 이유: 그 P1 이 1.4.4 까지 라이브였다는 사실 자체와, 미해결 P3 2건 |
| **D2 DX·문서** | 8 | 7 | 5 | **8** ↑↑ | 08-04 이 잡은 문서 결함 **10건 전부 해소**. en/ko **35/35 완전 번역**(미번역 6→0). doc 예제 컴파일 46→**112**, 미검사 24문서는 사유 명시. 폼 제출 거짓 문서 제거(#205). 9 가 아닌 이유: hook 7페이지가 여전히 예제 검증 밖, `components/datepicker.md` KO 펜스 순서 어긋남 |
| **D3 경쟁 적합성** | 4 | 4 | 4 | **4** = | 시장 포지션을 바꾼 변경 없음. 의도적 유지 |
| **D4 번들·성능** | 6 | 6 | 6 | **7** ↑ | **`/headless` 가 게이트 대상**이 됨(08-04 최대 지적 해소, 22KB 천장 분리). 픽커별 tree-shaking 이 **실제로 동작**(단일 16.2–20.0 vs 전체 25.1) 하고 `all-pass` 로 게이트됨. 마진 1.2–1.9KB. entry-split 델타 1.0%(목표 2%)는 informational 로 잔존 |
| **D5 접근성** | 7 | 7 | 7 | **7.5** ↑ | 월이동 키보드 진입점 소멸이 **실제로 해소**됨(08-04 이 7 로 눌렀던 사유). 완전 disabled 월도 교착 없음. axe 411건. RTL·focus restore 유지. 8 이 아닌 이유: 새 a11y 역량이 추가된 건 아님 |
| **D6 테스트 정직성** | 8 | 6–7 | 7 | **7.5** ↑ | 960→**1037**. timezone 커버리지 100%. discriminate 검증이 규칙으로 자리잡음(이번 수정에서도 양방향 확인). 8 이 아닌 이유: **P1 크래시가 960-green 을 그대로 통과했다** — malformed 입력 축이 통째로 미검이었다. calendar.ts 94.66%로 선언 목표 미달 |
| **D7 보안·공급망** | 8 | 7 | 7 | **8** ↑ | 승인 1명 복구 + **OSV·License required 승격**(11 checks). `workspace:` 누출 0. react→core **캐럿 전환 완료**(core 패치가 react 재배포 없이 전달). 미서명 6건은 SECURITY.md 에 등재. 9 가 아닌 이유: dayjs/luxon 배포본이 여전히 전량 미서명, `image-size` ignore 가 2026-11-07 만료 |
| **종합** | **~7** | **~5.5–6** | **~6** | **~7** | "08-04 이 남긴 5건이 전부 실제로 닫혔고 문서 축이 크게 회복했다. 대신 아무도 안 보던 축(malformed 입력)에서 P1 이 나왔고 지금 고쳤다." |

---

## 6. 남은 위험

| 우선순위 | 항목 | 비고 |
|---|---|---|
| P2 | **malformed 입력 축이 property test 로 안 잠겨 있다** | 이번엔 예제 기반 테스트 77건으로 잠갔다. `value`/`defaultValue` 를 임의 문자열로 흔드는 fast-check property 가 있으면 같은 클래스가 재발해도 잡힌다 |
| P2 | hook 7페이지가 doc 예제 검증 밖 | 핸드오프 §5-2. per-fence skip 목록(~20줄)이 가장 싼 증분 |
| P3 | `calendar.ts` 94.66% — 선언 목표(100%) 미달 | 목표를 낮추든 커버리지를 올리든 **문서와 실제를 맞출 것** |
| P3 | dayjs/luxon 전 배포본 미서명 | 재배포는 버전 이력을 바꾸므로 다음 실질 릴리즈에서 처리 |
| P3 | `image-size` OSV ignore 만료 | **2026-11-07** |
| P3 | `components/datepicker.md` KO 펜스 순서 어긋남 | EN 18 vs KO 13, 펜스 3부터 어긋나 여러 문서가 `EN_ONLY_DOCUMENTS` 에 묶여 있음 |
| P3 | 어댑터의 core dep/peer 중복 선언 (§3-5) | 배포 3건 필요 |
| P3 | `Africa/Monrovia` 1970 (§3-4) · invalid tz throw (§3-3) | 의도적 잔존 |

---

## 7. 방법론 메모

- **이번 P1 을 잡은 방법은 추론이 아니라 축의 전환이었다.** 이전 4개 리포트는 전부
  *올바른 값*의 timezone·경계 정확성을 팠고, **잘못된 값이 들어오면 어떻게 되는가**는
  아무도 묻지 않았다. 그 축에서 첫 질문이 바로 크래시를 냈다.
- **`adapter.isValid()` 가 존재하는데 호출되지 않고 있었다** — API 표면에 방어 수단이
  이미 있는데 쓰이지 않는 곳을 찾는 건 값싼 감사 휴리스틱이다.
- **죽은 방어 코드는 있는 방어보다 나쁘다.** §3-2 의 `try/catch` 는 리뷰어에게 "이미 처리됨"
  으로 읽혀서 실제 결함을 가렸다. 방어 코드는 **그 방어가 실제로 발동하는 테스트**와 함께
  둬야 한다.
- **⚠️ `@kalyx/core` 를 고칠 때 react 테스트는 `src` 가 아니라 `dist` 를 본다.** `vitest.config.ts`
  에 core alias 가 없어 `@kalyx/core` 는 workspace 링크 → `packages/core/dist` 로 해석된다.
  core 를 고치고 **재빌드 없이** 돌리면 조용히 낡은 아티팩트를 검사한다. 이번에 실제로
  당했다 — core 가드의 discriminate 가 "판별 안 됨"으로 나와 가드가 불필요한 줄 알았는데,
  `pnpm --filter @kalyx/core build` 후 다시 돌리니 **9건 실패**로 정상 판별됐다.
  **core 를 건드린 뒤의 모든 측정 앞에는 core 재빌드가 와야 한다.**
- **닫힌 Popover 안의 그리드는 마운트되지 않는다.** 첫 테스트 77건 중 그리드를 실제로 태운 건
  1건뿐이었고, 나머지는 `Popover` 안에 있어 `getCalendarDays` 에 닿지도 않았다. 그래서
  "고쳤다"고 판단한 시점에 결함 2겹이 남아 있었다. **UI 테스트는 검증 대상 컴포넌트가
  정말 렌더됐는지부터 확인할 것.**
- discriminate 검증을 **양방향**으로 돌린 게 값을 했다: sabotage ①은 신규 테스트가 잡고,
  sabotage ②는 신규 테스트가 못 잡고 **기존 스위트가** 잡았다. 한쪽만 돌렸으면
  "테스트가 충분하다"고 잘못 결론냈을 것이다.
