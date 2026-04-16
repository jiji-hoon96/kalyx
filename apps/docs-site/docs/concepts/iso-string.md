---
id: iso-string
title: ISO 8601 UTC strings
sidebar_position: 2
---

# ISO 8601 UTC strings

Every Kalyx value — `value`, `defaultValue`, `onChange`'s argument, every item in a `DateRange` — is an ISO 8601 UTC string or `null`. Never a `Date` object.

```ts
type ISODateString = string; // e.g. "2026-04-15T00:00:00.000Z"
```

## Why not `Date`?

`Date` objects are mutable, timezone-ambiguous, and serialize inconsistently. The classic bug:

```ts
// User in Seoul picks April 15
const picked = new Date(2026, 3, 15); // "2026-04-14T15:00:00.000Z" in KST 🤦

// Save to DB
await save(picked);

// Read back from DB in a UTC server
new Date(picked.toISOString()).getDate(); // 14 — off by one
```

ISO strings eliminate the ambiguity at the boundary:

```tsx
<DatePicker
  value="2026-04-15T00:00:00.000Z"  // always UTC midnight
  onChange={(iso) => save(iso)}      // always a UTC string
/>
```

Kalyx guarantees:

1. Dates are stored as **UTC midnight** (`T00:00:00.000Z`) unless a time is explicitly set.
2. `onChange` never fires with a `Date` — only a string or `null`.
3. Internal arithmetic uses the [`DateAdapter`](./adapters.md) which is UTC-safe end to end.

## Displaying in local time

The value is UTC. **Display** is a rendering concern — handled by `displayFormat` and `locale` on each root:

```tsx
<DatePicker
  value={iso}
  onChange={setIso}
  displayFormat="MMM d, yyyy"
  locale="en-US"
/>
```

Under the hood, the adapter formats the UTC instant using the requested locale.

## Converting to and from `Date`

When you must bridge to a `Date` — for example, in a legacy form library — do it at the edge:

```ts
// Date → ISO
const iso = new Date(2026, 3, 15).toISOString();
// → "2026-04-14T15:00:00.000Z"  (still KST-affected!)

// Safer: construct a UTC midnight directly
const iso = new Date(Date.UTC(2026, 3, 15)).toISOString();
// → "2026-04-15T00:00:00.000Z"

// ISO → Date
const date = new Date(iso);
```

For fine-grained conversion Kalyx exports helpers from `@kalyx/core`:

```ts
import { normalizeISO, parseInputValue, DateFnsAdapter } from '@kalyx/react';

normalizeISO('2026-04-15');           // "2026-04-15T00:00:00.000Z"
parseInputValue('15/04/2026', 'dd/MM/yyyy', DateFnsAdapter); // → ISO or null
```

## Times and time zones

`TimePicker` and `DateTimePicker` also return ISO strings. The date part of a pure `TimePicker` value is a stable placeholder — consume only the time fields (`getTime(iso)` in `@kalyx/core` helps).

Full IANA time-zone display (e.g., rendering "2026-04-15T00:00:00Z" as `"2026-04-15 09:00 KST"`) lands in v0.4. Until then, treat display formatting as your application's responsibility.

## Next

- [Adapters →](./adapters.md)
- [SSR safety →](./ssr.md)
