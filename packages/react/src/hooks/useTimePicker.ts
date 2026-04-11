import { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  generateHours,
  generateMinutes,
  getTime,
  setTime as setTimeOnIso,
  to12Hour,
  to24Hour,
} from '@kalyx/core';
import type { ISODateString, TimeValue } from '@kalyx/core';
import type { TimePickerFormat } from '../context/TimePickerContext.js';

export interface UseTimePickerOptions {
  /** 선택된 시간 (제어 모드) */
  value?: ISODateString | null;
  /** 초기 시간 (비제어 모드) */
  defaultValue?: ISODateString;
  /** 시간 변경 콜백 */
  onChange?: (value: ISODateString | null) => void;
  /** 12/24시간제 */
  format?: TimePickerFormat;
  /** 분 step */
  step?: number;
  /** 초 표시 */
  withSeconds?: boolean;
}

export interface UseTimePickerReturn {
  /** 현재 ISO datetime 값 */
  value: ISODateString | null;
  /** 현재 시간 (TimeValue) */
  currentTime: TimeValue;
  /** 시간 부분 변경 */
  setTime: (partial: Partial<TimeValue>) => void;
  /** 시(hour) 직접 설정 (12h 모드면 1-12, 24h 모드면 0-23) */
  setHour: (hour: number) => void;
  /** 분 설정 */
  setMinute: (minute: number) => void;
  /** 초 설정 */
  setSecond: (second: number) => void;
  /** AM/PM 변경 (12h 모드 전용) */
  setPeriod: (period: 'AM' | 'PM') => void;
  /** 사용 가능한 시 리스트 */
  availableHours: number[];
  /** 사용 가능한 분 리스트 (step 적용) */
  availableMinutes: number[];
  /** 12/24h 모드 */
  format: TimePickerFormat;
  /** 현재 표시용 시 (12h 모드면 1-12) */
  displayHour: number;
  /** 현재 AM/PM (12h 모드 전용, 24h면 null) */
  period: 'AM' | 'PM' | null;
  /** 고유 ID */
  pickerId: string;
}

function getDefaultIso(): ISODateString {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

/**
 * TimePicker 상태 관리 Hook.
 * 컴포넌트 없이 완전 커스텀 UI를 구현할 때 사용한다.
 */
export function useTimePicker(options: UseTimePickerOptions = {}): UseTimePickerReturn {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    format = '24h',
    step = 1,
  } = options;

  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime = useMemo(() => getTime(baseIso), [baseIso]);

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      const newIso = setTimeOnIso(baseIso, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [baseIso, isControlled, onChange],
  );

  const period = format === '12h' ? to12Hour(currentTime.hours).period : null;
  const displayHour =
    format === '12h' ? to12Hour(currentTime.hours).hours12 : currentTime.hours;

  const setHour = useCallback(
    (hour: number) => {
      const hours24 = format === '12h' && period ? to24Hour(hour, period) : hour;
      setTime({ hours: hours24 });
    },
    [format, period, setTime],
  );

  const setMinute = useCallback(
    (minute: number) => setTime({ minutes: minute }),
    [setTime],
  );

  const setSecond = useCallback(
    (second: number) => setTime({ seconds: second }),
    [setTime],
  );

  const setPeriod = useCallback(
    (newPeriod: 'AM' | 'PM') => {
      if (format !== '12h') return;
      const newHours24 = to24Hour(displayHour, newPeriod);
      setTime({ hours: newHours24 });
    },
    [format, displayHour, setTime],
  );

  return {
    value: currentValue,
    currentTime,
    setTime,
    setHour,
    setMinute,
    setSecond,
    setPeriod,
    availableHours: generateHours(format),
    availableMinutes: generateMinutes(step),
    format,
    displayHour,
    period,
    pickerId,
  };
}
