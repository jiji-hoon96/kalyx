# @kalyx/adapter-dayjs

> A `DateAdapter` for [Kalyx](https://github.com/jiji-hoon96/kalyx) built on **dayjs** (UTC mode). Drop-in replacement for the bundled date-fns adapter — same contract, your existing dayjs dependency.

[![npm](https://img.shields.io/npm/v/@kalyx/adapter-dayjs?color=5b4fe1)](https://www.npmjs.com/package/@kalyx/adapter-dayjs)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)

Already shipping dayjs (Mantine, Ant Design, …)? Use this adapter with `@kalyx/react/headless` and skip bundling date-fns entirely.

## Install

```bash
pnpm add @kalyx/adapter-dayjs dayjs
```

Peer dependency: `@kalyx/core`.

## Usage

```tsx
import { DatePicker } from '@kalyx/react/headless';
import { DayjsAdapter } from '@kalyx/adapter-dayjs';

<DatePicker adapter={DayjsAdapter} value={iso} onChange={setIso}>
  <DatePicker.Input />
  <DatePicker.Popover>
    <DatePicker.Calendar />
  </DatePicker.Popover>
</DatePicker>
```

All values in and out are **ISO 8601 UTC strings**. The adapter runs dayjs in UTC mode (`dayjs.extend(utc)` is applied internally — you don't need to set it up); IANA timezone display (`displayTimezone`) is handled by `@kalyx/core`'s Intl-based utilities, so no dayjs timezone plugin is required.

## Conformance

Verified against the shared adapter contract via [`@kalyx/core/test-helpers`](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — the same suite that validates [`@kalyx/adapter-date-fns`](https://www.npmjs.com/package/@kalyx/adapter-date-fns) and [`@kalyx/adapter-luxon`](https://www.npmjs.com/package/@kalyx/adapter-luxon).

## Documentation

- [Adapters guide](https://kalyx-docs-site.vercel.app/docs/guides/adapters) — swapping adapters, writing your own
- [Full docs](https://kalyx-docs-site.vercel.app) · [한국어](https://kalyx-docs-site.vercel.app/ko)

## License

[MIT](https://github.com/jiji-hoon96/kalyx/blob/main/LICENSE)
