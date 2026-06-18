# dev.to teaser article

## Title

Every React DatePicker forced a tradeoff. I built one that doesn't.

## Tags

#react #typescript #opensource #showdev

## Canonical URL

https://kalyx-docs-site.vercel.app/blog/introducing-kalyx-1-0

## Cover image

`apps/docs-site/static/img/og-hero.png` (re-export to ≥ 1000×420 for dev.to hero)

## Body

> **TL;DR** — I built [kalyx](https://kalyx-docs-site.vercel.app), a headless React DatePicker that ships 7 primitives (Date, Range, Time, DateTime, Month, Year, Week) under one Composition API. No CSS imports. 15.63 KB gzip. React 19+.
>
> `pnpm add @kalyx/react`

---

## The gap

For the past year I kept hitting the same wall.

Every React DatePicker I tried on npm picked one of these tradeoffs:

| Library | What it gets right | What it forces |
|---|---|---|
| **react-day-picker** (41.7M/wk) | Beautifully headless | Calendar grid only — I write Input, Popover, TimePicker myself |
| **react-datepicker** (4.7M/wk) | All primitives bundled | CSS import required; runs on native `Date`; props surface > 100 |
| **Ark UI** | Composition pattern | Removed TimePicker in v3 |
| **React Aria** | Spec-grade a11y | Locked to `@internationalized/date` |
| **Headless UI** | The headless pioneer | They declined to ship one |

None of them gave me _all_ of: headless **and** every primitive **and** small bundle **and** zero CSS coupling.

## What kalyx is

kalyx 1.0 is the union:

- **react-day-picker's headless philosophy** — every primitive is a Context + headless component you style with `classNames` slots
- **react-datepicker's primitive set** — 7 of them, including the TimePicker Ark dropped
- **shadcn's composition pattern** — dot-notation subcomponents, no props-explosion config object
- **A bundle ceiling I actually enforce** — 16 KB gzip, CI fails if a PR pushes it over. Currently 15.63 KB.

```tsx
<DateTimePicker value={iso} onChange={setIso} format="24h">
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar
      classNames={{
        daySelected: 'bg-violet-600 text-white',
        dayToday: 'ring-2 ring-violet-400',
        dayOutsideMonth: 'opacity-40',
      }}
    />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

ISO-8601 strings in and out. No native `Date` objects in props. `displayTimezone="Asia/Seoul"` for civil-midnight math. SSR-safe on Next.js App Router (CI verifies).

## The honest parts

1.0 shipped a week ago. The API is frozen. The user base is tiny — you'll be one of the first people hitting any edge case. I'm one person. The roadmap is published.

If you need 100K-deploy stability today, [react-datepicker](https://www.npmjs.com/package/react-datepicker) is still the safer call. kalyx is the bet on a smaller, headless future.

## Want the full story?

**[Read the full "Introducing Kalyx 1.0" post on the docs site →](https://kalyx-docs-site.vercel.app/blog/introducing-kalyx-1-0)**

It covers the API design choices in depth, the bundle work, the timezone model, and the year of "build vs. compose existing" deliberation that preceded the rewrite.

---

If you build forms in React, try it:

- **npm**: `pnpm add @kalyx/react`
- **Docs**: https://kalyx-docs-site.vercel.app
- **Repo**: https://github.com/jiji-hoon96/kalyx
- **Discussions**: https://github.com/jiji-hoon96/kalyx/discussions

I'd genuinely value your feedback — what's missing, what's awkward, what you broke.
