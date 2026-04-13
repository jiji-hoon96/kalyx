import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DatePicker } from './index.js';

function renderDatePicker(props: {
  value?: string | null;
  defaultValue?: string;
  onChange?: (v: string | null) => void;
  disabled?: boolean;
} = {}) {
  const onChange = props.onChange ?? vi.fn();
  const result = render(
    <DatePicker value={props.value} defaultValue={props.defaultValue} onChange={onChange} disabled={props.disabled}>
      <DatePicker.Input aria-label="날짜 선택" />
      <DatePicker.Popover>
        <DatePicker.Calendar />
      </DatePicker.Popover>
    </DatePicker>,
  );
  return { ...result, onChange };
}

describe('DatePicker — 기본 인터랙션', () => {
  it('Input이 combobox 역할을 가진다', () => {
    renderDatePicker();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('초기에 팝오버가 닫혀 있다', () => {
    renderDatePicker();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Input 클릭 → 팝오버 열림', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('날짜 클릭 → onChange가 ISO string으로 호출됨', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // 15일 클릭
    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-01-15T/),
    );
  });

  it('날짜 선택 후 팝오버가 닫힌다', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-01T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const day15 = screen.getByRole('button', { name: /January 15, 2026/ });
    await user.click(day15);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape → 팝오버 닫힘', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('선택된 값이 Input에 표시된다', () => {
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-15');
  });

  it('value가 null이면 Input이 비어있다', () => {
    renderDatePicker({ value: null });
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});

describe('DatePicker — 제어/비제어 모드', () => {
  it('제어 모드: value prop이 Input에 반영된다', () => {
    renderDatePicker({ value: '2026-06-15T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-06-15');
  });

  it('비제어 모드: defaultValue가 초기값으로 표시된다', () => {
    renderDatePicker({ defaultValue: '2026-03-20T00:00:00.000Z' });
    expect(screen.getByRole('combobox')).toHaveValue('2026-03-20');
  });
});

describe('DatePicker — 비활성화', () => {
  it('disabled=true일 때 Input이 비활성화된다', () => {
    renderDatePicker({ disabled: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('DatePicker — 캘린더 네비게이션', () => {
  it('이전/다음 달 버튼으로 월을 이동한다', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');

    await user.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'February 2026');

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'January 2026');
  });
});

describe('DatePicker — 키보드 내비게이션', () => {
  it('ArrowDown으로 캘린더를 연다', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Enter로 포커스된 날짜를 선택한다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // 포커스된 날짜(15일)에서 Enter
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-01-15T/),
    );
  });

  it('Arrow 키로 날짜 이동 후 Enter로 선택한다', async () => {
    const user = userEvent.setup();
    const { onChange } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // → 키 = 다음 날(16일)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-01-16T/),
    );
  });
});

describe('DatePicker — Context 에러', () => {
  it('Root 없이 Input을 사용하면 에러가 발생한다', () => {
    expect(() => {
      render(<DatePicker.Input aria-label="test" />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });

  it('Root 없이 Calendar를 사용하면 에러가 발생한다', () => {
    expect(() => {
      render(<DatePicker.Calendar />);
    }).toThrow(/DatePicker.Root 내부에서 사용해야 합니다/);
  });
});

describe('DatePicker — 접근성', () => {
  it('Input의 ARIA 속성이 올바르다', () => {
    renderDatePicker();
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
  });

  it('팝오버 열림 시 aria-expanded가 true가 된다', async () => {
    const user = userEvent.setup();
    renderDatePicker();

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('캘린더 grid에 aria-label이 있다', async () => {
    const user = userEvent.setup();
    renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'January 2026');
  });

  it('axe 접근성 검사를 통과한다 (닫힌 상태)', async () => {
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('axe 접근성 검사를 통과한다 (열린 상태)', async () => {
    const user = userEvent.setup();
    const { container } = renderDatePicker({ value: '2026-01-15T00:00:00.000Z' });

    await user.click(screen.getByRole('combobox'));

    // Floating UI focus guard 요소를 axe 검사에서 제외
    const results = await axe(container, {
      rules: {
        'aria-command-name': { selector: ':not([data-floating-ui-focus-guard])' },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('DatePicker — MonthGrid', () => {
  it('MonthGrid에 12개월이 표시된다', async () => {
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

  it('현재 월에 aria-selected가 있다', async () => {
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
    expect(screen.getByRole('gridcell', { name: 'March' })).toHaveAttribute('aria-selected', 'true');
  });

  it('월 클릭 → onSelect 콜백 호출', async () => {
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
  it('YearGrid에 12개 년도가 표시된다', async () => {
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

  it('현재 년도에 aria-selected가 있다', async () => {
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

  it('년 클릭 → onSelect 콜백 호출', async () => {
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

describe('DatePicker — SSR 안전성', () => {
  it('서버에서 renderToString이 에러 없이 동작한다', async () => {
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
