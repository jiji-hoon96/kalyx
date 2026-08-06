import type { IconName } from './FeatureIcon';

export type Feature = {
  id: string;
  icon: IconName;
  titleId: string;
  titleDefault: string;
  bodyId: string;
  bodyDefault: string;
};

export const FEATURES: readonly Feature[] = [
  {
    id: 'zero-css',
    icon: 'palette',
    titleId: 'home.featureGrid.zeroCss.title',
    titleDefault: 'Zero CSS',
    bodyId: 'home.featureGrid.zeroCss.body',
    bodyDefault:
      'No stylesheet to import. Style every part with your existing system — Tailwind, shadcn, CSS Modules, plain CSS.',
  },
  {
    id: 'ssr-safe',
    icon: 'bolt',
    titleId: 'home.featureGrid.ssr.title',
    titleDefault: 'SSR-safe',
    bodyId: 'home.featureGrid.ssr.body',
    bodyDefault:
      'No window/document access at render time. Works inside React Server Components, Next.js App Router, and Remix loaders.',
  },
  {
    id: 'timezone',
    icon: 'globe',
    titleId: 'home.featureGrid.timezone.title',
    titleDefault: 'Timezone-aware',
    bodyId: 'home.featureGrid.timezone.body',
    bodyDefault:
      'IANA timezones on the platform’s own Intl, DST-aware, no extra dependency. ISO-8601 UTC strings in, ISO-8601 UTC strings out — your storage layer stays clean.',
  },
  {
    id: 'bundle',
    icon: 'package',
    titleId: 'home.featureGrid.bundle.title',
    titleDefault: '≤20 KB gzipped',
    bodyId: 'home.featureGrid.bundle.body',
    bodyDefault:
      'All seven pickers + hooks + the date-fns adapter. Default and headless artifacts each have an explicit 20 KB CI ceiling.',
  },
] as const;
