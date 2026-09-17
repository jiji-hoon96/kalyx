# Social Copy Drafts — @kalyx/react (stable, 1.4.x)

> **게시 전 확인 사항** — 자동 게시 금지. 초안이며, 사용자가 확인 후 직접 게시.
>
> 1. 게시 직전 버전 확인: `npm view @kalyx/react version`
> 2. 번들 수치 확인: `pnpm check-bundle` — README 배지와 같은 단일 측정원. 현재 기본 엔트리 약 19.5 KB gzip, CI 상한 20 KB. 수치가 바뀌면 아래 카피의 "~19.5 KB"를 함께 갱신.
> 3. 데모 미디어: `img/demos/*.avif` (X에는 gif/mp4 변환 필요)
> 4. 첨부 추천: DatePicker + RangePicker 데모 2장 (과장 없이 실사용 화면)

---

## X / Twitter (EN)

Kalyx ships all 7 date primitives — Date, Range, Time, DateTime, Month, Year, Week — under one headless React composition API. ~19.5 KB gzip, zero CSS, SSR-safe, ISO strings in/out.

`pnpm add @kalyx/react`

Docs → https://kalyx-docs-site.vercel.app

---

## X / Twitter (KO)

Kalyx — 7종 데이트 프리미티브(Date/Range/Time/DateTime/Month/Year/Week)를 하나의 Headless React 조합형 API로. ~19.5 KB gzip, CSS 제로, SSR 안전, ISO 문자열 입출력.

`pnpm add @kalyx/react`

문서 → https://kalyx-docs-site.vercel.app/ko

---

## LinkedIn (EN)

After months of composition-first API work, @kalyx/react v1.4 is out: seven date-related primitives — single date, range, time, date+time, month, year, week — under one headless composition API.

- ~19.5 KB gzip (CI-gated ≤ 20 KB), per-picker tree-shaking
- Zero CSS — bring your own styling (Tailwind, shadcn/ui, plain CSS)
- SSR-safe — Next.js App Router verified
- ISO 8601 UTC strings in/out; opt-in IANA timezone with DST handling
- date-fns / dayjs / Luxon adapters · TypeScript strict · WAI-ARIA + axe-clean

MIT, free forever. Try it: https://kalyx-docs-site.vercel.app

---

## Reddit (r/reactjs) — 제안 톤

**Title:** Kalyx — headless React date pickers (7 primitives), ~19.5 KB gzip, zero CSS

**Body skeleton:**

1. 문제 제기 — 통합형 픽커는 무겁거나 Pro 라이선스가 필요하고, headless 계열은 기능이 부분적 (calendar grid만, standalone TimePicker 부재 등)
2. Kalyx 접근 — 조합형(dot 표기) API + ISO 문자열 입출력 계약 + date-fns/dayjs/luxon 어댑터
3. 실측 수치 — ~19.5 KB gzip (게시 전 `pnpm check-bundle`로 재확인), 트리쉐이킹 실측 링크
4. 데모: https://kalyx-docs-site.vercel.app/playground
5. StackBlitz 체험: examples/ 디렉토리 GitHub embed URL
6. 마무리 — "피드백 환영합니다" + issues/discussions 링크

> 톤 유의: 라이브러리 오너 1인칭 결정형 톤. "우리는 ~했다" / "선택지를 명확히 보여준다" — AI 권유 톤("여러분도 꼭 써보세요!") 금지.
