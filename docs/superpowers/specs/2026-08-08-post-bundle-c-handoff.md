# 묶음 C 이후 핸드오프 — 2026-08-08

> **시작점**: `main` @ `25d8160` · 열린 PR **0** · 960 테스트 green · npm `@kalyx/react@1.4.4` / `@kalyx/core@1.4.2`
> 아래 수치와 사실은 전부 이 세션에서 명령을 돌려 확인한 실측이다. 추정치는 없다.
>
> 이 문서는 [`2026-08-07-bundle-c-governance-handoff.md`](./2026-08-07-bundle-c-governance-handoff.md) 를 대체한다.
> **그 문서에는 그대로 따르면 레포가 잠기는 오류가 있다** — §1 참조.

---

## 0. 현재 상태

| | |
|---|---|
| main | `25d8160` (`chore: release packages (#202)`) |
| 열린 PR | 없음 |
| npm | `@kalyx/react@1.4.4` (latest, SLSA provenance v1) · `@kalyx/core@1.4.2` |
| 테스트 | 54 파일 / **960** |
| 번들 gzip | index ESM 18.52 / CJS 18.76 (천장 20) · headless ESM 19.80 / **CJS 20.06** (천장 22) |
| doc 예제 검증 | **112 예제 / 15 문서** (24 문서는 사유와 함께 미검사) |
| required check | **11개** (ruleset `17387277`) |

`@kalyx/core` 가 1.4.2 에 머문 건 정상이다 — react-only 변경이었고, `workspace:^` 전환 이후로는 core 가 dependent 로 끌려들어오지 않는다(§2).

---

## 1. ⚠️ 이전 핸드오프의 오류 (반복하면 레포가 잠긴다)

이전 문서는 required check 이름을 `OSV Vulnerability Scan` 이라고 적었다. **틀렸다.** 실제 리포트 이름은

```
OSV Vulnerability Scan / osv-scan
```

뒷부분은 `google/osv-scanner-action` **내부**의 job id 다. 이름 문자열로 매칭하므로, 앞부분만 등록했으면 모든 PR 이 영구 pending 이 됐을 것이다.

- 그래서 **`@v2.0.0` 핀이 머지 게이트의 일부**다. 이 태그를 올리면서 upstream 이 job 이름을 바꾸면 전 PR 이 막힌다. 버전 범프와 ruleset 수정을 같은 변경에서 해야 한다(`security.yml` 에 주석으로도 박아둠).
- 접두어 없는 **`osv-scanner`** 는 SARIF 업로드가 만드는 check-run 이다. **required 로 만들지 말 것** — 업로드가 skip 되면 아예 안 나타난다.

같은 문서의 다른 두 전제도 실측과 달랐다:

| 이전 문서 주장 | 실제 |
|---|---|
| "core-only 패치가 react 사용자에게 전달 안 됨" | 전달은 됐다. 다만 **react 버전을 올려야** 받았다(`linked` 가 react 를 재배포시킴) |
| 미서명 배포본 2건 | **6건** — core 0.2.0 / react 0.2.0 / date-fns 1.0.0-rc.1·1.0.0 / dayjs 0.1.0 / luxon 0.1.0 |

---

## 2. 이번에 출하된 것 (다시 파지 말 것)

`#197`~`#200`, `#203`~`#205`, 릴리즈 `#202`.

