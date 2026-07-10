import type { ReactNode } from 'react';

/**
 * Inline, dependency-free icon set for the landing feature cards.
 *
 * One consistent grid (24×24), one stroke weight (1.75), `currentColor` so the
 * accent is inherited from the card — replacing the emoji icons (🎨⚡🌍📦) that
 * read as AI-generated. Kalyx ships zero CSS and adds no icon dependency, so
 * these are hand-authored paths, not an icon library.
 *
 * See docs/superpowers/specs/2026-07-10-kalyx-design-system.md (anti-slop).
 */

export type IconName = 'palette' | 'bolt' | 'globe' | 'package';

const COMMON = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const PATHS: Record<IconName, ReactNode> = {
  // Zero CSS — a paint swatch / palette
  palette: (
    <>
      <circle cx="13.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-1.5a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 21Z" />
    </>
  ),
  // SSR-safe — a lightning bolt
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />,
  // Timezone-aware — a globe with meridians
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  // ≤16 KB — a package / box
  package: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
};

export function FeatureIcon({ name }: { name: IconName }) {
  return <svg {...COMMON}>{PATHS[name]}</svg>;
}
