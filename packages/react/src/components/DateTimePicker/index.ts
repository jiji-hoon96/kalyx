import { DateTimePickerRoot } from './Root.js';
import { DateTimePickerInput } from './Input.js';

// 재사용: DatePicker 하위 컴포넌트 (DatePickerContext 소비)
import { DatePickerPopover } from '../DatePicker/Popover.js';
import { DatePickerCalendar } from '../DatePicker/Calendar.js';

// 재사용: TimePicker 하위 컴포넌트 (TimePickerContext 소비)
import { TimePickerHourList } from '../TimePicker/HourList.js';
import { TimePickerMinuteList } from '../TimePicker/MinuteList.js';
import { TimePickerAmPmToggle } from '../TimePicker/AmPmToggle.js';

import type { DateTimePickerRootProps } from './Root.js';
import type { DateTimePickerInputProps } from './Input.js';

/**
 * DateTimePicker — 날짜와 시간을 함께 선택하는 통합 컴포넌트.
 *
 * 단일 ISO datetime을 source of truth로 관리하며, 내부적으로
 * DatePickerContext와 TimePickerContext를 동시에 제공한다.
 * 따라서 DatePicker.Calendar, TimePicker.HourList 등 기존 컴포넌트가
 * 그대로 동작한다.
 *
 * @example
 * ```tsx
 * <DateTimePicker value={dt} onChange={setDt} format="24h" step={15}>
 *   <DateTimePicker.Input />
 *   <DateTimePicker.Popover>
 *     <DateTimePicker.Calendar />
 *     <DateTimePicker.HourList />
 *     <DateTimePicker.MinuteList />
 *   </DateTimePicker.Popover>
 * </DateTimePicker>
 * ```
 *
 * @example 12시간제 모드
 * ```tsx
 * <DateTimePicker value={dt} onChange={setDt} format="12h" step={15}>
 *   <DateTimePicker.Input />
 *   <DateTimePicker.Popover>
 *     <DateTimePicker.Calendar />
 *     <DateTimePicker.HourList />
 *     <DateTimePicker.MinuteList />
 *     <DateTimePicker.AmPmToggle />
 *   </DateTimePicker.Popover>
 * </DateTimePicker>
 * ```
 */
export const DateTimePicker = Object.assign(DateTimePickerRoot, {
  Input: DateTimePickerInput,
  Popover: DatePickerPopover,
  Calendar: DatePickerCalendar,
  HourList: TimePickerHourList,
  MinuteList: TimePickerMinuteList,
  AmPmToggle: TimePickerAmPmToggle,
});

export type { DateTimePickerRootProps, DateTimePickerInputProps };
