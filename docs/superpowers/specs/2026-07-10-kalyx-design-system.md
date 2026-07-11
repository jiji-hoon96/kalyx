# Kalyx design system
**Base:** Astryx (generalized) · **Stack:** Docusaurus (Infima CSS vars) + Tailwind Play CDN (Playground) + plain CSS (demo recorder) · **As of:** 2026-07-10

> Single source of truth for the Kalyx docs surfaces. Before this spec the accent
> lived in three files with **two different indigos** (`#5b4fe1` in docs-site,
> `#4f46e5` in demo + Playground) and two neutral families (zinc in docs-site,
> slate in demo/Playground). This document unifies them: **one accent (`#5b4fe1`)
> and one neutral (Tailwind slate)** across all three surfaces.
>
> Scope: this styles the **docs/demo/Playground surfaces only.** `@kalyx/react`
> ships zero CSS by design — none of these tokens live in the library. They
> describe the *demo chrome* that shows the headless pickers on camera and in
> the docs.

## Foundation

Cool-neutral surface + one restrained **indigo** accent — the 2026 technical-docs
formula (GitHub/Stripe/Linear/Vercel/TanStack). The neutral is Tailwind **slate**
(faint cool tint), the accent is Kalyx's existing brand indigo `#5b4fe1`, and code
blocks keep an independent syntax palette. The single signature detail is the
**accent glow** on selected calendar cells (`--kx-glow`) — a soft indigo shadow
that makes selection read as deliberate rather than a flat fill.

Astryx is the *default foundation*, but Kalyx already had the indigo decision and
a `--kx-*`/`--ifm-*` token layer; this spec **extends that vocabulary**, it does
not replace it with Astryx defaults.

## Base tokens

### Color (base) — accent: indigo

| Token | Value | Note |
|-------|-------|------|
| `accent-500` | `#5b4fe1` | brand indigo — light-mode primary |
| `accent-600` | `#4a3ed3` | hover/pressed (light) |
| `accent-400` | `#8b80ff` | dark-mode primary (lightened one step for contrast on dark surface) |
| `accent-300` | `#a59dff` | dark hover |

Accent soft/weak/glow are derived as alpha variants of the active accent (no new base hex):
`weak = accent @ 12%`, `hover = accent @ 6%`, `ring = accent @ 22%`, `glow = 0 3px 12px accent @ 32%`.

### Color (base) — neutral: Tailwind slate

| Token | Value | | Token | Value |
|-------|-------|--|-------|-------|
| `slate-50`  | `#f8fafc` | | `slate-500` | `#64748b` |
| `slate-100` | `#f1f5f9` | | `slate-600` | `#475569` |
| `slate-200` | `#e2e8f0` | | `slate-700` | `#334155` |
| `slate-300` | `#cbd5e1` | | `slate-800` | `#1e293b` |
| `slate-400` | `#94a3b8` | | `slate-900` | `#0f172a` |

Dark surface uses a cool near-black consistent with slate: `#0f172a` (page), `#111827`/`#111117` (raised).

### Code (base) — GitHub/Primer syntax (independent of accent)

Kept as-is (Docusaurus/Prism theme). Not tinted toward the brand indigo — readability over branding.

### Spacing (base) — 4px scale

Astryx 4px unit. Used values in these surfaces: `4 8 12 14 16 24 40 48`px. Rule: no off-scale
values like `13px`; if a value isn't a 4px multiple (the `14px` popover padding is the one
tolerated legacy exception), reconsider.

### Typography (base)

- Base family: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, …, sans-serif`
- Mono: `'JetBrains Mono', 'Fira Code', ui-monospace, …, monospace`
- Ramp (docs-site): H1 32–40/700, H2 24–28/700 (with bottom rule), H3 20/600, Body 16/400, Small 13–14/400, Caption 10–12/500.
- Rule: body ≥16px; calendar cell text 13px (dense grid, acceptable for a control, not prose).

### Radius (base)

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | nav buttons, small chips, options |
| `radius-input` | 8px | inputs, day cells, triggers |
| `radius-card` | 14px | popovers, cards |
| `radius-full` | 9999px | (unused today) |

### Elevation (base)

- `elevation-0` flat · `elevation-1` cards (`--kx-shadow-card`) · `elevation-2` popovers/dropdowns · `elevation-3` modals.
- Selected-cell accent glow (`--kx-glow`) is a *state* signal, not an elevation level.

### Motion (base)

- `motion-fast` 120ms (hovers, cell background), `motion-base` 150ms (input focus).
- Easing: ease / ease-out. Respect `prefers-reduced-motion` for non-essential motion.

## Semantic tokens

Roles that reference base tokens. Components/surfaces consume **these**, never raw hex.
Light AND dark provided by swapping this layer only.

| Semantic role | → Base (light) | → Base (dark) | Use |
|---------------|----------------|---------------|-----|
| `--kx-fg` | `slate-800` `#1e293b` | `slate-100` `#f1f5f9` | primary text |
| `--kx-fg-muted` | `slate-500` `#64748b` | `slate-400` `#94a3b8` | secondary text |
| `--kx-fg-subtle` | `slate-400` `#94a3b8` | `slate-500` `#64748b` | weekday labels, outside-month |
| `--kx-bg` | white | `#111117` | surface / popover |
| `--kx-bg-quiet` | `slate-50` `#f8fafc` | `#0f172a` | wells, quiet backgrounds |
| `--kx-border` | `slate-200` `#e2e8f0` | white @ 8% | dividers, input border |
| `--kx-primary` | `accent-500` `#5b4fe1` | `accent-400` `#8b80ff` | selected, focus, links |
| `--kx-primary-fg` | white | `#0f172a` | text on accent |
| `--kx-primary-weak` | accent @ 12% | accent @ 18% | in-range band |
| `--kx-primary-hover` | accent @ 6% | accent @ 12% | cell hover |
| `--kx-glow` | `0 3px 12px accent@32%` | (same) | selected-cell signature |
| `--kx-radius-input` | `radius-input` 8px | — | inputs, day cells |
| `--kx-radius-card` | `radius-card` 14px | — | popover |

