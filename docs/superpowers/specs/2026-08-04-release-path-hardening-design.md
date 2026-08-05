# Release Path Hardening Design

> **Date:** 2026-08-04
> **Base:** `main` at `a71c43a`
> **Branch:** `fix/codex-release-path-2026-08`

## Goal

Ensure every publishable Kalyx package is built, packed, and import-tested from the artifact that would reach npm before a release can publish it.

## Current Failures

1. The root `pnpm build` produces core, date-fns adapter, and React only; the publishable dayjs and luxon adapters have no `dist/` afterward.
2. `@kalyx/adapter-dayjs` and `@kalyx/adapter-luxon` omit `publishConfig.provenance`, unlike the other publishable packages.
3. CI validates workspace imports but never imports the packed tarballs, so missing files, broken export maps, or incorrect workspace-range rewriting can escape until publication.

## Package Discovery

The tarball checker discovers direct children of `packages/` and treats every manifest without `private: true` as publishable. It does not hard-code the five current package names, so a new publishable adapter is automatically included. Before packing, it requires each publishable manifest to provide:

- a package name and version;
- a build script;
- non-empty `files` and `exports` fields;
- `publishConfig.access: public`;
- `publishConfig.provenance: true`.

## Root Build

Use a two-stage packages-only build:

```text
pnpm --filter @kalyx/core build
pnpm --filter './packages/*' --filter '!@kalyx/core' --if-present build
```

Core is built first because its development-only conformance dependency on the date-fns adapter forms a workspace cycle with the adapter's runtime dependency on core. A single recursive command can therefore start both declaration builds concurrently and fail on a clean tree. After core declarations exist, pnpm executes all remaining packages in topological order. Apps and examples remain outside the root library build, while every current and future package under `packages/` with a build script participates.

## Tarball Smoke Test

Add `scripts/check-package-tarballs.mjs` and the root command `pnpm check-package-tarballs`.

The script:

1. validates all publishable manifests;
2. creates an OS temporary directory and always removes it;
3. runs `pnpm pack` in each publishable package into a shared tarball directory;
4. creates a consumer project outside the workspace;
5. installs all local tarballs together, plus the React peer dependencies, using the already configured registry/store;
6. runs ESM and CommonJS smoke programs that import every package root export and the `@kalyx/core/test-helpers` and `@kalyx/react/headless` subpaths;
7. asserts representative runtime exports exist for each package.

Installing all local tarballs together verifies that packed workspace dependency ranges resolve to the corresponding artifacts rather than accidentally reading workspace sources or `dist/` folders.

## CI and Release Ordering

Add a dedicated `Package Tarball Smoke` PR job on a fresh checkout:

```text
checkout → frozen install → root build → tarball smoke
```

Make `All Checks Pass` depend on it. Add the same smoke command to the release workflow after build and before tests/publish, so publication cannot bypass artifact verification.

## Testing

Unit tests cover:

- discovery excludes private packages and includes every publishable package;
- missing provenance and required metadata are reported;
- the repository manifest set contains all five expected packages and has no validation errors;
- generated ESM/CommonJS smoke programs include every discovered package and required subpath.

The repository-level metadata test is expected to fail until provenance is added to dayjs and luxon. The real tarball command then provides integration coverage of pack/install/import behavior.

## Scope

Included: root build coverage, publish metadata validation, provenance on dayjs/luxon, packed artifact smoke tests, PR/release CI integration.

Excluded: publishing a version, creating changesets, changing runtime source, release concurrency/action pinning, or redesigning the whole release workflow. Those broader supply-chain findings remain separate decisions.

## Success Criteria

1. A clean root build creates `dist/` for all five publishable packages.
2. Every publishable package declares provenance.
3. Every packed ESM and CJS entry point imports from a standalone consumer.
4. Broken tarball contents or export maps fail PR CI and the release job before publish.
5. No package version or npm publication occurs in this PR.
