# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.0.0-rc.x | Yes |
| < 1.0.0 | No |

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

We run automated dependency audits weekly via GitHub Actions (`security.yml`).

## Disclosure

Once a fix is available, we will:

1. Release a patched version
2. Publish a GitHub Security Advisory
3. Credit the reporter (unless they prefer anonymity)
