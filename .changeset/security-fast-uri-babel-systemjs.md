---
"@kalyx/react": patch
"@kalyx/core": patch
---

Security: pin transitive `fast-uri` to `>=3.1.2` and `@babel/plugin-transform-modules-systemjs` to `>=7.29.4` via `pnpm.overrides`.

Resolves three Code Scanning alerts on `pnpm-lock.yaml`:

- `fast-uri@3.1.0` — [GHSA-v39h-62p7-jpjc](https://osv.dev/GHSA-v39h-62p7-jpjc) (CVE-2026-6322), first patched in `3.1.2`.
- `fast-uri@3.1.0` — [GHSA-q3j6-qgpj-74h6](https://osv.dev/GHSA-q3j6-qgpj-74h6) (CVE-2026-6321), first patched in `3.1.1`.
- `@babel/plugin-transform-modules-systemjs@7.29.0` — [GHSA-fv7c-fp4j-7gwp](https://osv.dev/GHSA-fv7c-fp4j-7gwp) (CVE-2026-44728), first patched in `7.29.4` on the 7.x line.

All three packages are transitive build-time dependencies (ajv → fast-uri, Babel preset-env → systemjs plugin); no public API impact.
