# Social Copy Drafts: @kalyx/react (stable, 1.4.x)

> **게시 전 확인 사항.** 자동 게시 금지. 초안이며, 사용자가 확인 후 직접 게시.
>
> 1. 게시 직전 버전 확인: `npm view @kalyx/react version` (2026-09-17 작업 트리 기준 `@kalyx/react` 1.4.7, `@kalyx/core` 1.4.8). DST 문구는 `@kalyx/core` 1.4.8 의 수정에 기대므로 `npm view @kalyx/core version` 이 1.4.8 이상인지도 본다(react 1.4.7 이 core 를 `^` 범위로 받으므로 새 설치는 1.4.8 을 받는다)
> 2. 번들 수치 확인: `pnpm build && pnpm check-tree-shaking`. 카피는 이 스크립트의 **소비자 번들 수치**를 쓴다.
>    - 무엇을 재나: esbuild 로 minify 하고 `@kalyx/core`·`@kalyx/adapter-date-fns`·`@floating-ui/react` 까지 함께 묶은 뒤(react, react-dom 만 external) Node zlib 기본 레벨로 gzip 한 크기.
>    - 2026-09-17 실측: DatePicker 하나 **18.90 KB**, TimePicker 하나 16.36 KB, 일곱 종 전부 + 훅 **25.65 KB**.
>    - README 배지의 ~19.5 KB(라벨 `gzip (dist file, deps external)`, `pnpm check-bundle`, 2026-09-17 실측 19.50 KB)는 다른 양이다. `packages/react/dist/index.js` 한 파일의 gzip 이고 위 세 의존성을 외부 import 로 남긴다. README 의 Bundle 절이 두 숫자를 같은 기준으로 나란히 설명한다. 이 값을 경쟁 라이브러리의 bundlephobia 류 수치(의존성 포함)와 나란히 놓으면 틀린 비교가 되므로 카피에는 쓰지 않는다.
>    - 수치가 바뀌면 아래 카피의 "~19 KB" / "~26 KB" 를 함께 갱신.
> 3. 경쟁 라이브러리 비교 금지. 크기 비교는 측정 조건이 다르면 성립하지 않고, "headless 계열은 캘린더 그리드까지만 낸다"는 서술은 사실이 아니다(Ark UI·React Aria 는 범위, 날짜+시간을 headless 로 낸다). 차별점을 말해야 하면 아래 셋으로 한정한다.
>    - 값 모델: ISO 8601 UTC 문자열로 주고받는다(Ark UI·React Aria 는 `@internationalized/date` 객체).
>    - 목록형 TimePicker: `TimePicker.HourList`·`MinuteList` 가 `role="listbox"` 로 골라 찍는 입력이다.
>    - Month·Year·Week 피커가 DatePicker 와 같은 composition API 에 있다.
>
>    두 경쟁 라이브러리에 대한 서술은 2026-09-16 공식 문서 기준이다. 게시 직전 다시 연다.
> 4. 데모 미디어: `img/demos/*.avif` (X에는 gif/mp4 변환 필요)
> 5. 첨부 추천: DatePicker + RangePicker 데모 2장 (과장 없이 실사용 화면)

---

## X / Twitter (EN)

Kalyx: seven headless React pickers (date, range, time, date+time, month, year, week) under one composition API. Values go in and out as ISO 8601 UTC strings, never Date objects. Zero CSS.

~19 KB gzip for one DatePicker with its deps bundled, ~26 KB for all seven.

`pnpm add @kalyx/react`

Docs → https://kalyx-docs-site.vercel.app

---

## X / Twitter (KO)

Kalyx. 날짜·범위·시간·날짜+시간·월·연·주 7종 Headless React 피커를 하나의 조합형 API로. 값은 Date 객체가 아니라 ISO 8601 UTC 문자열로 주고받는다. CSS 없음.

DatePicker 하나를 의존성까지 묶으면 ~19 KB gzip, 7종 전부 ~26 KB.

`pnpm add @kalyx/react`

문서 → https://kalyx-docs-site.vercel.app/ko

---

## LinkedIn (EN)

@kalyx/react 1.4.x is the current stable line: seven date-related pickers (single date, range, time, date+time, month, year, week) under one headless composition API.

- Values in and out are ISO 8601 UTC strings. The display timezone is a separate opt-in prop, so stored values don't depend on the viewer's zone
- DST gaps and overlaps follow Temporal's `'compatible'` policy, tested against temporal-polyfill for every 2020-2045 transition in every IANA zone the runtime supports
- Hours and minutes can be picked from listbox lists
- Zero CSS. Style it with Tailwind, shadcn/ui or plain CSS
- Bundle, minified with deps included and React external: ~19 KB gzip for one DatePicker, ~26 KB for all seven. Pickers you don't import are tree-shaken
- SSR-safe: every picker has a renderToString test
- date-fns by default; dayjs and Luxon adapters for the headless entry · TypeScript strict · jest-axe checks in the component tests

MIT licensed. Docs and playground: https://kalyx-docs-site.vercel.app

---

## Reddit (r/reactjs): 제안 톤

**Title:** Kalyx: headless React date pickers that take and return ISO strings (7 pickers, zero CSS)

**Body skeleton:**

1. 문제 제기. 경쟁 라이브러리의 약점이 아니라 우리가 겪은 문제에서 시작한다. `new Date(2026, 3, 15)` 를 서울에서 만들어 저장하면 서버에는 4월 14일(UTC 15:00)로 들어간다. 그래서 어떤 경계에서도 `Date` 를 받지 않고 UTC ISO 문자열만 주고받기로 했다. 표시 타임존은 값과 분리된 `displayTimezone` prop 이다
2. Kalyx 접근. 조합형(dot 표기) API, ISO 문자열 입출력 계약, date-fns 기본 어댑터(dayjs·luxon 어댑터는 `@kalyx/react/headless` 와 함께 쓴다). 기존 headless 라이브러리와의 차이를 말하려면 「게시 전 확인 사항」 3번의 세 가지로만 좁힌다
3. 실측 수치. 측정 조건을 문장에 함께 적는다. "esbuild minify, deps bundled, React external, gzip: one DatePicker ~19 KB, all seven ~26 KB. Reproduce with `pnpm check-tree-shaking`." 게시 전 재측정
4. 정확성 근거 한 줄. DST 겹침·공백 처리를 2020~2045 전 존의 전환 전체에 대해 temporal-polyfill 과 대조하는 테스트가 있고, `@kalyx/core` 1.4.8 이 이 대조로 드러난 84개 존의 겹침 시각 결함을 고쳤다. 고친 결함을 감추지 않고 쓴다
5. 데모: https://kalyx-docs-site.vercel.app/playground
6. StackBlitz 체험: https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic?file=src%2FApp.tsx (같은 형식으로 `examples/` 의 7종: datepicker-basic, datepicker-rhf, datepicker-shadcn, datepicker-tailwind, datetimepicker-timezone, rangepicker-presets, timepicker-12h)
7. 마무리. "피드백 환영합니다" + issues/discussions 링크

> 톤 유의: 라이브러리 오너 1인칭 결정형 톤. "우리는 ~했다" / "선택지를 명확히 보여준다". AI 권유 톤("여러분도 꼭 써보세요!") 금지. "finally complete", "유일한", "가장 가벼운" 같은 완결·최상급 주장은 쓰지 않는다.
