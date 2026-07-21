import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

vi.mock('@docusaurus/BrowserOnly', () => ({
  __esModule: true,
  default: ({ children }: { children: () => React.ReactNode }) => <>{children()}</>,
}));

import StatStrip from '../index';

describe('<StatStrip>', () => {
  beforeEach(() => {
    // Never hit the network in tests; leave live metrics pending -> "—".
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
  });
  it('renders the four static fact stats', () => {
    render(<StatStrip />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('≤17 KB')).toBeInTheDocument();
    expect(screen.getByText('WCAG AA')).toBeInTheDocument();
    // 6 stats total: 4 static + 2 live (live start as "—" before fetch resolves)
    expect(screen.getAllByTestId('stat').length).toBeGreaterThanOrEqual(4);
  });

  it('live metrics render a placeholder before fetch resolves (no inflated numbers)', () => {
    // fetch is not mocked -> promises never resolve in jsdom, live stays "—"
    render(<StatStrip />);
    expect(screen.getAllByText('—').length).toBe(2);
  });

  it('passes axe', async () => {
    const { container } = render(<StatStrip />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
