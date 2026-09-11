# benjoffe "Fast Time of Day" 적용 가능성 감사

출처: https://www.benjoffe.com/fast-time-of-day
측정 환경: Apple M2 Max, Node v24.16.0, `packages/{core,adapter-date-fns}/dist` (2026-09-11 빌드)

## 결론

아티클이 제안하는 기법은 Kalyx 에 적용할 수 없고, 억지로 옮기면 오히려 느려진다. 근거는 세 가지이며 전부 실측했다.

다만 아티클의 **원리**(안쪽 루프에서 중복된 의존 사슬을 끊는다)를 Kalyx 의 실제 병목에 대면 개선 지점이 하나 나온다. `resolveCivilDateTime` 의 검증 프로브 2회 중 99.9% 가 중복이었다. **후보 A 로 정리해 적용했고**, `displayTimezone` 캘린더 그리드가 1172µs 에서 940µs 로 19.8% 빨라졌다. 비용은 `@kalyx/core` +9 B 이고, 크기 게이트가 재는 `@kalyx/react` 번들은 0 B 다(게이트는 core 를 재지 않는다).

## 아티클이 다루는 것

하루 안의 초 단위 값 `[0..86399]` 를 시·분·초로 쪼개는 연산을, 나눗셈과 나머지의 직렬 의존 사슬 대신 고정소수점 곱셈으로 바꿔 16 사이클에서 5 사이클로 줄이는 방법이다. 핵심 상수는 `71582789 = (1<<32)/60 + 1` 과 `1193047 = (1<<32)/3600 + 1` 이고, V3 는 `(x + 4*y) & 63` 이 x86 `lea` / ARM `ADD ... LSL #2` 한 명령으로 접히는 것을 이용한다. 대상은 C 의 부호 없는 정수이며, 아티클 자신이 "timezone, DST, 달력 보정은 다루지 않는다"고 명시한다.

## 적용 불가 근거

### 1. 그 나눗셈을 하는 코드가 Kalyx 에 없다

`packages/core/src/utils/time.ts` 의 `getTime()` 은 시·분·초를 직접 계산하지 않고 `Date.prototype.getUTCHours/getUTCMinutes/getUTCSeconds` 에 위임한다. 최적화할 나눗셈 자체가 소스에 존재하지 않는다. 나눗셈은 엔진 안에 있고 그건 이미 C++ 이다.

### 2. 상수가 JS 에서 표현되지 않는다

JS 의 `>>` 와 `>>>` 는 피연산자를 int32 로 강제 변환한다. `86399 * 71582789 = 6184681386811` 은 `2^31` 을 한참 넘긴다.

```
(86399 * 71582789) >>> 32   →  4223447867     (원하는 값: 1439)
Math.floor(86399 * 71582789 / 2**32)  →  1439  (정확하지만 부동소수점 나눗셈)
```

곱셈 결과가 `Number.isSafeInteger` 를 만족하므로 `/ 2**32` 로 흉내낼 수는 있다. 문제는 그게 더 느리다는 것이다.

| 방식 | ns/op |
|---|---|
| 네이티브 `Math.floor(t/60)` | 3.47 |
| V1 부동소수점 흉내 `Math.floor(t*71582789/2**32)` | 7.18 |
| BigInt V1 `Number((BigInt(t)*71582789n)>>32n)` | 21.71 |

아티클의 기법은 JS 에서 **2배 느려지고**, BigInt 로 정직하게 옮기면 6배 느려진다. 정수 비트 연산이 32비트에 갇혀 있는 언어에서는 이 기법이 성립하지 않는다.

### 3. 절약 대상의 비용 비중이 0.014% 다

`displayTimezone` 이 켜진 캘린더 그리드 한 번을 만드는 데 1171µs 가 든다. 같은 조건에서 `getTime()` 한 번은 0.160µs 다.

| 연산 | µs/op | 그리드 1회 대비 |
|---|---|---|
| `getCalendarDays` + `displayTimezone` | 1171.6 | 100% |
| `getCalendarDays` UTC only | 290.3 | 24.8% |
| `civilMidnightFromUtcDay` | 15.0 | 1.28% |
| `getTimezoneOffsetMinutes` | 3.23 | 0.28% |
| `setTime({hours:9})` | 0.554 | 0.047% |
| `formatTimeFromISO('HH:mm')` | 0.188 | 0.016% |
| **`getTime()` (아티클의 대상)** | **0.160** | **0.014%** |

