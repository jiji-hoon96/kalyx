# Track 1 PR-C — `/playground` Enhancement

**Date:** 2026-06-11
**Status:** Approved (parent spec) — subset spec for implementation
**Track:** 1 (Visuals · Interactivity · Comparison) — PR #4 of 5
**Parent spec:** [`2026-06-09-track1-visuals-interactive-comparison-design.md`](./2026-06-09-track1-visuals-interactive-comparison-design.md) § C

## Context

`apps/docs-site/src/pages/playground.mdx` currently renders one editable DatePicker as a Docusaurus live block. The page is one of the top conversion surfaces — a visitor playing with the live picker is most of the way to installing.

This PR replaces the single-picker MDX page with a richer `<Playground>` component: picker selector, classNames editor, locale + timezone toggles, and an "Open in StackBlitz" button.

No code dependency on PR-B or PR-D. Independently shippable.

## Scope

**In:**

- New component `apps/docs-site/src/components/Playground/index.tsx` (default-exported) with the three controls + live render + StackBlitz button.
- Replace `apps/docs-site/src/pages/playground.mdx` body with a single `<Playground />` mount (keep the existing MDX frontmatter / heading / lead paragraph above the component).
- Add `@stackblitz/sdk` as a dependency of `apps/docs-site` (used only in the playground page — no impact on landing or other routes).
- Per-component classNames editor that covers the published `classNames` prop surface for each picker (see § Architecture).
- Locale options: `en-US`, `ko-KR`, `ja-JP`, `fr-FR`. Timezone options: `UTC`, `Asia/Seoul`, `America/New_York`, `Europe/London`.
- Tests: render-smoke + axe for `<Playground>`; smoke that switching the picker selector swaps the rendered picker; smoke that the StackBlitz button is reachable by keyboard.

**Out:**

