# Kalyx Claude/Codex 검증 세션 핸드오프

작성 시점: 2026-08-03 (America/Los_Angeles)

## 1. 이번 세션의 목적과 현재 결론

이번 세션은 Kalyx 1.4.0을 라이브러리 관점에서 평가하고, Claude가 작성한 평가·수정 PR과 Codex가 기준 커밋에서 독립적으로 작성한 수정안을 비교 검증하기 위해 진행했다.

현재 결론은 다음과 같다.

- Kalyx는 Core/Adapter/React 분리, ISO 문자열 계약, 무스타일 복합 Picker 제품군, 타임존/DST 기반 코드와 테스트라는 분명한 장점이 있다.
- 그러나 광범위한 홍보 전에 타임존 민간 날짜, 선택 제약 우회, 릴리스 산출물, 문서 정확성, 소비자 번들/tree-shaking 주장을 보강해야 한다.
- Claude PR들은 실제 버그를 일부 고쳤지만 대체로 UI 경로별 국소 수정이며, 타임존 좌표와 Root 전이 경계를 완전히 다루지 않는다.
- Codex 브랜치는 Core 타임존 의미와 Date/Time/DateTime Root 전이를 더 넓게 수정했지만 아직 Range/Week, headless hooks, 전체 회귀 검증, Claude 결과와의 최종 비교가 남아 있다.
- 현재 Codex 기능 테스트는 통과하지만 React CJS gzip이 기존 17 KB 목표보다 439 B 큰 17.43 KB다. 정확성 수정을 보존하고 전체 기능 작업 후 최종 번들 예산을 판단하는 방향이 권장된다.

## 2. 저장소와 브랜치 상태

### 기준선

- 원래 `main` / `origin/main`: `77ed089be47e708f0ba54abdbd4271ee294d9aeb`
- 비교 설계 문서가 추가된 감사 기준 브랜치: `audit/baseline-77ed089`
- 감사 기준 브랜치 HEAD: `845ca09e38773c0ef128ee60c293b5af62ee8396`
- 감사 worktree: `/private/tmp/kalyx-audit-baseline`

기준선에서 먼저 `pnpm build`를 실행한 후 `pnpm test:run`을 실행했고, 45개 파일 / 776개 테스트가 통과했다.

### Codex 구현

- 브랜치: `fix/codex-correctness`
- worktree: `/private/tmp/kalyx-codex-correctness`
- 현재 기능 HEAD: `cf23681`
- upstream 없음, 원격 push 안 됨, Codex PR 없음
- working tree는 핸드오프 문서 작성 전 clean 상태였다.

주요 계획 문서:

- `docs/superpowers/specs/2026-08-03-claude-codex-correctness-comparison-design.md`
- `docs/superpowers/plans/2026-08-03-timezone-constraint-transitions.md`

SDD 진행 장부는 worktree의 git-ignored 경로에 있다.

- `.superpowers/sdd/2026-08-03-timezone-constraint-transitions/progress.md`

`/private/tmp` worktree는 영구 보존을 보장할 수 없으므로 새 세션은 먼저 worktree와 장부 존재 여부를 확인하고, 없으면 Git 커밋 기록과 이 문서를 기준으로 복구해야 한다.

## 3. Claude PR 최신 상태

2026-08-03 세션 종료 시점 기준 네 PR 모두 OPEN, non-draft, CI 전체 성공, GitHub `mergeStateStatus=BLOCKED`다.

