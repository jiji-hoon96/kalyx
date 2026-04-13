import { createContext, useContext } from 'react';
import type {
  DateAdapter,
  DateRange,
  DisabledRule,
  ISODateString,
  WeekStartsOn,
} from '@kalyx/core';

/** 다음에 선택할 부분 (start | end) */
export type RangeSelectingTarget = 'start' | 'end';

export interface RangePickerContextValue {
  /** 현재 선택된 범위 */
  value: DateRange;
  /** 범위 변경 (Range 객체 전체 갱신) */
  setRange: (range: DateRange) => void;
  /** 단일 날짜 클릭 → 자동으로 start/end 결정 */
  selectDate: (iso: ISODateString) => void;
  /** 다음에 선택될 부분 (start 먼저 → end 다음) */
  selectingTarget: RangeSelectingTarget;
  /** hover 중인 날짜 (범위 미리보기용) */
  hoverDate: ISODateString | null;
  setHoverDate: (iso: ISODateString | null) => void;
  /** 팝오버 열림 상태 */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** 현재 표시 중인 월 */
  viewMonth: ISODateString;
  setViewMonth: (iso: ISODateString) => void;
  /** 캘린더에서 포커스된 날짜 */
  focusedDate: ISODateString;
  setFocusedDate: (iso: ISODateString) => void;
  /** 날짜 어댑터 */
  adapter: DateAdapter;
  /** 비활성화 규칙 */
  disabled: DisabledRule[];
  /** 주 시작 요일 */
  weekStartsOn: WeekStartsOn;
  /** 날짜 표시 포맷 */
  displayFormat: string;
  /** BCP 47 locale */
  locale: string;
  /** 전체 비활성화 */
  isDisabled: boolean;
  /** 읽기 전용 */
  isReadOnly: boolean;
  /** 고유 ID */
  pickerId: string;
}

export const RangePickerContext = createContext<RangePickerContextValue | null>(null);

/**
 * RangePickerContext를 소비한다.
 * RangePicker.Root 외부에서 호출하면 명확한 에러를 던진다.
 */
export function useRangePickerContext(componentName: string): RangePickerContextValue {
  const context = useContext(RangePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] RangePicker.Root 내부에서 사용해야 합니다.\n\n` +
        '올바른 사용법:\n' +
        '  <RangePicker>\n' +
        `    <RangePicker.${componentName.replace('RangePicker.', '')} />\n` +
        '  </RangePicker>',
    );
  }
  return context;
}
