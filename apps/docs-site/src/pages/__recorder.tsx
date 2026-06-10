import { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import HeroDemo from '../components/HeroDemo';

/**
 * Local-only recorder route. Driven by Playwright in scripts/record-hero.mjs
 * to produce hero-light.webp / hero-dark.webp.
 *
 * Query params:
 *   ?frame=N        — render HeroDemo with initialFrame=N, autoplay=false
 *   ?theme=light|dark — sets [data-theme] on <html> so dark-mode styles apply
 *
 * Hidden from production search engines via noindex meta. Not linked from
 * anywhere in the docs sidebar/nav. The body is wrapped in <BrowserOnly>
 * because Docusaurus SSGs this page at build time — HeroDemo's matchMedia
 * call would crash without a window.
 */
export default function RecorderRoute() {
  return (
    <Layout
      title="hero recorder (local)"
      noFooter
      wrapperClassName="hero-recorder-page">
      <meta name="robots" content="noindex,nofollow" />
      <BrowserOnly fallback={<div />}>
        {() => <RecorderBody />}
      </BrowserOnly>
    </Layout>
  );
}

function RecorderBody() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = Number(params.get('frame'));
    if (Number.isInteger(n) && n >= 0 && n < 7) {
      setFrame(n);
    }
    const theme = params.get('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  return (
    <div
      style={{
        width: 960,
        height: 540,
        margin: '0 auto',
        padding: 20,
        background: 'var(--ifm-background-color)',
      }}>
      <HeroDemo initialFrame={frame} autoplay={false} />
    </div>
  );
}
