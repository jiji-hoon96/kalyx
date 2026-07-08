import { describe, it, expect } from 'vitest';
import { horizontalDayStep, isBackwardKey } from '../_shared/rtl.js';

// Pure-function contract for the RTL keyboard helpers. In a WAI-ARIA date grid
// the arrow keys follow the *physical* layout, so when the calendar is laid out
// right-to-left the horizontal arrows must be mirrored. Vertical / page / Home
// / End keys keep their logical direction regardless of layout.
describe('rtl — horizontalDayStep', () => {
  it('LTR: ArrowLeft = −1 day, ArrowRight = +1 day', () => {
    expect(horizontalDayStep('ArrowLeft', 'ltr')).toBe(-1);
    expect(horizontalDayStep('ArrowRight', 'ltr')).toBe(1);
  });

  it('RTL: ArrowLeft = +1 day, ArrowRight = −1 day (mirrored)', () => {
    expect(horizontalDayStep('ArrowLeft', 'rtl')).toBe(1);
    expect(horizontalDayStep('ArrowRight', 'rtl')).toBe(-1);
  });

  it('returns null for keys it does not own (vertical / page / home / other)', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      expect(horizontalDayStep('ArrowUp', dir)).toBeNull();
      expect(horizontalDayStep('ArrowDown', dir)).toBeNull();
      expect(horizontalDayStep('PageUp', dir)).toBeNull();
      expect(horizontalDayStep('Home', dir)).toBeNull();
      expect(horizontalDayStep('Enter', dir)).toBeNull();
    }
  });
});

describe('rtl — isBackwardKey', () => {
  it('LTR: ArrowLeft/Up/PageUp/Home step backwards, ArrowRight forwards', () => {
    expect(isBackwardKey('ArrowLeft', 'ltr')).toBe(true);
    expect(isBackwardKey('ArrowRight', 'ltr')).toBe(false);
    expect(isBackwardKey('ArrowUp', 'ltr')).toBe(true);
    expect(isBackwardKey('PageUp', 'ltr')).toBe(true);
    expect(isBackwardKey('Home', 'ltr')).toBe(true);
    expect(isBackwardKey('ArrowDown', 'ltr')).toBe(false);
  });

  it('RTL: only the horizontal arrows flip; vertical/page/home keep logical direction', () => {
    // Physically-left cell is a *later* date in RTL → ArrowLeft is forward.
    expect(isBackwardKey('ArrowLeft', 'rtl')).toBe(false);
    expect(isBackwardKey('ArrowRight', 'rtl')).toBe(true);
    // Row / page / home are unaffected by layout direction.
    expect(isBackwardKey('ArrowUp', 'rtl')).toBe(true);
    expect(isBackwardKey('PageUp', 'rtl')).toBe(true);
    expect(isBackwardKey('Home', 'rtl')).toBe(true);
    expect(isBackwardKey('ArrowDown', 'rtl')).toBe(false);
  });
});
