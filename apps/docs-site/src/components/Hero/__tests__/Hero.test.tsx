import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

// Docusaurus modules don't resolve outside a Docusaurus build. Mock the
// three we touch so the smoke test stays hermetic.
vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));
vi.mock('@docusaurus/Link', () => ({
  __esModule: true,
  default: ({ to, href, children, ...rest }: { to?: string; href?: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={to ?? href} {...rest}>{children}</a>
  ),
}));
vi.mock('../HeroDemoSlot', () => ({
  __esModule: true,
  default: () => <div data-testid="hero-demo-slot" />,
}));

import Hero from '../index';

describe('<Hero>', () => {
  it('renders the main heading and at least two CTAs', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(2);
  });

  it('mounts the lazy HeroDemo slot in the right column', () => {
    render(<Hero />);
    expect(screen.getByTestId('hero-demo-slot')).toBeInTheDocument();
  });

  it('renders the install snippet', () => {
    render(<Hero />);
    expect(screen.getByText('pnpm add @kalyx/react')).toBeInTheDocument();
  });

  it('passes axe with no critical/serious violations', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
