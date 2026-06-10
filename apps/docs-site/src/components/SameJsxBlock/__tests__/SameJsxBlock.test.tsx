import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

import SameJsxBlock from '../index';

describe('<SameJsxBlock>', () => {
  it('renders the section heading', () => {
    render(<SameJsxBlock />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders 3 code variants (Tailwind, shadcn, plain CSS)', () => {
    render(<SameJsxBlock />);
    const blocks = screen.getAllByTestId('jsx-variant');
    expect(blocks).toHaveLength(3);
    const labels = blocks.map(b => b.getAttribute('data-variant'));
    expect(labels).toEqual(['tailwind', 'shadcn', 'plain']);
  });

  it('passes axe', async () => {
    const { container } = render(<SameJsxBlock />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
