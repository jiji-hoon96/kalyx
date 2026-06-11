import { useState } from 'react';
import { DatePicker } from '@kalyx/react';
import { cn } from './cn';

const inputBase = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const dayBase = 'h-9 w-9 p-0 font-normal aria-selected:opacity-100';
const daySelected = 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground';

export default function App() {
  const [iso, setIso] = useState<string | null>('2026-06-15T00:00:00.000Z');
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Kalyx × shadcn-style classes</h1>
      <DatePicker value={iso} onChange={setIso}>
        <DatePicker.Input className={cn(inputBase)} />
        <DatePicker.Popover>
          <DatePicker.Calendar classNames={{
            day: cn(dayBase),
            daySelected: cn(dayBase, daySelected),
          }} />
        </DatePicker.Popover>
      </DatePicker>
      <pre className="mt-4 p-3 bg-slate-100 rounded">{JSON.stringify({ iso }, null, 2)}</pre>
    </div>
  );
}
