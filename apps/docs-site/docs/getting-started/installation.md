---
id: installation
title: Installation
sidebar_position: 1
---

# Installation

Kalyx is distributed as two packages. Most apps install only `@kalyx/react` — it re-exports what you need from `@kalyx/core`.

## Requirements

| Requirement | Version |
| --- | --- |
| React | `^19.0.0` |
| React DOM | `^19.0.0` |
| Node | `>= 20` |
| TypeScript (optional) | `>= 5.5` |

## Install

```bash npm2yarn
npm install @kalyx/react
```

`@kalyx/react` depends on:

- `@kalyx/core` — platform-independent date logic.
- `@floating-ui/react` — SSR-safe popover positioning.
- `date-fns` — default date engine, wired in through `@kalyx/adapter-date-fns`.

These are installed automatically. Timezone handling does not add a dependency —
`displayTimezone` is built on the platform's own `Intl.DateTimeFormat`.

## TypeScript

Kalyx is written in strict TypeScript. Type declarations ship inside the package — no `@types/*` needed.

```tsx
import type {
  DatePickerRootProps,
  DatePickerCalendarClassNames,
  ISODateString,
  DateRange,
} from '@kalyx/react';
```

## Verify

```tsx
import { DatePicker } from '@kalyx/react';

export default function Hello() {
  return (
    <DatePicker defaultValue="2026-04-15T00:00:00.000Z">
      <DatePicker.Input />
    </DatePicker>
  );
}
```

If TypeScript compiles and the page renders an input, you're done.

## Next

- [Quick Start →](./quick-start)
- [Composition API →](../concepts/composition)
