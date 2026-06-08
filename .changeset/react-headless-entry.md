---
"@kalyx/react": minor
---

Add `@kalyx/react/headless` entry for adapter-explicit usage. Default `@kalyx/react` entry continues to auto-inject the date-fns adapter — no breaking change. Use the headless entry to opt out of the bundled date-fns and provide your own adapter (dayjs, luxon, custom). See [Adapters guide](https://kalyx-docs.vercel.app/docs/guides/adapters).
