import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@docusaurus/Translate', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  translate: ({ message }: { message: string }) => message,
}));

import PickerSelector from '../PickerSelector';
import { PICKER_IDS, CLASSNAMES_BY_PICKER } from '../classNamesByPicker';
import ClassNamesEditor from '../ClassNamesEditor';

describe('<PickerSelector>', () => {
  it('renders an option for each picker id', () => {
    render(<PickerSelector value="datepicker" onChange={() => {}} />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(PICKER_IDS.length);
  });

  it('calls onChange with the selected picker id', () => {
    const handle = vi.fn();
    render(<PickerSelector value="datepicker" onChange={handle} />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    fireEvent.change(select, { target: { value: 'timepicker' } });
    expect(handle).toHaveBeenCalledWith('timepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<PickerSelector value="datepicker" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('<ClassNamesEditor>', () => {
  it('renders one input per leaf entry for the active picker', () => {
    render(<ClassNamesEditor pickerId="datepicker" value={CLASSNAMES_BY_PICKER.datepicker} onChange={() => {}} />);
    const inputs = screen.getAllByRole('textbox');
    // datepicker has 1 (input) + 10 (calendar.*) = 11 leaf entries
    expect(inputs.length).toBe(11);
  });

  it('calls onChange when a leaf input is edited', () => {
    const handle = vi.fn();
    render(<ClassNamesEditor pickerId="datepicker" value={CLASSNAMES_BY_PICKER.datepicker} onChange={handle} />);
    const dayInput = screen.getByLabelText('calendar.day');
    fireEvent.change(dayInput, { target: { value: 'bg-indigo-100' } });
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
