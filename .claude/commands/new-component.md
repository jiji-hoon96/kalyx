---
name: new-component
description: 새 DatePicker 서브 컴포넌트를 스캐폴딩한다. 컴포넌트, 타입, 테스트 파일을 생성한다.
---

# /new-component

## 설명

`DatePicker.XXX` 서브 컴포넌트를 만들 때 사용한다.
컴포넌트 파일, 타입 파일, 테스트 파일을 표준 구조로 생성한다.

## 사용법

```
/new-component [ComponentName]
```

예:
```
/new-component TimePicker
/new-component MonthNav
/new-component YearSelect
```

## Claude가 수행할 작업

1. `.claude/skills/api-design.md` 읽기
2. 다음 파일들을 `packages/react/src/components/DatePicker/` 에 생성:

```
DatePicker[Name].tsx          ← 메인 컴포넌트
DatePicker[Name].types.ts     ← Props 타입 정의
DatePicker[Name].test.tsx     ← 테스트 파일 (기본 케이스 포함)
```

3. `packages/react/src/components/DatePicker/index.ts` 업데이트

## 생성 템플릿

### 컴포넌트 파일

```tsx
// DatePicker[Name].tsx
import type { DatePicker[Name]Props } from './DatePicker[Name].types';
import { useDatePickerContext } from '../../context/DatePickerContext';

/**
 * [한 줄 설명]
 *
 * DatePicker.Root 안에서 사용한다.
 *
 * @example
 * <DatePicker.Root>
 *   <DatePicker.[Name] />
 * </DatePicker.Root>
 */
export function DatePicker[Name]({
  classNames,
  ...props
}: DatePicker[Name]Props) {
  const context = useDatePickerContext('[Name]');
  // TODO: 구현
  return null;
}

DatePicker[Name].displayName = 'DatePicker.[Name]';
```

### 타입 파일

```tsx
// DatePicker[Name].types.ts
export type DatePicker[Name]ClassNames = {
  root?: string;
  // TODO: 필요한 classNames 추가
};

export type DatePicker[Name]Props = {
  classNames?: DatePicker[Name]ClassNames;
  // TODO: 필요한 props 추가
};
```

### 테스트 파일

```tsx
// DatePicker[Name].test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DatePicker } from '../index';

function Wrapper(props = {}) {
  return (
    <DatePicker onChange={vi.fn()} {...props}>
      <DatePicker.Input aria-label="날짜" />
      <DatePicker.Popover>
        <DatePicker.[Name] />
      </DatePicker.Popover>
    </DatePicker>
  );
}

describe('DatePicker.[Name]', () => {
  it('렌더링된다', () => {
    render(<Wrapper />);
    // TODO: 기본 렌더링 확인
  });

  it('접근성 위반이 없다', async () => {
    const { container } = render(<Wrapper />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // TODO: 추가 테스트 케이스
});
```

## 생성 후 확인 사항

- [ ] `CLAUDE.md` §8 절대 금지 패턴 위반 없는가?
- [ ] `.claude/skills/api-design.md` 원칙을 따르는가?
- [ ] classNames prop이 있는가?
- [ ] JSDoc 주석이 있는가?
- [ ] 테스트 파일에 axe 검사가 있는가?
- [ ] `index.ts`의 DatePicker 객체에 추가됐는가?