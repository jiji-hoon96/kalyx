import { useState } from 'react';
import { RangePicker, type DateRange } from '@kalyx/react';

const ISO_NOW = '2026-06-15T00:00:00.000Z';

export default function App() {
  const [range, setRange] = useState<DateRange>({ start: ISO_NOW, end: '2026-06-22T00:00:00.000Z' });

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — RangePicker with presets</h1>
      <RangePicker value={range} onChange={setRange}>
        <RangePicker.Input part="start" />
        <RangePicker.Input part="end" />
        <RangePicker.Popover>
          <RangePicker.Presets>
            <RangePicker.Preset value="last7days">Last 7 days</RangePicker.Preset>
            <RangePicker.Preset value="last30days">Last 30 days</RangePicker.Preset>
            <RangePicker.Preset value="thisMonth">This month</RangePicker.Preset>
          </RangePicker.Presets>
          <RangePicker.Calendar />
        </RangePicker.Popover>
      </RangePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify(range, null, 2)}</pre>
    </div>
  );
}
