import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/composition',
        'concepts/iso-string',
        'concepts/timezone',
        'concepts/ssr',
        'concepts/adapters',
        'concepts/accessibility',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/datepicker',
        'components/rangepicker',
        'components/timepicker',
        'components/datetimepicker',
        'components/monthpicker',
        'components/yearpicker',
        'components/weekpicker',
      ],
    },
    {
      type: 'category',
      label: 'Hooks',
      items: [
        'hooks/use-date-picker',
        'hooks/use-range-picker',
        'hooks/use-time-picker',
      ],
    },
    {
      type: 'category',
      label: 'Recipes',
      items: [
        'recipes/tailwind',
        'recipes/shadcn',
        'recipes/react-hook-form',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/core',
        'api/react',
      ],
    },
    'migration',
  ],
};

export default sidebars;
