import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RangePicker } from './index.js';
import type { DateRange } from '@kalyx/core';

const EMPTY: DateRange = { start: null, end: null };

/** 제어 모드에서 자동으로 value를 업데이트하는 테스트 wrapper */
function ControlledRangePicker({
  initialValue,
  onChange,
}: {
  initialValue: DateRange;
  onChange?: (r: DateRange) => void;
}) {
  const [value, setValue] = useState<DateRange>(initialValue);
  return (
    <RangePicker
      value={value}
      onChange={(r) => {
        setValue(r);
        onChange?.(r);
      }}
    >
      <RangePicker.Input part="start" />
      <RangePicker.Input part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>
  );
}

function renderRangePicker(props: {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (r: DateRange) => void;
  disabled?: boolean;
} = {}) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <RangePicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onChange}
      disabled={props.disabled}
    >
      <RangePicker.Input part="start" />
      <RangePicker.Input part="end" />
      <RangePicker.Popover>
        <RangePicker.Calendar />
      </RangePicker.Popover>
    </RangePicker>,
  );
  return { ...result, onChange };
}

describe('RangePicker — 기본 인터랙션', () => {
  it('두 개의 combobox(시작일, 종료일)가 렌더된다', () => {
    renderRangePicker();
    const combos = screen.getAllByRole('combobox');
    expect(combos).toHaveLength(2);
    expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료일')).toBeInTheDocument();
  });

  it('초기에 팝오버가 닫혀 있다', () => {
    renderRangePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Input 클릭 시 팝오버가 열린다', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('시작일'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('첫 클릭 → start 선택, 두 번째 클릭 → end 선택', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('시작일'));

    // 1차 클릭: 10일 → start
    const day10 = screen.getByRole('button', { name: /2026년 1월 10일/ });
    await user.click(day10);

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-10T/),
      end: null,
    });

    // 2차 클릭: 20일 → end
    const day20 = screen.getByRole('button', { name: /2026년 1월 20일/ });
    await user.click(day20);

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-10T/),
      end: expect.stringMatching(/^2026-01-20T/),
    });
  });

  it('end가 start보다 이전이면 자동으로 swap된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText('시작일'));

    // 1차 클릭: 20일 → start
    await user.click(screen.getByRole('button', { name: /2026년 1월 20일/ }));
    // 2차 클릭: 10일 → end (swap 발생)
    await user.click(screen.getByRole('button', { name: /2026년 1월 10일/ }));

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]![0] as DateRange;
    expect(lastCall.start).toMatch(/^2026-01-10T/);
    expect(lastCall.end).toMatch(/^2026-01-20T/);
  });

  it('범위 선택 완료 후 팝오버가 닫힌다', async () => {
    const user = userEvent.setup();
    render(
      <ControlledRangePicker
        initialValue={{ start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' }}
      />,
    );

    await user.click(screen.getByLabelText('시작일'));
    await user.click(screen.getByRole('button', { name: /2026년 1월 10일/ }));

    // start만 선택된 상태에서는 팝오버 유지
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /2026년 1월 20일/ }));

    // end 선택 후 팝오버 닫힘
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape → 팝오버 닫힘', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('시작일'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('선택된 범위가 input에 표시된다', () => {
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('시작일')).toHaveValue('2026-01-10');
    expect(screen.getByLabelText('종료일')).toHaveValue('2026-01-20');
  });

  it('빈 범위는 input이 비어있다', () => {
    renderRangePicker({ value: EMPTY });
    expect(screen.getByLabelText('시작일')).toHaveValue('');
    expect(screen.getByLabelText('종료일')).toHaveValue('');
  });
});

