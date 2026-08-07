# 묶음 C (거버넌스) 핸드오프 — 2026-08-07

> **시작점**: `main` @ `02075fa` · 열린 PR 0 · 946 테스트 green · npm `@kalyx/react@1.4.3`
> **이 문서 하나만 읽고 시작할 수 있게** 쓴 것. 아래 상태는 전부 이 세션에서 API·실행으로 확인한 실측이다.

---

## 0. 직전 세션이 출하한 것 (다시 파지 말 것)

`#192` → `#193` → `#194` 스택으로 머지, `@kalyx/react@1.4.3` 배포 완료(SLSA provenance v1). `@kalyx/core` 는 react-only 변경이라 **1.4.2 유지**.

| 항목 | 결과 |
|---|---|
| 문서 정합성 | `date-fns-tz` 유령 의존성 제거, 16KB 잔재 정리, 미문서화 export 4종, KO 6파일 번역, 번들 수치 화해 |
| Month/Year 커밋 가드 | `/headless` 훅이 grid 가 disabled 로 그린 셀을 커밋하던 문제 |
| timezone 인식 제약 | `isRangeFullyDisabled` half-open + 존 매핑. **양수 offset 존에서만** 틀렸었다 |
| per-picker tree-shaking | `Object.assign` PURE 주석. TimePicker 단독 24.04 → **16.18 KB** |
| headless 천장 | 20 → **22 KB** 분리 (index 는 20 유지) |

**결론이 난 것 — 재론 금지:**
- **ISO 계약 = instant.** `displayTimezone` 아래 inbound 정규화는 **구조적으로 불가능**(`civilMidnightFromUtcDay` 가 멱등이 아니라 양수 offset 존에서 렌더마다 하루씩 밀린다). 근거는 `CLAUDE.md §3` 에 측정치와 함께 기록.
- `{before}`/`{after}` 정규화와 `isDateDisabled` 자기 정규화도 같은 이유로 불가. 문서화로 종결.

---

## 1. 묶음 C 항목 — 1/5 완료

### ✅ C-1. `main-protection` 필수 승인 0 → 1 (완료)

- ruleset `17387277` 의 `required_approving_review_count` **한 필드만** 변경. 나머지 룰 4종·`bypass_actors`·`enforcement` 전부 보존.
- 게이트 작동 확인: 변경 직후 #192 가 `MERGEABLE` → `BLOCKED / REVIEW_REQUIRED`.
- **되돌리려면** 변경 전 원본이 세션 스크래치패드 `ruleset-backup-17387277.json` 에 있었다(세션 종료 시 소멸). 필요하면 `gh api repos/jiji-hoon96/kalyx/rulesets/17387277` 로 현재 상태를 먼저 백업할 것.
- admin bypass(`actor_id:5`, `bypass_mode: pull_request`)가 남아 있어 `gh pr merge --admin` 은 계속 가능하다. 하드락 아님.

### ⚠️ C-2. OSV / License 를 required check 로 승격 — **그대로 하면 레포가 잠긴다**

`.github/workflows/security.yml` 의 트리거:

```yaml
pull_request:
  paths:
    - '**/package.json'
    - 'pnpm-lock.yaml'
```

**실측**: 문서 전용 PR 인 #192 에서 OSV/License 체크가 **0개** 실행됐다(`PR Check` 만 돌았음).

required 로 올리면 의존성을 안 건드리는 PR — 문서·테스트·리팩터링 **대부분** — 에서 체크가 아예 리포트되지 않아 **영원히 pending 으로 머지가 막힌다.**

| 선택지 | 내용 | 대가 |
|---|---|---|
| **A (권고)** | `pull_request` 의 `paths:` 필터 제거 → 모든 PR 에서 실행 후 required 승격 | 모든 PR 에 스캔 시간 추가. Security Audit 최근 실행은 10분대 기록도 있음 |
| **B** | 항상 도는 required-check shim job 이 조건부로 스캔하거나 skip 을 성공 보고 | CI 시간 유지. 복잡도 ↑, "skip 이 성공" 이라 vacuous pass 여지 |
| **C** | 보류하고 기록만 | CVE 되살리는 PR 이 green 통과 가능 (현 상태) |

의존성 변경 PR 은 이미 검사되므로 **실제 노출은 "lockfile 을 안 건드리면서 취약점 도입"** 경로뿐이다. → **A 권고.**

> 승격 전에 반드시 확인: 필터 제거 후 실제 PR 에서 두 job 이 **이름 그대로**(`OSV Vulnerability Scan`, `License Compatibility`) 리포트되는지. required check 는 이름 문자열 매칭이라 job name 이 다르면 또 pending 이 된다.

### ❌ C-3. `@kalyx/react` → `@kalyx/core` 핀 정책

**실물 확인**: 배포된 `@kalyx/react@1.4.3` 의 `dependencies["@kalyx/core"]` = **`"1.4.2"`** (exact).

