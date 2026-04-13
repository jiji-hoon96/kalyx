import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DateFnsAdapter,
  getTime,
  setTime as setTimeOnIso,
} from '@kalyx/core';
import type {
  DateAdapter,
  DisabledRule,
  ISODateString,
  TimeValue,
  WeekStartsOn,
} from '@kalyx/core';
import { DatePickerContext } from '../../context/DatePickerContext.js';
import type { DatePickerContextValue } from '../../context/DatePickerContext.js';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type {
  TimePickerContextValue,
  TimePickerFormat,
} from '../../context/TimePickerContext.js';

export interface DateTimePickerRootProps {
  /** 선택된 datetime (제어 모드, ISO 8601 UTC) */
  value?: ISODateString | null;
  /** 초기 datetime (비제어 모드) */
  defaultValue?: ISODateString;
  /** datetime 변경 콜백 */
  onChange?: (value: ISODateString | null) => void;
  /** 12/24시간제 */
  format?: TimePickerFormat;
  /** 분 step (1, 5, 15, 30 등) */
  step?: number;
  /** 비활성화 규칙 (날짜) */
  disabled?: DisabledRule[] | boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 주 시작 요일 */
  weekStartsOn?: WeekStartsOn;
  /** 날짜·시간 표시 포맷 (Input용) */
  displayFormat?: string;
  /** BCP 47 locale */
  locale?: string;
  /** 날짜 어댑터 */
  adapter?: DateAdapter;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/** value=null 시 fallback ISO (오늘 00:00:00 UTC) */
function getDefaultIso(): ISODateString {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

/**
 * DateTimePicker.Root — DatePicker + TimePicker 통합 컴포넌트.
 *
 * 단일 ISO datetime을 source of truth로 관리하고, 내부적으로
 * DatePickerContext와 TimePickerContext를 동시에 제공한다.
 * 따라서 DatePicker.Calendar, TimePicker.HourList 등 기존 컴포넌트를
 * 그대로 재사용할 수 있다.
 *
 * 핵심 동작:
 * - Calendar에서 날짜 클릭 → 날짜 부분만 변경, 시간 부분 보존, 팝오버 유지
 * - TimePicker에서 시간 변경 → 시간 부분만 변경, 날짜 부분 보존
 * - Escape / 바깥 클릭 → 팝오버 닫기 (확정)
 */
export function DateTimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  disabled = false,
  readOnly = false,
  weekStartsOn = 0,
  displayFormat = 'yyyy-MM-dd HH:mm',
  locale = 'en-US',
  adapter = DateFnsAdapter,
  children,
}: DateTimePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  // 팝오버 / 캘린더 상태
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ISODateString>(
    currentValue ?? adapter.today(),
  );
  const [focusedDate, setFocusedDate] = useState<ISODateString>(
    currentValue ?? adapter.today(),
  );

  const isDisabled = typeof disabled === 'boolean' ? disabled : false;
  const disabledRules: DisabledRule[] = Array.isArray(disabled) ? disabled : [];

  // value가 null이면 시간 추출용 fallback 사용
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime: TimeValue = useMemo(() => getTime(baseIso), [baseIso]);

  const updateValue = useCallback(
    (next: ISODateString | null) => {
      if (isDisabled || readOnly) return;
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, isDisabled, readOnly, onChange],
  );

  /**
   * 날짜 선택: 시간 부분을 보존한다.
   * DatePicker.Root와 달리 팝오버를 자동으로 닫지 않는다.
   */
  const selectDate = useCallback(
    (newDateIso: ISODateString | null) => {
      if (newDateIso === null) {
        updateValue(null);
        return;
      }
      // 현재 시간 부분을 보존하여 새 날짜에 적용
      const time = currentValue ? getTime(currentValue) : currentTime;
      const merged = setTimeOnIso(newDateIso, time);
      updateValue(merged);
    },
    [currentValue, currentTime, updateValue],
  );

  /**
   * 시간 변경: 날짜 부분을 보존한다.
   */
  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      // 날짜가 없으면 오늘 자정으로 시작
      const base = currentValue ?? getDefaultIso();
      const merged = setTimeOnIso(base, partial);
      updateValue(merged);
    },
    [currentValue, updateValue],
  );

  const open = useCallback(() => {
    if (isDisabled || readOnly) return;
    setIsOpen(true);
    const target = currentValue ?? adapter.today();
    setViewMonth(target);
    setFocusedDate(target);
  }, [isDisabled, readOnly, currentValue, adapter]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // ─── DatePickerContext (Calendar, Popover 재사용용) ───
  const dateContext: DatePickerContextValue = useMemo(
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

  // ─── TimePickerContext (HourList, MinuteList, AmPmToggle 재사용용) ───
  const timeContext: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      step,
      withSeconds: false,
      isDisabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
    }),
    [currentValue, setTime, format, step, isDisabled, readOnly, currentTime, pickerId],
  );

  return (
    <DatePickerContext.Provider value={dateContext}>
      <TimePickerContext.Provider value={timeContext}>
        {children}
      </TimePickerContext.Provider>
    </DatePickerContext.Provider>
  );
}
