import * as React from 'react';

/**
 * Vitest stub for @docusaurus/Translate.
 * Passes children through unchanged.
 */
export default function Translate({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function translate({ message }: { message: string }): string {
  return message;
}