**Docusaurus mapping:** `--ifm-color-primary*` = accent ramp; `--kalyx-surface`/`-border`/`-text-muted`
map to the same slate roles so docs-site chrome and live examples agree.

## Components (roles)

- **Input**: `--kx-bg` surface, `--kx-border`, `radius-input`; focus → accent border + `ring` box-shadow; ≥16px target height (36px).
- **Day / month / year cell**: transparent → `--kx-primary-hover` on hover → `--kx-primary` + `--kx-glow` when selected; today = inset accent ring; ≥32–34px (dense grid).
- **Popover**: `--kx-bg`, `--kx-border`, `radius-card`, `elevation-2`.
- **Time option / AM-PM**: same selected treatment as cells (accent fill + glow) for one consistent "selected" language.
- **Preset**: ghost button, `--kx-primary-weak` when active.

One selected-state language across every picker: **accent fill + glow.** No competing highlight styles.

## Accessibility commitments

- Contrast (WCAG AA): `#1e293b` on white ≈ 13.6:1 (body ✓); `#64748b` on white ≈ 4.8:1 (secondary ✓); `#5b4fe1` on white ≈ 5.9:1 and white on `#5b4fe1` ≈ 5.9:1 (UI/accent ✓, ≥3:1). Dark: `#8b80ff` on `#111117` ≈ 6.4:1 ✓.
- Touch targets: inputs 36px height (docs live examples are pointer-first; acceptable), nav buttons ≥26–30px. Note as **medium** where < 44px on a touch-primary surface.
- Visible focus ring on inputs and cells; keyboard reachable (this is Kalyx's core guarantee).

## Do's and Don'ts

- **Do** reference `--kx-*` semantic tokens in the demo/live CSS; map new docs chrome through `--ifm-*` + `--kalyx-*`.
- **Do** use the accent only for selection, focus, links, active nav — never as a large fill or page background.
- **Do** keep the one selected-state language (accent fill + glow) across all seven pickers.
- **Don't** introduce a second indigo. `#4f46e5` (Tailwind `indigo-600`) is retired here — use `#5b4fe1`.
- **Don't** mix slate and zinc neutrals. Slate is the neutral; zinc is retired.
- **Don't** tint code-syntax colors toward the brand indigo.
- **Don't** put any of these tokens in `@kalyx/react` — the library is zero-CSS.

## Scope boundary: rendered surfaces vs. code examples

Unification applies to surfaces that **actually render** (docs-site chrome, live
examples, Playground preview, demo recorder). It does **not** rewrite the
`indigo-600`/`indigo-500` in **code examples that users copy-paste** —
`docs/recipes/tailwind.md`, `docs/hooks/*.md`, `docs/getting-started/quick-start.mdx`,
and the `SameJsxBlock` code strings on the landing page. Those show *standard*
Tailwind classes because a reader hasn't configured a `primary` color; rewriting
them to `primary` would break the copy-paste. Standard-Tailwind indigo in a code
sample is the honest choice; the retirement of `#4f46e5` is about the *rendered*
Kalyx brand accent only.

## Open questions

- [high, resolved] Accent unified to `#5b4fe1`; neutral unified to slate — per 2026-07-10 handoff + user decision.
- [medium] Input touch target is 36px on docs live examples; a touch-primary consumer should bump to ≥44px. Documented, not enforced (docs are pointer-first).
- [low] A dedicated **Themes preview** page (Astryx "themes" format showing the same picker under multiple brand tokens) is deferred to a later session — this spec's tokens make it cheap to build.