| PR | 브랜치 / 최신 SHA | 내용 | Codex 리뷰 핵심 |
|---|---|---|---|
| [#176](https://github.com/jiji-hoon96/kalyx/pull/176) | `claude/library-evaluation-2026-08-03` / `0d0300d1` | Claude 라이브러리 종합 평가·루브릭 | 최초 검토 뒤 head가 갱신됐다. 새 세션에서 `4af0606..0d0300d` 또는 현재 전체 diff를 다시 검토해야 한다. 초기 평가에는 P0 타임존 버그, 문서 컴파일 오류, 소비자 번들/tree-shaking, 실제 audit 결과가 충분히 반영되지 않았다. |
| [#178](https://github.com/jiji-hoon96/kalyx/pull/178) | `fix/typed-input-disabled-validation` / `0e32d2e` | DatePicker typed input disabled guard | 검증이 타임존 정규화 전 좌표에 적용되고 UTC 테스트만 있다. DateTime/Range/headless에는 적용되지 않아 전체 제약 parity가 아니다. |
| [#179](https://github.com/jiji-hoon96/kalyx/pull/179) | `fix/calendar-refocus-disabled-day` / `98c2c66` | disabled focused day의 Core flag 재타겟 | 파생 `isFocused` flag만 바꾸고 React `focusedDate` state는 유지한다. DOM은 월초를 포커스하지만 첫 Arrow는 원래 disabled 날짜 부근으로 점프할 수 있다. 정확한 이동 목적지를 검증하는 테스트가 필요하다. |
| [#180](https://github.com/jiji-hoon96/kalyx/pull/180) | `fix/medium-correctness-polish` / `0c105f6` | TimePicker typed filter + exact date timezone | Core grid UTC 자정 좌표를 실제 타임존 instant로 오인하여 America/New_York 같은 음수 오프셋에서 exact-date 비활성화가 여전히 틀린다. TimePicker 검증도 Input 경로에만 있어 Context/DateTime/headless가 우회한다. |

이번 세션에서 #176, #178, #179, #180에 위 내용을 GitHub review comment로 게시했다. 새 세션에서는 댓글 이후 추가 커밋과 답변이 있는지 먼저 확인한다.

## 4. Codex 구현 커밋과 검증 상태

| 커밋 | 내용 | 검증 |
|---|---|---|
| `b1bf461` | 타임존/제약 전이 구현 계획 | 문서 커밋 |
| `6c8e200` | `calendarDayFromInstant` 민간 날짜 좌표 변환 | timezone 52/52, Core build |
| `ca22d26` | selected/today/range/disabled를 실제 타임존 민간 자정 기준으로 판정 | Core calendar 집중 테스트 |
| `09aaeb8` | focused flag도 동일 후보 instant 사용 | 리뷰 수정 라운드 통과 |
| `3fe02c1` | `dayOfWeek`를 UTC 요일이 아닌 타임존 민간 요일로 판정 | Core calendar 55/55, Core build |
| `d689a4f` | 계획에서 빠진 TimePicker Root 제약 경계 추가 | 문서 커밋 |
| `d4386ae` | DatePicker/TimePicker/DateTimePicker Root 최종 검증, 프리셋·키보드·좌표 전이 | 집중 테스트 203/203, React typecheck/build |
| `cf23681` | 타임존 미지정 time-bearing 값도 자정 grid 좌표로 정규화, DateTime 중복 제거 | 집중 테스트 205/205, React typecheck/build |

### 구현된 핵심 동작

- `CalendarDay.isoString`은 계속 UTC 자정 민간 날짜 좌표다.
- 저장된 timezone civil-midnight instant는 `calendarDayFromInstant`로 grid 좌표화한다.
- grid 좌표는 선택 시 `civilMidnightFromUtcDay`로 정확히 한 번만 저장 instant로 변환한다.
- 선택/today/focus/range/hover/exact-date/day-of-week 플래그가 양·음수 오프셋에서 표시되는 민간 날짜를 따른다.
- `before` / `after`는 기존 instant 비교 의미를 유지한다.
- DatePicker Root가 typed input, preset, calendar selection의 최종 disabled gate다.
- TimePicker Root가 typed input과 Context 기반 mutation의 최종 `filterTime` gate다.
- DateTimePicker Root가 최종 merged datetime의 날짜 규칙과 표시 시간 규칙을 검증한다.
- 거절된 mutation은 state/value callback을 변경하지 않는다.
- DateTime atomic preset은 Root의 성공 boolean을 받아 성공한 경우에만 popover를 닫으며 실제 click의 consumer `onClick`은 유지한다.
- 타임존 미지정 DateTime 값에 시간이 포함되어도 view/focus state는 UTC 자정 grid 좌표다.

### 독립 리뷰 결과

- Task 1: 리뷰 clean.
- Task 2: 최초 리뷰에서 focus 누락을 발견해 수정했고, controller 교차 점검에서 민간 요일 누락을 추가 발견해 수정했다. 최종 리뷰 clean.
- Task 3: 기본 UTC time-bearing 좌표 누락은 수정 완료. 번들 크기만 open finding이다.

### 현재 번들 수치

- 기준선: ESM 16.66 KB, CJS 16.91 KB gzip
- Task 3 최초: ESM 16.98 KB, CJS 17.45 KB
- 현재 최적화 후: ESM 16.96 KB, CJS 17.43 KB
- 기존 목표: 각각 17 KB 이하
- ESM은 통과, CJS는 439 B 초과

헬퍼 추출 세 번은 raw size를 줄여도 gzip 반복 압축을 깨뜨려 17.49–17.52 KB로 악화돼 제거했다. 마지막으로 DateTime Root의 중복 시간 재계산/null 분기만 제거해 현재 수치를 얻었다. 빌드 설정이나 임계값은 변경하지 않았다.

## 5. 아직 구현·검증하지 않은 작업

### Task 3 종료 결정

현재 SDD 장부에는 CJS 크기 finding이 open으로 남아 Task 3이 완료 처리되지 않았다.

권장 결정:

1. 기능 정확성 수정은 보존한다.
2. Range/Week/headless까지 완료한다.
3. 최종 전체 번들 수치를 다시 측정한다.
4. 소비자 번들 기준과 현재 package artifact gate의 의미를 함께 검토한 뒤, 구조 최적화·예산 조정·별도 성능 PR 중 하나를 선택한다.

단순히 17 KB 숫자를 맞추기 위해 Core 외부화나 빌드 minify 설정으로 측정치를 우회하면 안 된다. 시장/보안 감사에서 현재 번들 gate가 Core·adapter·Floating UI를 외부화해 실제 소비자 비용을 과소 표시한다고 이미 확인했다.

### Task 4: RangePicker / WeekPicker

아직 시작하지 않았다.

- stored range/today의 view/focus 좌표 정규화
- Range Root의 endpoint 최종 disabled validation
- typed/direct/predefined preset parity
- week selection의 timezone civil-midnight endpoint
- clicked/calendar week anchor 보존
- keyboard disabled predicate의 좌표/instant 일관성

### Task 5: headless hooks

아직 시작하지 않았다.

- `useDatePicker`, `useRangePicker`, `useWeekPicker`, `useDateTimePicker`, `useTimePicker`
- rendered Root와 동일한 좌표 변환 및 최종 gate
- `filterTime` 옵션 추가 및 rejected mutation no-op

### Task 6: 전체 검증·비교·PR

아직 시작하지 않았다.

- changeset 없음
- Codex branch push 안 됨
- Codex draft PR 없음
- 전체 test/coverage/typecheck/lint/format/bundle/tree-shaking/E2E 미실행
- Claude/Codex 최종 acceptance matrix 미작성

## 6. 새 세션의 권장 실행 순서

1. `/private/tmp/kalyx-codex-correctness` 존재 여부와 `git status`, `git log`를 확인한다. 없으면 `fix/codex-correctness`에서 새 외부 worktree를 만든다.
2. `origin/main`과 Claude PR #176/#178/#179/#180의 최신 SHA, 댓글, 추가 커밋, CI 상태를 다시 조회한다.
3. #176은 head가 검토 후 변경됐으므로 새 diff를 우선 리뷰한다.
4. 계획 문서 Task 3 파일 목록에 실제 승인된 `packages/react/src/context/DatePickerContext.ts`와 `packages/react/src/components/DateTimePicker/Presets.tsx`를 추가한다.
5. CJS finding을 기능 작업 종료 후 재판정하기로 결정했다면 SDD 장부에 근거와 함께 parked/deferred로 기록하고 Task 3을 완료 처리한다. 무근거로 clean 처리하지 않는다.
6. Task 4를 strict TDD와 독립 task review로 구현한다.
7. Task 5를 strict TDD와 독립 task review로 구현한다.
8. 전체 브랜치 review 전에 다음을 순서대로 실행하고 실제 수치를 기록한다.

```sh
pnpm build
pnpm test:run
pnpm test:coverage
pnpm typecheck
pnpm lint
pnpm format:check
pnpm check-bundle
pnpm check-tree-shaking
pnpm test:e2e
```

9. docs-site 별도 typecheck도 실행한다. 기존 기준선에서는 `apps/docs-site/src/pages/index.tsx(11,33): Cannot find namespace 'JSX'`로 실패했다.
10. Claude 각 PR과 Codex branch를 다음 acceptance 기준으로 비교한다.

- New York/Seoul 선택·강조·재오픈
- today/direct preset 단일 정규화
- exact-date/day-of-week/before/after/filter 규칙
- typed/calendar/preset/context/headless parity
- rejected mutation의 state/callback/close 동작
- disabled focus의 DOM/state/첫 Arrow 일관성
- 테스트가 정확한 목적지를 assert하는지
- 번들 delta와 public API 영향

11. changeset과 최종 비교 문서를 추가하고, 전체 검증 후에만 `fix/codex-correctness`를 push해 draft PR을 만든다.

## 7. 전체 라이브러리 감사에서 확인된 별도 우선순위

이번 correctness 브랜치 범위 밖이지만 홍보 전에 해결하거나 공개적으로 제한을 설명해야 한다.

### 기능/API

- date-fns adapter의 `MMM` / `MMMM` 포맷이 `044`, `0404`처럼 깨진다.
- parse 계약과 문서 예제가 실제 signature/동작과 다르다.
- Day.js adapter가 `2026-02-30` 같은 불가능한 날짜를 수용한다.
- Saturday-first locale을 Monday-first로 축소한다.
- filtered listbox keyboard navigation이 disabled option에서 정체될 수 있다.

### 릴리스/보안

- root release build가 Day.js/Luxon adapter를 빌드하지 않아 clean publish 산출물이 누락될 수 있다.
- docs가 production에서 unpinned Tailwind Play CDN을 로드하고 CSP가 없다.
- live `pnpm audit --prod`는 17 high / 10 moderate / 1 low였으며 현재 확인된 경로는 private docs/build apps였다.
- workflow action이 immutable SHA가 아니고, lockfile에 없는 `npx license-checker` / `serve` 실행이 있다.
- release workflow `cancel-in-progress: true`는 multi-package publish 중간 취소 위험이 있다.
- SECURITY.md가 1.0.0-rc.x만 지원 버전으로 적는다.

### 문서/DX

- Core API 문서가 `DateFnsAdapter`를 잘못 `@kalyx/core`에서 import한다.
- docs가 제거된 `date-fns-tz` 의존성을 여전히 안내한다.
- `fixedWeeks`/`timezone` 옵션과 4–6주 grid 계약이 문서에 정확히 반영되지 않았다.
- docs-site typecheck가 JSX namespace 오류로 실패하며 CI는 이 script를 호출하지 않는다.
- footer의 `pathname:///llms.txt`, 완화된 broken-link 설정, 오래된 SECURITY/RC/배포 문서가 남아 있다.

### 시장/홍보

Kalyx의 설득력 있는 포지션은 “ISO 문자열을 사용하는 zero-CSS React picker suite로 Date/Range/Time/DateTime/Month/Year/Week와 명시적 displayTimezone 변환을 MIT로 제공”하는 것이다.

반면 “가장 작다”, “pay only for what you import”, “WCAG AA accessible by default” 같은 주장은 현재 근거가 부족하다.

- consumer tree-shaking 측정: 단일 picker가 모두 23.42 KB gzip, 전체가 24.25 KB
- 단일 picker 간 크기 차이가 없어 현재 tree-shaking 주장은 지지되지 않는다.
- React peer가 `^19.0.0`만 허용해 React 18 시장을 제외한다.
- broad promotion 전에 correctness, release integrity, honest consumer bundle claim을 먼저 정리하는 것이 권장된다.

## 8. 세션 종료 체크리스트

- 미완료 목표를 완료로 표시하지 않았다.
- Claude PR은 merge하지 않았다.
- Codex branch는 push/PR 생성하지 않았다.
- main을 수정하거나 reset하지 않았다.
- 다음 세션은 이 문서, Git 커밋, SDD 장부를 함께 확인해야 한다.
