import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kalyx',
  tagline: 'The headless DatePicker, finally complete',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://kalyx-docs.vercel.app',
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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          include: [
            'intro.{md,mdx}',
            'migration.{md,mdx}',
            'getting-started/**/*.{md,mdx}',
            'concepts/**/*.{md,mdx}',
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

  themeConfig: {
    image: 'img/social-card.jpeg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'keywords', content: 'react, datepicker, headless, typescript, tailwind, accessible, ssr, calendar, timepicker, rangepicker'},
      {name: 'description', content: 'Headless, SSR-safe React DatePicker with Input, Calendar, TimePicker, and RangePicker in under 12KB.'},
    ],
    navbar: {
      title: 'Kalyx',
      logo: {
        alt: 'Kalyx',
        src: 'img/kalyx-mascot.png',
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
