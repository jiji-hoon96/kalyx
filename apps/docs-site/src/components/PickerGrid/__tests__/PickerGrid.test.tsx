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

import PickerGrid from '../index';
import { PICKERS } from '../data';

describe('<PickerGrid>', () => {
  it('renders one card per picker', () => {
    render(<PickerGrid />);
    expect(screen.getAllByTestId('picker-card')).toHaveLength(PICKERS.length);
  });

  it('has the 7 expected pickers in order', () => {
    expect(PICKERS.map(p => p.id)).toEqual([
      'datepicker',
      'rangepicker',
      'timepicker',
      'datetimepicker',
      'monthpicker',
      'yearpicker',
      'weekpicker',
    ]);
  });

  it('every card links to its docs page with /docs/components/<id>', () => {
    render(<PickerGrid />);
    const cards = screen.getAllByTestId('picker-card');
    cards.forEach((card, i) => {
      const link = card.querySelector('a');
      expect(link?.getAttribute('href')).toBe(`/docs/components/${PICKERS[i].id}`);
    });
  });

  it('passes axe', async () => {
    const { container } = render(<PickerGrid />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
