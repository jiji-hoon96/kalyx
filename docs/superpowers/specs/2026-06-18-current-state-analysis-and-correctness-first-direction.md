# Kalyx 현 시점 분석 + "정확성 먼저" 방향 확정 (2026-06-18)

> **상태:** 확정 (사용자 승인). 이 문서가 2026-06-18 시점의 방향성 single source of truth다.
> CLAUDE.md §14 의 Track 우선순위와 cleanup 항목은 이 문서를 따라 갱신된다.
>
> **근거:** 10-에이전트 멀티에이전트 현 시점 분석 (7 차원 점검 → 2 적대적 검증 → 종합). 모든 전략 주장은
> 1차 출처(코드 file:line + 경쟁사 웹 URL)로 검증됨. 선행 분석(같은 날, 메모리에만 존재)을
> "validate-or-challenge" 프레임으로 재검증한 결과 **confirmed-with-adjustments**.
>
> 관련: [`2026-06-17-competitive-landscape-and-v1.1-roadmap.md`](2026-06-17-competitive-landscape-and-v1.1-roadmap.md),
> [`2026-06-17-kalyx-1.0-functional-audit.md`](2026-06-17-kalyx-1.0-functional-audit.md)

---

## 0. 한 줄 요약

홍보는 접는다(사용자 결정). 다음 작업은 **검증된 해자(`@kalyx/core` 정확성)를 강화**하는 bundle-0 작업 순서:
**①fast-check 속성테스트(1.0.4 patch) → ②conformance suite → ③누락 hook 4종(`/headless`) → ④(선택) dayjs 어댑터**.
`@kalyx/adapter-temporal` 은 **근시일 드롭**(정확성 0 검증). 동시에 라이브 홍보 콘텐츠 제거 + stale fact 일괄 정정.

---

## 1. 현 시점 분석 (검증된 사실)

### 1.1 번들 — 마진 고갈, CJS가 binding (🔴 제약)

- 현재 측정값(on-disk dist = fresh build 동일, 3개 측정 경로 일치): **ESM 15.78KB (16163 B, 마진 221 B) / CJS 15.88KB (16258 B, 마진 126 B)**. 16KB = 16384 B.
- **CJS 126 B 가 진짜 working headroom.** `scripts/check-bundle-size.js:12` 와 CLAUDE.md §14 B9 의 "~380 B 마진"은 **위험한 stale** — 다음 담당자가 380 B 믿고 천장 깬다.
- **유일한 판별 기준 = 런타임 value-export가 어느 ENTRY에 올라타는가** (소비자 tree-shaking 아님). 예산은 `index.js`/`index.cjs` 전체 gzip로 측정되므로, `src/index.ts` 에 export 추가 = 소비자가 안 써도 bundle-positive.
  - **Bundle-0:** 테스트/devDep(fast-check), 별도 패키지(어댑터), `@kalyx/core/test-helpers` subpath, `/headless` 엔트리(tsup `splitting:false` 로 물리적 분리, 예산 미측정).
  - **Bundle-positive:** `src/index.ts` 그래프에 올라가는 모든 런타임 코드 (B10 a11y polish, B7 weekStartsOn 자동추론 등).
  - `B5 DateTimePicker.Presets` 는 **배치 의존** — `/headless` 전용이면 0, 기본 엔트리면 positive. 명시 결정 필요.

### 1.2 해자 = `@kalyx/core`, 어댑터 아님 (🟢 전략 축)

- `DateAdapter` 인터페이스(`packages/core/src/types.ts:71-102`)는 **ISO-UTC 문자열 in/out**. ~24 메서드 중 `timezone?` 받는 건 **4개뿐**(format/isSameDay/startOfDay/today).
- 그 4개조차 reference 어댑터에서 전부 core로 위임(`packages/adapter-date-fns/src/index.ts:84-85,130-131,149-150,176-177`). 어댑터는 ~200줄 얇은 shim.
- 모든 hard TZ/DST 로직(`setTimeInTimezone`, `civilMidnightFromUtcDay`, `getTimezoneOffsetMinutes`, `startOfDayInTimezone` …)은 인터페이스에 **없고** core의 Intl 기반 `timezone.ts` 에 있음. core production src에 date-fns 참조 0건.
- **결론:** 새 어댑터(dayjs/luxon/temporal)는 같은 core Intl 코드로 재위임 → 정확성 델타 0. 어댑터의 가치는 **생태계 도달(drop-in 친숙함)**, 정확성 아님.

