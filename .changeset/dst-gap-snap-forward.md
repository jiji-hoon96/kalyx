---
'@kalyx/core': patch
'@kalyx/react': patch
---

fix(timezone): snap forward for non-existent civil times in DST gaps; document deterministic disambiguation

`setTimeInTimezone` previously returned a pre-transition instant when the
requested civil time fell in a DST spring-forward gap. Asking for
`2026-03-08 02:30 America/New_York` — which does not exist because clocks jump
02:00 EST → 03:00 EDT — returned `2026-03-08T06:30:00.000Z` (= 01:30 EST, an
hour before the gap), silently corrupting the user's intent.

`setTimeInTimezone` now classifies its two-pass offset candidates by whether
their civil round-trip matches the requested civil time, and:

- **Spring-forward gap** (neither candidate matches): snap forward to the
  later candidate — the first valid civil instant past the gap. `2026-03-08
  02:30 America/New_York` now returns `2026-03-08T07:30:00.000Z` (= 03:30
  EDT).
- **Fall-back ambiguity** (both candidates match): pick the earlier instant
  (EDT before EST in US Eastern, BST before GMT in Europe/London). Matches
  `@internationalized/date` and the TC39 Temporal default
  (`disambiguation: 'earlier'`).
- **Single-match** (one candidate matches, near a transition): return the
  matching candidate. This was the source of intermittent off-by-one-hour
  drift near transitions.

The JSDoc above `setTimeInTimezone` now documents the policy explicitly. The
existing ambiguous-hour test was tightened from
`expect([...]).toContain(result)` (two-valid-answers) to an exact-equality
assertion against the documented choice.

Audit reference: `docs/superpowers/specs/2026-06-17-kalyx-1.0-functional-audit.md`
(items T-D1, T-D2).
