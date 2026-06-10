import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroDemo from '../index';
import { FRAME_DURATION_MS, sequence } from '../sequence';

describe('<HeroDemo>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first frame initially', () => {
    render(<HeroDemo />);
    // The current frame's label is rendered (data-testid on the label element).
    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );
  });

  it('advances to the next frame after FRAME_DURATION_MS', () => {
    render(<HeroDemo />);
    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );

    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS);
    });

    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[1].label
    );
  });

  it('wraps from the last frame back to the first', () => {
    render(<HeroDemo />);

    // Advance through all 7 frames -> we should be back at frame 0.
    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * sequence.length);
    });

    expect(screen.getByTestId('hero-demo-label')).toHaveTextContent(
      sequence[0].label
    );
  });

  it('exposes the current frame index via data attribute', () => {
    render(<HeroDemo />);
    const root = screen.getByTestId('hero-demo-root');
    expect(root.getAttribute('data-frame')).toBe('0');

    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * 3);
    });

    expect(root.getAttribute('data-frame')).toBe('3');
  });

  it('respects an explicit initialFrame prop (used by the recorder)', () => {
    render(<HeroDemo initialFrame={4} autoplay={false} />);
    expect(screen.getByTestId('hero-demo-root').getAttribute('data-frame')).toBe('4');

    // autoplay=false means timers do NOT advance the frame.
    act(() => {
      vi.advanceTimersByTime(FRAME_DURATION_MS * 5);
    });
    expect(screen.getByTestId('hero-demo-root').getAttribute('data-frame')).toBe('4');
  });
});
