import * as React from 'react';

/**
 * Vitest stub for @docusaurus/Link.
 * Renders a plain <a> so tests can assert on links without a Docusaurus build.
 */
type LinkProps = {
  to?: string;
  href?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Link({ to, href, children, ...rest }: LinkProps) {
  return (
    <a href={to ?? href} {...rest}>
      {children}
    </a>
  );
}
