# Kalyx 라이브러리 종합 평가 — 공유 루브릭 (dual-model)

> **목적.** Claude 와 Codex 두 모델이 **같은 표를 독립적으로 채운 뒤** 셀 단위로 대조·중재하기 위한 공유 채점 기준.
> 자유형식 에세이는 정렬이 안 된다 — 반드시 이 루브릭의 차원·증거 프로토콜을 따른다.
>
> **작성일** 2026-08-03 · **평가 대상** `@kalyx/core@1.4.0` / `@kalyx/react@1.4.0` (+ adapter-date-fns 1.0.1, dayjs/luxon 0.1.0)

---

## 0. 증거 프로토콜 (양쪽 모델 공통 — 반드시 준수)

1. **CLAUDE.md·메모리·README 의 주장을 믿지 않는다.** 모든 점수는 **소스/실측**으로 뒷받침한다.
2. 각 findings 는 `파일:라인` + **구체적 실패 시나리오**(입력→잘못된 출력) + **confidence(high/med/low)** 를 단다.
3. 실측 커맨드를 실제로 돌린다: `pnpm typecheck` / `pnpm test:run` / `pnpm build` / `pnpm check-bundle`. 숫자는 출력에서 인용.
4. 버그 주장은 **재현 경로를 코드로 추적**한다(호출 그래프). "그럴 것이다" 금지.
5. 비-버그(정상 확인)도 신호다 — 검증해서 CORRECT 로 남긴 항목도 기록.
6. 점수는 1–10, 근거 한 줄 필수. 근거 없는 점수 무효.

---

## 1. 채점 차원 (7)

| # | 차원 | 무엇을 보는가 | 핵심 증거원 |
|---|------|--------------|------------|
| D1 | **정확성·견고성 (버그율)** | DST/timezone, 윤년, min/max, disabled 규칙, 12h/24h, 주 경계, controlled↔uncontrolled, mid-flight prop | `core/src/utils/*`, 각 `*/Root.tsx`·`Input.tsx`·`Calendar.tsx` |
| D2 | **DX·문서** | 설치→첫 픽커 마찰, zero-CSS 정직성, API 발견성, 커버리지 갭, en/ko 패리티, 검색 | `README*.md`, `apps/docs-site/**`, `packages/*/README.md` |
| D3 | **경쟁 적합성 (쓸 이유)** | 실제 시장 공백 여부, shadcn/react-day-picker/MUI/React-Aria/Ark 대비 차별점, 타깃 유저 | 웹 조사(2026 실측) + 소스 기능 확인 |
| D4 | **번들·성능 여유** | main/headless gzip, 게이트 범위, 마진, tree-shaking | `scripts/check-bundle-size.js`, `pnpm build` 출력 |
| D5 | **접근성 (a11y)** | ARIA roles, 키보드 내비 완결성, focus 관리, axe | `_shared/grid-keyboard.ts`, `*/Calendar.tsx`, a11y 테스트 |
| D6 | **테스트 정직성** | 테스트가 의미있나 얕나, 크리티컬 패스 미검 여부, property test | `__tests__/**`, 커버리지 |
| D7 | **보안·공급망** | 취약점, 라이선스, OIDC/provenance, 의존성 표면 | OSV/security 워크플로우, `package.json` deps |

---

## 2. 스코어카드 (각 모델이 독립 작성)

| 차원 | 점수(1-10) | 한 줄 근거 (파일:라인/실측) | Confidence |
|------|:---:|------|:---:|
| D1 정확성·견고성 |  |  |  |
| D2 DX·문서 |  |  |  |
| D3 경쟁 적합성 |  |  |  |
| D4 번들·성능 여유 |  |  |  |
| D5 접근성 |  |  |  |
| D6 테스트 정직성 |  |  |  |
| D7 보안·공급망 |  |  |  |
| **종합** |  | (가중 평균 아님 — 서술적 종합) |  |

---

## 3. 방향 결정 (평가 위에서 도출)

세 갈래 중 무엇을, 왜:

- **A. 정확성/버그 수정 우선** — 발견된 correctness hole 을 patch. 근거:
- **B. 기능 추가** — 무엇을, 번들 제약(main ~110B / headless 무게이트) 하에서 어디에:
- **C. 홍보** — 2026-06-18 "홍보 접는다" 결정 + 경쟁 분석 대비 재개 정당성:

각 모델은 A/B/C 우선순위를 **근거와 함께** 제시하고, 반대 근거도 명시한다.

---

## 4. 대조·중재 규칙

- 두 스코어카드를 **셀 단위**로 비교한다.
- 점수 차 ≥ 2 인 셀, 또는 findings 유무가 갈리는 셀은 **불일치**로 표시하고 중재한다.
- 중재자(사람 + Claude 종합)는 각 불일치에 대해: (a) 어느 쪽이 증거가 강한가, (b) 왜, (c) 최종값.
- 한쪽만 발견한 findings 는 폐기하지 말고 **반대편이 재검증**한다(놓친 것인지 오탐인지).
