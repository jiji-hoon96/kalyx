---
'@kalyx/react': minor
'@kalyx/core': minor
---

chore(oss): unify node engines to >=20 and add public repository metadata

- `@kalyx/react` and `@kalyx/core` now require Node `>=20`, matching the root workspace and CI. This was the de-facto requirement; only the published manifests still claimed `>=18`.
- Root `package.json` now exposes `homepage`, `repository`, and `bugs` so `npm info` and the npm registry page link back to the GitHub repo.
- `.github/PULL_REQUEST_TEMPLATE.md` bundle ceiling updated `15KB → 16 KB` to match the post-rc.8 limit advertised in README and CI.
- `.gitignore` ignores `.codegraph/`, `.serena/`, and `.tmp-*/` (MCP server caches and worktree scratchpads).
