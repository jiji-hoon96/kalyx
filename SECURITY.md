# Security Policy

## Supported versions

Fixes ship forward only — they land in a new release of the affected package
rather than being backported.

| Version | Supported |
|---------|-----------|
| Latest published release of each `@kalyx/*` package | Yes |
| Any earlier `1.x` | Upgrade to the latest `1.x` |
| `0.x` and `1.0.0-rc.*` pre-releases | No |

## Reporting a vulnerability

If you discover a security vulnerability in Kalyx, please report it responsibly.

**Do NOT open a public GitHub issue.**

Instead, email **jihoon7705@gmail.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Affected versions
4. Potential impact

You will receive an acknowledgment within **48 hours** and a detailed response within **7 days**.

## Scope

Kalyx is a client-side UI library. The most relevant security concerns are:

- **XSS** via unsanitized user input in component props
- **Prototype pollution** through date/option objects
- **Supply chain** vulnerabilities in dependencies (`date-fns`, `@floating-ui/react`)

We run automated dependency audits weekly via GitHub Actions (`security.yml`),
plus on pull requests. `osv-scanner` reads `pnpm-lock.yaml` and queries osv.dev;
a licence check refuses anything outside a permissive allowlist.

## Release integrity (provenance)

Releases are published from CI by `release.yml` over **npm Trusted Publishing
(OIDC)** with no long-lived token, and all five packages set
`publishConfig.provenance: true`. Those releases carry a signed SLSA provenance
attestation binding the tarball to the workflow run and commit that produced it.

Verify a version before trusting it:

```bash
npm audit signatures                       # verifies what your lockfile resolved
npm view @kalyx/react@1.4.3 dist.attestations
```

### Versions published without provenance

Six versions predate the current setup and are **not** attested. They were
uploaded from a maintainer's machine — every package's first publish must be
manual, because npm can only attach a Trusted Publisher to a package that
already exists (see `RELEASING.md`). Nothing is wrong with these tarballs as far
as we know, but their contents cannot be cryptographically traced to a commit,
so treat them as unverifiable rather than verified:

| Package | Unsigned versions |
|---|---|
| `@kalyx/core` | `0.2.0` |
| `@kalyx/react` | `0.2.0` |
| `@kalyx/adapter-date-fns` | `1.0.0-rc.1`, `1.0.0` |
| `@kalyx/adapter-dayjs` | `0.1.0` |
| `@kalyx/adapter-luxon` | `0.1.0` |

`@kalyx/adapter-dayjs` and `@kalyx/adapter-luxon` have only ever published
`0.1.0`, so **every currently released version of those two is unsigned.** Their
next release is signed — the `publishConfig.provenance` flag and the Trusted
Publisher registration are both already in place. They are not being republished
to fix this, because reissuing an identical tarball under a new version number
would be a change to the version history and not to the artifact.

Everything else, including every `1.x` of `@kalyx/core` and `@kalyx/react` and
`@kalyx/adapter-date-fns@1.0.1`, is attested.

## Disclosure

Once a fix is available, we will:

1. Release a patched version
2. Publish a GitHub Security Advisory
3. Credit the reporter (unless they prefer anonymity)
