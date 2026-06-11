import { useState } from 'react';
import { DateTimePicker } from '@kalyx/react';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T14:30:00.000Z');
  const [tz, setTz] = useState<string>('Asia/Seoul');

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Kalyx — DateTimePicker × timezone</h1>
      <p>Stored ISO is always UTC; display shifts per timezone.</p>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Timezone:&nbsp;
        <select value={tz} onChange={e => setTz(e.target.value)}>
          <option>UTC</option>
          <option>Asia/Seoul</option>
          <option>America/New_York</option>
          <option>Europe/London</option>
        </select>
      </label>
      <DateTimePicker value={iso} onChange={setIso} displayTimezone={tz}>
        <DateTimePicker.Input />
        <DateTimePicker.Popover>
          <DateTimePicker.Calendar />
          <div style={{ display: 'flex', gap: 12 }}>
            <DateTimePicker.HourList />
            <DateTimePicker.MinuteList />
          </div>
        </DateTimePicker.Popover>
      </DateTimePicker>
      <pre style={{ marginTop: 16 }}>{JSON.stringify({ iso, displayTimezone: tz }, null, 2)}</pre>
    </div>
  );
}
