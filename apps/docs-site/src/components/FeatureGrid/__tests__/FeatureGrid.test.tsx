import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

import FeatureGrid from '../index';
import { FEATURES } from '../data';

describe('<FeatureGrid>', () => {
  it('renders one card per entry in data.ts', () => {
    render(<FeatureGrid />);
    expect(screen.getAllByTestId('feature-card')).toHaveLength(FEATURES.length);
  });

  it('has exactly 4 features (Zero CSS, SSR-safe, Timezone-aware, bundle size)', () => {
    expect(FEATURES).toHaveLength(4);
    expect(FEATURES.map((f) => f.id)).toEqual(['zero-css', 'ssr-safe', 'timezone', 'bundle']);
  });

  it('describes the bundle with measured consumer sizes, not a stale competitor ratio', () => {
    const bundle = FEATURES.find((feature) => feature.id === 'bundle');

    // The headline is the consumer figure from `pnpm check-tree-shaking` (one
    // DatePicker, deps bundled, React external). The body names what was
    // measured and keeps the two CI ceilings on the published files apart.
    expect(bundle?.titleDefault).toBe('~19 KB gzipped');
    expect(bundle?.bodyDefault).toContain('dependencies bundled and React external');
    expect(bundle?.bodyDefault).toContain('~26 KB');
    expect(bundle?.bodyDefault).toContain('20 KB for the default entry and 22 KB for the headless entry');
    expect(bundle?.bodyDefault).not.toContain('Default and headless artifacts each');
    expect(bundle?.bodyDefault).not.toContain('quarter of react-datepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<FeatureGrid />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
