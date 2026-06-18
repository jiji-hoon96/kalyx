# Hacker News — Show HN (fact-locked 2026-06-18, for v1.0.3)

> Claims verified against the 2026-06-17 competitive spec + current bundle.
> DO NOT revert to the older copy — it claimed react-datepicker #1018 is "still
> open" (it was closed as docs-only "not a bug" Nov 2025) and "Ark removed
> TimePicker" (it never shipped a standalone one). Both are HN-fact-checkable.

## Title

Show HN: Kalyx – 7 headless React date pickers, no CSS, ≤16 KB gzip

## URL

https://kalyx-docs-site.vercel.app

## Text

I went through every React date picker on npm last year and kept hitting the same wall: you get to pick one of {headless, all the primitives, small bundle, no CSS} — never all of them.

- react-day-picker (41.7M/wk) — genuinely headless, but it's the Calendar grid only. You still wire your own Input, Popover, and TimePicker.
- react-datepicker (4.7M/wk) — has every primitive, but ships a stylesheet as a side effect and still uses the native `Date` as its value type. (9.1.0 added an optional `timeZone` prop behind date-fns-tz; the long-running timezone issue #1018 was closed as "expected `Date` behavior," not fixed.)
- Ark UI — no standalone TimePicker; time only exists through @internationalized/date inside the DatePicker.
- React Aria — complete, but you have to adopt @internationalized/date. If your codebase is on date-fns, that's a migration.
- Headless UI — has declined to ship one (the discussion's been open since 2021).

So I built Kalyx to be the thing I wanted: react-day-picker's headless philosophy + react-datepicker's breadth of primitives + shadcn-style composition.

1.0 ships seven primitives — Date / Range / Time / DateTime / Month / Year / Week — under one Composition API. No CSS imports (style via `classNames` + `data-*`). SSR-safe (Next.js App Router tested). ISO-8601 UTC strings in and out, with a separate `displayTimezone` — so no native `Date` ever crosses the API boundary.

```tsx
<DateTimePicker value={iso} onChange={setIso} displayTimezone="Asia/Seoul">
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar classNames={{ daySelected: 'bg-violet-600' }} />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

The date library is behind a small adapter interface — `@kalyx/adapter-date-fns` ships in 1.0; dayjs/luxon/Temporal adapters are next. There's a headless entry (`@kalyx/react/headless`) with zero date-library dependency for bring-your-own.

It's ~15.8 KB gzip against a 16 KB ceiling I enforce in CI — for context, MUI X is ~58 KB gzip and its Range/Time-Range pickers need a commercial Pro license. The flip side: my margin is down to ~150 bytes, so every new feature has to earn its place or the ceiling moves on purpose.

Honest caveats:
- 1.0 is ~10 days old. The public API is frozen, but the user base is still tiny — I'd rather say that than fake traction.
- React 19+ only.
- Gregorian calendar only; no React Native adapter yet.

Happy to get into the composition-vs-props decision, the timezone/DST model (non-existent civil times in spring-forward gaps snap forward; ambiguous fall-back times resolve deterministically), or the bundle work.

Docs: https://kalyx-docs-site.vercel.app
Repo: https://github.com/jiji-hoon96/kalyx

## First comment (post immediately after, HN convention)

A bit more on the two decisions people usually push back on:

**Why composition instead of props.** react-datepicker's surface is north of 100 props because every feature (time select, month dropdown, custom header, excluded dates…) is a prop. That doesn't compose — combinations interact and the type surface explodes. Kalyx inverts it: the Root holds state, and you assemble the parts you want (`<Picker.Calendar/>`, `<Picker.HourList/>`). The cost is a few more lines of JSX; the payoff is no "showTimeSelect + timeFormat + minTime" matrix to learn.

**Why ISO strings, not Date.** A `Date` is an instant plus the runtime's local zone, which is exactly the ambiguity that makes date pickers leak timezone bugs. Kalyx's value is always a UTC ISO-8601 string and display is a separate `displayTimezone`, so the value you store and the value you render can't silently disagree. The DST edges are the interesting part: a civil time that doesn't exist (2:30am on a spring-forward day) snaps forward to the post-transition instant instead of silently landing an hour early, and ambiguous fall-back times pick the earlier offset deterministically.

Things I'd genuinely like feedback on: the adapter interface shape (before I commit dayjs/luxon to it), and whether the headless entry is the right split or if it should be the default.

## Posting checklist

- [ ] Post Tue–Thu, ~16:00–18:00 UTC (≈ 01:00–03:00 KST). Avoid weekends.
- [ ] Be at the keyboard for the next 2–3 hours to answer every comment fast.
- [ ] DO NOT ask anyone to upvote (fastest way to get killed).
- [ ] Post the "First comment" yourself within a minute of submitting.
- [ ] If it doesn't catch (stays off the front page), HN allows a re-post weeks later — don't force it.
- [ ] Have the docs demo + comparison page loading fast (HN hug of death).
