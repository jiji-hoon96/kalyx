---
id: ssr
title: SSR safety
sidebar_position: 3
---

# SSR safety

Kalyx is designed for server rendering. It runs in Next.js App Router, Pages Router, Remix, and any environment that calls `renderToString`.

## What Kalyx does

- **Stable IDs** via React's `useId()` — matches between server and client.
- **No `window`/`document` at module scope.** All DOM access is inside `useEffect`.
- **No `useLayoutEffect`** in hot paths — avoids the SSR warning.
- **Floating UI** handles positioning with its SSR-safe `useFloating` hook.

In short: importing `@kalyx/react` on a server is safe.

## Usage with Next.js App Router

Kalyx components use React Context and interactivity, so they must render in a **client component**.

```tsx
// app/booking/date-field.tsx
'use client';

import { useState } from 'react';
import { DatePicker, type ISODateString } from '@kalyx/react';

export function DateField() {
  const [date, setDate] = useState<ISODateString | null>(null);

  return (
    <DatePicker value={date} onChange={setDate}>
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
```

Then consume it from a server component:

```tsx
// app/booking/page.tsx
import { DateField } from './date-field';

export default function Page() {
  return (
    <main>
      <h1>Book a date</h1>
      <DateField />
    </main>
  );
}
```

## RSC (React Server Components)

Kalyx components themselves are client components — the `'use client'` boundary belongs in your wrapper, not in Kalyx. Typical pattern:

```tsx
// components/ui/date-field.tsx
'use client';
export { DatePicker } from '@kalyx/react';
```

Import from your own boundary module to keep the `'use client'` directive consolidated.

## Uncontrolled rendering on the server

In SSR, the initial render has no user interaction yet. Start with either `defaultValue` or `value={null}`:

```tsx
{/* Uncontrolled — good for forms */}
<DatePicker name="checkIn" defaultValue="2026-04-15T00:00:00.000Z">
  <DatePicker.Input />
</DatePicker>

{/* Controlled with null — good for optional fields */}
<DatePicker value={null} onChange={setDate}>
  <DatePicker.Input />
</DatePicker>
```

## Hydration caveats

If your `displayFormat` or `locale` differ between server and client (for example, reading `navigator.language` at render time), you'll see hydration mismatches. Determine the locale **before** rendering:

```tsx
// Read locale from cookies / session server-side
<DatePicker locale={cookieLocale} value={iso} onChange={setIso}>
  ...
</DatePicker>
```

Avoid reading `navigator`, `window.matchMedia`, or `Intl.DateTimeFormat().resolvedOptions()` in the render body. Read them inside `useEffect` and defer rendering if needed.

## Testing SSR

Add a smoke test that mirrors production rendering:

```ts
import { renderToString } from 'react-dom/server';
import { DatePicker } from '@kalyx/react';

it('renders on the server without throwing', () => {
  const html = renderToString(
    <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
      <DatePicker.Input />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );
  expect(html).toContain('input');
});
```

## Next

- [Composition →](./composition.md)
- [Accessibility →](./accessibility.md)
