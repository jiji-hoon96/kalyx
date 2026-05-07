## Summary

<!-- Brief description of what this PR does and why -->

## Type

<!-- Check one -->
- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — Code change that neither fixes a bug nor adds a feature
- [ ] `docs` — Documentation only
- [ ] `test` — Adding or updating tests
- [ ] `chore` — Build, CI, deps, or tooling

## Changes

- 

## Test plan

<!-- How was this tested? Include specific scenarios. -->

- 

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test:run` passes
- [ ] `pnpm build` succeeds
- [ ] Bundle size checked (`pnpm check-bundle` ≤ 13KB)
- [ ] Changeset added (if public API changed)
- [ ] New public APIs have JSDoc comments
- [ ] Accessibility: axe passes, keyboard navigation works
- [ ] SSR: no `window`/`document` outside `useEffect`
- [ ] If the change touches date/time math, `displayTimezone` behavior verified (format, onChange, DST-safe)
