---
'@kalyx/core': patch
---

`resolveCivilDateTime` 이 두 offset 프로브가 같은 instant 로 수렴하면 civil 왕복 검증을 건너뛴다. `Intl.DateTimeFormat.formatToParts` 호출이 호출당 4회에서 2회로 줄어, `displayTimezone` 이 켜진 캘린더 그리드 빌드가 약 20% 빨라진다(1172µs → 940µs, 42셀 기준). `startOfDayInTimezone` / `setTimeInTimezone` / `civilMidnightFromUtcDay` / `todayInTimezone` 이 함께 빨라진다.

동작은 동일하다. 두 프로브가 수렴하면 기존 분류 블록의 네 갈래가 모두 같은 instant 를 내므로 건너뛰어도 결과가 같다. spring-forward gap 은 프로브가 어긋나 기존 경로를 그대로 타고, fall-back ambiguity 는 수렴하지만 `disambiguation: 'earlier'` 와 같은 instant 를 낸다. 16개 존 × 730일 × 7시각 = 81,760 케이스 전수 비교에서 불일치 0.
