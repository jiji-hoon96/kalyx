import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DateTimePicker } from './index.js';

function renderDateTimePicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  format?: '12h' | '24h';
  step?: number;
  disabled?: boolean;
} = {}) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <DateTimePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      format={props.format}
      step={props.step}
      disabled={props.disabled}
    >
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
        <DateTimePicker.AmPmToggle />
      </DateTimePicker.Popover>
    </DateTimePicker>,
  );
  return { ...result, onChange };
}

/** 제어 모드 wrapper */
function ControlledDateTimePicker({
  initialValue,
  format = '24h',
  step = 1,
  onChange,
}: {
  initialValue: string;
  format?: '12h' | '24h';
  step?: number;
  onChange?: (v: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  return (
    <DateTimePicker
      value={value}
      format={format}
      step={step}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <DateTimePicker.Input />
      <DateTimePicker.Popover>
        <DateTimePicker.Calendar />
        <DateTimePicker.HourList />
        <DateTimePicker.MinuteList />
        <DateTimePicker.AmPmToggle />
      </DateTimePicker.Popover>
    </DateTimePicker>
  );
}

describe('DateTimePicker — 기본 렌더링', () => {
  it('Input이 combobox 역할을 가진다', () => {
    renderDateTimePicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜 및 시간')).toBeInTheDocument();
  });

  it('초기에 팝오버가 닫혀 있다', () => {
    renderDateTimePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Input 클릭 → 팝오버 열림 (Calendar + TimeList)', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });

    await user.click(screen.getByLabelText('날짜 및 시간'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument(); // Calendar
    expect(screen.getByRole('listbox', { name: '시' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '분' })).toBeInTheDocument();
  });

  it('값이 "yyyy-MM-dd HH:mm" 형식으로 표시된다', () => {
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('날짜 및 시간')).toHaveValue('2026-01-15 14:30');
  });

  it('value=null이면 input이 비어있다', () => {
    renderDateTimePicker({ value: null });
    expect(screen.getByLabelText('날짜 및 시간')).toHaveValue('');
  });
});

describe('DateTimePicker — 날짜/시간 분리 보존', () => {
  it('날짜 클릭 → 날짜만 변경, 시간 보존', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('날짜 및 시간'));

    // 20일 클릭
    const day20 = screen.getByRole('button', { name: /January 20, 2026/ });
    await user.click(day20);

    const newValue = onChange.mock.calls[0]![0] as string;
    // 날짜는 20일로 변경됐어야 함
    expect(newValue).toMatch(/^2026-01-20T/);
    // 시간(14:30)은 보존됐어야 함
    expect(newValue).toMatch(/T14:30:00/);
  });

  it('시 변경 → 시만 변경, 날짜와 분 보존', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('날짜 및 시간'));

    // 18시 클릭
    const hour18 = screen.getByRole('option', { name: '18시' });
    await user.click(hour18);

    const newValue = onChange.mock.calls[0]![0] as string;
    // 날짜와 분은 보존
    expect(newValue).toMatch(/^2026-01-15T/);
    expect(newValue).toMatch(/T18:30:/);
  });

  it('분 변경 → 분만 변경, 날짜와 시 보존', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('날짜 및 시간'));

    // 45분 클릭
    const min45 = screen.getByRole('option', { name: '45분' });
    await user.click(min45);

    const newValue = onChange.mock.calls[0]![0] as string;
    expect(newValue).toMatch(/^2026-01-15T14:45:/);
  });

  it('날짜 → 시 → 분 순차 변경 (전체 동기화)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T10:00:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('날짜 및 시간'));

    // 1) 20일 클릭
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));
    // 2) 18시 클릭
    await user.click(screen.getByRole('option', { name: '18시' }));
    // 3) 30분 클릭
    await user.click(screen.getByRole('option', { name: '30분' }));

    const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as string;
    expect(lastValue).toMatch(/^2026-01-20T18:30:/);
  });
});

describe('DateTimePicker — 자동 닫기 비활성화', () => {
  it('날짜 선택 후에도 팝오버가 유지된다', async () => {
    const user = userEvent.setup();
    render(<ControlledDateTimePicker initialValue="2026-01-15T10:00:00.000Z" />);

    await user.click(screen.getByLabelText('날짜 및 시간'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 날짜 클릭
    await user.click(screen.getByRole('button', { name: /January 20, 2026/ }));

    // DatePicker와 달리 팝오버가 닫히지 않아야 함
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('시간 선택 후에도 팝오버가 유지된다', async () => {
    const user = userEvent.setup();
    render(<ControlledDateTimePicker initialValue="2026-01-15T10:00:00.000Z" />);

    await user.click(screen.getByLabelText('날짜 및 시간'));

    await user.click(screen.getByRole('option', { name: '18시' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape → 팝오버 닫힘', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T10:00:00.000Z' });

    await user.click(screen.getByLabelText('날짜 및 시간'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('DateTimePicker — 12시간제', () => {
  it('12h 모드에서 AmPmToggle 렌더링', async () => {
    const user = userEvent.setup();
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    await user.click(screen.getByLabelText('날짜 및 시간'));

    expect(screen.getByRole('radiogroup', { name: '오전/오후' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
  });

  it('AM/PM 변경 → 시간 동기화', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateTimePicker
        initialValue="2026-01-15T14:30:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('날짜 및 시간'));
    await user.click(screen.getByRole('radio', { name: 'AM' }));

    // 14:30 PM → 02:30 AM
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T02:30:/));
  });
});

describe('DateTimePicker — 비활성화', () => {
  it('disabled=true → input 비활성화', () => {
    renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z', disabled: true });
    expect(screen.getByLabelText('날짜 및 시간')).toBeDisabled();
  });
});

describe('DateTimePicker — 비제어 모드', () => {
  it('defaultValue가 초기값으로 표시된다', () => {
    renderDateTimePicker({ defaultValue: '2026-03-20T09:15:00.000Z' });
    expect(screen.getByLabelText('날짜 및 시간')).toHaveValue('2026-03-20 09:15');
  });
});

describe('DateTimePicker — 접근성', () => {
  it('Input ARIA 속성이 올바르다', () => {
    renderDateTimePicker();
    const input = screen.getByLabelText('날짜 및 시간');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('axe 검사 통과 (닫힌 상태)', async () => {
    const { container } = renderDateTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe 검사 통과 (열린 상태, 24h)', async () => {
    const user = userEvent.setup();
    const { container } = renderDateTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '24h',
    });
    await user.click(screen.getByLabelText('날짜 및 시간'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('DateTimePicker — SSR 안전성', () => {
  it('서버에서 renderToString이 에러 없이 동작한다', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <DateTimePicker value="2026-01-15T14:30:00.000Z" onChange={vi.fn()}>
          <DateTimePicker.Input />
        </DateTimePicker>,
      );
    }).not.toThrow();
  });
});
