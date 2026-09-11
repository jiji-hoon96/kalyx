# index CJS 번들 바이트 지도

측정 2026-09-11, `@kalyx/react@1.4.7` (main `d15e28a`), Apple M2 Max / Node 24.16.

## 왜 이 문서가 있나

`packages/react/dist/index.cjs` 의 gzip 크기가 **20,259 B** 이고 CI 천장이 20,480 B 다.
**여유 221 B.** 기본 엔트리 20 KB 는 공개 수치라 천장을 올릴 수 없다
(루트 `CLAUDE.md` §2: "기본 엔트리 20KB 는 공개 수치라 불변").

그래서 다음에 런타임 기능을 넣을 때는 바이트를 먼저 회수해야 한다. 이 문서는
**어디에 몰려 있는지**를 재 둔 것이다. 지금 리팩터하자는 제안이 아니다.
쓰지도 않을 여유를 만들려고 가장 많이 테스트된 컴포넌트를 건드리는 것은
투기적 최적화다.

측정 방법은 최상위 선언 경계로 청크를 나누고, 각 청크를 뺐을 때 줄어드는 gzip
바이트를 그 청크의 실효 기여로 잡았다.

## 상위 기여 구간

| gzip | raw | 구간 |
|---|---|---|
| 2,754 B | 9,490 | `DatePickerCalendar` |
| 2,419 B | 6,374 | `RangePickerRoot` |
| 2,417 B | 12,676 | `RangePickerCalendar` |
| 1,193 B | 3,658 | `DatePickerYearGrid` |
| 1,191 B | 3,721 | `DatePickerMonthGrid` |
| 996 B | 5,048 | `DatePickerRootImpl` |
| 946 B | 7,222 | `DateTimePickerRoot` |
| 903 B | 2,386 | `useGridState` |
| 733 B | 4,035 | `DatePickerInput` |
| 731 B | 2,449 | `RangePickerInput` |

상위 20개가 18,979 B 로 전체의 94% 다.

## 회수 후보 두 개

### 후보 A: `MonthGrid` / `YearGrid` (합계 2,384 B gzip)

두 파일에서 month/year 토큰을 서로 치환하면 **304줄 중 76줄만 다르다.**
구조가 약 75% 같다. 페이지네이션 단위(12개월 고정 vs 연도 범위)와 라벨 소스만
다르고, 그리드 렌더·키보드 내비게이션·disabled 판정 경로는 같은 모양이다.

### 후보 B: `DatePickerCalendar` / `RangePickerCalendar` (합계 5,171 B gzip)

881줄 중 327줄이 다르다. 약 63% 공유. raw 대비 gzip 비율을 보면
(`RangePickerCalendar` 12,676 raw → 2,417 gzip) gzip 이 이 중복을 이미 상당히
먹고 있다.

## 측정의 함정 (중요)

**"청크를 뺐을 때의 gzip 감소"는 서로 중복인 두 청크에서 과다 계상된다.**

`MonthGrid` 를 빼면 `YearGrid` 가 더 나쁘게 압축된다. 둘이 서로의 사전이었기
때문이다. 그래서 측정된 1,191 B 에는 "잃어버린 상호 압축분"이 섞여 있다.
**둘을 합쳐도 1,191 B 가 줄지는 않는다.** 실제 절감은 그보다 작다.

이 표는 "어디를 볼지"를 알려주는 지도이지 "얼마나 줄어드는지"의 예측이 아니다.
실제 착수하면 `node scripts/bundle-diff.mjs` 로 before/after 를 재야 한다.
그 스크립트가 CI 에서도 같은 수치를 쓴다.

## 착수 판단 기준

지금은 하지 않는다. 아래 중 하나가 참이 되면 후보 A 부터 본다.

- 기본 엔트리에 런타임 기능을 추가해야 하는데 여유 221 B 로 부족할 때
- `bundle-diff` 가 마진 음수를 보고해 PR 이 막힐 때

후보 A 를 먼저 보는 이유는 중복 비율이 높고(75%), 두 컴포넌트가 같은
디렉토리에 있으며, 표면적이 Calendar 보다 작아 회귀 위험이 낮기 때문이다.

## 재현

```bash
pnpm build
node scripts/bundle-diff.mjs        # 현재 마진
node scripts/check-bundle-size.js   # CI 게이트와 동일한 측정
```

구간별 지도를 다시 뽑는 스크립트는 이 세션의 스크래치패드에 있다
(`bundle-map.mjs`). 레포에 넣지 않은 이유는 일회성 진단이고, 상시 게이트는
이미 `bundle-diff.mjs` 가 하고 있기 때문이다.
