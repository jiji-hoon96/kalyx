---
"@kalyx/docs": patch
---

Security: pin transitive `next`, `brace-expansion`, `webpack-dev-server`, and `ws` via `pnpm.overrides`, resolving the OSV alerts raised against the docs app's dev-server tree.

OSV-detected advisories resolved on `next@15.5.15` (overridden to `>=15.5.18`, resolves to `16.2.6`):

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

Three additional dev-tree advisories surfaced after the Next 16 bump and are also pinned:

- `brace-expansion@5.0.5` → `>=5.0.6` — [GHSA-jxxr-4gwj-5jf2](https://osv.dev/GHSA-jxxr-4gwj-5jf2) (6.5, DoS via untrimmed `max` option)
- `webpack-dev-server@5.2.3` → `>=5.2.4` — [GHSA-79cf-xcqc-c78w](https://osv.dev/GHSA-79cf-xcqc-c78w) (5.3, cross-origin source code exposure)
- `ws@8.20.0` → `>=8.20.1` — [GHSA-58qx-3vcg-4xpx](https://osv.dev/GHSA-58qx-3vcg-4xpx) (4.4, `close()` implementation)

All four packages are dev-time dependencies of the docs app (Next's webpack dev server and its transitives). `@kalyx/react` / `@kalyx/core` are unaffected. Next 16 also requires `apps/docs/tsconfig.json` `jsx` → `react-jsx` and the `.next/dev/types/**/*.ts` include; `next-env.d.ts` is auto-regenerated.

No public API change.
