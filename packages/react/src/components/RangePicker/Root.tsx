import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DateFnsAdapter } from '@kalyx/core';
import type {
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';
import { RangePickerContext } from '../../context/RangePickerContext.js';
import type {
  RangePickerContextValue,
  RangeSelectingTarget,
} from '../../context/RangePickerContext.js';

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * RangePicker의 Root 컴포넌트 props.
 *
 * @example
 * ```tsx
 * <RangePicker value={range} onChange={setRange}>
 *   <RangePicker.Input part="start" />
 *   <RangePicker.Input part="end" />
 *   <RangePicker.Popover>
 *     <RangePicker.Calendar />
 *   </RangePicker.Popover>
 * </RangePicker>
 * ```
 */
export interface RangePickerRootProps {
  /** 선택된 범위 (제어 모드). `{ start, end }` 형태의 ISO string 또는 null. */
  value?: DateRange;
  /** 초기 범위 (비제어 모드) */
  defaultValue?: DateRange;
  /** 범위 변경 콜백 */
  onChange?: (range: DateRange) => void;
  /** 비활성화 규칙 */
  disabled?: DisabledRule[] | boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 주 시작 요일 */
  weekStartsOn?: WeekStartsOn;
  /** 날짜 표시 포맷 */
  displayFormat?: string;
  /** BCP 47 locale */
  locale?: string;
  /** 날짜 어댑터 */
  adapter?: DateAdapter;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

export function RangePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd',
  locale = 'en-US',
  adapter = DateFnsAdapter,
  children,
}: RangePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;
  const referenceRef = useRef<HTMLElement | null>(null);

  // 비제어 모드의 내부 상태
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    defaultValue ?? EMPTY_RANGE,
  );

  const currentValue = isControlled ? (controlledValue ?? EMPTY_RANGE) : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);

  // 다음에 어디를 선택할지 (start 먼저, 이후 end)
  const [selectingTarget, setSelectingTarget] = useState<RangeSelectingTarget>('start');

  // hover 상태
  const [hoverDate, setHoverDate] = useState<ISODateString | null>(null);

  // 뷰 월
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    currentValue.start ?? adapter.today(),
  );

  // 포커스된 날짜
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    currentValue.start ?? adapter.today(),
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = Array.isArray(disabled) ? disabled : [];

  const setRange = useCallback(
    (range: DateRange) => {
      if (isDisabled || readOnly) return;
      if (!isControlled) {
        setUncontrolledValue(range);
      }
      onChange?.(range);
    },
    [isControlled, isDisabled, readOnly, onChange],
  );

  /**
   * 단일 날짜 클릭 핸들러.
   * - selectingTarget === 'start' → start 선택, target = 'end'
   * - selectingTarget === 'end' → end 선택 (start보다 이전이면 swap), target = 'start', 닫기
   */
  const selectDate = useCallback(
    (iso: ISODateString) => {
      if (isDisabled || readOnly) return;

      if (selectingTarget === 'start') {
        const newRange: DateRange = { start: iso, end: null };
        setRange(newRange);
        setSelectingTarget('end');
        setHoverDate(null);
      } else {
        // end 선택
        const start = currentValue.start;
        if (!start) {
          // 안전장치: start가 없으면 start로 처리
          setRange({ start: iso, end: null });
          setSelectingTarget('end');
          return;
        }

        let newRange: DateRange;
        if (adapter.isBefore(iso, start)) {
          // end가 start보다 이전이면 swap
          newRange = { start: iso, end: start };
        } else {
          newRange = { start, end: iso };
        }

        setRange(newRange);
        setSelectingTarget('start');
        setHoverDate(null);
        setIsOpen(false);
      }
    },
    [isDisabled, readOnly, selectingTarget, currentValue.start, adapter, setRange],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    const target = currentValue.start ?? adapter.today();
    setViewMonth(target);
    setFocusedDate(target);
    // 범위가 완전하면 새로 시작, 아니면 현재 상태 유지
    if (currentValue.start && currentValue.end) {
      setSelectingTarget('start');
    }
  }, [isDisabled, readOnly, currentValue, adapter]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHoverDate(null);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const contextValue: RangePickerContextValue = useMemo(
    () => ({
      referenceRef,
      value: currentValue,
      setRange,
      selectDate,
      selectingTarget,
      hoverDate,
      setHoverDate,
      isOpen,
      open,
      close,
      toggle,
      viewMonth,
      setViewMonth,
      focusedDate,
      setFocusedDate,
      adapter,
      disabled: disabledRules,
      weekStartsOn,
      displayFormat,
      locale,
      isDisabled,
      isReadOnly: readOnly,
      pickerId,
    }),
    [
      currentValue,
      setRange,
      selectDate,
      selectingTarget,
      hoverDate,
      isOpen,
      open,
      close,
      toggle,
      viewMonth,
      focusedDate,
      adapter,
      disabledRules,
      weekStartsOn,
      displayFormat,
      locale,
      isDisabled,
      readOnly,
      pickerId,
    ],
  );

  return (
    <RangePickerContext.Provider value={contextValue}>
      {children}
    </RangePickerContext.Provider>
  );
}
