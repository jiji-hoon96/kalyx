# Claude 세션 — Fix PR 교차검증 리포트 (2026-08-03)

> ⚠️ **정정됨 (2026-08-03 later)**: Codex 교차검증이 **negative UTC offset P0 timezone 버그**를 찾았고 Claude가 실측 CONFIRMED. 이로써 아래 **M-4·tz-gap "CONFIRMED/FIXED" 판정이 뒤집힘**(Seoul-only 테스트라 깨진 모델이 맞아 보인 self-test 함정). **tz-gap 패치 철회.** 최종 판정·P0·수정 방향은 [`2026-08-03-cross-evaluation-synthesis.md`](2026-08-03-cross-evaluation-synthesis.md) 참조. 아래 #178/#179 CONFIRMED + 방법론(combined 검증·머지 순서)은 유효.

> **검증 주체**: Claude(신규 세션, 이전 세션 PR과 무관). **대상**: `#178`/`#179`/`#180` (fix PR 3종).
> **방법**: 세 PR을 `origin/main` 위에 병합한 **shipped state**를 격리 worktree에서 재구성 → typecheck/test/build/lint/check-bundle 직접 실행 → 각 fix의 **이빨 검증(revert → RED)** → 스코프 주장 소스 대조 → PR 간 상호작용 갭 탐지·수정.
> **증거 원칙 준수**: 아래 모든 숫자는 worktree에서 직접 실행한 실측. PR 설명·메모리 수치는 재측정으로 갈음.

---

## 0. 요약 (verdict)

| PR | 대상 | verdict | 근거 |
|---|---|---|---|
| **#178** | HIGH-1 타입드 input이 disabled/min-max 우회 | ✅ **CONFIRMED** | 가드 revert 시 3 negative 테스트 RED. 스코프 주장(MonthPicker/YearPicker 자동 커버) 소스로 사실 확인. |
| **#179** | HIGH-2 disabled 날짜로 열 때 키보드 그리드 사망 | ✅ **CONFIRMED** | retarget revert 시 core 1 + react 2(ArrowRight 포함) RED. **core-only 변경 → 번들 0 byte.** |
| **#180** | M-3 TimePicker filterTime 타입드 우회 + M-4 isDateDisabled tz | ✅ **CONFIRMED** | M-3/M-4 각각 revert 시 해당 테스트 RED. |
| — | **PR 간 상호작용 갭 (신규 발견)** | 🔧 **FIXED** | #178+#180 병합 시 타입드 input 가드가 tz 미전달 → displayTimezone에서 grid는 막고 타입드는 통과. 1-인자 수정(+0 byte)으로 폐기. |

**세 PR 모두 개별적으로 정확하며 회귀 없음.** 발견한 유일한 결함은 두 PR이 **함께 머지될 때만** 나타나는 상호작용 갭(어느 단일 PR의 버그도 아님).

---

## 1. 실측 baseline (세 PR 병합 + tz-gap 수정 후, combined 최종 상태)

| 항목 | 결과 |
|---|---|
| `pnpm typecheck` (`tsc -b`) | ✅ exit 0 |
| `pnpm test:run` | ✅ **792 passed / 45 files** (0 fail) |
| `pnpm build` | ✅ exit 0 |
| `pnpm lint` (eslint) | ✅ exit 0 |
| `node scripts/check-bundle-size.js` | ✅ **ESM index 16.67KB / CJS index 16.92KB** gzip — 둘 다 ≤17KB PASS |

**번들 델타**: baseline 1.4.0 (ESM 16.64 / CJS 16.89) 대비 **ESM +0.03 / CJS +0.03KB**. 세 PR + tz-gap 수정을 전부 합쳐도 17KB 천장 아래(CJS 잔여 마진 ~80B). #179는 core 순수함수 변경이라 react 엔트리에 0 byte(HIGH-2 선례대로), tz-gap 수정도 기존 gzip 토큰 재사용으로 0 byte.

> ⚠️ 함정 기록: `pnpm --filter @kalyx/react exec vitest`는 `test/setup.ts`를 못 찾음(cwd가 패키지로 바뀜). **반드시 루트에서** `pnpm exec vitest run <path>`. / 빌드 전 `test:run`은 docs-site 3종이 `@kalyx/react` dist 미존재로 실패 — `pnpm build` 후 해소(fix와 무관한 아티팩트).

---

## 2. 이빨 검증 (revert → RED, 핸드오프 필수 항목)

각 fix의 **구현 hunk만** 되돌리고(테스트는 유지) 해당 테스트가 RED가 되는지 확인. RED가 안 되면 테스트가 장식.

| fix | revert 대상 | 결과 |
|---|---|---|
| #178 가드 | `Root.tsx` L162 `if (iso && isDateDisabled(...)) return;` | 3 negative RED (`dayOfWeek`/`before`/`after`), positive 2 GREEN ✅ |
| #179 retarget (core) | `calendar.ts` focus-retarget 블록 | `moves isFocused…` RED ✅ |
| #179 retarget (react) | 위 동일 (재빌드) | **`lands focus…` + `keeps the grid keyboard-navigable`(ArrowRight) 둘 다 RED** ✅ |
| #180 M-3 | `TimePicker/Input.tsx` filterTime 체크 | `does not commit a typed time rejected…` RED ✅ |
| #180 M-4 | `calendar.ts` `isSameDay(iso, rule.date, timezone)` → 3-arg | `matches a {date} rule by civil day…` RED ✅ |

**Advisor 지목 우려 해소**: #179의 ArrowRight 테스트("keeps the grid keyboard-navigable")가 grid-keyboard의 disabled-skip으로 우연히 통과하는 게 아니라, **실제로 focus-retarget에 의존**함을 확인(retarget 되돌리면 RED). 장식 아님.