- **C-1/C-2 거버넌스** — 승인 1명 게이트 + OSV·License 를 required 로 승격. `security.yml` 의 `pull_request` `paths` 필터 제거(안 지우면 의존성 미변경 PR 에서 체크가 **아예 리포트되지 않아** 영구 pending). concurrency group 추가. 실측 실행시간 License 37s / OSV 27s.
- **C-3 `workspace:^`** — `packages/react` 가 core·date-fns 를 캐럿으로 참조. **배포본 tarball 실측**: `1.4.3` 은 `"@kalyx/core": "1.4.2"`(exact), `1.4.4` 는 `"^1.4.2"`. 이제 core 패치가 react 릴리즈 없이 기존 설치에 전달된다. 대가: core 패치가 react CHANGELOG 로 신호되지 않고, core/react 버전이 갈릴 수 있다.
- **C-4 provenance** — SECURITY.md 에 미서명 6건 등재. dayjs·luxon 은 **현재 배포된 전 버전이 미서명**. 재배포하지 않음(동일 tarball 을 새 버전으로 다시 올리는 건 아티팩트가 아니라 버전 이력을 바꾸는 것).
- **C-5 doc 예제 체커** — 46예제/2문서 → **112예제/15문서**. per-fence typed preamble, 인벤토리 assertion, 미빌드 패키지 가드.
- **폼 제출 문서-구현 불일치 해소(#205)** — §3.
- **image-size CVE 차단 해제(#204)** — §4.

---

## 3. 폼 제출 — `DatePicker.Input` 하나뿐

```
$ grep -rl 'type="hidden"' packages/react/src/components/
packages/react/src/components/DatePicker/Input.tsx
```

`name` prop 과 hidden input 은 **`DatePicker.Input` 에만** 있다. Root 에는 `name` 이 없고, **MonthPicker·YearPicker·WeekPicker·RangePicker·DateTimePicker 는 폼 제출을 지원하지 않는다.**

세 피커 문서가 `<form>` + Root `name` + submit 버튼으로 없는 기능을 시연하고 있었다. 사용자 결정에 따라 **구현이 아니라 거짓 문서 제거**로 처리했다. 단 `## Uncontrolled` 섹션을 통째로 지우진 않았다 — 비제어(`defaultValue`)는 실제로 동작하므로 그건 남기고 폼 관련 부분만 걷어낸 뒤, 미지원 사실과 대안(`onChange` + 직접 hidden input)을 명시했다.

`concepts/ssr.md` 은 `DatePicker` 라 **지원**하므로 반대로 `name` 을 `.Input` 으로 옮겼다.

이 사실은 세 곳에 일관되게 기록돼 있다: 각 컴포넌트 문서 · `troubleshooting.md`(en+ko) · `CLAUDE.md §3 원칙 5`.

---

## 4. OSV required 의 대가 — 만료 있는 ignore

승격 몇 시간 만에 `image-size@2.0.2` 에 CVE 2건(HIGH, DoS)이 공표돼 **모든 PR 이 막혔다**.

- **픽스 없음**: OSV 가 둘 다 `fixed: []` / `last_affected: 2.0.2` 로 보고하고 2.0.2 가 npm 최신. 범프도 `pnpm.overrides` 도 불가.
- **배포 패키지 무관**: `pnpm why image-size --filter '@kalyx/*'` → 무출력. `@docusaurus/mdx-loader` 경유로 private `apps/docs-site` 에만 들어온다. 악용하려면 malformed JXL/HEIF/ICNS 를 이 레포에 커밋해 우리 docs 빌드를 멈춰야 한다.

→ `osv-scanner.toml` 에 **2026-11-07 만료** ignore. 파일 헤더에 규칙을 박아뒀다: **만료 없는 ignore 는 조용히 영구가 된다.**

**교훈**: `paths` 필터 없는 required OSV 는 픽스 없는 dev 전용 취약점마다 명시적·기한부 판단을 요구한다. 이게 이 설정의 실제 운영 비용이다.

---

## 5. 남은 작업

| # | 항목 | 메모 |
|---|---|---|
| 1 | OSV ignore 만료 전 재검토 | **2026-11-07**. image-size 픽스 또는 Docusaurus 이전 시 제거 |
| 2 | hook 7페이지 커버리지 | 각 페이지가 signature 펜스 **하나** 때문에 빠져 있다. `declare function` 으로 바꾸면 컴파일은 되지만 **실제 export 와 대조되지 않아 vacuous** 하다 — 그래서 안 했다. per-fence skip 목록(약 20줄)이 가장 싼 증분 |
| 3 | weekpicker 1건 | `{/* ... */}` 를 children 으로 쓰는 펜스. JSX 는 children 없음으로 처리 |
| 4 | 컴포넌트 문서 KO 번역 백로그 | `components/datepicker.md` EN 18펜스 vs KO 13, **펜스 3부터 순서 자체가 어긋남**. 이것 때문에 여러 문서가 `EN_ONLY_DOCUMENTS` 에 머문다 |
| 5 | `@kalyx/adapter-date-fns@1.0.0` GitHub Release backfill | 기존 미결(RELEASING.md) |

---

## 6. 작업 규칙 (이 레포에서 실측 검증된 것)

- **main 직접 push 불가.** 문서 변경도 PR. 승인 1명 필요라 실무상 `gh pr merge --admin`. `--admin` 은 승인 요구를 넘길 뿐 **실패한 체크를 넘기지 않는다**.
- **`pull_request` 체크는 head+base 머지 ref 에서 돈다.** base 에 수정이 들어가면 자식 PR 은 **rebase 없이** `gh pr close N && gh pr reopen N` 재실행만으로 상속받는다(#204→#203 로 실증). `edited` 는 기본 트리거가 아니라 base 변경만으로는 CI 가 안 붙는다.
- **스택 PR 에 `--delete-branch` 금지** — 자식이 CLOSED 되고 재오픈·base 변경 모두 거부되는 교착. 스택은 `--squash` 아닌 `--merge`.
- **버그 수정은 discriminate 검증까지.** RED→GREEN 만으로 부족하고, **잘못된 구현을 넣어 RED 가 되는지** 직접 확인한다. 이번 세션에서 이 규칙이 두 번 값을 했다: 체커 검증 하나가 prose 에만 있는 심볼을 바꿔 통과해 "구멍"처럼 보였으나 실은 **테스트가 틀린 것**이었고, 인벤토리 assertion 은 실제로 문서를 추가·개명해 회귀를 확인했다.
- **로컬 green 을 믿지 말 것.** doc 체커가 로컬에서만 통과했다 — 매핑한 adapter `dist/` 가 내 머신에만 있었기 때문. CI 가 잡았다. 지금은 체커가 **참조된** 패키지의 선언 파일 부재를 명확한 메시지로 먼저 실패시킨다(모든 매핑을 요구하면 유닛테스트가 깨진다 — 그것도 CI 가 잡았다).
- 런타임 추가 후 **네 아티팩트 전부** 재본다. 병목은 `headless.cjs`(20.06 / 22KB). 소스 **주석 편집은 0 byte**.
- timezone 은 대표 존이 아니라 **전수 스윕**(`Intl.supportedValuesOf('timeZone')` 418개).
- docs-site 변경 시 `pnpm exec docusaurus clear` 후 **en+ko 둘 다** 빌드. 한글 헤딩에 `{#custom-id}` 금지.
- `publishConfig.provenance: true` 라 **로컬 수동 배포는 구조적으로 불가**(EUSAGE).
- 배포 후에는 워크플로 성공이 아니라 **배포본으로** 검증한다 — `npm pack <pkg>@<v>` 후 `package/package.json` 확인. 1.4.4 의 `^1.4.2` 도 이렇게 확인했다. 전파 지연으로 `npm view` 가 404 여도 버전 엔드포인트가 200 이면 성공이고, **그 창에서 재배포 금지**.
- 커밋 전 명시적 path 로 `git add`. `.idea/` 는 untracked 유지.

---

## 7. 재론 금지 (결론 남)

- **ISO 계약 = instant.** `displayTimezone` 아래 inbound 정규화는 구조적으로 불가능 — `civilMidnightFromUtcDay` 가 멱등이 아니라 양수 offset 존에서 렌더마다 하루씩 밀린다. 근거는 `CLAUDE.md §3` 에 측정치와 함께.
- `{before}`/`{after}` 정규화, `isDateDisabled` 자기 정규화도 같은 이유로 불가. 문서화로 종결.
- **`@kalyx/adapter-temporal` 드롭** — 어댑터 인터페이스가 ISO-string in/out 이라 Temporal 역량을 운반하지 못한다.
