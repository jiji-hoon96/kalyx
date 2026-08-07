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

  it('has exactly 4 features (Zero CSS, SSR-safe, Timezone-aware, ≤20 KB)', () => {
    expect(FEATURES).toHaveLength(4);
    expect(FEATURES.map((f) => f.id)).toEqual(['zero-css', 'ssr-safe', 'timezone', 'bundle']);
  });

  it('describes the bundle using the enforced ceiling, not a stale competitor ratio', () => {
    const bundle = FEATURES.find((feature) => feature.id === 'bundle');

    // The headline tracks the default entry — what `import from '@kalyx/react'`
    // costs — which is the 20 KB gate. The opt-in headless entry has a separate,
    // larger ceiling and the body must name both rather than implying one number.
    expect(bundle?.titleDefault).toBe('≤20 KB gzipped');
    expect(bundle?.bodyDefault).toContain('20 KB CI ceiling');
    expect(bundle?.bodyDefault).toContain('headless entry has its own at 22 KB');
    expect(bundle?.bodyDefault).not.toContain('Default and headless artifacts each');
    expect(bundle?.bodyDefault).not.toContain('quarter of react-datepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<FeatureGrid />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
