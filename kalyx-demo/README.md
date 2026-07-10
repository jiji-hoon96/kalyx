# kalyx-demo — Playwright 데모 녹화기

[Kalyx](https://github.com/jiji-hoon96/kalyx)(`@kalyx/react`) headless 날짜 피커 7종을
Playwright로 자동 조작·녹화한 뒤, ffmpeg로 GitHub README/문서에 바로 넣을 수 있는
**WebM**과 **애니메이션 AVIF**로 최적화한다.

각 피커마다 개별 클립 하나씩(총 7개)을 만들어 README 표에 따로따로 임베드하기 좋다.

```
recordings/<picker>/<picker>.webm   # Playwright 원본(VP8, 1200×720)
        └─ encode.sh ─▶ out/<picker>.webm   # 최적화 VP9
                        out/<picker>.avif   # 애니메이션 AVIF
```

## 대상 피커 (7종)

`datepicker` · `rangepicker` · `timepicker` · `datetimepicker` · `monthpicker` · `yearpicker` · `weekpicker`

## 빠른 시작

```bash
cd kalyx-demo
bash setup.sh        # 의존성 + Chromium 설치, 출력 디렉토리 생성 (멱등)
pnpm demo            # 녹화 + 인코딩을 한 번에
```

또는 단계별로:

```bash
pnpm record          # 7종 전부 녹화 -> recordings/
pnpm encode          # recordings/의 모든 클립을 out/으로 인코딩
```

## 요구 사항

- Node ≥ 20, pnpm (없으면 setup.sh가 npm으로 폴백)
- **ffmpeg** — AV1 인코더(`libsvtav1` 또는 `libaom-av1`) 포함 빌드
  (`brew install ffmpeg`면 `libsvtav1` 포함). AVIF 뮤서 필요.

## 환경 변수

### 녹화 (`pnpm record`)

| 변수 | 기본값 | 설명 |
|---|---|---|
| `DEMO_URL` | `https://kalyx-docs-site.vercel.app/playground` | 데모 대상 URL |
| `ONLY` | (없음) | 한 피커만 녹화. 예: `ONLY=timepicker` |
| `COLOR_SCHEME` | `light` | `light` \| `dark` — 첫 페인트 테마 + 주입 CSS 팔레트 |
| `THEME` | `inject` | `inject`(데모 스타일 주입) \| `none`(raw headless 그대로) |
| `SLOWMO` | `120` | 모든 Playwright 액션에 적용되는 슬로모(ms) |
| `STEP_MS` | `700` | 데모 스텝 사이 기본 대기(ms) |
| `MOUSE_STEPS` | `25` | 커서 트위닝 스텝 수(클수록 부드러움) |

> **스타일 주입에 관해:** Kalyx는 설계상 **zero-CSS / headless**라, 아무것도
> 안 하면 브라우저 기본 버튼·인풋(테두리만 있는 회색)으로 렌더된다. README/문서
> 데모용으로 보기 좋게 하려고, 이 레코더는 녹화 직전 [`src/theme.css`](src/theme.css)를
> 페이지에 주입한다. 이 CSS는 대상 사이트 코드를 건드리지 않고 **Kalyx의 안정적인
> 계약(ARIA 역할 + `data-*` 상태 속성)에만** 걸린다 — 라이브러리 자체엔 이 CSS가
> 전혀 포함되지 않는다. 라이브러리의 진짜 raw 모습을 담으려면 `THEME=none`.

```bash
DEMO_URL=http://localhost:3000/playground ONLY=rangepicker COLOR_SCHEME=dark pnpm record
```

### 인코딩 (`pnpm encode [picker ...]`)

| 변수 | 기본값 | 설명 |
|---|---|---|
| `FPS` | `15` | 출력 프레임레이트 |
| `WIDTH` | `960` | 스케일 폭(px), 높이 자동 |
| `CRF` | `32` | WebM(VP9) 품질 — 낮을수록 고화질/대용량 |
| `AVIF_CRF` | `40` | AVIF 품질 |
| `TRIM` | (없음) | 앞부분 트림 시작(초). 미지정 시 녹화가 남긴 `<picker>.trim` 사이드카(페이지 로드·하이드레이션 구간)를 자동 사용 |
| `CROP` | (없음) | 스케일 전 크롭. ffmpeg `w:h:x:y`. 예: `CROP="620:420:560:180"` |
| `AVIF_ENCODER` | 자동 | AV1 인코더 강제 지정(`libsvtav1`/`libaom-av1`) |

> **처음부터 스타일된 클립 (flash 방지):** 녹화기는 (1) 페이지 첫 페인트 전에
> 테마 CSS를 주입하고(`addInitScript` — **함수가 아니라 문자열 스크립트**로 넘겨
> tsx/esbuild 트랜스파일에 깨지지 않게 함) + `addStyleTag` 런타임 폴백, (2) 피커가
> 실제로 스타일 적용될 때까지 대기한 시점을 `<picker>.trim` 에 기록한다. 인코딩은
> 이 지점부터 잘라내므로, 결과 클립은 **로딩 흰 화면이나 스타일 미적용 프레임 없이**
> 안정된 피커에서 시작한다.

특정 피커만, 프리뷰 패널만 확대해서 인코딩:

```bash
CROP="620:420:560:180" WIDTH=560 pnpm encode datepicker
```

## 셀렉터를 바꿔야 할 때

DOM에 의존하는 모든 값은 [`src/selectors.ts`](src/selectors.ts) 한 곳에 있다.
`demo.ts`는 건드리지 않고 이 파일만 고치면 된다.

Kalyx는 headless라 셀렉터는 클래스명이 아니라 **ARIA 역할**을 기준으로 한다
(라이브 playground에서 검증됨):

| 파트 | 셀렉터 |
|---|---|
| Input | `role="combobox"` (일부는 라벨, 예: "Date and time") |
| Popover | `role="dialog"` |
| Calendar | `role="grid"`, 날짜 `button:not([data-outside-month])` |
| Month/Year 셀 | `role="gridcell"` (월 전체 이름 / 4자리 연도) |
| TimePicker | `role="listbox"` "Hour"/"Minute", `role="option"`(aria-label "N hours"), `role="radiogroup"` AM/PM |
| Playground 전환 | `select[aria-label="Picker"]` (값: `datepicker` 등) |

playground는 한 번에 한 피커만 보여주고, `<select>`로 전환하며
`[data-testid="preview-panel"][data-picker="<id>"]` 안에 렌더한다.

## 새 피커/플로우 추가

`src/demo.ts`의 `FLOWS` 맵에 피커 id → async 함수를 추가한다. 각 함수는
`(page, preview)`를 받고, `preview`는 해당 피커로 스코프된 로케이터다.
기존 함수(예: `demoDatePicker`)를 복사해 고치면 된다.

## README 임베드 예시

WebM(`<video>`)과 AVIF(`<img>`) 모두 GitHub 마크다운에서 인라인 재생된다:

```html
<img src="./out/datepicker.avif" width="480" alt="DatePicker demo" />
```

```markdown
https://user-images.githubusercontent.com/.../datepicker.webm
```
(WebM은 이슈/PR에 드래그·드롭해 업로드하면 자동 임베드 URL이 생성된다.)

## 산출물 크기(참고)

기본 설정 기준 클립당 대략 **WebM 32–80KB / AVIF 48–68KB** — README에 넣기 충분히 작다.

## 디렉토리 구조

```
kalyx-demo/
├── setup.sh              # 의존성 + Chromium 설치
├── package.json          # record / encode / demo 스크립트
├── tsconfig.json
├── pnpm-workspace.yaml    # 부모 모노레포와 분리(자체 워크스페이스 루트)
├── src/
│   ├── selectors.ts      # 모든 셀렉터·설정 (여기만 고치면 됨)
│   ├── theme.css         # 데모 전용 주입 스타일 (라이브러리엔 미포함)
│   └── demo.ts           # 녹화 오케스트레이션 + 7종 플로우
├── scripts/
│   └── encode.sh         # ffmpeg WebM + 애니메이션 AVIF
├── recordings/           # Playwright 원본 (gitignore)
└── out/                  # 최적화 산출물 (gitignore)
```
