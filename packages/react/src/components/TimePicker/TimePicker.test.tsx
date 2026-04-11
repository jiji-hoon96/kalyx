import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TimePicker } from './index.js';

function renderTimePicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  format?: '12h' | '24h';
  step?: number;
  disabled?: boolean;
  withSeconds?: boolean;
} = {}) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <TimePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      format={props.format}
      step={props.step}
      disabled={props.disabled}
      withSeconds={props.withSeconds}
    >
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
      <TimePicker.AmPmToggle />
    </TimePicker>,
  );
  return { ...result, onChange };
}

/** 제어 모드 wrapper */
function ControlledTimePicker({
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
    <TimePicker
      value={value}
      format={format}
      step={step}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <TimePicker.Input />
      <TimePicker.HourList />
      <TimePicker.MinuteList />
      <TimePicker.AmPmToggle />
    </TimePicker>
  );
}

describe('TimePicker — 기본 렌더링', () => {
  it('Input, HourList, MinuteList가 렌더된다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('시간 입력')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '시' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '분' })).toBeInTheDocument();
  });

  it('현재 시간이 input에 표시된다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByLabelText('시간 입력')).toHaveValue('14:30');
  });

  it('초 표시 모드', () => {
    renderTimePicker({ value: '2026-01-15T14:30:45.000Z', withSeconds: true });
    expect(screen.getByLabelText('시간 입력')).toHaveValue('14:30:45');
  });
});

describe('TimePicker — 24시간제 (기본)', () => {
  it('HourList에 0-23시가 표시된다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const hourList = screen.getByRole('listbox', { name: '시' });
    const options = hourList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(24);
  });

  it('AmPmToggle은 24시간제에서 렌더되지 않는다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '24h' });
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('현재 시가 aria-selected="true"', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    const selected = screen
      .getByRole('listbox', { name: '시' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('14');
  });
});

describe('TimePicker — 12시간제', () => {
  it('HourList에 1-12시가 표시된다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    const hourList = screen.getByRole('listbox', { name: '시' });
    const options = hourList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(12);
  });

  it('AmPmToggle이 렌더된다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    expect(screen.getByRole('radiogroup', { name: '오전/오후' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'AM' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PM' })).toBeInTheDocument();
  });

  it('14시 → PM이 선택됨', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'AM' })).not.toBeChecked();
  });

  it('14시(오후 2시) → 2가 selected', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z', format: '12h' });
    const selected = screen
      .getByRole('listbox', { name: '시' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('02');
  });

  it('0시 → 12 AM', () => {
    renderTimePicker({ value: '2026-01-15T00:00:00.000Z', format: '12h' });
    expect(screen.getByRole('radio', { name: 'AM' })).toBeChecked();
    const selected = screen
      .getByRole('listbox', { name: '시' })
      .querySelector('[aria-selected="true"]');
    expect(selected).toHaveTextContent('12');
  });
});

describe('TimePicker — 분 step', () => {
  it('step=15 → 4개의 옵션 (0, 15, 30, 45)', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', step: 15 });
    const minuteList = screen.getByRole('listbox', { name: '분' });
    const options = minuteList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(4);
  });

  it('step=5 → 12개의 옵션', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', step: 5 });
    const minuteList = screen.getByRole('listbox', { name: '분' });
    const options = minuteList.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(12);
  });
});

describe('TimePicker — 인터랙션', () => {
  it('시 클릭 → onChange 호출', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const hour14 = screen.getByRole('option', { name: '14시' });
    await user.click(hour14);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T14:00:/));
  });

  it('분 클릭 → onChange 호출', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        step={15}
        onChange={onChange}
      />,
    );

    const min30 = screen.getByRole('option', { name: '30분' });
    await user.click(min30);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T14:30:/));
  });

  it('AM/PM 토글 → 시간 변경', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledTimePicker
        initialValue="2026-01-15T14:00:00.000Z"
        format="12h"
        onChange={onChange}
      />,
    );

    // 14시 → PM. AM 클릭 시 02:00 (오전 2시)가 됨
    const amButton = screen.getByRole('radio', { name: 'AM' });
    await user.click(amButton);

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T02:00:/));
  });

  it('Input에 시간 직접 타이핑 → 파싱', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const input = screen.getByLabelText('시간 입력');
    await user.clear(input);
    await user.type(input, '15:45');
    await user.tab(); // blur

    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/T15:45:/));
  });

  it('Input에 잘못된 시간 → 무시', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTimePicker initialValue="2026-01-15T10:00:00.000Z" onChange={onChange} />);

    const input = screen.getByLabelText('시간 입력');
    await user.clear(input);
    await user.type(input, 'invalid');
    await user.tab();

    // 잘못된 입력은 onChange 호출하지 않음 (clear는 불릴 수 있음)
    const calls = onChange.mock.calls;
    // 마지막 호출이 'invalid' 파싱 결과가 아니어야 함
    const lastCall = calls[calls.length - 1];
    if (lastCall) {
      // 만약 호출됐다면, 원래 시간 유지
      expect(lastCall[0]).toMatch(/T10:00:/);
    }
  });
});

describe('TimePicker — 비활성화', () => {
  it('disabled=true → input 비활성화 + listbox aria-disabled', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', disabled: true });
    expect(screen.getByLabelText('시간 입력')).toBeDisabled();
    expect(screen.getByRole('listbox', { name: '시' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('listbox', { name: '분' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('disabled=true → 옵션 클릭 시 onChange 호출되지 않음', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTimePicker({
      value: '2026-01-15T14:00:00.000Z',
      disabled: true,
      onChange,
    });

    const hour10 = screen.getByRole('option', { name: '10시' });
    await user.click(hour10);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TimePicker — Context 에러', () => {
  it('Root 없이 Input을 사용하면 에러', () => {
    expect(() => {
      render(<TimePicker.Input />);
    }).toThrow(/TimePicker.Root 내부에서 사용해야 합니다/);
  });

  it('Root 없이 HourList를 사용하면 에러', () => {
    expect(() => {
      render(<TimePicker.HourList />);
    }).toThrow(/TimePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('TimePicker — 접근성', () => {
  it('listbox에 aria-label이 있다', () => {
    renderTimePicker({ value: '2026-01-15T14:30:00.000Z' });
    expect(screen.getByRole('listbox', { name: '시' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '분' })).toBeInTheDocument();
  });

  it('AmPmToggle에 radiogroup 역할이 있다', () => {
    renderTimePicker({ value: '2026-01-15T14:00:00.000Z', format: '12h' });
    expect(screen.getByRole('radiogroup', { name: '오전/오후' })).toBeInTheDocument();
  });

  it('axe 검사 통과 (24h 모드)', async () => {
    const { container } = renderTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '24h',
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe 검사 통과 (12h 모드)', async () => {
    const { container } = renderTimePicker({
      value: '2026-01-15T14:30:00.000Z',
      format: '12h',
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('TimePicker — SSR 안전성', () => {
  it('서버에서 renderToString이 에러 없이 동작한다', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <TimePicker value="2026-01-15T14:30:00.000Z" onChange={vi.fn()}>
          <TimePicker.Input />
          <TimePicker.HourList />
          <TimePicker.MinuteList />
        </TimePicker>,
      );
    }).not.toThrow();
  });
});
