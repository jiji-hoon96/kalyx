---
'@kalyx/react': patch
---

docs(i18n): translate Korean intro and stop bumping demo apps on every patch

- `apps/docs-site/i18n/ko/.../intro.md` is now fully translated to Korean. Previously the file lived in the `i18n/ko/` tree but the body was the verbatim English copy, so Korean docs visitors saw English content on the landing page.
- `.changeset/config.json` `ignore` now includes the two demo workspaces (`@kalyx/docs`, `docs-site`). Changesets used to bump them on every release because they depend on `@kalyx/react`, polluting their CHANGELOG with `Updated dependencies` entries and adding noise to release PRs. Demo apps aren't published — they don't need versioning.
