import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

// Keep the live picker (which imports @kalyx/react) out of the unit test —
// render only the static fallback for the preview column.
vi.mock('@docusaurus/BrowserOnly', () => ({
  __esModule: true,
  default: ({ fallback }: { fallback: React.ReactNode }) => <>{fallback}</>,
}));

import SameJsxBlock from '../index';

describe('<SameJsxBlock>', () => {
  it('renders the section heading', () => {
    render(<SameJsxBlock />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders 3 style tabs (Tailwind, shadcn, plain CSS)', () => {
    render(<SameJsxBlock />);
    const tabs = screen.getAllByTestId('jsx-tab');
    expect(tabs).toHaveLength(3);
    expect(tabs.map(t => t.getAttribute('data-variant'))).toEqual([
      'tailwind',
      'shadcn',
      'plain',
    ]);
  });

  it('defaults to the Tailwind tab selected', () => {
    render(<SameJsxBlock />);
    const tabs = screen.getAllByTestId('jsx-tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('switches the active tab and code on click', () => {
    render(<SameJsxBlock />);
    const tabs = screen.getAllByTestId('jsx-tab');
    // Tailwind code shows the indigo utility by default
    expect(screen.getByText(/bg-indigo-600/)).toBeInTheDocument();
    fireEvent.click(tabs[2]); // plain CSS
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/kx-day-selected/)).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<SameJsxBlock />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
