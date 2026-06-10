import { describe, expect, it } from 'vitest';
import { sequence, FRAME_COUNT, FRAME_DURATION_MS } from '../sequence';

describe('hero sequence', () => {
  it('has exactly 7 frames', () => {
    expect(sequence).toHaveLength(7);
    expect(FRAME_COUNT).toBe(7);
  });

  it('each frame has a unique id', () => {
    const ids = sequence.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('frame ids match the 7 kalyx pickers in order', () => {
    expect(sequence.map(f => f.id)).toEqual([
      'datepicker',
      'rangepicker',
      'timepicker',
      'datetimepicker',
      'monthpicker',
      'yearpicker',
      'weekpicker',
    ]);
  });

  it('each frame has a non-empty label', () => {
    for (const frame of sequence) {
      expect(frame.label).toBeTruthy();
      expect(frame.label.length).toBeGreaterThan(0);
    }
  });

  it('frame duration is a positive integer in milliseconds', () => {
    expect(FRAME_DURATION_MS).toBeGreaterThan(0);
    expect(Number.isInteger(FRAME_DURATION_MS)).toBe(true);
  });

  it('total cycle duration fits the 6-second budget (±1s tolerance)', () => {
    const total = FRAME_DURATION_MS * FRAME_COUNT;
    expect(total).toBeGreaterThanOrEqual(5000);
    expect(total).toBeLessThanOrEqual(7000);
  });
});
