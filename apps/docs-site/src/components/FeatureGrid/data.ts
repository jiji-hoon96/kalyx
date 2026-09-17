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
      'No stylesheet to import. Style every part with your existing system: Tailwind, shadcn, CSS Modules, plain CSS.',
  },
  {
    id: 'ssr-safe',
    icon: 'bolt',
    titleId: 'home.featureGrid.ssr.title',
    titleDefault: 'SSR-safe',
    bodyId: 'home.featureGrid.ssr.body',
    bodyDefault:
      'No window/document access at render time. Every picker has a renderToString test, and the published entries carry the \'use client\' directive for React Server Components.',
  },
  {
    id: 'timezone',
    icon: 'globe',
    titleId: 'home.featureGrid.timezone.title',
    titleDefault: 'Timezone-aware',
    bodyId: 'home.featureGrid.timezone.body',
    bodyDefault:
      'IANA timezones on the platform’s own Intl, DST-aware, no extra dependency. ISO-8601 UTC strings in, ISO-8601 UTC strings out, so your storage layer stays clean.',
  },
  {
    id: 'bundle',
    icon: 'package',
    titleId: 'home.featureGrid.bundle.title',
    titleDefault: '~19 KB gzipped',
    bodyId: 'home.featureGrid.bundle.body',
    bodyDefault:
      'One DatePicker, minified with its dependencies bundled and React external. All seven pickers plus hooks are ~26 KB. CI also gates the published file at 20 KB for the default entry and 22 KB for the headless entry.',
  },
] as const;
