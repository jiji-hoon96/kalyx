import { useCallback, useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';
import { useDatePickerContext } from '../../context/DatePickerContext.js';

export interface DatePickerPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  children?: ReactNode;
}

export function DatePickerPopover({ children, ...props }: DatePickerPopoverProps) {
  const ctx = useDatePickerContext('DatePicker.Popover');
  const calendarId = `${ctx.pickerId}-calendar`;
  const floatingRef = useRef<HTMLDivElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    open: ctx.isOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // 포커스 복원: 닫힐 때 이전 포커스 요소로 복원
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ctx.isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [ctx.isOpen]);

  // 바깥 클릭 감지
  useEffect(() => {
    if (!ctx.isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const floating = floatingRef.current;
      if (floating && !floating.contains(e.target as Node)) {
        ctx.close();
      }
    }

    // 다음 틱에 등록해서 현재 클릭 이벤트는 무시
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ctx.isOpen, ctx]);

  // Escape 키 처리
  useEffect(() => {
    if (!ctx.isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        ctx.close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ctx.isOpen, ctx]);

  if (!ctx.isOpen) return null;

  return (
    <div
      ref={(node) => {
        floatingRef.current = node;
        refs.setFloating(node);
      }}
      id={calendarId}
      role="dialog"
      aria-label="날짜 선택"
      aria-modal="false"
      style={floatingStyles}
      {...props}
    >
      {children}
    </div>
  );
}
