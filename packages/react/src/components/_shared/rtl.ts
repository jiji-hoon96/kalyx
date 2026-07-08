/** Layout direction for the picker. Mirrors the HTML `dir` attribute. */
export type Direction = 'ltr' | 'rtl';

/**
 * In a WAI-ARIA date grid the arrow keys follow *physical* layout, not logical
 * order. When the calendar is laid out right-to-left (`dir="rtl"`), the visually
 * left cell is the *next* day and the visually right cell is the *previous* day,
 * so ArrowLeft/ArrowRight must be swapped. ArrowUp/ArrowDown (row movement) and
 * Home/End (start/end of the visual row) are unaffected — the grid still reads
 * top-to-bottom and Home/End map to the week's first/last day via `weekStartsOn`.
 *
 * Returns the day offset for the four horizontal-relevant keys, or `null` for
 * keys this helper doesn't own.
 *
 * @example
 * // LTR: ArrowLeft = −1 day, ArrowRight = +1 day
 * // RTL: ArrowLeft = +1 day, ArrowRight = −1 day
 */
export function horizontalDayStep(key: string, dir: Direction): number | null {
  const rtl = dir === 'rtl';
  switch (key) {
    case 'ArrowLeft':
      return rtl ? 1 : -1;
    case 'ArrowRight':
      return rtl ? -1 : 1;
    default:
      return null;
  }
}

/**
 * Whether a navigation key moves focus "backwards" (towards earlier dates) for
 * the disabled-cell skip loop. In RTL the physical ArrowLeft/ArrowRight are
 * swapped, so this must account for `dir`; the vertical / page / Home keys keep
 * their logical direction regardless of layout.
 */
export function isBackwardKey(key: string, dir: Direction): boolean {
  const rtl = dir === 'rtl';
  switch (key) {
    case 'ArrowLeft':
      // Physically-left cell is a *later* date in RTL, so it's forward there.
      return !rtl;
    case 'ArrowRight':
      return rtl;
    case 'ArrowUp':
    case 'PageUp':
    case 'Home':
      return true;
    default:
      return false;
  }
}