### 1.3 경쟁 thesis 완전 유효 (적대적 검증 통과)

| 라이브러리 | 2026-06 상태 | Kalyx 갭 |
|---|---|---|
| react-day-picker 10.0.1 (~42M/wk) | v10은 cleanup 릴리즈. Calendar grid only, Input/TimePicker 없음(가이드만) | **열림** |
| react-datepicker 9.1.0 (~4.7M/wk) | CSS import 필수, value=native Date 유지. #1018 "not a bug"로 종결. `timeZone` prop은 생겼으나 onChange는 여전히 Date | **열림** |
| MUI X 9.5.0 | **58.2 KB gzip**(bundlephobia), Range/Time-Range는 Pro(유료) | **열림** (~3.7× 큼) |
| Chakra UI v3.34 DatePicker (2026-03) | **신규** — Ark UI/`@internationalized/date` 강결합, standalone TimePicker 없음 | **열림 — 포지셔닝 승리** (강결합 축 심화) |
| Adobe React Aria | `@internationalized/date` 결합 유지, Temporal 지향(미전환) | **열림** |

→ 어느 경쟁사도 (headless + 7 primitive incl. standalone TimePicker + date-fns 호환 어댑터 + ISO/UTC + ≤16KB) 갭을 닫지 못함.

### 1.4 테스트 커버리지 갭

