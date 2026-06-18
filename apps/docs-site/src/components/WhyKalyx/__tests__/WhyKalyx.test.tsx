import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

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

import WhyKalyx from '../index';

describe('<WhyKalyx>', () => {
  it('renders a section heading and a CTA link', () => {
    render(<WhyKalyx />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href');
  });

  it('CTA points at /docs/intro', () => {
    render(<WhyKalyx />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/docs/intro');
  });

  it('passes axe', async () => {
    const { container } = render(<WhyKalyx />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
