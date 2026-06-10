import * as React from 'react';

/**
 * Vitest stub for @docusaurus/BrowserOnly.
 *
 * Always renders the SSG `fallback`. `children` is declared in the prop
 * signature for type compatibility with the real BrowserOnly API but is
 * intentionally never invoked — every test using a BrowserOnly-wrapped
 * component either mocks the wrapping component (e.g. HeroDemoSlot) or
 * asserts only on the fallback markup.
 */
export default function BrowserOnly({
  fallback,
}: {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children?: () => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <>{fallback ?? null}</>;
}
