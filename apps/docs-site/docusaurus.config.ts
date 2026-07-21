import {themes as prismThemes} from 'prism-react-renderer';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';
import llmsTxtPlugin from './src/plugins/llms-txt';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kalyx',
  tagline: 'The headless DatePicker, finally complete',
  favicon: 'img/kalyx-logo.svg',

  future: {
    v4: true,
  },

  url: 'https://kalyx-docs-site.vercel.app',
  baseUrl: '/',

  organizationName: 'jiji-hoon96',
  projectName: 'kalyx',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US'},
      ko: {label: '한국어', htmlLang: 'ko-KR'},
    },
  },

  themes: ['@docusaurus/theme-live-codeblock'],

  // Tailwind Play CDN — lets the Tailwind recipe's live examples render real
  // Tailwind utility classes at runtime. Scoped via the `tw-enable` class on
  // the wrapper so the rest of the docs site is unaffected.
  scripts: [
    {
      src: 'https://cdn.tailwindcss.com',
      async: false,
    },
    {
      src: '/js/tailwind-config.js',
      async: false,
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          remarkPlugins: [[npm2yarn, {sync: true, converters: ['yarn', 'pnpm', 'bun']}]],
          include: [
            'intro.{md,mdx}',
            'migration.{md,mdx}',
            'troubleshooting.{md,mdx}',
            'getting-started/**/*.{md,mdx}',
            'concepts/**/*.{md,mdx}',
            'guides/**/*.{md,mdx}',
            'components/**/*.{md,mdx}',
            'hooks/**/*.{md,mdx}',
            'recipes/**/*.{md,mdx}',
            'api/**/*.{md,mdx}',
          ],
          editUrl: ({locale, docPath}) => {
            if (locale !== 'en') {
              return `https://github.com/jiji-hoon96/kalyx/edit/main/apps/docs-site/i18n/${locale}/docusaurus-plugin-content-docs/current/${docPath}`;
            }
            return `https://github.com/jiji-hoon96/kalyx/edit/main/apps/docs-site/docs/${docPath}`;
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [llmsTxtPlugin],

  themeConfig: {
    image: 'img/og-hero.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'keywords', content: 'react, datepicker, headless, typescript, tailwind, accessible, ssr, calendar, timepicker, rangepicker'},
      {name: 'description', content: 'Headless, SSR-safe React DatePicker with Input, Calendar, TimePicker, and RangePicker in ~16.6 KB (≤ 17 KB ceiling).'},
    ],
    navbar: {
      title: 'Kalyx',
      logo: {
        alt: 'Kalyx',
        src: 'img/kalyx-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/components/datepicker',
          label: 'Components',
          position: 'left',
        },
        {
          to: '/playground',
          label: 'Playground',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@kalyx/react',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/jiji-hoon96/kalyx',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Quick Start', to: '/docs/getting-started/quick-start'},
            {label: 'Components', to: '/docs/components/datepicker'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/jiji-hoon96/kalyx'},
            {label: 'Issues', href: 'https://github.com/jiji-hoon96/kalyx/issues'},
            {label: 'Discussions', href: 'https://github.com/jiji-hoon96/kalyx/discussions'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: '@kalyx/react on npm', href: 'https://www.npmjs.com/package/@kalyx/react'},
            {label: '@kalyx/core on npm', href: 'https://www.npmjs.com/package/@kalyx/core'},
            {label: 'Changelog', href: 'https://github.com/jiji-hoon96/kalyx/blob/main/packages/react/CHANGELOG.md'},
            {label: 'llms.txt', href: 'pathname:///llms.txt'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kalyx. Released under the MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'tsx', 'typescript'],
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
