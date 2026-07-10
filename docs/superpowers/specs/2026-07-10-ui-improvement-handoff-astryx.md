# Handoff — UI 개선 이니셔티브: 컴포넌트 샘플 UI · 문서 · 데모 · 공식문서 UI (2026-07-10)

> **다음 세션이 이어받을 작업 컨텍스트.** 이 세션에서 데모 녹화 파이프라인 + 문서 데모 삽입 + Playground UI 개선까지 마쳤고, 다음 세션은 이를 발판으로 **공식문서(docs-site) 전반의 UI를 Astryx 기반 디자인 시스템으로 끌어올리는 것**이 목표다.

---

## 0. 다음 세션 목표 (사용자 의도)

> "컴포넌트의 샘플 UI와 문서와 데모의 UI 등을 개선하면서 공식문서의 UI도 같이 개선한다. 요즘 [Astryx](https://astryx.atmeta.com/)에 관심이 많다."

즉 세 층을 **하나의 일관된 디자인 언어**로 묶는 작업:
1. **컴포넌트 샘플 UI** — docs 페이지의 코드 예제/live 예제가 보여주는 스타일
2. **데모 UI** — `kalyx-demo`가 녹화하는 피커 테마 (`kalyx-demo/src/theme.css`)
3. **공식문서 UI** — docs-site(Docusaurus) 자체의 레이아웃·색·타이포·컴포넌트 크롬

**북극성:** Astryx의 토큰 구조와 디폴트를 *출발점*으로 삼아 Kalyx docs 전반에 적용. 단, Kalyx는 **이미 디자인 결정이 일부 존재**(아래 §3)하므로 그것을 존중·확장한다(Astryx로 덮어쓰지 않는다).

---

## 1. Astryx 요약 (astryx.atmeta.com 확인 결과)

- **정체**: Meta의 오픈소스 디자인 시스템. React + **StyleX** 기반. 현재 Beta. Meta 내부에서 8년간 13,000+ 앱에 사용.
- **차별점 3축**: (1) **fully customizable / no dependencies**, (2) **agent-ready** (CLI + MCP로 스캐폴딩·테마 생성·agent-ready docs), (3) **token-driven + theme-able** (color/spacing/type/elevation/motion/shape 토큰, 내장 dark mode).
- **표면**: Docs · Components(160+) · Templates(ready-to-ship) · Themes(브랜드 맞춤) · Playground · Blog · Changelog · Community.
- **최근 릴리즈** (v0.1.3, 2026-07-04): Table 컨텍스트 메뉴(plugin), 전체 WAI-ARIA 키보드 패턴, InputGroup composition.
- **랜딩 UI 특징** (벤치마크 포인트): 실제 제품 목업(watch/backpack/croissant 커머스)으로 컴포넌트를 "맥락 속에서" 시연, 큰 히어로 타이포, 테마 스위칭 데모, AI 채팅/인벤토리/대시보드 등 **복합 화면 템플릿**을 스크롤 스토리로 노출.
- **팔레트 감각**: neutral surface + 절제된 accent, 큼직한 여백/라운드, 제품 사진 카드.

### Kalyx에 적용 시 시사점
- Astryx는 **StyleX**라 Kalyx(zero-CSS headless + Docusaurus + Tailwind Play CDN)와 스택이 다르다 → **토큰/스케일/원칙만 차용**하고 구현은 Kalyx 스택으로.
- "맥락 속 시연"(Astryx의 커머스 목업)은 Kalyx docs에도 이식 가치 큼 — 지금 데모는 playground 스크린 녹화라 실제 폼/예약 UI 맥락이 없다. 다음 세션에서 **use-case 맥락 데모**(예: 예약 폼, 대시보드 날짜 필터)를 고려.
- Astryx의 **Themes 페이지**(브랜드별 테마 미리보기)는 Kalyx가 "zero-CSS라 어떤 스타일도 가능"을 보여줄 강력한 포맷.

---

## 2. 활용할 스킬 — `design-system` (Astryx 기반, 이미 설치돼 있음)

- **실체**: `~/Desktop/dev-hub/skills/engineering/design-system/` (SKILL.md + SKILL.ko.md).
- **성격**: `disable-model-invocation: true` (user-invoked) — **자동 발동 안 됨**. 다음 세션에서 **명시적으로 로드**해야 한다.
  - opencode: `.opencode/commands/design-system.md` 심볼링크가 있으면 `/design-system <요청>`, 없으면 SKILL.md 절대경로를 Read로 직접 읽어 적용.
  - 이 레포엔 아직 command 심볼링크 없음 → 필요 시 `ln -sfn ~/Desktop/dev-hub/commands/design-system.md .opencode/commands/design-system.md`.
- **스킬 핵심 원칙**: design → implement → review 3단계. **"이미 존재하는 디자인 시스템은 그것이 이긴다 — Astryx로 덮지 말고 확장하라."** (Kalyx는 아래 §3처럼 부분적으로 존재.)
- **references** (SKILL.md가 상황별로 가리킴): `astryx-foundations.md`(토큰 디폴트), `design-system-spec-template.md`(토큰 스펙 문서 템플릿), `anti-slop-and-review.md`(리뷰 루브릭), `docs-template-guide.md`, `stacks.md`. 한/영 쌍 존재.

