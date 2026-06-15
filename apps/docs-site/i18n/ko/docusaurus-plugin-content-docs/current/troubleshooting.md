---
id: troubleshooting
title: Troubleshooting
sidebar_position: 8
---

# Troubleshooting

Common issues and how to fix them.

## Installation

### `Cannot find module '@kalyx/react'`

Make sure you have the correct peer dependencies installed:

```bash
pnpm add @kalyx/react react react-dom
```

Kalyx requires **React 19+**. Check your version:

```bash
pnpm list react
```

### TypeScript errors after install

Kalyx ships its own `.d.ts` files. If you see type errors, ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler" // or "node16" / "nodenext"
  }
}
```

The legacy `"node"` resolution mode doesn't support `package.json` `exports` — upgrade to `"bundler"` or `"node16"`.

---

## SSR / Next.js

### `useLayoutEffect` warning in Next.js

Kalyx does **not** use `useLayoutEffect`. If you see this warning, it's from another library in your tree. Kalyx uses only `useEffect` and `useId` for SSR safety.

### `ReferenceError: window is not defined`

This should never happen with Kalyx components — all `window`/`document` access is inside `useEffect`. If you encounter it:

1. Check that you're using `@kalyx/react` (not importing from `@kalyx/core` directly in a server component)
2. Ensure you're not destructuring Kalyx components in a Server Component file — wrap them in a Client Component:

```tsx title="components/MyDatePicker.tsx"
'use client';

import { DatePicker } from '@kalyx/react';

export function MyDatePicker() {
  return (
    <DatePicker>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

### Hydration mismatch

If you see a hydration mismatch, check:

- Are you using `displayTimezone`? The server and client must resolve the same timezone. Avoid relying on the system timezone — always pass an explicit IANA zone string.
- Are you conditionally rendering based on `new Date()`? The server timestamp differs from the client's. Use `defaultValue` instead of computing a value during render.

---

## Popover / Positioning

### Popover appears in the wrong position

Kalyx uses [Floating UI](https://floating-ui.com/) with `flip` and `shift` middleware. If the popover is mispositioned:

1. **Check for `overflow: hidden` on ancestors** — Floating UI detects overflow boundaries. A parent with `overflow: hidden` can clip or misposition the popover.
2. **Check CSS transforms on ancestors** — `transform` creates a new containing block, which can offset `position: fixed` elements.
3. **In a modal/dialog?** — The popover renders as a sibling, not a portal. If your modal clips overflow, the popover may be clipped.

### Popover doesn't close on outside click

This can happen if an element calls `event.stopPropagation()` before the click reaches the document listener. Check your modal or dropdown wrappers.

---

## Timezone

### Selected date is off by one day

This is the most common timezone confusion. When you store a UTC ISO string like `"2026-04-15T00:00:00.000Z"` and display it in a timezone like `Asia/Seoul` (UTC+9), the displayed date is April 15 — but if the value was `"2026-04-15T15:00:00.000Z"`, that's April 16 in Seoul.

**Fix:** Use `displayTimezone` to ensure correct display, and always let `onChange` handle the value — it emits civil midnight in the display timezone:

```tsx
<DatePicker
  value={value}
  onChange={setValue}
  displayTimezone="Asia/Seoul"
>
  ...
</DatePicker>
```

### DST transition causes unexpected behavior

During DST transitions (e.g., US "spring forward"), 2:00 AM doesn't exist. Kalyx handles this internally with two-pass offset correction. If you're doing manual timezone math, use `@kalyx/core`'s `startOfDayInTimezone` instead of computing midnight yourself.

---

## Styling

### Components have no styles at all

This is by design — Kalyx is headless. You must provide styles via `classNames` props or `className`. See the [Tailwind recipe](./recipes/tailwind.md) for a complete example.

### `classNames` prop doesn't work

Make sure you're passing an object, not a string:

```tsx
// ❌ Wrong — className (string) only applies to the root element
<DatePicker.Calendar className="my-calendar" />

// ✅ Right — classNames (object) targets internal slots
<DatePicker.Calendar
  classNames={{
    root: 'my-calendar',
    day: 'my-day',
    daySelected: 'my-day-selected',
  }}
/>
```

Both `className` (root element) and `classNames` (slots) are supported. Use `classNames` when you need to style internal elements.

---

## Forms

### Value is not submitted with the form

In uncontrolled mode, pass a `name` prop to `DatePicker.Root`:

```tsx
<DatePicker name="startDate" defaultValue="2026-04-15T00:00:00.000Z">
  <DatePicker.Input name="startDate" />
  ...
</DatePicker>
```

### react-hook-form integration

See the dedicated [React Hook Form recipe](./recipes/react-hook-form.md).

---

## Performance

### Calendar re-renders on every state change

This is normal — the calendar grid is lightweight (~42 cells). If you're experiencing jank:

1. Profile with React DevTools — check if the re-render is actually slow
2. Avoid creating new objects on every render in parent components:

```tsx
// ❌ Creates a new array on every render
<DatePicker disabled={[{ dayOfWeek: [0, 6] }]}>

// ✅ Stable reference
const DISABLED = [{ dayOfWeek: [0, 6] }] as const;
<DatePicker disabled={DISABLED}>
```

### Bundle size seems larger than expected

Kalyx's `@kalyx/react` is ~15 KB gzipped (CI ceiling 16 KB). If your bundle is larger:

1. Check that tree-shaking is working — only import what you use
2. `date-fns` is a dependency and adds ~5KB for the functions Kalyx uses. If you already use date-fns in your app, the cost is shared.
3. Run `pnpm check-bundle` in the Kalyx repo to verify

---

## Still stuck?

- [기존 이슈](https://github.com/jiji-hoon96/kalyx/issues) 검색
- [버그 리포트](https://github.com/jiji-hoon96/kalyx/issues/new?template=bug_report.yml) 작성
- [기능 요청](https://github.com/jiji-hoon96/kalyx/issues/new?template=feature_request.yml) 보내기
- [Discussions](https://github.com/jiji-hoon96/kalyx/discussions)에서 질문하기
