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

import GetStarted from '../index';

describe('<GetStarted>', () => {
  it('renders the install command exactly', () => {
    render(<GetStarted />);
    expect(screen.getByText('pnpm add @kalyx/react')).toBeInTheDocument();
  });

  it('renders a first-example code block', () => {
    render(<GetStarted />);
    const example = screen.getByTestId('first-example');
    expect(example.textContent).toContain('<DatePicker');
  });

  it('passes axe', async () => {
    const { container } = render(<GetStarted />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
