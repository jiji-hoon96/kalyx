import { createContext, useContext } from 'react';
import type { ISODateString, TimeValue } from '@kalyx/core';

export type TimePickerFormat = '12h' | '24h';

export interface TimePickerContextValue {
  /** 현재 선택된 ISO datetime (시간 부분만 의미 있음) */
  value: ISODateString | null;
  /** 시간 변경 (TimeValue 부분만 갱신) */
  setTime: (partial: Partial<TimeValue>) => void;
  /** 12/24시간제 모드 */
  format: TimePickerFormat;
  /** 분 step (예: 15면 0,15,30,45) */
  step: number;
  /** 초 표시 여부 */
  withSeconds: boolean;
  /** 전체 비활성화 */
  isDisabled: boolean;
  /** 읽기 전용 */
  isReadOnly: boolean;
  /** 현재 시간 (TimeValue) */
  currentTime: TimeValue;
  /** 고유 ID */
  pickerId: string;
}

export const TimePickerContext = createContext<TimePickerContextValue | null>(null);

/**
 * TimePickerContext를 소비한다.
 * TimePicker.Root 외부에서 호출하면 명확한 에러를 던진다.
 */
export function useTimePickerContext(componentName: string): TimePickerContextValue {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] TimePicker.Root 내부에서 사용해야 합니다.\n\n` +
        '올바른 사용법:\n' +
        '  <TimePicker>\n' +
        `    <TimePicker.${componentName.replace('TimePicker.', '')} />\n` +
        '  </TimePicker>',
    );
  }
  return context;
}
