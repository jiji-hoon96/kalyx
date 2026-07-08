import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  setTime,
  getTime,
  parseTimeString,
  formatTimeString,
  to12Hour,
  to24Hour,
  generateHours,
  generateMinutes,
  isSameTime,
} from '../utils/time.js';
import type { TimeValue } from '../utils/time.js';

// Property-based hardening of the time-of-day layer (the third leg of the
// timezone -> calendar -> date sweep). The time utils are pure and total over
// small integer domains, which makes their algebraic laws — round-trips,
// bijections, idempotence — cheap to state and expensive to violate. Example
// tests pin a handful of clock values; these assert the laws across the whole
// 24h x 60m x 60s space plus every AM/PM hour and every minute step.

const hours = () => fc.integer({ min: 0, max: 23 });
const minutes = () => fc.integer({ min: 0, max: 59 });
const seconds = () => fc.integer({ min: 0, max: 59 });

const timeValue = (): fc.Arbitrary<TimeValue> =>
  fc.record({ hours: hours(), minutes: minutes(), seconds: seconds() });

// A UTC instant that is not a leap-second-adjacent edge, so the H/M/S we read
// back are exactly the H/M/S we wrote.
const isoInstant = () =>
  fc
    .date({
      min: new Date('1970-01-01T00:00:00.000Z'),
      max: new Date('2060-01-01T00:00:00.000Z'),
      noInvalidDate: true,
    })
    .map((d) => d.toISOString());

describe('setTime / getTime round-trip (property-based)', () => {
  it('getTime reads back exactly what setTime wrote', () => {
    fc.assert(
      fc.property(isoInstant(), timeValue(), (iso, time) => {
        const stamped = setTime(iso, time);
        expect(getTime(stamped)).toEqual(time);
      }),
    );
  });

  it('setTime only touches the time-of-day, never the calendar date', () => {
    fc.assert(
      fc.property(isoInstant(), timeValue(), (iso, time) => {
        const stamped = setTime(iso, time);
        // The UTC date portion (YYYY-MM-DD) is preserved because every field we
        // set is in-range (0-23 / 0-59), so no field ever overflows into the day.
        expect(stamped.slice(0, 10)).toBe(iso.slice(0, 10));
      }),
    );
  });

  it('setTime is idempotent for a fully-specified TimeValue', () => {
    fc.assert(
      fc.property(isoInstant(), timeValue(), (iso, time) => {
        const once = setTime(iso, time);
        const twice = setTime(once, time);
        expect(twice).toBe(once);
      }),
    );
  });

  it('a partial setTime leaves the omitted fields untouched', () => {
    fc.assert(
      fc.property(isoInstant(), hours(), (iso, h) => {
        const before = getTime(iso);
        const after = getTime(setTime(iso, { hours: h }));
        expect(after.hours).toBe(h);
        expect(after.minutes).toBe(before.minutes);
        expect(after.seconds).toBe(before.seconds);
      }),
    );
  });
});

describe('to12Hour / to24Hour bijection (property-based)', () => {
  it('to24Hour(to12Hour(h)) is the identity over 0..23', () => {
    fc.assert(
      fc.property(hours(), (h) => {
        const { hours12, period } = to12Hour(h);
        expect(to24Hour(hours12, period)).toBe(h);
      }),
    );
  });

  it('to12Hour always yields a 12-hour clock value in 1..12', () => {
    fc.assert(
      fc.property(hours(), (h) => {
        const { hours12 } = to12Hour(h);
        expect(hours12).toBeGreaterThanOrEqual(1);
        expect(hours12).toBeLessThanOrEqual(12);
      }),
    );
  });

  it('period is AM strictly below noon and PM at/above noon', () => {
    fc.assert(
      fc.property(hours(), (h) => {
        const { period } = to12Hour(h);
        expect(period).toBe(h < 12 ? 'AM' : 'PM');
      }),
    );
  });

  it('to12Hour(to24Hour(h12, period)) round-trips the 12-hour form', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        fc.constantFrom<'AM' | 'PM'>('AM', 'PM'),
        (h12, period) => {
          const h24 = to24Hour(h12, period);
          expect(to12Hour(h24)).toEqual({ hours12: h12, period });
        },
      ),
    );
  });

  it('to12Hour throws for any integer outside 0..23', () => {
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n < 0 || n > 23),
        (bad) => {
          expect(() => to12Hour(bad)).toThrow(RangeError);
        },
      ),
    );
  });

  it('to24Hour throws for any 12-hour value outside 1..12', () => {
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n < 1 || n > 12),
        fc.constantFrom<'AM' | 'PM'>('AM', 'PM'),
        (bad, period) => {
          expect(() => to24Hour(bad, period)).toThrow(RangeError);
        },
      ),
    );
  });
});

