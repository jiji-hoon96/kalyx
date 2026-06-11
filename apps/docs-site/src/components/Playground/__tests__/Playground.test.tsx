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
import LocaleTimezoneToggles from '../LocaleTimezoneToggles';
import PreviewPanel from '../PreviewPanel';
import OpenInStackBlitz from '../OpenInStackBlitz';
import sdk from '@stackblitz/sdk';
import Playground from '../index';

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

describe('<LocaleTimezoneToggles>', () => {
  it('renders 4 locale options and 4 timezone options', () => {
    render(<LocaleTimezoneToggles locale="en-US" timezone="UTC" onLocaleChange={() => {}} onTimezoneChange={() => {}} />);
    const localeSelect = screen.getByRole('combobox', { name: /locale/i });
    const tzSelect = screen.getByRole('combobox', { name: /timezone/i });
    expect(localeSelect.querySelectorAll('option')).toHaveLength(4);
    expect(tzSelect.querySelectorAll('option')).toHaveLength(4);
  });

  it('reports locale change', () => {
    const onLocale = vi.fn();
    render(<LocaleTimezoneToggles locale="en-US" timezone="UTC" onLocaleChange={onLocale} onTimezoneChange={() => {}} />);
    fireEvent.change(screen.getByRole('combobox', { name: /locale/i }), { target: { value: 'ko-KR' } });
    expect(onLocale).toHaveBeenCalledWith('ko-KR');
  });
});

describe('<PreviewPanel>', () => {
  it('renders a DatePicker when pickerId="datepicker"', () => {
    render(
      <PreviewPanel
        pickerId="datepicker"
        classNames={CLASSNAMES_BY_PICKER.datepicker}
        locale="en-US"
        timezone="UTC"
      />
    );
    // DatePicker.Input ends up as a button/combobox at the top of the tree
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('datepicker');
  });

  it('switches to TimePicker when pickerId="timepicker"', () => {
    const { rerender } = render(
      <PreviewPanel pickerId="datepicker" classNames={CLASSNAMES_BY_PICKER.datepicker} locale="en-US" timezone="UTC" />
    );
    rerender(
      <PreviewPanel pickerId="timepicker" classNames={CLASSNAMES_BY_PICKER.timepicker} locale="en-US" timezone="UTC" />
    );
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('timepicker');
  });
});

describe('<OpenInStackBlitz>', () => {
  it('renders a button that calls sdk.openProject when clicked', () => {
    const openProject = vi.spyOn(sdk, 'openProject');
    render(
      <OpenInStackBlitz
        pickerId="datepicker"
        classNames={CLASSNAMES_BY_PICKER.datepicker}
        locale="en-US"
        timezone="UTC"
      />
    );
    const btn = screen.getByRole('button', { name: /open in stackblitz/i });
    fireEvent.click(btn);
    expect(openProject).toHaveBeenCalledTimes(1);
    const arg = openProject.mock.calls[0][0] as { title: string; files: Record<string, string> };
    expect(arg.title).toContain('datepicker');
    expect(arg.files['src/App.tsx']).toContain('<DatePicker');
    openProject.mockRestore();
  });
});

describe('<Playground>', () => {
  it('renders all four controls + preview + StackBlitz button', () => {
    render(<Playground />);
    expect(screen.getByRole('combobox', { name: /picker/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /locale/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /timezone/i })).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open in stackblitz/i })).toBeInTheDocument();
  });

  it('changing picker selector swaps the preview', () => {
    render(<Playground />);
    const select = screen.getByRole('combobox', { name: /picker/i });
    fireEvent.change(select, { target: { value: 'timepicker' } });
    expect(screen.getByTestId('preview-panel').getAttribute('data-picker')).toBe('timepicker');
  });

  it('passes axe', async () => {
    const { container } = render(<Playground />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
