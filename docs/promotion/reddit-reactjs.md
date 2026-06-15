# Reddit r/reactjs

## Title (pick one)

- **A.** I built kalyx because every React DatePicker forced a tradeoff I didn't want to make
- **B.** kalyx 1.0 — headless DatePicker with the 7 primitives bundled (no CSS, ≤ 16 KB)
- **C.** Show /r/reactjs: kalyx — react-day-picker's headless philosophy + react-datepicker's primitives

> Pick A if you want comments. Pick B if you want clicks. Pick C if posting in a "Show" thread.

## Body

```md
TL;DR — `pnpm add @kalyx/react`. Docs: https://kalyx-docs-site.vercel.app · Repo: https://github.com/jiji-hoon96/kalyx

Every React DatePicker I tried last year forced a tradeoff:

- **react-day-picker** (11M/week) — beautifully headless, but it's a Calendar grid only. I still had to wire my own Input, my own Popover, my own TimePicker.
- **react-datepicker** (17.5M/week) — has the primitives, but imports a stylesheet I have to wrestle and runs on the native `Date` object (timezone bug #1018 has been open for years).
- **Ark UI** — almost there, but they removed TimePicker in v3 and didn't put it back.
- **React Aria** — fully featured, but I have to commit to `@internationalized/date`. My codebase already uses date-fns.
- **Headless UI** — they explicitly refused to ship one.

So I built kalyx to be the thing I wanted: react-day-picker's headless philosophy + react-datepicker's primitives + shadcn-style composition.

**What's in 1.0:**

- 7 primitives in one Composition API: `DatePicker`, `RangePicker`, `TimePicker`, `DateTimePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`
- Zero CSS imports — you bring your own className/Tailwind/CSS Modules
- SSR-safe (Next.js App Router tested in CI)
- date-fns adapter included, swap to dayjs/luxon/Temporal later via the adapter API
- Timezone-aware (`displayTimezone="Asia/Seoul"`), DST handled
- ISO-8601 strings in and out — no native `Date` objects in props
- WAI-ARIA + keyboard navigation in every primitive (axe clean)
- **15.63 KB gzip** at the 16 KB ceiling I committed to

**What it looks like:**

```tsx
<DateTimePicker value={iso} onChange={setIso} format="24h">
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar classNames={{ daySelected: 'bg-violet-600' }} />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

**Honest caveats:**

- 1.0 shipped 7 days ago. The API is frozen but the user base is tiny — you'll be one of the first people hitting any edge case.
- React 19+ only. RSC is the priority; I'm not back-porting to 18.
- No React Native adapter yet. Web only.

Happy to take pointed questions on the design choices — composition vs. props, why date-fns and not just-Date, the 16 KB ceiling, anything.
```

## Reply playbook

- **"How is this different from shadcn's calendar?"** → shadcn uses react-day-picker under the hood, so you still get Calendar-only. kalyx ships the other 6 primitives in the same composition style.
- **"Why not just use Ark?"** → Ark dropped TimePicker. If you can ship a DatePicker without time selection on a SaaS app, sure — most apps can't.
- **"react-datepicker works fine"** → For most use cases, yes. The bundle and the CSS coupling are the tradeoffs. If neither hurts your app, stay where you are.
- **"Is this maintained?"** → 1.0 is the freeze line. I'm one person. The roadmap is in `ROADMAP.md` (link). Adapter packages for dayjs/luxon are the next priority.

## Don't say

- "Better than X" — let the reader decide.
- "Production-ready" — let downloads speak.
- "Easy to use" — show the code instead.