describe('parseTimeString / formatTimeString round-trip (property-based)', () => {
  it('parseTimeString(formatTimeString(t, true)) recovers the TimeValue', () => {
    fc.assert(
      fc.property(timeValue(), (t) => {
        const formatted = formatTimeString(t, true); // HH:MM:SS
        expect(parseTimeString(formatted)).toEqual(t);
      }),
    );
  });

  it('the HH:MM form round-trips with seconds defaulting to 0', () => {
    fc.assert(
      fc.property(hours(), minutes(), (h, m) => {
        const formatted = formatTimeString({ hours: h, minutes: m, seconds: 0 }, false);
        expect(parseTimeString(formatted)).toEqual({ hours: h, minutes: m, seconds: 0 });
      }),
    );
  });

  it('formatTimeString always zero-pads to a fixed width', () => {
    fc.assert(
      fc.property(timeValue(), (t) => {
        expect(formatTimeString(t, false)).toMatch(/^\d{2}:\d{2}$/);
        expect(formatTimeString(t, true)).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      }),
    );
  });

  it('parseTimeString rejects any hour/minute/second outside its clock range', () => {
    fc.assert(
      fc.property(fc.integer({ min: 24, max: 99 }), minutes(), (badHour, m) => {
        expect(parseTimeString(`${badHour}:${String(m).padStart(2, '0')}`)).toBeNull();
      }),
    );
  });
});

describe('generateHours / generateMinutes structure (property-based)', () => {
  it('generateMinutes(step) is a strictly increasing multiples-of-step list within 0..59', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 60 }), (step) => {
        const list = generateMinutes(step);
        expect(list[0]).toBe(0);
        for (let i = 0; i < list.length; i++) {
          expect(list[i]).toBe(i * step);
          expect(list[i]).toBeLessThan(60);
        }
        // The list is exactly ceil(60/step) long.
        expect(list.length).toBe(Math.ceil(60 / step));
      }),
    );
  });

  it('generateMinutes throws outside 1..60', () => {
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n < 1 || n > 60),
        (bad) => {
          expect(() => generateMinutes(bad)).toThrow();
        },
      ),
    );
  });

  it('generateHours yields the canonical 24h or 12h ranges', () => {
    expect(generateHours('24h')).toEqual(Array.from({ length: 24 }, (_, i) => i));
    expect(generateHours('12h')).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
  });
});

describe('isSameTime is an equivalence relation (property-based)', () => {
  it('is reflexive', () => {
    fc.assert(
      fc.property(timeValue(), (t) => {
        expect(isSameTime(t, t)).toBe(true);
      }),
    );
  });

  it('is symmetric', () => {
    fc.assert(
      fc.property(timeValue(), timeValue(), (a, b) => {
        expect(isSameTime(a, b)).toBe(isSameTime(b, a));
      }),
    );
  });

  it('agrees with structural equality of all three fields', () => {
    fc.assert(
      fc.property(timeValue(), timeValue(), (a, b) => {
        const structural =
          a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds;
        expect(isSameTime(a, b)).toBe(structural);
      }),
    );
  });
});
