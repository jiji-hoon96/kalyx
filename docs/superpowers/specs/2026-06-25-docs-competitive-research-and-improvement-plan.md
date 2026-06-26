# Kalyx 공식문서 경쟁 리서치 + 개선 플랜

> **작성일:** 2026-06-25
> **목적:** 7개 경쟁 OSS의 공식문서 UX를 6개 측면에서 조사하고, 그 근거로 kalyx `apps/docs-site` (Docusaurus) 개선 플랜을 우선순위와 함께 확정한다.
> **범위:** 문서/사이트(IA·데모·코드 예제·API 표현·랜딩·a11y/i18n) UX에 한정. 라이브러리 런타임 코드 변경은 별도 spec.
> **방향 정합성:** [`2026-06-18-current-state-analysis-and-correctness-first-direction.md`](2026-06-18-current-state-analysis-and-correctness-first-direction.md) 의 "홍보는 접는다(라이브 마케팅 콘텐츠 제거) / 정확성 먼저" 결정과 충돌하지 않도록, 본 플랜은 **마케팅 모먼트가 아니라 "평가자(evaluator)·구현자가 빠르게 이해·복붙·신뢰"** 하는 docs 품질에 집중한다. comparison 랜딩·블로그 announcement 류는 **다시 만들지 않는다.**

---

## 0. 조사 대상 & 방법

| # | 프로젝트 | 포지션 | 문서 스택 |
|---|---|---|---|
| 1 | react-day-picker | Headless 직접 경쟁자 | Docusaurus |
| 2 | Radix UI Primitives | Headless 컴포넌트 문서 표준 | 자체 |
| 3 | Ark UI | Composition + 멀티프레임워크 | 자체 |
| 4 | shadcn/ui | "복사해서 쓰는" 문서 UX | 자체(Next) |
| 5 | react-datepicker | 통합형·기능 밀집(but dated) | SPA |
| 6 | React Aria / Adobe | a11y·i18n 문서의 gold standard | 자체 |
| 7 | MUI X Date Pickers | API 레퍼런스·prop 토글 데모 표준 | 자체 |

조사 측면(6): IA/네비게이션 · 인터랙티브 데모/플레이그라운드 · 코드 예제 제시 · API 레퍼런스 표현 · 랜딩/Hero · 접근성·i18n.

---

## 1. 측면별 비교 매트릭스

범례: ●= 강함/모범, ◐= 부분적, ○= 없음/약함.

### 1.1 IA / 네비게이션

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ◐ | Docs/Playground/API 3-탭. **태스크 중심 사이드바**(Selecting Days, Localization, Guides). 버전 드롭다운. |
| Radix | ● | **Overview / Guides / Components / Utilities** 4분할 — 개념과 컴포넌트 레퍼런스 분리. |
| Ark UI | ● | **프레임워크 스위처**(React/Solid/Vue/Svelte)가 URL·코드 동시 전환. **"AI for agents"** 사이드바 그룹. 버전 드롭다운. |
| shadcn/ui | ◐ | cmd+K 검색, 헤더에 **GitHub 스타 수** 노출. provider 스위처(radix/base). |
| react-datepicker | ○ | 단일 롱스크롤 예제 페이지. 사이드바·검색·버전 없음. SPA라 no-JS 깨짐. |
| React Aria | ● | **컴포넌트별 일관 스켈레톤**(intro→example→concept→Anatomy→API). |
| MUI X | ● | **최고 분류**: Components / Main features / Localization / Customization / API reference. Algolia + 버전 셀렉터 + 우측 TOC. |

**kalyx 현재:** category 분할(Getting Started / Concepts / Guides / Components / Hooks / Recipes / API / migration / troubleshooting)은 이미 Radix/MUI에 근접. **약점:** "Main features"류 동작(validation/lifecycle) 카테고리 부재, 버전 셀렉터 부재(단일 버전이라 OK), 검색은 Docusaurus 기본.

### 1.2 인터랙티브 데모 / 플레이그라운드

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ● | **도메인 축을 토글로**: locale × timezone × calendar system × numeral × week-start × RTL → 하단에 코드 생성. |
| Radix | ◐ | 스타일된 인터랙티브 프리뷰 우선(읽기전용). |
| Ark UI | ◐ | 유스케이스 카드("booking systems") + Show Code. |
| shadcn/ui | ◐ | 유스케이스별 프리뷰(DOB/range/time/자연어) + 인라인 RTL+아랍어 토글. |
| react-datepicker | ◐ | 기능마다 인라인 라이브 프리뷰(밀집). 편집 불가. |
| React Aria | ● | **Vanilla CSS + Tailwind 쌍둥이 예제**. `<I18nProvider>`로 RTL/locale 인라인. |
| MUI X | ● | **모든 데모에 "Edit code" 인라인 에디터** + 전용 Customization 플레이그라운드. |

