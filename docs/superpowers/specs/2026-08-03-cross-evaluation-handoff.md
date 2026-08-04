# Dual-model 교차 평가 핸드오프 (2026-08-03)

> **다음 세션(Claude 또는 Codex)이 먼저 읽는 문서.** 두 모델이 각자 정리한 PR을 **상대 시선으로 평가·검증**하고, 그 결과를 하나로 종합하기 위한 지침.
> 공유 채점 기준: [`2026-08-03-library-evaluation-rubric.md`](2026-08-03-library-evaluation-rubric.md) (§0 증거 프로토콜 + 7차원 스코어카드)

---

## 0. 지금까지의 경위

Kalyx(`@kalyx/core@1.4.0` / `@kalyx/react@1.4.0`)를 두 모델이 **독립 병행**으로 종합 평가하고, 발견한 버그를 각자 수정 PR로 올리는 중이다.

- **Claude 측**: 종합 평가(#176) + 자체검증한 실 버그 4건을 3개 fix PR로 수정.
- **Codex 측**: 자기 프롬프트로 독립 실행하여 자체 평가 + 수정 PR 생성(진행 중 — PR 번호는 아래 표에 채울 것).

**증거 원칙(양측 공통, 반드시 준수):** CLAUDE.md·메모리·PR 설명의 주장을 믿지 말고 **소스/실측**으로만 검증한다. `pnpm typecheck / test:run / build / check-bundle`를 직접 실행해 숫자를 인용한다. 버그 주장은 코드로 재현 경로를 추적한다.

---

## 1. 평가 대상 PR

### Claude 측 (완료·OPEN)

| PR | 종류 | 내용 | 검증 스냅샷(Claude 자체) |
|---|---|---|---|
| **#176** | 평가 | 7차원 종합 평가 + 공유 루브릭 | 776 test·번들 16.64/16.89KB 실측 기반 |
| **#178** | fix (react patch) | **HIGH-1** — 타입드 input이 `disabled`/min-max 우회. `DatePicker.Root.selectDate`에 `isDateDisabled` 가드(그리드와 동일). MonthPicker/YearPicker 자동 커버. | 회귀 5건, 781 pass, CJS 16.90KB |
| **#179** | fix (core patch) | **HIGH-2** — disabled 날짜로 open 시 키보드 그리드 사망. `getCalendarDays`가 `isFocused`를 first-enabled로 재타겟. Date/Range/Week 커버. | core 3+react 3, 782 pass, CJS 16.89KB(delta 0) |
| **#180** | fix (react+core patch) | **M-3** TimePicker typed input이 `filterTime` 우회 + **M-4** `isDateDisabled`가 `{date}` 규칙서 `displayTimezone` 무시. | 4건, 780 pass, CJS 16.91KB |

**Claude가 defer한 것(번들 게이트 초과 — correctness 아님):**
- **M-5** controlled↔uncontrolled dev 경고: 3 Root에 넣으면 측정 번들 ~210B↑ → CJS 17.12KB(>17). tsup이 `process.env.NODE_ENV` 미치환이라 dev 코드가 dist에 계상됨.
- **HIGH-2 first-arrow 잔여**: react `handleKeyDown`이 `focusedDate` state에서 화살표 계산 → disabled 날짜로 연 직후 첫 화살표 1회가 원래(disabled) 날짜 기준으로 이동(비인접 점프). 완전교정=`Root.open()`에서 enabled seed지만 번들 여유 필요.

### Codex 측 (진행 중 — 다음 세션이 채울 것)

| PR | 종류 | 내용 |
|---|---|---|
| _TBD_ | 평가 | Codex 독립 스코어카드 |
| _TBD_ | fix | _(있으면)_ |

> 찾는 법: `gh pr list --state open` → `codex/*` 브랜치 또는 Codex가 만든 PR.

---

## 2. 다음 세션의 임무 (모델별 시선)

**핵심: 자기 모델이 만든 것이 아니라 "상대 모델"의 PR을 적대적으로 검증한다.**

- **Claude 세션이라면** → Codex의 평가·수정 PR을 검증. Codex 스코어카드를 #176과 셀 단위 대조. Codex fix가 있으면 소스+테스트로 재현·재검증(과대/과소 주장, 회귀, 번들 영향).
- **Codex 세션이라면** → Claude의 #178/#179/#180을 검증. 각 fix가 정말 버그를 고치는지, 부작용/회귀는 없는지, 테스트가 의미있는지, 번들 주장이 맞는지 실측으로 확인. #176 스코어카드를 Codex 독립 평가와 대조.

### PR별 검증 체크리스트 (fix PR)
```
□ 브랜치 체크아웃 후 pnpm test:run / typecheck / build / check-bundle 직접 실행 (숫자 인용)
□ 수정이 겨냥한 버그를 "수정 전(main)"에서 재현되는지 → 수정 후 사라지는지 확인
□ 추가된 테스트가 실제로 그 버그를 잡는지 (이빨 검증: 수정 되돌리면 RED 되는지)
□ 부작용/회귀: 정상 흐름(클릭 선택, 유효 커밋, 다른 픽커)이 안 깨지는지
□ 번들 주장 검증 (PR이 말한 gzip 수치가 실측과 일치하는지, ≤17KB 게이트)
□ 스코프 정직성: PR이 "defer"했다고 한 것이 정말 defer 필요한지(번들 실측)
```

### 대조·중재 규칙 (평가 스코어카드)
- 두 스코어카드를 **셀 단위**로 비교. 점수 차 ≥2 또는 findings 유무가 갈리는 셀 = **불일치**.
- 불일치마다: (a) 어느 쪽 증거가 강한가, (b) 왜, (c) 최종값. 증거는 소스/실측.
- 한쪽만 발견한 findings는 폐기 말고 **반대편이 재검증**(놓친 것인지 오탐인지).

## 3. 산출물
- 단일 **종합 리포트**: 대조표(불일치+중재) + 각 fix PR의 검증 결과(CONFIRMED/과대/회귀) + 최종 액션 플랜(머지 순서, 잔여 defer 항목 처리 여부).
- 위 표의 Codex PR 슬롯을 채우고, 각 PR에 검증 verdict를 단다.

## 4. 환경 메모(함정)
- 번들 게이트: `scripts/check-bundle-size.js`(`TARGET_KB=17`)가 **main entry(index)만** 강제. headless entry는 무게이트. CJS 마진 극소(~110B) → **런타임 코드를 main에 넣으면 게이트 위험**, core 순수함수에 넣으면 gzip 토큰 재사용으로 0 byte 가능(HIGH-2 선례).
- 테스트 트리거: DatePicker Input은 **change마다** commit(`fireEvent.change`로 전체값), TimePicker Input은 **blur/Enter**에 commit(`fireEvent.change`+`fireEvent.blur`).
- main 보호: release/eval PR류는 승인 필요. 로컬 검증은 루트에서 `pnpm ...`.
