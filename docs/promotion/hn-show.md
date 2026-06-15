# Hacker News — Show HN

## Title (80 char limit, strict)

**Show HN: kalyx – headless React DatePicker, 7 primitives, no CSS, ≤16 KB gzip**

(79 chars — count before posting. HN auto-prepends "Show HN:" if you don't but it counts toward the limit either way.)

## URL field

`https://kalyx-docs-site.vercel.app`

Not the GitHub repo. HN ranks Show HN higher when the URL is the product itself.

## Text field (HN comment, first thing readers see)

```md
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
```

## Common HN comment patterns + drafts

**"Why not contribute to react-day-picker?"**
> I considered it. react-day-picker's scope is explicitly "calendar grid" — the maintainer has stated they're not adding Input/Popover/TimePicker. So adding those upstream wasn't on the table; the alternative was to layer kalyx on top, which is what react-datepicker effectively does. I wanted to keep the headless guarantee end-to-end, so I started fresh.

**"What about timezone X?"**
> The picker stores ISO-8601 UTC strings. Display timezone is a separate prop (`displayTimezone="..."`). DST transitions are handled via `date-fns-tz` under the hood. Civil-midnight math is unit-tested in the timezone util module. Specific repro welcome.

**"How do I customize the look without CSS imports?"**
> Every primitive accepts a `classNames` prop with named slots (e.g., `daySelected`, `dayToday`, `dayOutsideMonth`, `headerNavButton`). You wire Tailwind, CSS Modules, or whatever you already use. The site's `/playground` lets you swap classNames live.

**"Why react 19?"**
> RSC. `useId` for SSR-stable IDs, no `useLayoutEffect` warnings, the form-action integration on Inputs. Back-porting would mean carrying compatibility shims I don't want to maintain on a one-person project.

## Don't say

- "Anthropic" or "Claude" — HN penalizes anything that smells like LLM-assisted launch theater. The code is the code.
- "Disruptive", "next-gen", "modern". HN reads these as red flags.
- Don't argue with downvoted comments — they sink the post.

## Post timing

Tue/Wed 22:30 KST = US 06:30 PT. That's the empirically-best HN window. Don't post on Friday (US weekend dead zone) or Sunday night.

## After posting

- Reply within 30 min to every top-level comment. HN's algorithm weights early author engagement heavily.
- Don't ask friends to upvote — HN's shadow-detect punishes this hard.
- If the post falls off the front page within 2 hours, don't resubmit the same URL for 30 days.
