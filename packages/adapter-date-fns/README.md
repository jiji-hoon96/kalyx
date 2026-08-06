# @kalyx/adapter-date-fns

> The default `DateAdapter` for [Kalyx](https://github.com/jiji-hoon96/kalyx), built on **date-fns v4**. UTC-safe — timezone work is delegated to `@kalyx/core`'s Intl-based utilities.

[![npm](https://img.shields.io/npm/v/@kalyx/adapter-date-fns?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/adapter-date-fns)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

**You usually don't need to install this directly** — `@kalyx/react`'s main entry bundles it and injects it automatically. Install it yourself only when you use `@kalyx/react/headless` (no auto-injected adapter) or `@kalyx/core` standalone.

## Install

```bash
pnpm add @kalyx/adapter-date-fns date-fns
```

`@kalyx/core` is both this package's runtime dependency and its peer compatibility boundary, so it is installed with the adapter. Add `@kalyx/core` to your own dependencies as well if your application imports its utilities directly. When you use `@kalyx/react/headless`, `@kalyx/react` already supplies its own core dependency.

## Usage

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DateFnsAdapter } from '@kalyx/adapter-date-fns';

<DatePicker adapter={DateFnsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

All values in and out are **ISO 8601 UTC strings** (`"2026-01-15T00:00:00.000Z"`) — the adapter never leaks `Date` objects or local-time arithmetic into your app. Calendar math (`addDays`, `addMonths`, `addYears`) runs in UTC to stay DST-proof.

## Conformance

Verified against the shared adapter contract via [`@kalyx/core/test-helpers`](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — the same suite that validates [`@kalyx/adapter-dayjs`](https://www.npmjs.com/package/@kalyx/adapter-dayjs) and [`@kalyx/adapter-luxon`](https://www.npmjs.com/package/@kalyx/adapter-luxon).

## Documentation

- [Adapters guide](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — swapping adapters, writing your own
- [Full docs](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko)

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