---

## 3. 스코프 정직성 검증

- **#178 "MonthPicker/YearPicker 자동 커버"** → ✅ **사실**.
  - `MonthPicker/Root.tsx:13` = `return <DatePickerRoot {...props} .../>`, `YearPicker/Root.tsx:12` 동일.
  - `MonthPicker.Input`/`YearPicker.Input` = `DatePickerInput` (각 `index.ts`).
  - → 타입드 커밋이 가드된 `DatePickerRoot.selectDate`를 그대로 통과 → 자동 보호.
- **#178 "RangePicker/WeekPicker는 Input readOnly라 영향 없음"** → 스코프 제외 주장(별도 확인 권장이나 이번 검증 범위 밖, 낮은 리스크).
- **#180 M-5 defer(controlled↔uncontrolled dev 경고, 번들 초과)** → defer 자체는 재측정 안 함(런타임 코드 main 추가 = 마진 ~80B 고려 시 defer 타당성 높음).

---

## 4. 신규 발견 + 수정: 타입드 input tz-consistency 갭

**증상 (combined 상태에서 재현):** `displayTimezone` 설정 + `{date}` 규칙 + 날짜를 **타이핑**할 때, 그리드는 해당 셀을 civil-day-in-tz로 disabled 처리(#180 M-4)하지만 #178의 타입드 가드는 tz 없이 UTC 비교 → **그리드가 회색 처리한 날짜가 타이핑으로 조용히 커밋됨.**

```
재현: displayTimezone="Asia/Seoul", disabled=[{date:'2026-01-14T15:00:00.000Z'}]  // = Seoul civil Jan 15
      "2026-01-15" 타이핑 → 수정 전: onChange 호출됨(누락) / 수정 후: 차단됨
```

**원인**: 각 PR은 개별적으론 정확. `isDateDisabled`의 `timezone` 4번째 파라미터는 #180이 추가, 타입드 가드는 #178이 추가 — **두 PR이 만나는 지점에서만** 발생하는 상호작용.

**수정 (`packages/react/src/components/DatePicker/Root.tsx`)**: 가드가 `displayTimezone`을 전달 (이미 dep 배열에 존재 → dep 변경 불필요, 번들 0 byte).
```ts
- if (iso && isDateDisabled(iso, disabledRules, adapter)) return;
+ if (iso && isDateDisabled(iso, disabledRules, adapter, displayTimezone)) return;
```
회귀 테스트 1건 추가(`honors a {date} rule by civil day when displayTimezone is set`) — 수정 전 RED, 수정 후 GREEN 확인. 패치 파일: [`2026-08-03-tz-gap-followup.patch`](2026-08-03-tz-gap-followup.patch).

**⚠️ 이 수정은 #178·#180 둘 다 있어야 컴파일됨** (#178 브랜치엔 4-arg 시그니처 없음, #180 브랜치엔 가드 라인 없음). → **어느 단일 PR 브랜치에도 넣을 수 없고, 병합 후 follow-up으로만** 적용 가능.

---

## 5. 액션 플랜 (권고)

1. **머지 순서 (중요 — 충돌 최소화)**: **`#178` + `#180` 먼저(순서 무관, 두 PR은 공유 파일 0 → 상호 클린) → `#179` 마지막**.
   - 파일 겹침: #178=`Root.tsx`·`DatePicker.test.tsx` / #180=`calendar.ts`·`calendar.test.ts`·`TimePicker/*` → **교집합 없음**. #179=`calendar.ts`+`calendar.test.ts`(#180과 공유)+`DatePicker.test.tsx`(#178과 공유) → **양쪽과 겹치는 충돌 허브**.
   - #179를 마지막에 두면 충돌 해결이 **딱 한 번**(#179 머지 시): `DatePicker.test.tsx`(import union + 두 describe 공존)·`calendar.test.ts`(두 describe 공존). `calendar.ts`는 다른 영역이라 **자동 병합**(로컬 확인). 해결 내용은 "두 블록 모두 유지" 라 순서 무관.
   - ⚠️ #179를 먼저 머지하면 이후 #178·#180 각각에서 충돌 해결이 필요 → **두 번**. GitHub는 admin 머지라도 충돌 브랜치를 막으므로 순서가 실제로 중요.
   - **#179 머지 시 충돌 해결은 이미 로컬에서 수행함**(worktree `e69114d`·`565f124`) — 필요 시 그 해결 파일 제공 또는 대신 처리 가능.
2. **tz-gap follow-up** (사용자 결정: **별도 follow-up PR**): #178+#180 머지 완료 후 아래로 클린 브랜치 생성.
   ```bash
   git checkout -b fix/typed-input-tz-consistency origin/main
   git apply docs/superpowers/specs/2026-08-03-tz-gap-followup.patch   # changeset + Root.tsx + 회귀 테스트
   pnpm test:run && pnpm typecheck && pnpm build && node scripts/check-bundle-size.js
   git add -A && git commit && gh pr create
   ```
   패치는 changeset(`@kalyx/react` patch) + `Root.tsx` 1-line(+dep 변경 없음) + 회귀 테스트 1건. **+0 byte**(gzip 토큰 재사용). #178·#180 둘 다 main에 있어야 `git apply` 성공(4-arg 시그니처 + 가드 라인 모두 필요).
3. **defer 유지**: M-5(dev 경고), HIGH-2 first-arrow 잔여 — 둘 다 번들 마진(~80B) 초과라 defer 타당. 별도 조치 불필요.
4. **Codex 교차검증(대기)**: Codex fix PR·스코어카드 미완(브랜치 = 스켈레톤). 산출물 나오면 #176 스코어카드와 셀 단위 대조 필요(핸드오프 §2 미완 항목).
