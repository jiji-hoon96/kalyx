import { createContext, useContext } from 'react';
import type { MutableRefObject } from 'react';
import type { DateAdapter, DisabledRule, ISODateString, WeekStartsOn } from '@kalyx/core';

export interface DatePickerContextValue {
  /** Floating UI reference 요소 (Input/Trigger가 설정, Popover가 읽음) */
  referenceRef: MutableRefObject<HTMLElement | null>;
  /** 현재 선택된 날짜 (ISO 8601 UTC) */
  value: ISODateString | null;
  /** 날짜 선택 핸들러 */
  selectDate: (iso: ISODateString | null) => void;
  /** 팝오버 열림 상태 */
  isOpen: boolean;
  /** 팝오버 열기 */
  open: () => void;
  /** 팝오버 닫기 */
  close: () => void;
  /** 팝오버 토글 */
  toggle: () => void;
  /** 현재 표시 중인 월 (ISO string) */
  viewMonth: ISODateString;
  /** 표시 월 변경 */
  setViewMonth: (iso: ISODateString) => void;
  /** 캘린더에서 포커스된 날짜 */
  focusedDate: ISODateString;
  /** 포커스 날짜 변경 */
  setFocusedDate: (iso: ISODateString) => void;
  /** 날짜 어댑터 */
  adapter: DateAdapter;
  /** 비활성화 규칙 */
  disabled: DisabledRule[];
  /** 주 시작 요일 */
  weekStartsOn: WeekStartsOn;
  /** 날짜 표시 포맷 */
  displayFormat: string;
  /** BCP 47 locale (예: "en-US", "ko-KR") */
  locale: string;
  /** 전체 비활성화 */
  isDisabled: boolean;
  /** 읽기 전용 */
  isReadOnly: boolean;
  /** 고유 ID (useId 기반) */
  pickerId: string;
}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);

/**
 * DatePickerContext를 소비한다.
 * DatePicker.Root 외부에서 호출하면 명확한 에러를 던진다.
 */
export function useDatePickerContext(componentName: string): DatePickerContextValue {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error(
      `[${componentName}] DatePicker.Root 내부에서 사용해야 합니다.\n\n` +
      '올바른 사용법:\n' +
      '  <DatePicker>\n' +
      `    <DatePicker.${componentName.replace('DatePicker.', '')} />\n` +
      '  </DatePicker>'
    );
  }
  return context;
}