**kalyx 현재:** `live` 코드블록(react-live), 전용 `/playground` (Picker 선택 + classNames 에디터 + locale/timezone 토글 + StackBlitz 내보내기), `HeroDemo` 애니메이션. **이미 상위권.** 약점: 데모가 "유스케이스(DOB/booking/datetime)"가 아니라 "API 데모" 위주. RTL 인라인 토글 데모 없음.

### 1.3 코드 예제 제시

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ◐ | 파일명 헤더 + **"View source"**(GitHub 실제 예제 파일 링크). |
| Radix | ● | Anatomy 우선 → **멀티파일**(index+styles) → "Custom APIs"의 **Usage+Implementation 페어**. |
| Ark UI | ◐ | 프레임워크 탭 코드. **Open in ChatGPT/Claude + view-as-markdown + llms.txt**. |
| shadcn/ui | ● | **per-block 복사 + "Copy Page"(전체 md)** + 파일명 헤더 + pm 인식. |
| react-datepicker | ◐ | **예제 상단 주석 import + Common Imports Guide**(복붙 후 컴파일 안 되는 문제 해결). |
| React Aria | ● | **멀티파일 + 파일명 헤더 + 라인 하이라이트 마커**. |
| MUI X | ● | 라이브 데모 아래 **"Show code" 토글** + 복사 버튼. |

**kalyx 현재:** Docusaurus 기본 복사 버튼. **약점:** pm 탭(npm/pnpm/yarn/bun) 미사용, 라인 하이라이트 거의 없음, 파일명 헤더 부분적, "Copy Page"/llms.txt 없음, 예제 import 누락으로 복붙 마찰 가능.

### 1.4 API 레퍼런스 표현

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ◐ | TypeDoc 자동 + 토픽별 큐레이션 prop 표. |
| Radix | ● | **part별 Prop/Type/Default 표 + 별도 `data-*` 어트리뷰트 표** + **Anatomy** 트리. |
| Ark UI | ● | **part당 3계약**: props + **data-attrs** + **CSS 변수** + **헤드리스 훅 Context 표**. |
| shadcn/ui | ◐ | **ASCII Composition 트리** + "root 컴포넌트 없음" 정직한 설명. |
| react-datepicker | ○ | 수기 단일 prop 표(드리프트). |
| React Aria | ● | **Anatomy JSX 트리** + `data-*` 상태 스타일 표 + render props/slots. |
| MUI X | ● | per-prop 앵커 + **함수 시그니처 인라인 전개** + **Slots 표**(slot→기본 컴포넌트→class). |

**kalyx 현재:** 컴포넌트 페이지에 Prop/Type/Default 표 + classNames 키 표(타입으로). **약점:** (1) **Anatomy 트리 부재** — Composition API가 thesis인데 트리를 먼저 안 보여줌. (2) `data-*` 어트리뷰트 계약을 표로 문서화 안 함(실제 코드에 `data-active` 등 존재). (3) 헤드리스 훅(`useDatePicker` 등) 반환값 Context 표가 산문/부분적. (4) classNames가 타입 코드블록이라 "어떤 상태에 적용되는지" 설명 열이 없음.

### 1.5 랜딩 / Hero

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ◐ | intro=hero, **모든 기능 불릿이 딥링크**(피처리스트=네비). 스폰서 월. |
| Radix | ◐ | **문제 우선 프레이밍**("기존 구현은 부적절"). |
| Ark UI | ● | **"Built with Ark UI" 쇼케이스 그리드**(실서비스 디자인시스템). 탭 코드 hero. |
| shadcn/ui | ● | **도발적 한 줄 포지셔닝** + **브랜드 social proof**(OpenAI/Adobe) + 인라인 FAQ. |
| react-datepicker | ○ | hero 없음, 바로 예제 그리드. |
| React Aria | ● | **주석 달린 인터랙티브 hero**(실앱+컴포넌트 화살표 라벨=네비). |
| MUI X | ● | **value-pillar별 라이브 데모**(i18n=타임존 셀렉터, a11y=키보드 그래픽). |

**kalyx 현재:** Hero + FeatureGrid + SameJsxBlock + PickerGrid + WhyKalyx + GetStarted, HeroDemo 애니메이션. **이미 강함.** 약점: 피처 불릿→딥링크 연결 약함, value-pillar별 "데모로 증명" 부족(특히 timezone/correctness가 thesis인데 hero에서 라이브로 안 보여줌).

