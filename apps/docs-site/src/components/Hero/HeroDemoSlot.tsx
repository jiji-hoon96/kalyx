import { lazy, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import StaticHero from './StaticHero';

const HeroDemo = lazy(() => import('../HeroDemo'));

/**
 * The right column of the hero. Wraps <HeroDemo> in BrowserOnly +
 * Suspense so:
 *   - the SSG pass emits only <StaticHero /> (no React.lazy on the server)
 *   - the lazy chunk replaces the placeholder once it loads on the client
 *
 * Marked with data-testid so smoke tests can assert the slot exists
 * without resolving the real HeroDemo (which would pull in @kalyx/react).
 */
export default function HeroDemoSlot() {
  return (
    <div data-testid="hero-demo-slot">
      <BrowserOnly fallback={<StaticHero />}>
        {() => (
          <Suspense fallback={<StaticHero />}>
            <HeroDemo />
          </Suspense>
        )}
      </BrowserOnly>
    </div>
  );
}
