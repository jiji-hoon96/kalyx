# Handoff — Kalyx UI 개선 이니셔티브 이어가기 (2026-07-10 저녁 세션 종료)

> **다음 세션이 이어받을 컨텍스트.** 이 세션에서 디자인 토큰 단일화 → 랜딩 전면 재디자인 → 비주얼 패스(깊이·질감·타이포·모션) → 데모 테마 정렬까지 했다. 다음 세션은 **데모 클립 7종을 하나씩 이미지로 리뷰하며 디테일 수정 요청**을 받는 것부터 시작한다.

---

## 0. 지금 상태 (한눈에)

- **브랜치**: `feat/unify-design-system` (main 아님!). working tree clean.
- **PR**: [#170](https://github.com/jiji-hoon96/kalyx/pull/170) — **OPEN, MERGEABLE, CI 전부 통과**, 승인 대기 중. 아직 머지 안 됨.
- **커밋 스택** (위→아래 최신순, 전부 이 브랜치):
  - `f9c0eb2` chore(demo): 데모 테마를 랜딩 비주얼 언어로 정렬 + 7종 재생성
  - `e306537` feat(docs-site): landing visual pass — depth, texture, scale, motion
  - `496559a` feat(docs-site): interactive style-switch demo + honest stat strip
  - `135d65e` feat(docs-site): drop landing gradients + swap mascot logo
  - `9e40ad0` docs(agents): 2026-07-10 오후 세션 로그 (디자인 토큰 단일화 PR #170)
  - `ddcf2b9`/`25f18e0`/`c0313ab` — 토큰 단일화 3커밋 (오후, PR #170 초기)
- **changeset 불필요** (docs/example only, `@kalyx/react` 무변경). **release 아니라 `--admin` 불필요**(1명 승인 보호).

## 1. 바로 할 일 (다음 세션 시작점)

사용자 요청: **"데모 클립 7종을 하나씩 이미지로 띄워달라 → 디테일 수정 요청하겠다."**

- 7종: `datepicker rangepicker timepicker datetimepicker monthpicker yearpicker weekpicker`
- **AVIF는 로컬 ffmpeg가 애니메이션 1프레임만 디코드**한다(함정). 정지 프레임 확인은 반드시 **WebM 후반 프레임**으로:
  ```bash
  cd kalyx-demo
  d=$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 out/<picker>.webm)
  # 캘린더/팝오버가 열려 있는 구간을 잡아야 함. datepicker/monthpicker는 후반이면 팝오버가 닫혀 입력만 보임.
  # 열린 프레임: datepicker~2.2s, monthpicker~2.0s, yearpicker~2.0s, weekpicker~2.4s, datetimepicker~0.6*dur, timepicker~0.7*dur
  ffmpeg -y -ss <t> -i out/<picker>.webm -frames:v 1 -update 1 /tmp/<picker>.png
  ```
  그런 다음 Read 툴로 `/tmp/<picker>.png`를 첨부해 사용자에게 보여준다.
- **움직이는 실물**을 보려면 갤러리 HTML을 이미 만들어 뒀다: `kalyx-demo/out/preview.html` (WebM/AVIF 토글 + 다크 패널 토글, 7종 자동재생). `out/`은 gitignore라 커밋 안 됨. 서버:
  ```bash
  npx serve kalyx-demo/out -l 4712   # http://localhost:4712/preview.html
  ```

## 2. 데모 스타일이 사는 곳 (수정 대상)

- **`kalyx-demo/src/theme.css`** — 녹화 시 페이지에 주입되는 데모 전용 테마. **라이브러리엔 없음**(@kalyx/react는 zero-CSS). 여기가 데모 시각의 단일 소스.
  - 현재 반영된 것(이번 세션): 선택 셀/시간옵션/AM-PM에 **accent glow**(`--kx-glow`), popover/list에 **layered shadow + hairline accent border**(`--kx-hairline`) + 큰 radius(`--kx-radius-card:16px`, `--kx-radius:10px`), preview-panel 배경에 **radial wash + dot-grid**(`::before`/`::after`), accent `#5b4fe1`(dark `#8b80ff`), neutral=slate.
  - 셀렉터는 **ARIA role + data-\* 상태**만 타겟 (headless 계약). `[data-testid='preview-panel']` 스코프 + popover는 `[role='dialog'][aria-label]` 전역.
- **재생성 파이프라인**: `cd kalyx-demo && pnpm demo` (record→encode). 특정 하나만: `ONLY=timepicker pnpm record && pnpm encode timepicker`. 다크: `COLOR_SCHEME=dark`. `DEMO_URL` 기본=라이브 vercel playground지만 **주입 theme.css가 색을 지배**(`[data-selected]{…!important}`)라 라이브 미배포와 무관하게 로컬 theme.css가 반영됨.
- **함정**: 녹화 후 반드시 두 위치에 복사 — `cp out/*.avif out/*.webm ../img/demos/`(README) + `cp out/*.avif ../apps/docs-site/static/img/demos/`(docs). ffmpeg는 `libsvtav1`만 있음(libaom 없음), encode.sh가 자동 감지.

## 3. 이번 세션에서 한 것 (전체)

### 3-1. 디자인 토큰 단일화 (오후, 커밋 ddcf2b9 등)
accent가 두 indigo(`#5b4fe1` docs vs `#4f46e5` demo/playground)로 갈렸던 것 → **accent `#5b4fe1`, neutral=slate**로 3소스 수렴. 스펙: `docs/superpowers/specs/2026-07-10-kalyx-design-system.md`. **Scope boundary**: 렌더 표면만 통일, 복붙 코드예제(`recipes/tailwind.md`·`hooks/*.md`·`quick-start.mdx`·`SameJsxBlock` 코드 문자열)의 `indigo-600`은 표준 Tailwind로 유지.

### 3-2. 랜딩 재디자인 (저녁, 커밋 135d65e / 496559a / e306537)
사용자 피드백 "식상하다/올드하다" → TanStack 벤치마크로:
- **slop 제거**: WhyKalyx 보라 그라디언트 카드 → accent rule 카드; Hero titleAccent 그라디언트 텍스트 → solid indigo.
- **로고**: 흐린 mascot PNG → `apps/docs-site/static/img/kalyx-logo.svg`(캘린더 마크). config의 logo+favicon 교체.
- **StatStrip** 신설(`src/components/StatStrip/`): 정적 사실 4개(7 primitives·≤16KB·0 CSS·WCAG AA) + 라이브 fetch 2개(npm 월 다운로드·GitHub 스타, 실패 시 `—`). **실제 수치**(스타 7·월 1k) — 과장 안 함(사용자 결정).
- **SameJsxBlock** 재구성(`SameJsxDemo.tsx` 신설): 정적 코드 3개 → **인터랙티브 비대칭 2열 스타일 스위처**. 좌 탭+코드, 우 **실제 DatePicker가 탭 전환 시 리스킨**(Tailwind/shadcn/plain). BrowserOnly+lazy로 SSG 격리.
- **비주얼 패스**: custom.css에 비주얼 토큰(`--kx-elev-1/2`, `--kx-elev-accent`, `--kx-accent-tint`, `--kx-hairline`, `--kx-dot`, `--kx-radial` — light+dark). Hero 타이포 clamp 4.5rem + 배경 radial wash+dot-grid + CTA glow, HeroDemo 위젯 elevation+glow border. 모든 카드 flat→layered shadow+hover glow. 섹션 5rem→7rem. `<Reveal>` 래퍼(`src/components/Reveal/`)로 scroll-in fade/slide(IntersectionObserver, SSR-safe 기본 visible, reduced-motion 완전 비활성).

### 3-3. 데모 테마 정렬 (저녁, 커밋 f9c0eb2)
위 §2의 theme.css 개선 + 7종 재생성 + 두 위치 반영. (이 세션 마지막 작업.)

## 4. 검증 상태
- docs-site vitest **55 pass**(axe 포함: StatStrip·SameJsxBlock 탭전환·FeatureGrid 등).
- `pnpm --filter docs-site build` **en+ko 성공**. `pnpm typecheck`+`pnpm lint` pass.
- **PR #170 CI 전부 통과** (Type Check, Test 20/22, Build, Docs Site Build, Bundle Size, SSR Safety, Lint, Vercel).
- 로컬 검증 서버(이 세션 중 띄움, 다음 세션엔 없을 수 있음): docs `npx serve -s apps/docs-site/build -l 4711`, 갤러리 `npx serve kalyx-demo/out -l 4712`.

## 5. 함정·주의 (다음 세션 반드시 알 것)
1. **docs-site 테스트는 레포 루트에서** 실행: `pnpm vitest run apps/docs-site/...`. `apps/docs-site` 안에서 돌리면 `test/setup.ts` 못 찾음.
2. **`apps/docs-site/src/pages/index.tsx` JSX namespace tsc 에러는 사전 존재·무해**. CI Type Check는 별도 tsconfig로 통과. 내 변경과 무관(import 추가로 라인번호만 밀림).
3. **AVIF 로컬 디코드 1프레임 한계** → 색/glow 검증은 WebM 프레임으로(§1).
4. **`kalyx-demo/`는 부모 모노레포와 분리된 자체 워크스페이스**. `out/`·`recordings/`는 gitignore. `theme.css`만 tracked.
5. **Vercel 프리뷰는 로그인 벽 뒤**(git 브랜치 프리뷰 보호). 화면 확인은 **로컬 프로덕션 빌드**로: `pnpm --filter docs-site build && npx serve -s apps/docs-site/build`.
6. **한글 heading + `{#custom-id}` MDX 조합 금지**(acorn 파싱 에러로 ko 빌드 깨짐 — 과거 함정). docs 변경 시 `pnpm --filter docs-site build`로 en+ko 둘 다 검증.
7. `color-mix(in srgb, …)` 사용 중(FeatureGrid/custom.css) — 최신 브라우저 전제(docs 청중 OK), 빌드 통과.

## 6. 마무리 액션 (사용자가 정할 것)
- **PR #170 머지 여부**: CI 통과·MERGEABLE. 승인 후 머지 or 데모 디테일 수정까지 이 브랜치에 계속 쌓기. (지금까지 전부 한 PR에 누적 중.)
- **데모 디테일 수정**: 다음 세션의 주 작업. §1대로 하나씩 이미지로 보여주고 요청 수렴 → theme.css 수정 → 재생성 → 두 위치 반영 → 커밋.

## 7. 남은 열린 항목 (이니셔티브 백로그, 우선순위 낮음)
- Astryx "Themes 미리보기" 페이지(같은 피커를 여러 브랜드 토큰으로) — 토큰이 단일 소스라 저비용.
- Astryx "맥락 속 시연"(예약 폼/대시보드 use-case 데모).
- FeatureGrid 4열의 추가 비대칭화(지금은 SVG 아이콘+hover로 개선, 대칭 유지 — refine 판단).
