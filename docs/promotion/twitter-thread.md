# Twitter / X Thread

## 1/7 (attach og-hero.png · pin this tweet)

I shipped kalyx 1.0 today — a headless React DatePicker with 7 primitives bundled into one Composition API.

No CSS imports. SSR-safe. 15.63 KB gzip at a 16 KB ceiling.

The thing every React DatePicker forced me to choose between, all in one library 👇

https://kalyx-docs-site.vercel.app

## 2/7

Every React DatePicker I tried last year forced a tradeoff:

• react-day-picker — headless, but Calendar grid only
• react-datepicker — has primitives, but ships CSS + native Date
• Ark UI — removed TimePicker in v3
• React Aria — locked to @internationalized/date
• Headless UI — declined to ship one

## 3/7

kalyx is the union:

react-day-picker's headless philosophy
 + react-datepicker's primitives
 + shadcn's composition pattern
 + the TimePicker Ark dropped

Date · Range · Time · DateTime · Month · Year · Week — all under one Composition API. Bring your own CSS.

## 4/7 (attach code screenshot)

The API:

<DateTimePicker value={iso} onChange={setIso}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar classNames={{...}} />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>

That's it.

## 5/7

What I committed to in the README:

• Zero CSS imports
• ≤ 16 KB gzip (currently 15.63)
• SSR-safe on Next.js App Router
• ISO-8601 strings in/out — no native Date
• date-fns adapter included, others swappable
• WAI-ARIA + keyboard nav in every primitive

CI enforces every line of this.

## 6/7

What 1.0 isn't:

• Battle-tested at scale — shipped 7 days ago, user base is small
• React 18 — sorry, 19+ only (RSC, useId, no useLayoutEffect)
• React Native — web only for now

If you need 100K-deploy-stability today, react-datepicker is still the safer call. kalyx is the bet.

## 7/7

If you build forms in React, I'd value 5 minutes of your time:

→ try `pnpm add @kalyx/react`
→ break it, open an issue
→ tell me what's missing

Docs: https://kalyx-docs-site.vercel.app
Repo: https://github.com/jiji-hoon96/kalyx
Discussions: https://github.com/jiji-hoon96/kalyx/discussions

RTs appreciated.
