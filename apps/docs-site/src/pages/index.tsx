import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import StatStrip from '../components/StatStrip';
import FeatureGrid from '../components/FeatureGrid';
import SameJsxBlock from '../components/SameJsxBlock';
import PickerGrid from '../components/PickerGrid';
import WhyKalyx from '../components/WhyKalyx';
import GetStarted from '../components/GetStarted';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Kalyx — seven date primitives, one API"
      description="Headless React DatePicker + 6 sibling primitives. Zero CSS, SSR-safe, ≤16 KB gzipped.">
      <main>
        <Hero />
        <StatStrip />
        <FeatureGrid />
        <SameJsxBlock />
        <PickerGrid />
        <WhyKalyx />
        <GetStarted />
      </main>
    </Layout>
  );
}
