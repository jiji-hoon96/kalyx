import { useState } from 'react';
import { DatePicker } from '@kalyx/react';
import styles from './SameJsxBlock.module.css';

/**
 * Live style-switch demo body. Renders ONE real <DatePicker> and swaps only
 * the `classNames` between three styling stories (Tailwind / shadcn / plain
 * CSS) — proving the "same JSX, your styles" claim by showing the identical
 * component actually re-skin, not just three static code snippets.
 *
 * Loaded via BrowserOnly + lazy from index.tsx (like HeroDemo) so SSG never
 * imports @kalyx/react and the chunk is client-only.
 *
 * The calendar body is rendered directly inside Root (no Popover) so it is
 * always visible in the demo panel — same trick HeroDemo uses.
 */

const FROZEN = '2026-06-15T00:00:00.000Z';

type VariantId = 'tailwind' | 'shadcn' | 'plain';

// Tailwind Play CDN is loaded + scoped to `.tw-enable`; the plain/shadcn
// variants use the site's kx-live-* / kx-shadcn-* classes from custom.css.
const CLASSNAMES: Record<VariantId, Record<string, string>> = {
  tailwind: {
    root: 'rounded-xl border border-slate-200 bg-white p-3 shadow-lg',
    header: 'mb-2 flex items-center justify-between',
    navButton:
      'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100',
    title: 'text-sm font-semibold text-slate-800',
    grid: 'border-separate [border-spacing:4px]',
    weekdayHeader: 'text-xs font-medium text-slate-400',
    day: 'flex h-9 w-9 items-center justify-center rounded-md text-sm text-slate-700 transition hover:bg-slate-100',
    daySelected: 'bg-primary text-white hover:bg-primary',
    dayToday: 'font-semibold text-primary ring-1 ring-inset ring-primary/50',
    dayOutsideMonth: 'text-slate-300',
  },
  shadcn: {
    root: 'kx-shadcn kx-shadcn-popover',
    header: 'kx-live-header',
    navButton: 'kx-shadcn-nav',
    title: 'kx-shadcn-title',
    grid: 'kx-live-grid',
    weekdayHeader: 'kx-shadcn-weekday',
    day: 'kx-shadcn-day',
    daySelected: 'kx-shadcn-day-selected',
    dayToday: 'kx-shadcn-day-today',
    dayOutsideMonth: 'kx-live-outside',
  },
  plain: {
    root: 'kx-live-popover',
    header: 'kx-live-header',
    navButton: 'kx-live-nav',
    title: 'kx-live-title',
    grid: 'kx-live-grid',
    weekdayHeader: 'kx-live-weekday',
    gridCell: 'kx-live-cell',
    day: 'live-day',
    daySelected: 'live-day-selected',
    dayToday: 'live-day-today',
    dayOutsideMonth: 'kx-live-outside',
  },
};

export const CODE: Record<VariantId, string> = {
  tailwind: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Calendar classNames={{
    day: 'rounded hover:bg-slate-100',
    daySelected: 'bg-indigo-600 text-white',
  }} />
</DatePicker>`,
  shadcn: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Calendar classNames={{
    day: cn(dayBase),
    daySelected: cn(dayBase, daySelected),
  }} />
</DatePicker>`,
  plain: `<DatePicker value={iso} onChange={setIso}>
  <DatePicker.Calendar classNames={{
    day: 'kx-day',
    daySelected: 'kx-day-selected',
  }} />
</DatePicker>`,
};

export const VARIANTS: { id: VariantId; label: string }[] = [
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'shadcn', label: 'shadcn / cva' },
  { id: 'plain', label: 'Plain CSS' },
];

export default function SameJsxDemo({ variant }: { variant: VariantId }) {
  const [iso, setIso] = useState<string | null>(FROZEN);
  return (
    <div className={`tw-enable ${styles.previewInner}`} data-variant={variant}>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Calendar classNames={CLASSNAMES[variant]} />
      </DatePicker>
    </div>
  );
}
