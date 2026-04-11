import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getTime, setTime as setTimeOnIso } from '@kalyx/core';
import type { ISODateString, TimeValue } from '@kalyx/core';
import { TimePickerContext } from '../../context/TimePickerContext.js';
import type {
  TimePickerContextValue,
  TimePickerFormat,
} from '../../context/TimePickerContext.js';

export interface TimePickerRootProps {
  /** 선택된 시간 (제어 모드, ISO 8601 UTC) */
  value?: ISODateString | null;
  /** 초기 시간 (비제어 모드) */
  defaultValue?: ISODateString;
  /** 시간 변경 콜백 */
  onChange?: (value: ISODateString | null) => void;
  /** 12시간제 또는 24시간제 */
  format?: TimePickerFormat;
  /** 분 step (1, 5, 10, 15, 30 등) */
  step?: number;
  /** 초 표시 여부 */
  withSeconds?: boolean;
  /** 전체 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/** value가 null일 때 사용할 기본 ISO (오늘 00:00:00 UTC) */
function getDefaultIso(): ISODateString {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

export function TimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '24h',
  step = 1,
  withSeconds = false,
  disabled = false,
  readOnly = false,
  children,
}: TimePickerRootProps) {
  const pickerId = useId();
  const isControlled = useRef(controlledValue !== undefined).current;

  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString | null>(
    defaultValue ?? null,
  );

  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  // value가 null이어도 시간 선택은 가능해야 함 → fallback
  const baseIso = currentValue ?? getDefaultIso();
  const currentTime = useMemo(() => getTime(baseIso), [baseIso]);

  const setTime = useCallback(
    (partial: Partial<TimeValue>) => {
      if (disabled || readOnly) return;
      const newIso = setTimeOnIso(baseIso, partial);
      if (!isControlled) {
        setUncontrolledValue(newIso);
      }
      onChange?.(newIso);
    },
    [disabled, readOnly, baseIso, isControlled, onChange],
  );

  const contextValue: TimePickerContextValue = useMemo(
    () => ({
      value: currentValue,
      setTime,
      format,
      step,
      withSeconds,
      isDisabled: disabled,
      isReadOnly: readOnly,
      currentTime,
      pickerId,
    }),
    [currentValue, setTime, format, step, withSeconds, disabled, readOnly, currentTime, pickerId],
  );

  return (
    <TimePickerContext.Provider value={contextValue}>
      {children}
    </TimePickerContext.Provider>
  );
}
