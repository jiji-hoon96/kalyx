import React from 'react';
import {
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  useDatePicker,
  useRangePicker,
  useTimePicker,
  DateFnsAdapter,
} from '@kalyx/react';

// Scope injected into every `jsx live` code block. Anything here is available
// without an import statement in the live editor.
const ReactLiveScope = {
  React,
  ...React,
  DatePicker,
  RangePicker,
  TimePicker,
  DateTimePicker,
  useDatePicker,
  useRangePicker,
  useTimePicker,
  DateFnsAdapter,
};

export default ReactLiveScope;
