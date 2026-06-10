import { useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import HeroDemo from '../components/HeroDemo';

/**
 * Local-only recorder route. Driven by Playwright in scripts/record-hero.mjs
 * to produce hero-light.webp / hero-dark.webp.
 *
 * Query params:
 *   ?frame=N — render HeroDemo with initialFrame=N, autoplay=false
 *
 * Theme is driven by Playwright's `colorScheme` context option (sets
 * prefers-color-scheme on the page). Docusaurus is configured with
 * respectPrefersColorScheme:true so that's the only way to make the first
 * paint render in the requested theme; toggling data-theme after mount is
 * overwritten by Docusaurus's own theme manager.
 *
 * The body is wrapped in <BrowserOnly> because Docusaurus SSGs this page at
 * build time — HeroDemo's matchMedia call would crash without a window.
 * Hidden from production search engines via noindex meta. Not linked from
 * any nav surface.
 */
export default function RecorderRoute() {
  return (
    <Layout
      title="hero recorder (local)"
      noFooter
      wrapperClassName="hero-recorder-page">
      <meta name="robots" content="noindex,nofollow" />
      {/* Hide every piece of Docusaurus chrome — this route is screenshot
          fodder only, so heavy-handed CSS is fine. The hero must fill the
          entire 960×540 viewport without nav/announcement/footer bleed. */}
      <style>{`
        .navbar,
        .announcementBar_node_modules-\\@docusaurus-theme-classic-lib-theme-AnnouncementBar-styles-module,
        [class*="announcementBar"],
        .theme-doc-footer,
        footer {
          display: none !important;
        }
        html, body, #__docusaurus, .main-wrapper, .hero-recorder-page {
          background: var(--ifm-background-color) !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <BrowserOnly fallback={<div />}>
        {() => <RecorderBody />}
      </BrowserOnly>
    </Layout>
  );
}

function RecorderBody() {
  // Parse the frame index synchronously on mount. <BrowserOnly> guarantees
  // we're already on the client, so window.location is available. Using
  // useEffect to update frame after mount would race HeroDemo: HeroDemo
  // captures initialFrame into its own useState on first render and ignores
  // subsequent prop changes, so the effect would never reach the picker.
  const [frame] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const n = Number(params.get('frame'));
    return Number.isInteger(n) && n >= 0 && n < 7 ? n : 0;
  });

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