`workspace:*` 가 packed 될 때 exact 로 치환되기 때문. 결과적으로 **core-only 패치가 react 사용자에게 자동 전달되지 않는다.** 어댑터 3종은 `^1.x` 라 정상 수령한다.

- 선택지: `workspace:*` → `workspace:^` 로 바꾸면 `^1.4.2` 로 packed 된다.
- ⚠️ 바꾸기 전에 **changesets 연쇄 범프**를 확인할 것 — 과거 `onlyUpdatePeerDependentsWhenOutOfRange:true` 로 major cascade 를 막은 전례가 있다(#148). `pnpm changeset version` 을 로컬에서 돌려 결과를 먼저 본다.
- 검증: 변경 후 `pnpm pack` 으로 tarball 을 열어 실제 치환값을 확인(`npm pack @kalyx/react@<v>` 후 `package/package.json`).

### ❌ C-4. `adapter-dayjs@0.1.0` · `adapter-luxon@0.1.0` 미서명

수동 첫 배포라 provenance 가 없다. `#189` 가 두 패키지에 `publishConfig.provenance: true` 를 넣어 **다음 배포부터는 서명된다.** 지금 할 일은 "재배포" 가 아니라 **기록**(릴리즈 노트나 SECURITY 문서에 0.1.0 은 미서명임을 명시)이다. 코드 변경이 없으니 억지 범프는 하지 말 것.

### ❌ C-5. doc 예제 체커 커버리지

`scripts/check-doc-code-examples.mjs` 는 `api/core.md` **EN/KO 2개 파일만** 컴파일한다(문서 70개 중 2개). 스크립트 헤더에 경계·한계가 이미 명시돼 있다:
- ` ```jsx `/` ```js ` 펜스는 검증 대상 밖(EN 문서에 27개 존재) — 깨진 예제를 jsx 로 옮기면 조용히 빠진다
- 문서 안 `type Foo = {…}` 는 새 지역 선언이라 소스와 얼마나 어긋나도 영원히 컴파일된다
- `// → "..."` 출력 주석은 미검증

확대 시 **EN/KO 펜스가 바이트 동일**해야 통과한다는 제약을 유지할 것(현재 KO 번역이 펜스를 건드리지 않는 이유).

---

## 2. 작업 규칙 (이 레포에서 검증된 것)

- **스택 PR 에 `--delete-branch` 금지.** 자식 PR 이 리타겟이 아니라 CLOSED 되고, 닫힌 PR 은 base 변경도 재오픈도 거부되는 교착에 빠진다. 복구는 `git push origin <sha>:refs/heads/<deleted>` 로 브랜치를 되살린 뒤 reopen → base 변경.
- 스택은 `--squash` 아닌 **`--merge`**(SHA 보존, 자식 충돌 방지). 릴리즈 Version PR 은 스택이 아니므로 `--squash --admin`.
- **base 를 바꿔도 CI 는 안 붙는다** — `edited` 는 기본 트리거가 아니다. base 를 main 으로 바꾼 뒤 `gh pr close N && gh pr reopen N`.
- 버그 수정은 TDD. **RED→GREEN 만으로는 부족** — 잘못된 구현을 넣어 RED 가 되는지 확인한다. 이 세션에서 가드 테스트가 주장한 걸 검증 못 하는 상태로 커밋될 뻔했다.
- 런타임 추가 후 **네 아티팩트 전부** 재본다. 병목은 `headless.cjs`(현재 20.06 / 22 KB). `tsup onSuccess` 가 throw 하고 `release = pnpm build && …` 라 릴리즈까지 막힌다.
- 소스 **주석 편집은 0 byte**(esbuild 가 제거) — 실측 확인됨.
- 커밋 전 명시적 path 로 `git add`. `.idea/` 는 untracked 로 둔다.
- docs-site 변경 시 `pnpm exec docusaurus clear` 후 **en+ko 둘 다** 빌드. 한글 헤딩에 `{#custom-id}` 금지(MDX 파싱 실패). 헤딩을 번역하면 슬러그가 바뀌므로 **inbound 앵커를 함께 고칠 것** — ko 빌드가 broken anchor 로 잡아준다.
- 배포 후에는 **워크플로 성공이 아니라 배포본으로** 검증한다(`npm pack <pkg>@<v>` → tarball 검사).

---

## 3. 착수 순서 제안

1. **C-2** 를 A 안으로 — 실제 리스크가 가장 크고, 선택지가 이미 정리돼 있다. (필터 제거 → PR 하나로 job 이름 확인 → required 승격)
2. **C-3** — 로컬 `changeset version` 으로 cascade 먼저 확인.
3. **C-4** 기록 + **C-5** 커버리지 확대. 둘 다 런타임 0 byte.

C-2·C-3 은 릴리즈 파이프라인을 건드리므로, 착수 전에 `gh api repos/jiji-hoon96/kalyx/rulesets/17387277` 백업을 떠둘 것.