- Save/restore playground state to URL (deferred — adds query-string parsing complexity)
- Sharing the StackBlitz link as a paste-friendly URL (the SDK's `openProject` opens a fresh sandbox each click; long-link sharing is a follow-up)
- Custom theme variants beyond the existing CSS variables
- Live preview of generated TS interfaces / props
- Mobile-first redesign — the playground is desktop-primary on purpose

## Architecture

### File layout

```
apps/docs-site/
├── src/
│   ├── components/
│   │   └── Playground/
│   │       ├── index.tsx                     ← composer + state
│   │       ├── PickerSelector.tsx            ← <select> for 7 pickers
│   │       ├── ClassNamesEditor.tsx          ← per-part class inputs
│   │       ├── LocaleTimezoneToggles.tsx     ← two <select>s
│   │       ├── PreviewPanel.tsx              ← live picker render
│   │       ├── OpenInStackBlitz.tsx          ← button + SDK call
│   │       ├── classNamesByPicker.ts         ← static map of parts per picker
│   │       ├── seedProject.ts                ← StackBlitz project seed builder
│   │       ├── Playground.module.css
│   │       └── __tests__/Playground.test.tsx
│   └── pages/playground.mdx                   ← rewrite body to <Playground />
```

### State model

A single `PlaygroundState` object passed top-down:

```ts
type PlaygroundState = {
  pickerId: 'datepicker' | 'rangepicker' | 'timepicker' | 'datetimepicker' | 'monthpicker' | 'yearpicker' | 'weekpicker';
  classNames: Record<string, string>; // keys depend on pickerId
  locale: 'en-US' | 'ko-KR' | 'ja-JP' | 'fr-FR';
  timezone: 'UTC' | 'Asia/Seoul' | 'America/New_York' | 'Europe/London';
};
```

Held in `useState` at `<Playground>` root. Three controls call setters; `<PreviewPanel>` reads the whole state and dispatches to the right `@kalyx/react` component.

When `pickerId` changes, the new picker's default classNames map seeds in; the user's previous custom class strings for the old picker are discarded (simpler than persistence and matches user expectation of "I switched pickers, start fresh").

### `classNamesByPicker.ts`

Static map listing the published `classNames` prop surface for each picker. Source-of-truth: read each picker's `*ClassNames` exported type from `@kalyx/react`. Example:

```ts
export const CLASSNAMES_BY_PICKER = {
  datepicker: {
    input: '',
    calendar: { root: '', header: '', grid: '', day: '', daySelected: '', dayToday: '', dayDisabled: '', dayOutsideMonth: '' },
  },
  rangepicker: { /* ... */ },
  // ... 5 more
} as const;
```

UI flattens this into a `key.path` ↔ string-input list (`calendar.day`, `calendar.daySelected`, etc.) for editing.

### StackBlitz seed

`seedProject.ts` builds a project descriptor:

```ts
import sdk from '@stackblitz/sdk';

sdk.openProject({
  title: `Kalyx Playground — ${state.pickerId}`,
  template: 'create-react-app-typescript', // or 'node' with Vite — see § Risks
  files: {
    'src/App.tsx': renderAppCode(state),
    'src/index.tsx': INDEX_STUB,
    'package.json': renderPackageJson(state),
  },
}, { openFile: 'src/App.tsx' });
```

The state hash goes into the title only (StackBlitz's project name suffix). No project URL persistence.

### MDX integration

```mdx
---
title: Playground
description: Try every Kalyx picker live. Edit classNames, toggle locale and timezone, open in StackBlitz.
---

import Playground from '@site/src/components/Playground';

# Playground

Try every Kalyx picker live. Edit classNames, toggle locale and timezone, open in StackBlitz with one click.

<Playground />
```

The page-level frontmatter / title / lead paragraph stays in MDX so Docusaurus's TOC and SEO meta still work. The actual interactive surface is one React mount.

## Testing strategy

### Per-component smoke tests

- `<PickerSelector>` — renders 7 options, fires onChange when changed (1 test)
- `<ClassNamesEditor>` — renders one input per part for the active pickerId, fires onChange (1 test)
- `<LocaleTimezoneToggles>` — renders 4 locale + 4 timezone options each (1 test)
- `<OpenInStackBlitz>` — renders button, clickable, `sdk.openProject` called with correct file map on click (1 test, `sdk` mocked)
- `<Playground>` (integration smoke) — renders all four controls, switching pickerId changes the rendered preview (2 tests)
- Axe pass on `<Playground>` (1 test)

Target: **7 new tests**, all under `Playground/__tests__/`.

### Mocks

- `@stackblitz/sdk` mocked at vitest config level (alias to `test/__mocks__/stackblitz-sdk.ts` returning a no-op `openProject`)
- `@docusaurus/*` already aliased from PR-A2

### Manual review

- `pnpm --filter docs-site start`, navigate to `/playground`, exercise every control on every picker.
- Click "Open in StackBlitz" — sandbox must open in a new tab with the right picker and classNames applied.

## Success criteria

- [ ] `<Playground>` renders without runtime errors on initial mount
- [ ] Picker selector switches between all 7 pickers without crashing
- [ ] classNames edits apply live to the rendered picker
- [ ] Locale + timezone toggles take effect (verify date display formats change)
- [ ] "Open in StackBlitz" spawns a working sandbox that renders the same picker config
- [ ] Existing `<DatePicker live>` block in `playground.mdx` is replaced — no orphan
- [ ] All 7 new tests pass + axe
- [ ] `pnpm --filter docs-site build` succeeds for en + ko
- [ ] Bundle size for landing chunk unchanged (`<Playground>` is on its own route, lazy by Docusaurus's per-page splitting)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `@stackblitz/sdk` doesn't have a Vite-friendly template, only Webpack 4-era CRA | Use `template: 'node'` + a minimal Vite `vite.config.ts` in the seeded files. Vite templates work cleanly with React 19 + `@kalyx/react`. Verify in the implementation plan. |
| `@stackblitz/sdk` pulls in a heavy chunk on the playground page | The dep ships its own iframe-API client (~10 KB gzip). Acceptable on a non-landing route. Lazy-import it inside `OpenInStackBlitz.tsx` if it bloats further. |
| classNames-editor UI feels cluttered with 8-10 part inputs visible | Group inputs by section header (Calendar / Input / Popover). Collapsible groups deferred — out of scope. |
| Switching pickerId mid-edit loses the user's class strings | Acknowledged trade-off (per § Architecture). A confirmation dialog is feature creep. |
| `@kalyx/react` typings for `*ClassNames` don't expose every part | Audit during implementation. If any part is private, document the gap and skip that input. |

## PR breakdown

Single PR. Commit shape (~9 commits):

1. `chore(docs-site): add @stackblitz/sdk dependency + mock`
2. `feat(playground): scaffold classNamesByPicker map`
3. `feat(playground): add PickerSelector`
4. `feat(playground): add ClassNamesEditor`
5. `feat(playground): add LocaleTimezoneToggles`
6. `feat(playground): add PreviewPanel`
7. `feat(playground): add OpenInStackBlitz + seedProject`
8. `feat(playground): compose Playground root`
9. `refactor(docs-site): replace playground.mdx body with <Playground />`

## References

- Parent spec § C — `docs/superpowers/specs/2026-06-09-track1-visuals-interactive-comparison-design.md`
- StackBlitz SDK docs — https://developer.stackblitz.com/platform/api/javascript-sdk
- Each picker's `*ClassNames` export — `packages/react/src/components/<picker>/`
