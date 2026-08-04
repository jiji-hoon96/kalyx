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
    expect(FEATURES.map(f => f.id)).toEqual([
      'zero-css',
      'ssr-safe',
      'timezone',
      'bundle',
    ]);
  });

  it('passes axe', async () => {
    const { container } = render(<FeatureGrid />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