**주의**: 이 스킬은 `~/.config/opencode/skills/`에 **전역 설치돼 있지 않다**(회사 레포 보호 목적, AGENTS.md 명시). 그래서 자동 스캔되지 않는다. 반드시 경로로 직접 로드.

---

## 3. Kalyx의 기존 디자인 결정 (존중·확장 대상)

덮어쓰지 말 것. 다음 세션은 이 어휘를 채택해 확장한다.

- **핵심 팔레트 = indigo `#5b4fe1`** (primary). docs-site `apps/docs-site/src/css/custom.css` `:root`에 Docusaurus infima 변수로 정의:
  - light primary `#5b4fe1`, dark primary `#8b80ff` (+ dark/darker/light/lighter 스케일).
- **데모 테마** (`kalyx-demo/src/theme.css`): cool-neutral surface + **indigo `#4f46e5`** accent, 라이트/다크 `--kx-*` 토큰(`--kx-bg/fg/muted/border/hover/accent/accent-soft/radius/shadow/focus`). ⚠️ 데모(`#4f46e5`)와 docs-site(`#5b4fe1`) accent가 **미세하게 다름** — 다음 세션에서 **하나로 정렬**할지 결정 (통일 권장).
- **Playground 테마** (이 세션에서 추가): `apps/docs-site/src/components/Playground/classNamesByPicker.ts`의 Tailwind 디폴트가 indigo-600 + slate neutral. Tailwind Play CDN config(`apps/docs-site/static/js/tailwind-config.js`)는 `primary: #5b4fe1`, `important: '.tw-enable'`, `preflight: false`.
- **Docusaurus infima** 변수(`--ifm-color-*`)가 docs-site 전반의 실제 소스. Astryx 토큰을 이식하려면 이 변수 레이어에 매핑하는 게 정석.

**즉 Kalyx의 사실상 디자인 토큰은 3곳에 흩어져 있다**(custom.css infima / demo theme.css / playground tailwind). 다음 세션 초반에 **단일 토큰 소스로 수렴**시키는 게 첫 과제 후보(design-system 스킬의 "Design" 단계 + `design-system-spec-template.md` 활용).

---

## 4. 이 세션에서 완료한 것 (커밋 안 됨 — working tree)

### 4-1. 데모 녹화 파이프라인 신규 — `kalyx-demo/` (untracked, 자립형)
- Playwright(TS)로 라이브 playground(`https://kalyx-docs-site.vercel.app/playground`)의 7종 피커를 자동 조작·녹화 → ffmpeg로 WebM(VP9) + 애니메이션 AVIF(libsvtav1) 산출.
- **부모 모노레포와 분리**: 자체 `pnpm-workspace.yaml`(빈 packages)로 독립 워크스페이스. `pnpm-workspace.yaml`의 `packages: [packages/*, apps/*, examples/*]`엔 미포함이라 안전.
- 구조: `src/selectors.ts`(모든 셀렉터/설정 — ARIA role 기반, 라이브 DOM 검증됨), `src/demo.ts`(오케스트레이션 + 7종 플로우), `src/theme.css`(데모 전용 주입 CSS), `scripts/encode.sh`(WebM+AVIF, `TRIM`/`CROP`/`AVIF_ENCODER` env), `setup.sh`, `README.md`.
- **핵심 함정 3개 해결** (다음 세션이 데모를 다시 돌릴 때 반드시 알 것):
  1. **headless라 raw로 녹화되는 문제**: Kalyx는 zero-CSS라 스타일 안 입히면 브라우저 기본 버튼으로 찍힘 → `theme.css`를 페이지에 주입. `THEME=none`이면 raw.
  2. **CSS가 아예 안 먹던 진짜 버그**: `page.addInitScript(함수)`의 인라인 함수를 **tsx/esbuild가 트랜스파일하며 브라우저 컨텍스트에서 깨뜨려** 조용히 no-op. → `addInitScript`에 **함수 대신 순수 문자열 스크립트**(`JSON.stringify`로 CSS 임베드) + `addStyleTag` 런타임 폴백으로 해결.
  3. **초반 unstyled flash**: 로딩·하이드레이션 구간이 녹화 앞에 찍힘 → `ensureStyled()`가 입력의 `border-radius≥4px` 적용을 대기한 시점을 `<picker>.trim` 사이드카에 기록 → `encode.sh`가 그만큼 앞을 트림. 결과 클립은 처음부터 styled.
- ffmpeg 환경: 이 머신은 `libaom-av1` 없고 **`libsvtav1`만** 있음 → encode.sh가 자동 감지. AVIF 애니메이션 정상(116~160 프레임 확인).
- 산출물 검증 완료: 7종 WebM 36~48K / AVIF 40~57K, 첫 프레임 styled 확인.

