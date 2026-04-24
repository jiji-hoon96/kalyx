import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DatePicker } from './index.js';

function renderDatePicker(
  props: {
    value?: string | null;
    defaultValue?: string;
    onChange?: (v: string | null) => void;
    disabled?: boolean;
  } = {},
) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <DatePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
    >
      <DatePicker.Input aria-label="날짜 선택" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );
  return { ...result, onChange };
}

describe('DatePicker — basic interactions', () => {
  it('renders the input with combobox role', () => {
    renderDatePicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('keeps the popover closed on initial render', () => {
    renderDatePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the popover when the input is clicked', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls onChange with an ISO string when a day is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-15T/));
  });

  it('closes the popover after a date is selected', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popover when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the selected value in the input', () => {
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-15');
  });

  it('renders an empty input when value is null', () => {
    renderDatePicker({ value: null });
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});

describe('DatePicker — controlled / uncontrolled modes', () => {
  it('reflects the value prop in controlled mode', () => {
    renderDatePicker({ value: '2026-06-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');
  });

  it('shows defaultValue as the initial value in uncontrolled mode', () => {
    renderDatePicker({ defaultValue: '2026-03-20T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-03-20');
  });
});

describe('DatePicker — disabled state', () => {
  it('disables the input when disabled=true', () => {
    renderDatePicker({ disabled: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('DatePicker — calendar navigation', () => {
  it('navigates months with the previous/next buttons', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'February 2026');

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
  });
});

describe('DatePicker — keyboard navigation', () => {
  it('opens the calendar with ArrowDown', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('selects the focused day when Enter is pressed', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // Enter on the initially focused day (15)
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-15T/));
  });

  it('moves the focused day with arrow keys and selects it with Enter', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // ArrowRight advances by one day (to the 16th)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-16T/));
  });
});

describe('DatePicker — context errors', () => {
  it('throws when Input is used without Root', () => {
    expect(() => {
      render(<DatePicker.Input aria-label="test" />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });

  it('throws when Calendar is used without Root', () => {
    expect(() => {
      render(<DatePicker.Calendar />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('DatePicker — accessibility', () => {
  it('sets the correct ARIA attributes on the input', () => {
    renderDatePicker();
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
  });

  it('sets aria-expanded to true when the popover opens', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-label on the calendar grid', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'January 2026');
  });

  it('passes axe accessibility checks (closed state)', async () => {
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe accessibility checks (open state)', async () => {
    const user = userEvent.setup();
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // Exclude Floating UI focus guard elements from axe checks
    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('DatePicker — MonthGrid', () => {
  it('renders 12 months in the MonthGrid', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveTextContent('January');
    expect(cells[11]).toHaveTextContent('December');
  });

  it('marks the current month as aria-selected', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-03-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('invokes the onSelect callback when a month is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.MonthGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: 'June' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker — YearGrid', () => {
  it('renders 12 years in the YearGrid', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
  });

  it('marks the current year as aria-selected', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('gridcell', { name: '2026' })).toHaveAttribute('aria-selected', 'true');
  });

  it('invokes the onSelect callback when a year is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.YearGrid onSelect={onSelect} />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('gridcell', { name: '2025' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DatePicker — Trigger', () => {
  function renderWithTrigger(
    props: {
      value?: string | null;
      onChange?: (v: string | null) => void;
      disabled?: boolean;
    } = {},
  ) {
    const onChange = props.onChange ?? vi.fn();
    const result = render(
      <DatePicker value={props.value} onChange={onChange} disabled={props.disabled}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Trigger />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    return { ...result, onChange };
  }

  it('renders a button with the calendar icon', () => {
    renderWithTrigger();
    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector('svg')).toBeInTheDocument();
  });

  it('opens the popover when clicked', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Close calendar');
  });

  it('closes the popover when Escape is pressed after Trigger opens it', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sets aria-expanded and aria-controls correctly', async () => {
    const user = userEvent.setup();
    renderWithTrigger({ value: '2026-01-15T00:00:00.000Z' });

    const trigger = screen.getByRole('button', { name: 'Open calendar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('is disabled when the picker is disabled', () => {
    renderWithTrigger({ disabled: true });
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeDisabled();
  });

  it('renders custom children instead of the default icon', () => {
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Trigger>Open</DatePicker.Trigger>
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    expect(screen.getByRole('button', { name: 'Open calendar' })).toHaveTextContent('Open');
  });

  it('calls the custom onClick handler alongside toggling', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Trigger onClick={onClick} />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('DatePicker — event callbacks', () => {
  it('fires onOpenChange(true) when the popover opens', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('fires onOpenChange(false) when the popover closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('does not fire onOpenChange on initial mount', () => {
    const onOpenChange = vi.fn();
    render(
      <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()} onOpenChange={onOpenChange}>
        <DatePicker.Input aria-label="날짜 선택" />
      </DatePicker>,
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('fires onCalendarNavigate when the user navigates months', async () => {
    const user = userEvent.setup();
    const onCalendarNavigate = vi.fn();
    render(
      <DatePicker
        value="2026-01-15T00:00:00.000Z"
        onChange={vi.fn()}
        onCalendarNavigate={onCalendarNavigate}
      >
        <DatePicker.Input aria-label="날짜 선택" />
        <DatePicker.Popover>
          <DatePicker.Calendar />
        </DatePicker.Popover>
      </DatePicker>,
    );

    await user.click(screen.getByRole('combobox'));
    onCalendarNavigate.mockClear();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onCalendarNavigate).toHaveBeenCalledTimes(1);
    expect(onCalendarNavigate).toHaveBeenLastCalledWith(expect.stringMatching(/^2026-02-01T/));
  });
});

describe('DatePicker — Presets', () => {
  it('renders preset buttons inside a group', () => {
    render(
      <DatePicker onChange={vi.fn()}>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
          <DatePicker.Preset value="tomorrow">Tomorrow</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );
    expect(screen.getByRole('option', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tomorrow' })).toBeInTheDocument();
  });

  it('commits today when the today preset is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('option', { name: 'Today' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
  });

  it('commits the exact ISO when a direct date is passed via `date`', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('option', { name: 'Christmas' }));

    expect(onChange).toHaveBeenCalledWith('2026-12-25T00:00:00.000Z');
  });

  it('marks the matching preset as aria-selected', () => {
    render(
      <DatePicker value="2026-12-25T00:00:00.000Z" onChange={vi.fn()}>
        <DatePicker.Presets>
          <DatePicker.Preset date="2026-12-25T00:00:00.000Z">Christmas</DatePicker.Preset>
          <DatePicker.Preset date="2026-01-01T00:00:00.000Z">New Year's</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    expect(screen.getByRole('option', { name: 'Christmas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: "New Year's" })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('resolves startOfMonth relative to today', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Presets>
          <DatePicker.Preset value="startOfMonth">Start of month</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('option', { name: 'Start of month' }));

    // The first day of the current month (any month) — ends with "01T..."
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/-01T00:00:00\.000Z$/));
  });

  it('does nothing when the picker is disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker onChange={onChange} disabled>
        <DatePicker.Presets>
          <DatePicker.Preset value="today">Today</DatePicker.Preset>
        </DatePicker.Presets>
      </DatePicker>,
    );

    await user.click(screen.getByRole('option', { name: 'Today' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DatePicker — SSR safety', () => {
  it('renderToString runs without errors on the server', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <DatePicker value="2026-01-15T00:00:00.000Z" onChange={vi.fn()}>
          <DatePicker.Input aria-label="날짜" />
        </DatePicker>,
      );
    }).not.toThrow();
  });
});
