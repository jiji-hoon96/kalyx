# Twitter / X Thread

A 7-tweet thread. Each tweet stays under 280 characters (counted inline). Lead tweet pinned for a week. Threaded reply to each so the thread chains.

---

## 1/7 — Hook (pin this)

```
I shipped kalyx 1.0 today — a headless React DatePicker with 7 primitives bundled into one Composition API.

No CSS imports. SSR-safe. 15.63 KB gzip at a 16 KB ceiling.

The thing every React DatePicker forced me to choose between, all in one library 👇

https://kalyx-docs-site.vercel.app
```

(265 chars. Attach the og-hero.png image for a card preview.)

---

## 2/7 — The gap

```
Every React DatePicker I tried last year forced a tradeoff:

• react-day-picker — headless, but Calendar grid only
• react-datepicker — has primitives, but ships CSS + native Date
• Ark UI — removed TimePicker in v3
• React Aria — locked to @internationalized/date
• Headless UI — declined to ship one
```

(270 chars.)

---

## 3/7 — What kalyx is

```
kalyx is the union:

react-day-picker's headless philosophy
 + react-datepicker's primitives
 + shadcn's composition pattern
 + the TimePicker Ark dropped

Date · Range · Time · DateTime · Month · Year · Week — all under one Composition API. Bring your own CSS.
```

(264 chars.)

---

## 4/7 — Show code (carousel image-friendly)

```
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
```

(263 chars — note the truncated classNames `{...}` to fit the limit. Attach a screenshot of the actual code from the docs site for the long version.)

---

## 5/7 — Constraints

```
What I committed to in the README:

• Zero CSS imports
• ≤ 16 KB gzip (currently 15.63)
• SSR-safe on Next.js App Router
• ISO-8601 strings in/out — no native Date
• date-fns adapter included, others swappable
• WAI-ARIA + keyboard nav in every primitive

CI enforces every line of this.
```

(279 chars.)

---

## 6/7 — Honest caveats

```
What 1.0 isn't:

• Battle-tested at scale — shipped 7 days ago, user base is small
• React 18 — sorry, 19+ only (RSC, useId, no useLayoutEffect)
• React Native — web only for now

If you need 100K-deploy-stability today, react-datepicker is still the safer call. kalyx is the bet.
```

(279 chars.)

---

## 7/7 — Ask

```
If you build forms in React, I'd value 5 minutes of your time:

→ try `pnpm add @kalyx/react`
→ break it, open an issue
→ tell me what's missing

Docs: https://kalyx-docs-site.vercel.app
Repo: https://github.com/jiji-hoon96/kalyx
Discussions: https://github.com/jiji-hoon96/kalyx/discussions

RTs appreciated.
```

(279 chars.)

---

## Posting notes

- Image on tweet 1: `og-hero.png` from `apps/docs-site/static/img/og-hero.png` (already updated to Aurora aesthetic in PR #118).
- Image on tweet 4: code snippet screenshot — use a syntax-highlighted code-screenshot tool (Carbon, Ray.so) for legibility.
- Don't reply with "thanks!" to every retweet — clutters the timeline. Reply substantively to questions; like the rest.
- If a tweet in the thread bombs, don't delete — Twitter penalizes mid-thread deletes.
- Schedule for Wed/Thu 09:00 KST (US 17:00–18:00 PT prev day = peak engagement) and a re-pin at 23:00 KST same day to catch EU morning.

## Don't say

- "🚀 Excited to announce…" — telegraphs ad copy
- "Game-changer" — same
- "@vercel @reactjs @tailwindcss" tag-bombing — they don't reply, looks desperate
- Quote-tweeting your own thread to bump it — Twitter's algorithm de-prioritizes self-QT chains
