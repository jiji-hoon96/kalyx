# Hacker News — Show HN

## Title

Show HN: kalyx – headless React DatePicker, 7 primitives, no CSS, ≤16 KB gzip

## URL

https://kalyx-docs-site.vercel.app

## Text

Hi HN — I built kalyx after going through every React DatePicker on npm and finding the same pattern: pick one tradeoff (headless OR primitives OR small bundle OR no-CSS), never all four.

- react-day-picker is headless but only ships the Calendar grid. You wire your own Input, Popover, TimePicker.
- react-datepicker has every primitive but ships a stylesheet, runs on native `Date` (the timezone issue thread is from 2019 and still open), and the props surface is north of 100.
- Ark UI removed TimePicker in v3.
- React Aria forces `@internationalized/date` — incompatible with date-fns/dayjs codebases.
- Headless UI declined to ship one ("maintenance burden too high").

kalyx 1.0 ships seven primitives — Date / Range / Time / DateTime / Month / Year / Week — under one Composition API. No CSS imports. SSR-safe. 15.63 KB gzip at a 16 KB ceiling I enforce in CI. ISO-8601 strings in and out, no Date object wrangling.

```tsx
<DateTimePicker value={iso} onChange={setIso}>
  <DateTimePicker.Input />
  <DateTimePicker.Popover>
    <DateTimePicker.Calendar classNames={{ daySelected: 'bg-violet-600' }} />
    <DateTimePicker.HourList />
    <DateTimePicker.MinuteList step={15} />
  </DateTimePicker.Popover>
</DateTimePicker>
```

The date library is plugged in via a small adapter interface — `@kalyx/adapter-date-fns` ships in 1.0; dayjs/luxon/Temporal adapters are next. The headless entry (`@kalyx/react/headless`) carries zero date-library dependency for people who want to bring their own.

Honest caveats:
- 1.0 shipped a week ago. The API is frozen but the user base is tiny.
- React 19+ only.
- No React Native yet.

Bundle margin is 0.24 KB — every new feature has to justify itself against the ceiling. I'd rather hold the ceiling than ship a third "kitchen sink" picker.

Happy to answer specifics about the composition vs. props decision, the timezone model, or the bundle work.

Docs: https://kalyx-docs-site.vercel.app
Repo: https://github.com/jiji-hoon96/kalyx
