import { useCallback, useId, useRef, useState } from 'react';
import { DateFnsAdapter, getCalendarDays } from '@kalyx/core';
import type {
  CalendarGrid,
  DateAdapter,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';

export interface UseDatePickerOptions {
  /** 선택된 날짜 (제어 모드) */
  value?: ISODateString | null;
  /** 초기 날짜 (비제어 모드) */
  defaultValue?: ISODateString;
  /** 날짜 변경 콜백 */
  onChange?: (value: ISODateString | null) => void;
  /** 비활성화 규칙 */
  disabled?: DisabledRule[];
  /** 주 시작 요일 */
  weekStartsOn?: WeekStartsOn;
  /** 날짜 어댑터 */
  adapter?: DateAdapter;
}

export interface UseDatePickerReturn {
  /** 현재 선택된 날짜 (ISO string) */
  value: ISODateString | null;
  /** 팝오버 열림 상태 */
  isOpen: boolean;
  /** 팝오버 열기 */
  open: () => void;
  /** 팝오버 닫기 */
  close: () => void;
  /** 팝오버 토글 */
  toggle: () => void;
  /** 날짜 선택 */
  selectDate: (iso: ISODateString | null) => void;
  /** 현재 표시 중인 월 (ISO string) */
  viewMonth: ISODateString;
  /** 표시 월 변경 */
  setViewMonth: (iso: ISODateString) => void;
  /** 캘린더 그리드 데이터 */
  calendar: CalendarGrid;
  /** 포커스된 날짜 */
  focusedDate: ISODateString;
  /** 포커스 날짜 변경 */
  setFocusedDate: (iso: ISODateString) => void;
  /** 이전 달로 이동 */
  previousMonth: () => void;
  /** 다음 달로 이동 */
  nextMonth: () => void;
  /** 고유 ID */
  pickerId: string;
  /** 날짜 어댑터 */
  adapter: DateAdapter;
}

/**
 * DatePicker의 상태를 관리하는 Hook.
 * 컴포넌트를 사용하지 않고 완전 커스텀 UI를 구현할 때 사용한다.
 *
 * @example
 * ```tsx
 * function MyDatePicker() {
 *   const { value, isOpen, calendar, open, selectDate } = useDatePicker({
 *     onChange: (iso) => console.log(iso),
 *   });
 *   // ... 커스텀 렌더링
 * }
 * ```
 */
export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = [],
    weekStartsOn = 0,
    adapter = DateFnsAdapter,
  } = options;

  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(currentValue ?? adapter.today());
  const [focusedDate, setFocusedDate] = useState<ISODateString>(currentValue ?? adapter.today());

  const selectDate = useCallback(
    (iso: ISODateString | null) => {
      if (!isControlled) {
        setUncontrolledValue(iso);
      }
      onChange?.(iso);
      setIsOpen(false);
    },
    [isControlled, onChange],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue ?? adapter.today();
    setViewMonth(target);
    setFocusedDate(target);
  }, [currentValue, adapter]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const previousMonth = useCallback(() => {
    const newMonth = adapter.addMonths(viewMonth, -1);
    setViewMonth(newMonth);
    setFocusedDate(adapter.startOfMonth(newMonth));
  }, [adapter, viewMonth]);

  const nextMonth = useCallback(() => {
    const newMonth = adapter.addMonths(viewMonth, 1);
    setViewMonth(newMonth);
    setFocusedDate(adapter.startOfMonth(newMonth));
  }, [adapter, viewMonth]);

  const calendar = getCalendarDays(viewMonth, adapter, {
    weekStartsOn,
    selected: currentValue,
    focusedDate,
    disabled,
  });

  return {
    value: currentValue,
    isOpen,
    open,
    close,
    toggle,
    selectDate,
    viewMonth,
    setViewMonth,
    calendar,
    focusedDate,
    setFocusedDate,
    previousMonth,
    nextMonth,
    pickerId,
    adapter,
  };
}
