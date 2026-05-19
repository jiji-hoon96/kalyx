---
"@kalyx/docs": patch
---

Security: bump `next` to `>=15.5.18` via `pnpm.overrides`, resolving 13 OSV alerts on the docs app's transitive `next@15.5.15` lockfile entry.

OSV-detected advisories resolved (all on `next@15.5.15`):

- GHSA-c4j6-fc7j-m34r (8.6)
- GHSA-492v-c6pp-mqqv (8.1)
- GHSA-267c-6grr-h53f (7.5)
- GHSA-26hh-7cqf-hhc6 (7.5)
- GHSA-36qx-fr4f-26g5 (7.5)
- GHSA-8h8q-6873-q5fj (7.5)
- GHSA-mg66-mrh9-m8jx (7.5)
- GHSA-gx5p-jg67-6x7h (6.1)
- GHSA-h64f-5h5j-jqjh (5.9)
- GHSA-wfc6-r584-vfw7 (5.4)
- GHSA-ffhc-5mcf-pf4q (4.7)
- GHSA-3g8h-86w9-wvmq (3.7)
- GHSA-vfv6-92ff-j949 (3.7)

The override resolves to `next@16.2.6` (current latest) since the override is a lower bound. `apps/docs` peer declaration bumped to `^16.0.0` to reflect the actual resolved version. The `jsx` compiler option in `apps/docs/tsconfig.json` is updated to `react-jsx` and the `.next/dev/types/**/*.ts` include added — both required by Next 16's automatic typed-routes setup; `next-env.d.ts` is auto-regenerated to the v16 form.

`@kalyx/react` / `@kalyx/core` are unaffected — `next` is a docs-app-only dependency. No public API change.