- 총 587 테스트. 분포 편중: DatePicker 82 … **WeekPicker 16 (최약)**, 키보드 nav 테스트 3개뿐.
- **fast-check 속성테스트 0건, RTL 테스트 0건.**
- `todayInTimezone` = **공개 API인데 테스트 0건** (최대 단일 갭).
- audit TZ 항목: T-D3 **이미 완료**(#134). T-G1 부분만(UTC-only characterization). T-G3/T-R1/T-R2 사실상 미커버.

### 1.5 API 비대칭

- headless hook은 Date/Range/Time 3종만. Month/Year/Week/DateTime **없음**(B4).
- `announce()` 패리티 불균일: RangePicker만 context-level live region(올바름), DatePicker는 Calendar-local useState, WeekPicker는 region 있으나 호출 안 함(무음), Month/Year/Time은 없음.
- `getISOWeekNumber` 등 core util 함수가 `@kalyx/react`에서 re-export 안 됨(이미 번들 내 존재 → 추가는 ~0 B이나 **측정 후** 진행).
- `resolveAdapter` 는 하드코딩 아님(파라미터화). 단 Month/Year/Week가 DatePicker/RangePicker Root를 wrapping → no-adapter 에러가 컴포넌트명 오표기. low severity.

---

## 2. adapter-temporal 모순 해결 → **근시일 드롭**

> **충돌:** 커밋된 CLAUDE.md §14 Track B **B6 = "우선순위 상향"** vs 오늘 승인 방향 = "드롭". 이 문서가 B6를 덮어쓴다.

- **정확성 다리 (검증, 결정적):** Temporal 어댑터는 인터페이스를 통해 TZ 정확성을 *물리적으로 운반 불가* — 같은 core Intl 코드로 재위임, 동일 결과. core는 이미 Temporal 기본 DST 정책(gap→snap-forward via `Math.max`, ambiguous→earlier via `Math.min`, `timezone.ts:199-208,264`)과 일치 → edge에서도 차별화 0. ISO 사용자는 `.toString()`으로 **어댑터 없이** 사용 → 인터롭 이득도 0(dayjs/luxon보다 약함).
- **포지셔닝 다리 (근시일 무효):** (a) 홍보 접음(오늘 재확인) → optics 청중 없음; (b) 얇은 @0.x glue 어댑터는 "Temporal-native" 신뢰도 못 얻음(평가자는 같은 core 코드임을 봄); (c) 진짜 Temporal 역량은 core 레벨이고 이미 Track D로 demand-gate.
- **결정:** `@kalyx/adapter-temporal` **근시일 드롭**. Temporal **전략**은 core 레벨에서 Track D 보존(사용자 issue ≥3 또는 enterprise sponsor 시 착수).
- **과장 금지:** "Temporal 영원히 가치 0" 아님 — *Gregorian ISO 어댑터*가 정확성 0. 진짜 역량은 core에 속함.

---

## 3. 확정 로드맵 (순서·bundle 영향)

| 순서 | 항목 | bundle | 근거 |
|---|---|---|---|
| **1** | **1.0.4 patch: fast-check 속성테스트 `@kalyx/core`** (timezone→calendar→date). **T-G3 리드**(`todayInTimezone` 0커버 + Pacific/Niue UTC−11 day-boundary) + T-G1 컴포넌트레벨(minDate×displayTimezone civil-midnight) + T-R1(Europe/London 2026-03-29 month-nav, 실제 산술) + T-R2(Feb-29 non-UTC round-trip). **T-D3 제외**(#134 완료) | 0 (devDep/test) | 즉시 착수 가능, 정확성 ROI 최고. `setTimeInTimezone` 2-pass DST가 crown-jewel·최고위험 → 속성테스트가 example test 이김. **단** 속성테스트가 발견한 *수정*이 `src/index.ts` 그래프 건드리면 126 B 마진 측정 필수 |
| **2** | **`@kalyx/core/test-helpers` conformance suite** (새 exports subpath) | 0 (subpath) | 해자를 "검증된 계약"으로. 미래 어댑터 작성 부담 제거 |
| **3** | **누락 hook 4종** useMonthPicker/useYearPicker/useWeekPicker/useDateTimePicker (`/headless` **전용**, DOM-free 유지=RN seam 보존) | 0 (entry 분리, **tree-shaking 아님**) | API 비대칭 해소(B4). `src/index.ts` 유출 시 bundle-positive — `verify-entry-split.mjs` CI 가드 유지 |
| **4 (선택)** | **dayjs 어댑터**(P0, ~50% dayjs/Mantine 도달) — luxon보다 우선. **temporal 아님** | 0 (별도 pkg) | conformance suite 첫 외부 고객. 가치는 도달이지 정확성 아님 |

**드롭/보류:** adapter-temporal(§2), 비그레고리력(Track D out-of-scope), RN("hook DOM-free 유지" 제약으로만 보존, 프로젝트 착수 X).

---

## 4. 홍보 제거 (라이브 콘텐츠 포함 — 사용자 결정)

의존성 망 반영. 외부 사용자 0이라 실질 영향 미미하나 명시한다.

| 항목 | 조치 |
|---|---|
| **블로그**(PR#122) | **원자적 1커밋 제거** — `docusaurus.config.ts` blog plugin(~79-99) + navbar Blog 링크(~151-155) + `authors.yml`(EN+KO i18n) + 두 글(EN+KO). ⚠️ `.mdx`만 삭제 시 dangling plugin/RSS로 **빌드 깨짐**. plugin 제거가 RSS/Atom도 깨끗이 제거. 라이브 `/blog/*` 404됨(명시) |
| **announcementBar**(PR#120) | `docusaurus.config.ts` ~112-119 제거 |
| **comparison 페이지**(EN+KO) | **완전 제거**(사용자 결정) — `apps/docs-site/docs/comparison.md` + `i18n/ko/.../comparison.md` + README 2곳 링크 + `docs.include` allowlist/navbar 참조. "홍보성 비교 없음" 일관 입장 |
| 홍보 초안 | 이미 `docs/archive/promotion/`(완료) |
| **og-hero.png**(PR#118) | ⚠️ **유지 필수** — 사이트 전역 og 이미지 + CI 강제(`check-hero-freshness.mjs:28`, `pr-check.yml:188`). 삭제 시 CI 하드 실패, 블로그 전용 아님 |

---

## 5. Stale fact 일괄 정정

| # | 위치 | 틀림 → 맞음 |
|---|---|---|
| S1 | README.md:15,92 / README.ko.md:15,92 / CLAUDE.md:601 / `docusaurus.config.ts:126` / `docs/api/react.md:187`(+KO) / blog index.mdx(삭제됨) | 번들 15.63/15.76 → **15.78 ESM / 15.88 CJS** |
| S2 | `scripts/check-bundle-size.js:12` + CLAUDE.md §14 B9 | "~380 B 마진" → **126 B CJS / 221 B ESM** (위험 stale) |
| S3 | README.md:45 / README.ko.md:45 | MUI ~45 KB → **~58.2 KB gzip** (comparison.md는 삭제되므로 불필요) |
| S4 | `docs/api/react.md:179`(+KO) + CLAUDE.md:657 item#4 | @floating-ui ^0.26.0 → **^0.27.0** (이미 done — cleanup 항목 종료 표기) |
| S5 | README.md:92 / README.ko.md:92 / `docs/api/react.md:187`(+KO) | v1.0.0 / rc.14 → **1.0.3** (또는 버전-무관 표기로 drift 방지) |
| S6 | `adapter-date-fns/package.json` | 미사용 `date-fns-tz` 의존성 **제거**(declared, import 0건) |
| S7 | CLAUDE.md §14 B6 | "우선순위 상향" → **드롭 결정**(§2) 반영 |
| — | 시장 수치 41.7M/4.7M | 일관(수정 불요), 단 undated → freshness 재확인 필요 표기 |

---

## 6. 실행 PR 구성

| PR | 내용 | 비고 |
|---|---|---|
| **A** | 이 spec 문서 + CLAUDE.md §14 갱신(Track 재정렬, B6 드롭, floating-ui 종료, 380B→126B) | 기획/문서. **이 PR** |
| **B** | 홍보 제거(블로그 원자적 + announcementBar + comparison EN+KO + README 링크) | docs-site 빌드 영향 → 격리해 CI 빌드 검증 |
| **C** | stale fact 일괄(S1·S3·S4·S5) + date-fns-tz 제거(S6) | 텍스트/의존성 |
| **D** | #1 fast-check 1.0.4 patch (TDD) | 별도 release |

> B/C는 둘 다 docs-site/README 건드리므로 합칠 수 있으나, B는 빌드 위험 변경·C는 텍스트라 리뷰 분리가 깔끔. 최종 분할은 writing-plans에서.

---

## 7. 주요 리스크

1. **번들 천장(126 B CJS):** 로드맵은 전부 bundle-0이나, #1 속성테스트가 발견한 *수정*이 런타임 그래프에 들어가면 천장 깸. 완화: `scripts/bundle-diff.mjs`(B9) 먼저, 모든 런타임 수정 단독 측정.
2. **hook 유출:** #3의 0 보장은 entry 분리지 tree-shaking 아님. barrel-export 실수로 `src/index.ts` 유출 시 bundle-positive. 완화: `verify-entry-split.mjs` CI 가드 유지.
3. **우발적 동작 고정:** WeekPicker 키보드 테스트는 **A-G2 nav 결정 후** 작성. 안 그러면 우발 동작을 계약으로 박제.
4. **"free 윈" 미검증:** `getISOWeekNumber` re-export(F3)·컴포넌트명 threading(F4)은 "0 B" 미측정. 126 B에서 신뢰 금지 — **측정 우선**.
5. **홍보 제거 원자성:** `.mdx`만 삭제/og-hero 삭제 = 빌드·CI 깸. all-or-nothing.
6. **temporal 드롭 과장:** "영원히 0" 아님 — Gregorian ISO 어댑터만 0. core 역량은 Track D demand-gate.
7. **솔로 처리량:** #2·#4 + 정정 + 제거는 1인 실작업. 엄격 순서화, #4는 진짜 선택.
