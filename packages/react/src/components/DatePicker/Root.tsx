import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DateFnsAdapter } from '@kalyx/core';
import type { DateAdapter, DisabledRule, ISODateString, WeekStartsOn } from '@kalyx/core';
import { DatePickerContext } from '../../context/DatePickerContext.js';
import type { DatePickerContextValue } from '../../context/DatePickerContext.js';

/**
 * DatePicker의 Root 컴포넌트 props.
 *
 * @example 제어 모드
 * ```tsx
 * <DatePicker value={date} onChange={setDate}>
 *   <DatePicker.Input />
 *   <DatePicker.Popover>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popover>
 * </DatePicker>
 * ```
 *
 * @example 비제어 모드
 * ```tsx
 * <DatePicker defaultValue="2026-01-15T00:00:00.000Z">
 *   <DatePicker.Input />
 * </DatePicker>
 * ```
 */
export interface DatePickerRootProps {
  /** 선택된 날짜 (제어 모드, ISO 8601 UTC). `null`이면 빈 상태. */
  value?: ISODateString | null;
  /** 초기 날짜 (비제어 모드) */
  defaultValue?: ISODateString;
  /** 날짜 변경 콜백 */
  onChange?: (value: ISODateString | null) => void;
  /** 비활성화 규칙 */
  disabled?: DisabledRule[] | boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 주 시작 요일 */
  weekStartsOn?: WeekStartsOn;
  /** 날짜 표시 포맷 */
  displayFormat?: string;
  /** BCP 47 locale (예: "en-US", "ko-KR", "ja-JP") */
  locale?: string;
  /** 날짜 어댑터 */
  adapter?: DateAdapter;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

export function DatePickerRoot({
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
}: DatePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  // 비제어 모드의 내부 상태
  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  // 팝오버 상태
  const [isOpen, setIsOpen] = useState(false);

  // 뷰 월 (캘린더에서 현재 보고 있는 달)
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    currentValue ?? adapter.today(),
  );

  // 포커스된 날짜
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    currentValue ?? adapter.today(),
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = Array.isArray(disabled) ? disabled : [];

  const selectDate = useCallback(
    (iso: ISODateString | null) => {
      if (isDisabled || readOnly) return;

      if (!isControlled) {
        setUncontrolledValue(iso);
      }
      onChange?.(iso);

      // 날짜 선택 후 팝오버 닫기
      setIsOpen(false);
    },
    [isControlled, isDisabled, readOnly, onChange],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    // 팝오버 열 때 현재 값 또는 오늘로 뷰 초기화
    const target = currentValue ?? adapter.today();
    setViewMonth(target);
    setFocusedDate(target);
  }, [isDisabled, readOnly, currentValue, adapter]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const contextValue: DatePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      selectDate,
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
      selectDate,
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
    <DatePickerContext.Provider value={contextValue}>
      {children}
    </DatePickerContext.Provider>
  );
}
