import type { CSSProperties } from 'react';

/**
 * Visually-hidden style for screen-reader-only content (live regions, extra labels).
 * Shared across Root/Calendar live regions so the constant isn't duplicated per component.
 */
export const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
