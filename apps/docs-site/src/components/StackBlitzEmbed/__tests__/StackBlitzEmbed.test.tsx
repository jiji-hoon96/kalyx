import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import StackBlitzEmbed from '../index';

describe('<StackBlitzEmbed>', () => {
  it('renders an iframe with the correct StackBlitz URL', () => {
    render(<StackBlitzEmbed id="datepicker-basic" />);
    const iframe = screen.getByTitle(/kalyx example: datepicker-basic/i);
    expect(iframe.getAttribute('src')).toContain('stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic');
    expect(iframe.getAttribute('src')).toContain('embed=1');
    expect(iframe.getAttribute('src')).toContain('file=src/App.tsx');
    expect(iframe.getAttribute('loading')).toBe('lazy');
  });

  it('renders an "Open in StackBlitz" link to the same project', () => {
    render(<StackBlitzEmbed id="datepicker-basic" />);
    const link = screen.getByRole('link', { name: /open in stackblitz/i });
    expect(link.getAttribute('href')).toBe(
      'https://stackblitz.com/github/jiji-hoon96/kalyx/tree/main/examples/datepicker-basic'
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('renders a "View source" link to the example file on GitHub', () => {
    render(<StackBlitzEmbed id="datepicker-basic" />);
    const link = screen.getByRole('link', { name: /view source/i });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/jiji-hoon96/kalyx/blob/main/examples/datepicker-basic/src/App.tsx'
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('points View source at a custom file when provided', () => {
    render(<StackBlitzEmbed id="datepicker-tailwind" file="src/index.css" />);
    const link = screen.getByRole('link', { name: /view source/i });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/jiji-hoon96/kalyx/blob/main/examples/datepicker-tailwind/src/index.css'
    );
  });

  it('passes axe', async () => {
    const { container } = render(<StackBlitzEmbed id="datepicker-basic" />);
    // iframes cannot be accessed in jsdom; skip iframe rules to avoid internal axe errors.
    expect(await axe(container, { iframes: false })).toHaveNoViolations();
  });
});
