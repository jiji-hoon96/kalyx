# Track 1 PR-B — Per-Picker Sandbox Infrastructure

**Date:** 2026-06-11
**Status:** Approved (parent spec) — subset spec for implementation
**Track:** 1 (Visuals · Interactivity · Comparison) — PR #3 of 5
**Parent spec:** [`2026-06-09-track1-visuals-interactive-comparison-design.md`](./2026-06-09-track1-visuals-interactive-comparison-design.md) § B

## Context

Track 1 ships visual/interactive/comparison improvements to the docs site. PR-B is the biggest of the five (~1200 LoC across many files): it gives every picker docs page a real interactive sandbox via two parallel mechanisms — inline `live` code blocks (already-enabled Docusaurus theme, just needs scope extension) and full StackBlitz iframe embeds backed by 7 new `examples/` projects.

No code dependency on PR-C or PR-D. Independently shippable.

## Scope

**In:**

- **B.1** — Extend `apps/docs-site/src/theme/ReactLiveScope/index.tsx` to expose every public `@kalyx/react` export. After this, any `.md`/`.mdx` page can use ```` ```tsx live ```` blocks rendering real pickers.
- **B.2** — New component `apps/docs-site/src/components/StackBlitzEmbed.tsx`. Iframe + "Open in StackBlitz" link, props per parent spec § B.2.
- **B.2** — 7 new example projects under `examples/`:
  - `examples/datepicker-basic/`
  - `examples/datepicker-rhf/`
  - `examples/rangepicker-presets/`
  - `examples/timepicker-12h/`
  - `examples/datetimepicker-timezone/`
  - `examples/datepicker-tailwind/`
  - `examples/datepicker-shadcn/`
- Remove `examples/stackblitz-rc/` (stale RC-era artifact).
- Add an inline `tsx live` block to each of the 7 picker docs pages (`apps/docs-site/docs/components/<picker>.md`), placed below the intro and above the existing API table.
- Add a `<StackBlitzEmbed>` to each picker docs page referencing the corresponding example project (use `datepicker-basic` for DatePicker, etc.).
- Korean docs (`i18n/ko/docusaurus-plugin-content-docs/current/components/<picker>.md`) get the same `live` blocks and `<StackBlitzEmbed>` — example projects are language-agnostic, embed URLs are identical.
- New CI helper `scripts/check-stackblitz-urls.mjs` that returns HTTP status for each of the 7 embed URLs. Manual-run + can be wired into the existing E2E workflow as a follow-up (not in this PR).
- Workspace + pnpm config updates so the 7 `examples/*` packages are recognized as workspace packages and pass `pnpm typecheck` at the root.

**Out:**

- `<StackBlitzEmbed>` is a thin iframe + link wrapper. It does NOT use `@stackblitz/sdk` (that dep is owned by PR-C's `OpenInStackBlitz` button). Keeps PR-B and PR-C dep ownership clean.
- The `scripts/check-stackblitz-urls.mjs` cron wiring (nightly issue creation) is out of scope; the parent spec lists it as a separate follow-up.
- "Recipes" deep-dives on each picker page (deferred — current recipe content stays, only the live block + embed are added at the top of each page).
- Re-styling of existing docs pages.
- A `<LiveBlock>` wrapper component on top of Docusaurus's built-in — the built-in already works once the scope is extended.

## Architecture

### File tree

```
apps/docs-site/
├── src/
│   ├── theme/
│   │   └── ReactLiveScope/
│   │       └── index.tsx                      ← edit: expose @kalyx/react
│   └── components/
│       └── StackBlitzEmbed/
│           ├── index.tsx                      ← iframe + link
│           ├── StackBlitzEmbed.module.css
│           └── __tests__/StackBlitzEmbed.test.tsx
├── docs/components/
│   ├── datepicker.md                          ← edit: add live + embed
│   ├── rangepicker.md                         ← edit
│   ├── timepicker.md                          ← edit
│   ├── datetimepicker.md                      ← edit
│   ├── monthpicker.md                         ← edit
│   ├── yearpicker.md                          ← edit
│   └── weekpicker.md                          ← edit
└── i18n/ko/docusaurus-plugin-content-docs/current/components/
    └── (same 7 files)                         ← edit: mirror live + embed

examples/
├── datepicker-basic/
│   ├── package.json
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       └── main.tsx
├── datepicker-rhf/                             ← + react-hook-form dep
├── rangepicker-presets/
├── timepicker-12h/
├── datetimepicker-timezone/
├── datepicker-tailwind/                        ← + tailwindcss dep
├── datepicker-shadcn/                          ← + cn util + cva pattern
└── stackblitz-rc/                              ← DELETED

scripts/
└── check-stackblitz-urls.mjs                  ← new: HTTP HEAD against each embed URL

pnpm-workspace.yaml                             ← add 'examples/*' if not already
```

### `<StackBlitzEmbed>` API

```tsx
type Props = {
  id: string;                       // examples/<id>
  file?: string;                    // default 'src/App.tsx'
  height?: number;                  // default 600
  theme?: 'dark' | 'light';         // default 'dark'
};
```

Renders:

```tsx
<div className={styles.wrapper}>
  <iframe
    src={`https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/${id}?embed=1&file=${file ?? 'src/App.tsx'}&hideExplorer=1&theme=${theme ?? 'dark'}`}
    title={`Kalyx example: ${id}`}
    loading="lazy"
    height={height ?? 600}
    style={{ width: '100%', border: 0 }}
  />
  <a
    className={styles.openLink}
    href={`https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/${id}`}
    target="_blank"
    rel="noopener noreferrer">
    Open in StackBlitz ↗
  </a>
</div>
```

`title` is required for iframe a11y. `loading="lazy"` keeps iframes from competing with first paint when multiple embeds appear on one docs page (rare, but possible).

### ReactLiveScope extension

```tsx
// apps/docs-site/src/theme/ReactLiveScope/index.tsx
import * as React from 'react';
import {
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
  DateFnsAdapter,
} from '@kalyx/react';

export default {
  React,
  ...React,
  DatePicker, RangePicker, TimePicker, DateTimePicker,
  MonthPicker, YearPicker, WeekPicker,
  useDatePicker, useRangePicker, useTimePicker,
  DateFnsAdapter,
};
```

If `ReactLiveScope/index.tsx` already exists (it does — Docusaurus theme-live-codeblock is wired in), this is a content swap, not a new file.

### Example project shape

Each `examples/<id>/` is a real pnpm workspace package. Minimal template:

```json
// package.json
{
  "name": "@kalyx-example/datepicker-basic",
  "version": "0.0.0",
  "private": true,
  "scripts": { "dev": "vite", "build": "vite build", "typecheck": "tsc -b --noEmit" },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@kalyx/react": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.4.0",
    "vite": "^7.0.0"
  }
}
```

```tsx
// src/App.tsx
import { useState } from 'react';
import { DatePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  return (
    <div style={{ padding: 32 }}>
      <h1>Kalyx — DatePicker basic</h1>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Input placeholder="Pick a date" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify({ iso }, null, 2)}</pre>
    </div>
  );
}
```

Specialised examples (`-rhf`, `-tailwind`, `-shadcn`) add the relevant peer deps and demonstrate the integration pattern. Each example's `App.tsx` is < 80 LoC — focused, copy-paste-ready snippets.

### CI helper script

`scripts/check-stackblitz-urls.mjs`:

```js
#!/usr/bin/env node
import { request } from 'undici';

const EXAMPLES = [
  'datepicker-basic', 'datepicker-rhf', 'rangepicker-presets',
  'timepicker-12h', 'datetimepicker-timezone',
  'datepicker-tailwind', 'datepicker-shadcn',
];

let fail = 0;
for (const id of EXAMPLES) {
  const url = `https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/${id}`;
  const res = await request(url, { method: 'HEAD' });
  if (res.statusCode >= 400) {
    console.error(`✗ ${id}: HTTP ${res.statusCode}`);
    fail++;
  } else {
    console.log(`✓ ${id}: HTTP ${res.statusCode}`);
  }
}
process.exit(fail > 0 ? 1 : 0);
```

Manual-run. Not wired into PR-check yet — parent spec earmarks that for a nightly job.

## Testing strategy

### Component tests

- `<StackBlitzEmbed>` smoke: renders iframe with correct URL, "Open in StackBlitz" link present, axe pass (3 tests).
- ReactLiveScope: no direct test; verified indirectly by the docs-site build succeeding with new ```` ```tsx live ```` blocks.

### Example project verification

- `pnpm -r --filter "@kalyx-example/*" typecheck` — all 7 examples must pass `tsc -b`. This catches API drift if `@kalyx/react` exports change.
- Each example project must build via `pnpm --filter "@kalyx-example/<id>" build`. Sampled, not exhaustive in CI (manual or local).

### Docs build

- `pnpm --filter docs-site build` must succeed for en + ko after every picker page's edits — confirms the `tsx live` syntax passes Docusaurus's MDX transform and the embeds are valid markup.

### Manual

- Click through each picker docs page in dev, exercise the live block, click "Open in StackBlitz" to confirm the URL loads a real sandbox.
- Run `node scripts/check-stackblitz-urls.mjs` — expect 7× HTTP 200 (StackBlitz returns 200 even for repo paths it hasn't snapshotted, so this is a weak signal but better than nothing).

## Success criteria

- [ ] `ReactLiveScope` exposes all 7 pickers + 3 hooks + `DateFnsAdapter`
- [ ] At least one inline ```` ```tsx live ```` block on each of the 7 picker docs pages, both en and ko (14 pages)
- [ ] At least one `<StackBlitzEmbed>` on each of the 7 picker docs pages, both en and ko
- [ ] All 7 example projects under `examples/` pass `pnpm typecheck`
- [ ] All 7 StackBlitz URLs return HTTP 200 via `scripts/check-stackblitz-urls.mjs`
- [ ] `examples/stackblitz-rc/` removed
- [ ] Vitest baseline + 3 new `<StackBlitzEmbed>` tests pass
- [ ] `pnpm --filter docs-site build` succeeds for en + ko
- [ ] No regression in `@kalyx/react` bundle (no source touched)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| StackBlitz embed URL changes / repo path moves | The URL convention is documented in `<StackBlitzEmbed>`'s JSDoc. The `check-stackblitz-urls.mjs` script catches URL rot. |
| One bad `live` block breaks the docs-site build | Each picker page edited in a separate commit. CI build runs per commit; bad blocks isolated. |
| `examples/*` packages bloat `pnpm install` time at root | Each example pulls only React + `@kalyx/react`. The 7 examples together add ~80 MB to `node_modules` (mostly shared). Acceptable. |
| `@vitejs/plugin-react@^5` / `vite@^7` are bleeding-edge in some examples | Use the same versions the workspace already uses; do not introduce new majors. |
| The Tailwind / shadcn examples need their own configs that drift from the recipes docs | Each example folder gets a `README.md` (one paragraph) summarising the integration. Lightweight; not in the success criteria above. |
| The 7 examples each get their own `index.html` + `main.tsx` with the same boilerplate — DRY violation | Acceptable — copy-paste examples ARE the point. A shared template would defeat the purpose of "open in StackBlitz, see exact code". |

## PR breakdown

Single PR. Commit shape (~15 commits):

1. `chore(workspace): include examples/* and remove stackblitz-rc`
2. `feat(docs-site): expose @kalyx/react in ReactLiveScope`
3. `feat(docs-site): add StackBlitzEmbed component + tests`
4. `feat(examples): add datepicker-basic`
5. `feat(examples): add datepicker-rhf`
6. `feat(examples): add rangepicker-presets`
7. `feat(examples): add timepicker-12h`
8. `feat(examples): add datetimepicker-timezone`
9. `feat(examples): add datepicker-tailwind`
10. `feat(examples): add datepicker-shadcn`
11. `feat(scripts): add check-stackblitz-urls.mjs`
12. `docs(components): add live block + embed to DatePicker (en + ko)`
13. `docs(components): add live block + embed to RangePicker (en + ko)`
14. `docs(components): add live block + embed to TimePicker / DateTimePicker (en + ko)`
15. `docs(components): add live block + embed to Month / Year / WeekPicker (en + ko)`

The 7 example-project commits are the largest individual diffs (~150 LoC each); the docs commits are small (~30 LoC per picker page).

## References

- Parent spec § B — `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md`
- Docusaurus theme-live-codeblock — https://docusaurus.io/docs/markdown-features/code-blocks#interactive-code-editor
- StackBlitz GitHub embeds — https://developer.stackblitz.com/platform/embed-a-github-project
- Existing `ReactLiveScope` — `apps/docs-site/src/theme/ReactLiveScope/index.tsx`
- Existing examples directory — `examples/`
