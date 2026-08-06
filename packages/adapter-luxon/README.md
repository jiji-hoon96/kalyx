# @kalyx/adapter-luxon

> A `DateAdapter` for [Kalyx](https://github.com/jiji-hoon96/kalyx) built on **luxon** (UTC mode). Drop-in replacement for the bundled date-fns adapter — same contract, your existing luxon dependency.

[![npm](https://img.shields.io/npm/v/@kalyx/adapter-luxon?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/adapter-luxon)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Already shipping luxon? Use this adapter with `@kalyx/react/headless` and skip bundling date-fns entirely.

## Install

```bash
pnpm add @kalyx/adapter-luxon luxon
```

`@kalyx/core` is both this package's runtime dependency and its peer compatibility boundary, so it is installed with the adapter. Add `@kalyx/core` to your own dependencies as well if your application imports its utilities directly. When you use `@kalyx/react/headless`, `@kalyx/react` already supplies its own core dependency.

## Usage

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { LuxonAdapter } from '@kalyx/adapter-luxon';

<DatePicker adapter={LuxonAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

All values in and out are **ISO 8601 UTC strings**. The adapter pins luxon to UTC for calendar math; IANA timezone display (`displayTimezone`) is handled by `@kalyx/core`'s Intl-based utilities, so luxon's own zone machinery is never engaged.

## Conformance

Verified against the shared adapter contract via [`@kalyx/core/test-helpers`](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — the same suite that validates [`@kalyx/adapter-date-fns`](https://www.npmjs.com/package/@kalyx/adapter-date-fns) and [`@kalyx/adapter-dayjs`](https://www.npmjs.com/package/@kalyx/adapter-dayjs).

## Documentation

- [Adapters guide](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — swapping adapters, writing your own
- [Full docs](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko)

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
