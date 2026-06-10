import Translate from '@docusaurus/Translate';
import styles from './SameJsxBlock.module.css';

type Variant = {
  id: 'tailwind' | 'shadcn' | 'plain';
  label: string;
  code: string;
};

const VARIANTS: readonly Variant[] = [
  {
    id: 'tailwind',
    label: 'Tailwind',
    code: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input
    className="border rounded px-2 py-1" />
  <DatePicker.Popover>
    <DatePicker.Calendar classNames={{
      day: 'rounded hover:bg-slate-100',
      daySelected: 'bg-indigo-600 text-white',
    }} />
  </DatePicker.Popover>
</DatePicker>`,
  },
  {
    id: 'shadcn',
    label: 'shadcn / cva',
    code: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input className={cn(inputBase)} />
  <DatePicker.Popover>
    <DatePicker.Calendar classNames={{
      day: cn(dayBase),
      daySelected: cn(dayBase, daySelected),
    }} />
  </DatePicker.Popover>
</DatePicker>`,
  },
  {
    id: 'plain',
    label: 'Plain CSS',
    code: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Input className="kx-input" />
  <DatePicker.Popover>
    <DatePicker.Calendar classNames={{
      day: 'kx-day',
      daySelected: 'kx-day-selected',
    }} />
  </DatePicker.Popover>
</DatePicker>`,
  },
] as const;

export default function SameJsxBlock() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <Translate id="home.sameJsx.eyebrow">Same JSX, your styles</Translate>
          </span>
          <h2 className={styles.heading}>
            <Translate id="home.sameJsx.heading">
              One component. Every styling story.
            </Translate>
          </h2>
          <p className={styles.body}>
            <Translate id="home.sameJsx.body">
              Pass any class string to any part. No CSS file to import, no
              theme provider to wrap. The library never touches your design
              system.
            </Translate>
          </p>
        </div>

        <div className={styles.grid}>
          {VARIANTS.map(v => (
            <div
              key={v.id}
              data-testid="jsx-variant"
              data-variant={v.id}
              className={styles.variant}>
              <div className={styles.variantLabel}>{v.label}</div>
              <pre className={styles.code}>
                <code>{v.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