### 4-2. 문서에 데모 삽입 (tracked 파일 수정)
- **자산 배치**: `img/demos/*.avif`(+webm), `apps/docs-site/static/img/demos/*.avif` — 두 위치 복사.
- **docs-site 컴포넌트 페이지 7개(en)** + **i18n/ko 7개**: 제목/설명 아래 `<figure><img ...avif>` + "Styling shown is demo-only — Kalyx ships zero CSS." 캡션.
- **intro.md (en+ko)**: "See it in action / 직접 확인해보세요" 반응형 그리드 갤러리(7종).
- **루트 README.md / README.ko.md**: Components 섹션에 3×3 데모 표(상대경로 `./img/demos/*.avif`).
- ⚠️ MDX 함정 회피 완료(AGENTS.md 기록된 한글 heading+`{#id}` / 콜론 이슈 없음). docs-site **en+ko 빌드 성공** 검증.

### 4-3. Playground UI 개선 (tracked 파일 수정)
- **원인**: Playground는 classNames 라이브 에디터인데 기본값이 빈 문자열이라 raw로 보였음(버그 아님, 에디터 목적상 의도적이었으나 첫인상 나쁨).
- **해결**: `classNamesByPicker.ts`의 7종 전 필드를 **Tailwind 디폴트**(indigo-600 + slate, cool-neutral)로 채움. 사용자가 지우거나 고쳐 실시간 확인 가능 + 복붙 레시피 역할.
- `PreviewPanel.tsx`: (a) preview 컨테이너에 **`tw-enable`** 추가(Tailwind Play CDN이 `important:'.tw-enable'`로 스코프돼 이 래퍼 안에서만 유틸 동작 — 이거 없으면 클래스 안 먹음), (b) TimePicker/Month/Year/Week/DateTimePicker 프리뷰가 하드코딩 `kx-live-*` 버리고 **에디터 classNames를 실제 사용**하도록 수정.
- `seedProject.ts`: "Open in StackBlitz" 내보내기 `index.html`에 Tailwind Play CDN 추가(내보낸 프로젝트도 동일 렌더).
- 검증: Playground 유닛 13개 통과(axe 포함), docs-site en+ko 빌드 성공, 실제 렌더 스크린샷으로 styled 확인.

---

## 5. 미해결 / 다음 세션이 결정할 것

1. **토큰 단일화**: accent가 데모 `#4f46e5` vs docs-site/tailwind `#5b4fe1`로 갈림. 하나로 통일하고(권장: `#5b4fe1`) 단일 토큰 소스 정립. → design-system 스킬 "Design" + `design-system-spec-template.md`.
2. **커밋 전략**: 현재 전부 working tree(커밋 안 함). 논리 단위 분리 제안:
   - `feat(demo): add Playwright picker demo recorder (kalyx-demo)` — kalyx-demo/ 전체
   - `docs: embed recorded picker demos in component pages, intro, README` — 문서 + img/demos + static/img/demos
   - `feat(docs-site): style Playground with Tailwind defaults` — Playground 3파일
   - changeset **불필요**(docs/example만, `.changeset/config.json`에서 `docs`·`@kalyx-example/*` ignore). 단 Playground는 `apps/docs-site`(private 0.0.x)라 publish 무관.
   - main 보호(1명 승인 필요) — PR 필요, release류 아니라 `--admin` 불필요.
3. **docs-site 자체 UI 개선 범위 확정**: 랜딩(`src/pages/index.tsx`)·컴포넌트 페이지 레이아웃·Themes 페이지 신설 여부 등. Astryx의 "맥락 속 시연"·"Themes 미리보기" 포맷 이식 검토.
4. **알려진 무해 이슈**: `apps/docs-site/src/pages/index.tsx:9` `JSX namespace` tsc 에러 — **사전부터 존재**, CI Type Check는 다른 tsconfig로 통과(AGENTS.md 기록). 이 세션 변경과 무관.
5. **데모 재생성 시**: `cd kalyx-demo && bash setup.sh && pnpm demo`. 특정 피커만: `ONLY=datepicker pnpm record`. 프리뷰만 크롭: `CROP="620:420:560:180" WIDTH=560 pnpm encode datepicker`. 다크 테마: `COLOR_SCHEME=dark`.

---

## 6. 다음 세션 착수 체크리스트

```
□ 이 핸드오프 정독
□ design-system 스킬 로드 (경로 직접 Read 또는 /design-system command 심볼링크)
□ Kalyx 기존 토큰 3소스(custom.css / demo theme.css / playground tailwind) 실사 → 단일화 결정
□ Astryx foundations(references/astryx-foundations.md) 대조 → 채울 갭 식별
□ 작업 범위 확정 (컴포넌트 샘플 / 데모 테마 / docs-site 크롬 중 어디부터)
□ 커밋 아직 안 됨 — 커밋 전략(§5-2) 사용자와 합의
□ 변경마다 docs-site en+ko 빌드로 검증 (pnpm --filter docs-site build)
```
