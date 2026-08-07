import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Presets/Preset live on the `/headless` entry only (keeps the default bundle
// under its gzip ceiling), so we import the headless-augmented DateTimePicker.
import { DateTimePicker } from './headless.js';

const MON_9AM = '2026-01-19T09:00:00.000Z'; // Monday
const TUE_3PM = '2026-01-20T15:30:00.000Z';

function renderWithPresets(onChange = vi.fn(), value?: string | null) {
  const result = render(
    <DateTimePicker value={value} onChange={onChange}>
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
        <DateTimePicker.Presets>
          <DateTimePicker.Preset value={MON_9AM}>Mon 9 AM</DateTimePicker.Preset>
          <DateTimePicker.Preset value={TUE_3PM}>Tue 3:30 PM</DateTimePicker.Preset>
        </DateTimePicker.Presets>
      </DateTimePicker.Popover>
    </DateTimePicker>,
  );
  return { ...result, onChange };
}

describe('DateTimePicker.Presets (B5)', () => {
  it('renders presets inside a labelled group', async () => {
    const user = userEvent.setup();
    renderWithPresets();
    await user.click(screen.getByRole('combobox'));
    const group = screen.getByRole('group', { name: /presets/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mon 9 AM' })).toBeInTheDocument();
  });

  it('commits the full datetime (date + time) atomically on click', async () => {
    const user = userEvent.setup();
    const { onChange } = renderWithPresets();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Mon 9 AM' }));
    // Both the date (Jan 19) and the time (09:00) land in a single onChange.
    expect(onChange).toHaveBeenCalledWith(MON_9AM);
  });

  it('does not preserve a previously selected time (unlike Calendar)', async () => {
    const user = userEvent.setup();
    // Start at a value with a 15:30 time — the preset must overwrite the time, not keep it.
    const { onChange } = renderWithPresets(vi.fn(), TUE_3PM);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Mon 9 AM' }));
    expect(onChange).toHaveBeenLastCalledWith(MON_9AM);
  });

  it('marks the active preset with aria-pressed', async () => {
    const user = userEvent.setup();
    renderWithPresets(vi.fn(), MON_9AM);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: 'Mon 9 AM' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Tue 3:30 PM' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('closes the popover after selecting a preset', async () => {
    const user = userEvent.setup();
    renderWithPresets();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mon 9 AM' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not commit when the picker is disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker value={null} onChange={onChange} disabled>
        <DateTimePicker.Input />
        <DateTimePicker.Presets>
          <DateTimePicker.Preset value={MON_9AM}>Mon 9 AM</DateTimePicker.Preset>
        </DateTimePicker.Presets>
      </DateTimePicker>,
    );
    const button = screen.getByRole('button', { name: 'Mon 9 AM' });
    expect(button).toBeDisabled();
    await user.click(button).catch(() => {});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    const { container } = renderWithPresets();
    await user.click(screen.getByRole('combobox'));
    expect(await axe(container)).toHaveNoViolations();
  });
});
