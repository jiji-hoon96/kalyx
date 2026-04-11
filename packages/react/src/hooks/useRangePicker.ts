import { useCallback, useId, useRef, useState } from 'react';
import { DateFnsAdapter, getCalendarDays } from '@kalyx/core';
import type {
  CalendarGrid,
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import type { RangeSelectingTarget } from '../context/RangePickerContext.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

export interface UseRangePickerOptions {
  /** 선택된 범위 (제어 모드) */
  value?: DateRange;
  /** 초기 범위 (비제어 모드) */
  defaultValue?: DateRange;
  /** 범위 변경 콜백 */
  onChange?: (range: DateRange) => void;
  /** 비활성화 규칙 */
  disabled?: DisabledRule[];
  /** 주 시작 요일 */
  weekStartsOn?: WeekStartsOn;
  /** 날짜 어댑터 */
  adapter?: DateAdapter;
}

export interface UseRangePickerReturn {
  /** 현재 선택된 범위 */
  value: DateRange;
  /** 다음에 선택될 부분 */
  selectingTarget: RangeSelectingTarget;
  /** 단일 날짜 클릭 핸들러 */
  selectDate: (iso: ISODateString) => void;
  /** 범위 직접 설정 */
  setRange: (range: DateRange) => void;
  /** 팝오버 열림 상태 */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** hover 날짜 (미리보기용) */
  hoverDate: ISODateString | null;
  setHoverDate: (iso: ISODateString | null) => void;
  /** 현재 표시 중인 월 */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** 캘린더 그리드 */
  calendar: CalendarGrid;
  /** 포커스된 날짜 */
  focusedDate: ISODateString;
  setFocusedDate: (iso: ISODateString) => void;
  /** 이전 달로 이동 */
  previousMonth: () => void;
  /** 다음 달로 이동 */
  nextMonth: () => void;
  /** 고유 ID */
  pickerId: string;
  /** 어댑터 */
  adapter: DateAdapter;
}

/**
 * RangePicker 상태 관리 Hook.
 * 컴포넌트 없이 완전 커스텀 UI를 만들 때 사용한다.
 */
export function useRangePicker(options: UseRangePickerOptions = {}): UseRangePickerReturn {
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

  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );

  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<RangeSelectingTarget>('start');
  const [hoverDate, setHoverDate] = useState<ISODateString | null>(null);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    currentValue.start ?? adapter.today(),
  );
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    currentValue.start ?? adapter.today(),
  );

  const setRange = useCallback(
    (range: DateRange) => {
      if (!isControlled) {
        setUncontrolledValue(range);
      }
      onChange?.(range);
    },
    [isControlled, onChange],
  );

  const selectDate = useCallback(
    (iso: ISODateString) => {
      if (selectingTarget === 'start') {
        setRange({ start: iso, end: null });
        setSelectingTarget('end');
        setHoverDate(null);
      } else {
        const start = currentValue.start;
        if (!start) {
          setRange({ start: iso, end: null });
          setSelectingTarget('end');
          return;
        }

        const newRange: DateRange = adapter.isBefore(iso, start)
          ? { start: iso, end: start }
          : { start, end: iso };

        setRange(newRange);
        setSelectingTarget('start');
        setHoverDate(null);
        setIsOpen(false);
      }
    },
    [selectingTarget, currentValue.start, adapter, setRange],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    const target = currentValue.start ?? adapter.today();
    setViewMonth(target);
    setFocusedDate(target);
    if (currentValue.start && currentValue.end) {
      setSelectingTarget('start');
    }
  }, [currentValue, adapter]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHoverDate(null);
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
    focusedDate,
    disabled,
    range: currentValue,
    rangeHover: hoverDate,
  });

  return {
    value: currentValue,
    selectingTarget,
    selectDate,
    setRange,
    isOpen,
    open,
    close,
    toggle,
    hoverDate,
    setHoverDate,
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