시·분·초 추출을 무한히 빠르게 만들어도 그리드 빌드는 0.014% 빨라진다. 42셀 전부에 적용해도 0.57% 다.

## 진짜 병목은 어디인가

`Intl.DateTimeFormat.formatToParts` 호출 횟수를 계측했다. 포매터 인스턴스는 `timezone.ts` 의 `formatterCache` 가 이미 재사용하고 있어서 그리드 1회당 생성은 1개뿐이다. 문제는 생성이 아니라 호출 횟수다.

```
grid +displayTimezone  ×1   formatToParts=280   newDTF=1
grid  UTC only         ×1   formatToParts=  0   newDTF=0
civilMidnightFromUtcDay ×1  formatToParts=  4
```

`getCalendarDays` 는 42셀 각각에 `civilMidnightFromUtcDay` 를 부르고, 그 안의 `resolveCivilDateTime` 은 offset 프로브 2회 + `civilMatches` 검증 2회로 `formatToParts` 를 4번 쓴다. 여기에 셀마다 `adapter.isSameDay(..., timezone)` 이 더해져 280회가 된다. UTC 경로가 0회인 것과 대비된다.

아티클의 원리를 그대로 옮기면 이 지점이 대상이다. "하루 안의 직렬 나눗셈 사슬"이 아니라 "42셀 루프 안에서 같은 값을 반복 재계산하는 사슬"이다.

## 개선 후보

### 후보 A: `resolveCivilDateTime` 조기 반환 (적용 완료)

`resolveCivilDateTime` 은 두 후보 instant `realEpoch1`, `realEpoch2` 를 만든 뒤 둘 다 `civilMatches` 로 검증한다. 그런데 **두 값이 같으면 네 갈래 반환문이 모두 같은 값을 낸다.** `match1 && match2` 면 `min(e1,e2)`, 둘 다 실패면 `max(e1,e2)` 인데 `e1 === e2` 이면 셋 다 같다. 즉 검증 2회가 통째로 불필요하다.

```js
// resolveCivilDateTime, realEpoch2 계산 직후
if (realEpoch1 === realEpoch2) return new Date(realEpoch1).toISOString();
```

등가성의 근거는 `civilMatches` 가 같은 인자를 두 번 받는다는 것이다. 따라서 `match1 === match2` 이고, `min(e,e)` 도 `max(e,e)` 도 `e` 다. 네 갈래가 하나로 접힌다.

**두 프로브가 어긋나는 경우는 spring-forward gap 하나뿐이다.** civil-as-UTC 프로브가 전환 이전 쪽을 읽고 해결된 instant 는 전환 이후에 있어서 offset 이 갈린다(New_York 2026-03-08 02:30: -300 대 -240). 이 경우만 기존 분류 블록으로 떨어지고 snap-forward 정책이 유지된다.

**fall-back ambiguity 는 어긋나지 않고 수렴한다.** New_York 2026-11-01 civil 01:30 은 두 프로브 모두 -240(EDT)을 읽어 `realEpoch1 === realEpoch2 = 05:30Z` 가 되고, 새 경로로 빠진다. 이건 문제가 아니다. 기존 코드의 `match1 && match2 → min` 갈래가 내던 값과 같은 instant 이고, `disambiguation: 'earlier'` 정책 그대로다. 기존 테스트 `picks the earlier offset for an ambiguous fall-back hour` 가 통과하는 것이 이를 확인한다.

이 파일이 주석으로 기록해 둔 Australia/Sydney 봄 전환 버그(단일 프로브가 전날 23:00 을 내던 건)는 2패스 구조 자체를 건드리지 않으므로 유지된다.

전수 검증: 16개 존(UTC, New_York, London, Seoul, Sydney, Chatham, Kathmandu, Santiago, Apia, Cairo, Sao_Paulo, Tehran, Troll, Kolkata, Kiritimati, St_Johns) × 730일 × 하루 7개 시각 = **81,760 케이스, 불일치 0**. 반음수 offset 존(Kathmandu +05:45, Chatham +12:45, St_Johns -03:30)과 DST 전환 시각대(01:30 / 02:00 / 02:30 / 03:00)를 포함한다.

적용 후 실측(프로토타입 추정이 아니라 빌드 산출물 기준):

| | 적용 전 | 적용 후 | |
|---|---|---|---|
| `civilMidnightFromUtcDay` formatToParts | 4 | 2 | -50% |
| `civilMidnightFromUtcDay` | 14.99µs | 8.29µs | 1.81배 |
| 그리드 1회 formatToParts (`displayTimezone`) | 280 | 210 | -25% |
| `getCalendarDays` + `displayTimezone` | 1171.6µs | 940.0µs | **-19.8%** |
| `getCalendarDays` UTC only | 290.3µs | 284.6µs | 변화 없음 (경로 미사용) |