describe('RangePicker — 제어/비제어 모드', () => {
  it('제어 모드: value prop이 반영된다', () => {
    renderRangePicker({
      value: {
        start: '2026-06-15T00:00:00.000Z',
        end: '2026-06-20T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('시작일')).toHaveValue('2026-06-15');
    expect(screen.getByLabelText('종료일')).toHaveValue('2026-06-20');
  });

  it('비제어 모드: defaultValue가 초기값으로 표시된다', () => {
    renderRangePicker({
      defaultValue: {
        start: '2026-03-01T00:00:00.000Z',
        end: '2026-03-15T00:00:00.000Z',
      },
    });
    expect(screen.getByLabelText('시작일')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('종료일')).toHaveValue('2026-03-15');
  });
});

describe('RangePicker — 비활성화', () => {
  it('disabled=true일 때 input이 비활성화된다', () => {
    renderRangePicker({ disabled: true });
    expect(screen.getByLabelText('시작일')).toBeDisabled();
    expect(screen.getByLabelText('종료일')).toBeDisabled();
  });
});

describe('RangePicker — 키보드 내비게이션', () => {
  it('Arrow 키로 날짜 이동 후 Enter로 선택한다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderRangePicker({
      value: { start: '2026-01-15T00:00:00.000Z', end: '2026-01-20T00:00:00.000Z' },
    });

    await user.click(screen.getByLabelText('시작일'));
    // 포커스는 15일 (start)에 있음. 다시 시작이므로 selectingTarget이 'start'로 리셋됨

    // → 키 = 다음 날 (16일)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      start: expect.stringMatching(/^2026-01-16T/),
      end: null,
    });
  });
});

describe('RangePicker — Range 시각화', () => {
  it('범위 내 날짜에 data-in-range 속성이 있다', async () => {
    const user = userEvent.setup();
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('시작일'));

    const day12 = screen.getByRole('button', { name: /2026년 1월 12일/ });
    expect(day12).toHaveAttribute('data-in-range', 'true');
  });

  it('start와 end에 각각 data-range-start, data-range-end 속성이 있다', async () => {
    const user = userEvent.setup();
    renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-15T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('시작일'));

    const day10 = screen.getByRole('button', { name: /2026년 1월 10일.*시작일/ });
    const day15 = screen.getByRole('button', { name: /2026년 1월 15일.*종료일/ });

    expect(day10).toHaveAttribute('data-range-start', 'true');
    expect(day15).toHaveAttribute('data-range-end', 'true');
  });
});

describe('RangePicker — Context 에러', () => {
  it('Root 없이 Input을 사용하면 에러가 발생한다', () => {
    expect(() => {
      render(<RangePicker.Input part="start" />);
    }).toThrow(/RangePicker.Root 내부에서 사용해야 합니다/);
  });

  it('Root 없이 Calendar를 사용하면 에러가 발생한다', () => {
    expect(() => {
      render(<RangePicker.Calendar />);
    }).toThrow(/RangePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('RangePicker — 접근성', () => {
  it('Input ARIA 속성이 올바르다', () => {
    renderRangePicker();
    const start = screen.getByLabelText('시작일');
    expect(start).toHaveAttribute('role', 'combobox');
    expect(start).toHaveAttribute('aria-expanded', 'false');
    expect(start).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('grid에 aria-multiselectable="true"가 있다', async () => {
    const user = userEvent.setup();
    renderRangePicker();

    await user.click(screen.getByLabelText('시작일'));
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('axe 접근성 검사를 통과한다 (닫힌 상태)', async () => {
    const { container } = renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
      },
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe 접근성 검사를 통과한다 (열린 상태)', async () => {
    const user = userEvent.setup();
    const { container } = renderRangePicker({
      value: {
        start: '2026-01-10T00:00:00.000Z',
        end: '2026-01-20T00:00:00.000Z',
      },
    });

    await user.click(screen.getByLabelText('시작일'));

    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('RangePicker — SSR 안전성', () => {
  it('서버에서 renderToString이 에러 없이 동작한다', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => {
      renderToString(
        <RangePicker
          value={{ start: '2026-01-10T00:00:00.000Z', end: '2026-01-20T00:00:00.000Z' }}
          onChange={vi.fn()}
        >
          <RangePicker.Input part="start" />
          <RangePicker.Input part="end" />
        </RangePicker>,
      );
    }).not.toThrow();
  });
});
