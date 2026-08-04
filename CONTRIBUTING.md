# Contributing to Kalyx

Thanks for your interest in contributing! This guide will help you get started.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Please report unacceptable behavior to **jihoon7705@gmail.com**.

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
git clone https://github.com/jiji-hoon96/kalyx.git
cd kalyx
pnpm install
pnpm build
```

## Development

```bash
pnpm test          # watch mode
pnpm test:run      # single run (CI)
pnpm typecheck     # tsc -b
pnpm lint          # eslint
pnpm check-bundle  # gzip size check (≤ 20 KB)
```

### Branch Naming

| Prefix | Purpose |
|---|---|
| `feat/xxx` | New feature |
| `fix/xxx` | Bug fix |
| `docs/xxx` | Documentation only |
| `test/xxx` | Test only |
| `chore/xxx` | Tooling, CI, deps |

## Project Structure

```
packages/
  core/             — Platform-independent date logic (calendar grid, utilities, DateAdapter contract)
  react/            — React components (DatePicker, RangePicker, TimePicker, DateTimePicker, MonthPicker, YearPicker, WeekPicker)
  adapter-date-fns/ — date-fns DateAdapter (default)
  adapter-dayjs/    — dayjs DateAdapter
  adapter-luxon/    — luxon DateAdapter
apps/
  docs/    — Next.js demo site
  docs-site/ — Docusaurus documentation
```

- `@kalyx/core` has zero React dependency — pure functions and types.
- `@kalyx/react` depends on `@kalyx/core`, React 19+, Floating UI, and date-fns.

## Code Style

- **TypeScript strict** — `any` is forbidden (`@typescript-eslint/no-explicit-any: error`).
- **ISO 8601 UTC strings** — All date values are `string` (e.g., `"2026-01-15T00:00:00.000Z"`). Never use native `Date` objects as component values.
- **Timezone awareness** — For display-zone-specific behavior, route through the `displayTimezone` prop or `@kalyx/core` helpers (`civilMidnightFromUtcDay`, `getTimeInTimezone`, `setTimeInTimezone`). Avoid ad-hoc `new Date()` math in features.
- **Composition API** — Sub-components via Dot Notation (`DatePicker.Input`, `DatePicker.Calendar`), not props explosion.
- **SSR safe** — No `window`/`document` outside `useEffect`. Use `useId()` for IDs.
- **Headless** — Zero CSS. Styling is done via `classNames` prop and `data-*` attributes.

## Testing

We use **Vitest** + **Testing Library** + **jest-axe**.

| Layer | Target |
|---|---|
| Core utilities | 100% |
| Components | ≥ 85% statements, ≥ 75% branches |
| Accessibility | All components pass axe |

```bash
pnpm test:run --coverage    # run with coverage report
pnpm check-a11y             # accessibility-focused tests
```

Every PR should include tests for new functionality. At minimum:
- onChange fires with ISO string
- Controlled and uncontrolled modes work
- Keyboard navigation works
- axe accessibility checks pass

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(calendar): add keyboard navigation
fix(input): handle empty string on blur
docs(readme): update comparison table
test(range): add auto-swap edge case
chore(deps): update date-fns to 4.1
```

## Pull Requests

Before opening a PR, verify:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test:run` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm check-bundle` — bundle ≤ 20 KB gzip
- [ ] Changeset added if public API changed (`pnpm changeset`)
- [ ] New public APIs have JSDoc comments

## Bundle Size

The gzip target is **≤ 20 KB** for `@kalyx/react`. Check with:

```bash
pnpm build && pnpm check-bundle
```

If your change increases bundle size significantly, consider:
- Lazy loading or code splitting
- Moving logic to `@kalyx/core` (tree-shakeable)
- Reviewing if the feature is essential

## Releasing

Releases are handled by maintainers via [Changesets](https://github.com/changesets/changesets):

1. Contributors add a changeset with `pnpm changeset` in their PR.
2. On merge, CI creates a "Version Packages" PR.
3. When the version PR is merged, CI publishes to npm automatically.

## Questions?

Open an issue or start a discussion on [GitHub](https://github.com/jiji-hoon96/kalyx/issues).