`startOfDayInTimezone` / `setTimeInTimezone` / `todayInTimezone` 도 같은 함수를 타므로 함께 빨라진다. 전수 검증 기준으로 검증 프로브의 99.9% 가 제거된다(163,520 → 184).

검증 결과: `pnpm test:run` 1124/1124 통과(`timezone.property.test.ts` 의 fast-check 속성 테스트 포함), `pnpm typecheck` / `pnpm lint` / `pnpm build` 통과.

새 테스트는 추가하지 않았다. 이 변경이 깨뜨릴 수 있는 경로는 전부 기존 테스트가 이미 잠그고 있다. spring-forward gap 스냅포워드(New_York 02:30, London 01:30), fall-back ambiguous 의 earlier 선택, Australia/Sydney 2034-10-01 자정 회귀, 반음수 offset 존(Kolkata/Kathmandu/Eucla), Chatham/Kiritimati 날짜 보존이 해당한다. 같은 내용을 한 번 더 쓰는 건 중복이다.

번들:

| 산출물 | 적용 전 | 적용 후 | 델타 |
|---|---|---|---|
| `@kalyx/react` index ESM / CJS | 19628 / 19884 B | 19628 / 19884 B | **+0 B** |
| `@kalyx/react` headless ESM / CJS | 20919 / 21209 B | 20919 / 21209 B | **+0 B** |
| `@kalyx/core` index ESM | 4854 B | 4863 B | +9 B |

게이트가 재는 `@kalyx/react` 번들은 변하지 않는다. tsup 이 `dependencies` 를 자동 외부화하므로 `@kalyx/core` 는 react 번들에 포함되지 않기 때문이다. core 자체는 +9 B 이고, 주석은 빌드에서 제거되므로 비용에 들어가지 않는다.

### 후보 B: 훅 4종의 `getCalendarDays` 메모이제이션 누락

`components/DatePicker/Calendar.tsx:83` 과 `components/RangePicker/Calendar.tsx:118` 은 `useMemo` 로 감싸고 있다. 반면 훅 경로는 감싸지 않는다.

- `hooks/useDatePicker.ts:165`
- `hooks/useRangePicker.ts:211`
- `hooks/useWeekPicker.ts:186`
- `hooks/useDateTimePicker.ts:202`

훅 소비자는 부모가 리렌더될 때마다 42셀 그리드를 다시 만든다. 비용은 UTC 290µs, `displayTimezone` 1171µs 다. 무관한 입력 필드 타이핑 한 번마다 1.1ms 가 나가는 구조다.

이건 측정된 비용이지 확정된 결함은 아니다. 훅은 `/headless` 소비자가 직접 렌더 제어를 갖는 경로라서, 메모를 훅 안에 둘지 소비자에게 맡길지는 API 판단이 필요하다. 두 컴포넌트가 이미 훅이 아니라 컴포넌트 쪽에서 메모하고 있다는 점이 이 설계 질문을 그대로 드러낸다.

## 하지 않기로 한 것

- V1/V2/V3 고정소수점 이식. 근거 2, 3.
- `getTime` / `formatTimeFromISO` 마이크로 최적화. 비용 비중 0.014%, 번들만 늘어난다.
- SIMD / 윤초 처리. 브라우저 JS 에 SIMD 경로가 없고, `Date` 는 윤초를 표현하지 않는다.

## 재현

```bash
pnpm test:run && pnpm typecheck && pnpm lint && pnpm build
node scripts/check-bundle-size.js
# 벤치·전수검증 스크립트는 세션 스크래치패드에 있음 (bench3.mjs, probe.mjs)
```

번들 수치를 잴 때는 반드시 `pnpm build` 를 먼저 돌린다. `dist` 가 소스보다 오래되면 게이트가 과거 상태를 보고한다. 이 감사 초안의 "18.62KB" 표기가 그 경우였고, 재빌드한 실제 기준선은 19.41KB 다.

계측 주의: `formatToParts` 를 카운터로 몽키패치한 채로 레이턴시를 재면 값이 오염된다. 위 수치는 카운팅 단계가 끝난 뒤 원본 함수를 복원하고 측정했다. 복원 전후 차이는 1171µs 대 1162µs 로 실제로는 미미했다.