### 1.6 접근성 & i18n

| 프로젝트 | 평가 | 핵심 패턴 |
|---|---|---|
| react-day-picker | ● | **a11y 전용 가이드** + WAI-ARIA APG 인용 + **키보드 표** + 캘린더시스템별 페이지. |
| Radix | ● | **2단**: 전역 a11y 개념 + 컴포넌트별 키보드 표 + APG 패턴 링크. |
| Ark UI | ◐ | i18n을 **타입드 props**(`locale`/`timeZone`/`translations`)로 문서화. |
| shadcn/ui | ◐ | **전용 /rtl 페이지** + 인라인 RTL 토글. |
| react-datepicker | ◐ | README 키보드 리스트 + **"date is one day off" 타임존 가이드**(#1 구글링 버그 직접 해결). |
| React Aria | ● | **gold standard**: APG 인용, SR 테스트, 30+언어/13캘린더/RTL을 **코드로 시연**. |
| MUI X | ● | **서브컴포넌트별 키보드 표**(Field/Calendar/Range 각각) + WCAG AA 명시 + APG URL. |

**kalyx 현재:** `concepts/accessibility.md`, `concepts/internationalization.md`, `concepts/timezone.md` 존재. **약점:** (1) 컴포넌트 페이지에 **서브컴포넌트별 키보드 표**가 없음(Calendar grid 키만 일부). (2) APG 패턴 URL 명시적 인용 약함. (3) **RTL 인라인 토글 데모** 없음. (4) timezone "하루 어긋남" 같은 **명명된 트러블슈팅 레시피**가 약함 — 정확성이 thesis인데 #1 버그를 소유하지 못함.

---

## 2. 종합: kalyx가 이미 강한 것 / 격차

### 이미 모범 수준 (유지)
- **인터랙티브 데모**: react-live 인라인 + 전용 Playground + StackBlitz 내보내기 + locale/timezone 토글 → react-day-picker/MUI 급. 7개 중 상위권.
- **IA 분류**: Radix/MUI 스타일 카테고리 분할 이미 적용.
- **랜딩**: Hero/FeatureGrid/PickerGrid/HeroDemo 구성 양호.

### 핵심 격차 (개선 타깃) — 우선순위순
1. **Anatomy 트리 부재** (API 표현). Composition이 thesis인데 가장 강력한 교육 장치가 없음.
2. **`data-*` / classNames 계약의 표 문서화 부재** (API 표현). 헤드리스의 스타일링 API 자체.
3. **서브컴포넌트별 키보드 표 + APG 인용 부재** (a11y).
4. **유스케이스 레시피 + "View source" 부재** (데모/코드). DOB/booking/datetime 같은 복붙 레시피.
5. **코드 제시 마찰**: pm 탭, 라인 하이라이트, Copy Page/llms.txt, 예제 import 누락.
6. **timezone "하루 어긋남" 명명 트러블슈팅 + RTL 인라인 토글** (a11y/i18n) — 정확성 thesis 소유.
7. **헤드리스 훅 Context 반환 표** (API 표현).

---

## 3. 개선 플랜 (근거 + 우선순위)

각 항목: 근거(출처 프로젝트) · 작업 위치 · 예상 비용. 코드(런타임) 변경 없음, docs-site 한정.

### P0 — 가장 높은 레버리지 (thesis 직결, 비용 중간)

| # | 항목 | 근거(출처) | 위치 |
|---|---|---|---|
| D1 | **Anatomy 트리 블록**을 7개 컴포넌트 페이지 상단에 추가(Basic usage 위). JSX 트리로 composition 계약 우선 노출. | Radix/React Aria/Ark Anatomy, shadcn ASCII 트리 | `docs/components/*.md` |
| D2 | **classNames 표 리포맷** + **`data-*` 어트리뷰트 표** per 서브컴포넌트. 현재 타입 코드블록을 `Slot / data-attr / 적용 시점 / 설명` 표로. | Radix data-attr 표, React Aria 상태 표, MUI Slots 표 | `docs/components/*.md`, 신규 `concepts/styling.md` |
| D3 | **서브컴포넌트별 키보드 인터랙션 표** + WAI-ARIA APG datepicker-dialog/combobox/spinbutton **URL 인용** + WCAG AA 목표 명시. | MUI(per-sub 표·APG URL), Radix(2단), react-day-picker(키보드 표) | `docs/concepts/accessibility.md` + 각 컴포넌트 "Accessibility" 섹션 |

### P1 — 복붙·신뢰 (비용 낮음~중간)

| # | 항목 | 근거(출처) | 위치 |
|---|---|---|---|
| D4 | **유스케이스 레시피 페이지** 신설: Date of Birth(month/year jump), Booking range + presets, DateTime + timezone, 자연어 입력(가능 범위). 라이브 프리뷰 + 복붙. | shadcn 유스케이스 카드, Ark "booking systems" | 신규 `docs/recipes/use-cases/*` 또는 recipes 확장 |
| D5 | **"View source" 링크**: 라이브 예제를 GitHub의 실제(테스트되는) 예제 파일에 연결해 드리프트 방지. | react-day-picker, React Aria | 예제 컴포넌트 + 코드블록 |
| D6 | **헤드리스 훅 Context 반환 표**: `useDatePicker`/`useRangePicker`/`useTimePicker` + (1.1 추가분) 반환 state/메서드 전수 표. | Ark Context 표, React Aria render props | `docs/hooks/*.md` |
| D7 | **timezone "하루 어긋남" 명명 트러블슈팅**: 정확성 thesis를 소유. "Why is my date one day off?" 섹션 + ISO/UTC 계약으로 해결됨을 코드로. | react-datepicker #1018 가이드 | `docs/concepts/timezone.md` + `troubleshooting.md` |

### P2 — 마감/마찰 제거 (비용 낮음)

| # | 항목 | 근거(출처) | 위치 |
|---|---|---|---|
| D8 | **pm 탭**(npm/pnpm/yarn/bun) — Docusaurus `Tabs` 또는 `@docusaurus/theme` npm2yarn 플러그인. | shadcn/MUI | installation/quick-start + 전역 |
| D9 | **라인 하이라이트 마커** + 파일명 헤더 일관화. | React Aria, shadcn | 전역 코드블록 |
| D10 | **예제 상단 import 일관화 + Common Imports 노트**(복붙 후 컴파일 보장). | react-datepicker Common Imports Guide | 예제 전반 |
| D11 | **"Copy Page (markdown)" + `llms.txt`** — LLM/에이전트 친화. (홍보 아님, DX) | Ark UI, shadcn Copy Page | docs-site 테마/정적 |
| D12 | **RTL 인라인 토글 데모** 1개(Playground 또는 i18n 페이지). | shadcn /rtl, React Aria | `concepts/internationalization.md`/Playground |

### P3 — 랜딩 폴리시 (선택, 홍보 아님)

| # | 항목 | 근거(출처) | 위치 |
|---|---|---|---|
| D13 | 피처 불릿 → 해당 doc **딥링크**(피처리스트=네비). | react-day-picker | `intro.md`, FeatureGrid |
| D14 | value-pillar(correctness/timezone)별 **라이브 데모로 증명** 1개씩(이미 HeroDemo 자산 재사용). | MUI value-pillar 데모, React Aria 주석 hero | 랜딩 컴포넌트 |

> ⚠️ comparison 랜딩·블로그 announcement·외부 홍보 카피는 **범위 밖**(2026-06-18 결정). D13/D14는 사이트 내부 네비/이해도 개선이지 마케팅 모먼트가 아니다.

---

## 4. 권장 실행 순서

```
1차(P0): D1 Anatomy → D2 styling/data-attr 표 → D3 a11y 키보드 표+APG
2차(P1): D4 유스케이스 레시피 → D7 timezone 트러블슈팅 → D5 View source → D6 훅 Context 표
3차(P2): D8 pm 탭 → D9 라인 하이라이트 → D10 import → D11 Copy Page/llms.txt → D12 RTL 데모
4차(P3, 선택): D13 딥링크 → D14 pillar 데모
```

근거: P0 3개가 "헤드리스 + composition + 정확성"이라는 kalyx thesis를 문서에서 가장 직접적으로 증명하는 격차다. P1은 평가자가 복붙·신뢰하게 만드는 전환 레버. P2는 마찰 제거(저비용 일괄). P3은 여력 시.

---

## 5. 비범위 / 주의

- **런타임/번들 변경 없음.** 모든 항목 docs-site 한정. (`data-*` 표 작성 중 실제 컴포넌트에 누락된 data-attr 발견 시 → 별도 1.0.x 이슈로 분리, 본 플랜에서 코드 수정 금지.)
- **i18n(한국어) docs 번역**은 별도 트랙(§14 B8)과 정합. 본 플랜의 신규 페이지는 영문 기준, KO 번역은 후속.
- **검증**: 각 PR에서 `pnpm --filter docs-site build` 통과 + 기존 컴포넌트 테스트(PickerGrid/Playground/Hero 등) 유지.
