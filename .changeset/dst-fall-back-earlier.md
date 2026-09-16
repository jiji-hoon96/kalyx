---
'@kalyx/core': patch
---

`setTimeInTimezone` 이 fall-back 으로 두 번 나타나는 시각을 UTC offset 이 0 이상인 존에서 늦은 instant 로 해석하던 결함을 고쳤다. 이제 모든 존에서 이른 instant 를 고른다. 예를 들어 `Europe/London` 2026-10-25 01:30 은 `01:30Z`(GMT) 가 아니라 `00:30Z`(BST) 이고, `Australia/Sydney` 2026-04-05 02:30 은 `16:30Z` 가 아니라 `15:30Z` 다. 영향 범위는 유럽 전역, 호주 남동부(`Sydney`, `Melbourne`, `Adelaide`, `Lord_Howe` 등), 중동 일부를 포함한 84개 존이며, `displayTimezone` 을 쓰는 `TimePicker` / `DateTimePicker` 에서 그 한 시간 안의 시각을 고르면 한 시간(Lord_Howe 는 30분) 늦은 값이 `onChange` 로 나갔다. 겹치는 자정이 있는 존(`Asia/Amman`, `Asia/Gaza` 등)에서는 캘린더 클릭이 내보내는 자정 값도 같은 이유로 틀렸다. `America/New_York` 처럼 offset 이 음수인 존은 원래 맞았다.

spring-forward gap 동작은 그대로다. 없는 시각은 gap 길이만큼 앞으로 민다. 두 규칙을 합친 정책은 TC39 Temporal 의 기본값 `disambiguation: 'compatible'` 이며, 문서 주석이 이를 `'earlier'`(gap 을 뒤로 미는 모드)로 잘못 적고 있던 것도 바로잡았다.

`Intl.supportedValuesOf('timeZone')` 전체 418개 존의 2020~2045년 전환 6,789건을 `temporal-polyfill` 과 비교해 gap 3,394건, 겹침 3,395건, 주변 자정 20,367건 모두 일치한다. 수정 전에는 겹침 1,908건과 자정 9건이 어긋났다. 라이브러리는 여전히 `Intl` 만 쓴다. (`temporal-polyfill` 은 테스트 전용 devDependency)
