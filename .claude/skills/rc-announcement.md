---
name: rc-announcement
version: 1.2.0
description: |
  v1.0.0 Release Candidate 배포·공지 플레이북.
  npm publish 검증, GitHub Release, docs 배너, README 배지, 소셜 초안까지 한 흐름으로 다룬다.
triggers:
  - "RC를 공지할 때"
  - "v1.0.0-rc 배포 상태를 검증할 때"
  - "프리릴리즈 공개 준비를 할 때"
  - "RC에서 정식 릴리즈(1.0.0)로 졸업할 때"
---

# Skill: v1.0 RC 배포 및 공지

이 플레이북은 fresh 세션에서도 그대로 실행 가능하도록 작성됐다. 각 단계는 "선행 검증 → 작업 → 검증" 순서를 따른다.

---

## 전제 상태 (2026-05-27 기준 handoff 시점)

- `.changeset/pre.json`: `mode: pre`, `tag: rc`
- npm 게시 버전: `@kalyx/react@1.0.0-rc.12`, `@kalyx/core@1.0.0-rc.12`
- dist-tag: `rc` (확정). `latest`는 여전히 stable 시점의 `0.4.0` — pre-mode 의도된 상태
- 번들 한계: **16 KB** gzip (rc.8에서 13→15→16 단계적 상향). 현재 측정 ESM ~15.33 KB / CJS ~15.51 KB
- 누적 changeset 0개 (rc.12 publish 시 모두 소비). 다음 changeset이 들어오면 release 봇이 rc.13 PR 생성
- rc.0 → rc.12 누적 주요 변경:
  - **컴포넌트 표면 확정**: 7 picker (Date/Range/Time/DateTime/Month/Year/Week) + 3 hook 모두 시리즈 내 안정화
  - **WAI-ARIA grid 키보드 내비**: Arrow/Home/End/PageUp/Down/Enter/Space + roving tabIndex (#46)
  - **MonthPicker/YearPicker disabled 셀**: before/after rule + 키보드 skip (#48)
  - **showWeekNumber + fixedWeeks + getISOWeekNumber** (#57)
  - **DisabledRule 프로그래밍 filter 변형** (#56)
  - **TimePicker filterTime 콜백** (#61) — polarity는 MUI X 스타일(true=disable)
  - **rc.10**:
    - DateTimePicker composition gap 해소 — `withSeconds`/`filterTime` props 추가 (#72)
    - hydration-safe currentTime — TimePicker/DateTimePicker에서 render-path `today()` 호출 제거 (#71/#72)
    - RangePicker.Preset 메모이즈 (#71)
    - 공개 API 타입 11개 + 4 DEFAULT_LABELS 상수 re-export (#72)
    - engines.node 통일 `>=20`, 루트 metadata, PR template 16KB 동기화, MCP 캐시 gitignore (#70)
  - **rc.11**:
    - RangePicker live-region을 Calendar→Root로 영구화 + selectingEnd/rangeSelected announce (#74)
    - ko intro.md 전체 한국어 번역 + 데모 앱 changeset ignore (#75)
    - generateMinutes step 한계 30→60 확장 (#76)
    - DatePicker/TimePicker.Input의 inputText stale 버그 fix — ctx.value 변경 시 reset, IME-aware (#77)
  - **rc.12**:
    - 7 컴포넌트 모두에 controlled value + DST 경계 + displayTimezone 결정성 테스트 추가 (#79)
    - to12Hour/to24Hour silent-wrong 차단 → RangeError로 명시화 (#80)
- 보안: 최근 패치 — `qs >=6.15.2` (#67), `next` 13 OSV 해결 (#55), `fast-uri` (#52)

> 이 상태는 시점 스냅샷. 새 세션에서 먼저 "작업 전 검증"으로 실제 상태를 확인한다.

---

## 작업 전 검증 (항상 먼저 실행)

```bash
# npm에 RC가 실제 올라갔는지 (dist-tag와 최신 RC 버전을 함께 확인)
npm view @kalyx/react dist-tags
npm view @kalyx/core  dist-tags
npm view @kalyx/react versions --json | tail -10

# GitHub Release 목록
gh release list --limit 10

# main 기준 pre-mode 여부 + 누적 changeset 잔량
cat .changeset/pre.json | head -5
ls .changeset/*.md | grep -v README | wc -l

# 현재 번들 크기 (배지·landing 업데이트 판단 기준)
pnpm --filter @kalyx/react build 2>&1 | grep -E "gzip|KB"
```

이 결과를 비교해 "어디까지 됐고 무엇이 남았는지" 판정 후 아래 단계 중 필요한 것만 수행.

---

## 플레이북 (5단계)

### Step 1. npm publish 검증 (또는 재실행)

**목표**: `@kalyx/react@rc`가 설치 가능해야 함. dist-tag는 반드시 `rc` (pre.json.tag와 일치).

**검증**:
```bash
# 빈 디렉터리에서 실제 설치 테스트
mkdir -p /tmp/kalyx-rc-test && cd /tmp/kalyx-rc-test
pnpm init && pnpm add @kalyx/react@rc react@19 react-dom@19
node -e "const k=require('@kalyx/react'); console.log(Object.keys(k));"
```

**누락 시**: CI (`release.yml`)는 changesets가 pre-mode이면 자동으로 `pre.json.tag` 값을 dist-tag로 사용 (별도 `--tag` 옵션 불필요). 실패 근인은 주로 `NPM_TOKEN` 권한 또는 OIDC trusted publishing 설정. 최근 release.yml은 `npm >= 11.5.1` 검증 단계 포함.

**`@next` 잔존 검사**: 과거 docs/README가 `@next`로 안내했다면 모두 `@rc`로 정정. `pre.json.tag: rc`가 source of truth.

```bash
grep -rn "@kalyx/react@next\|@kalyx/core@next" README.md README.ko.md apps/docs-site/ 2>/dev/null | grep -v node_modules
```

---

### Step 2. GitHub Release 드래프트

**목표**: 최신 `v1.0.0-rc.N` 태그에 연결된 prerelease 공개.

이전 release notes 패턴은 `gh release list --limit 5`로 확인. 새 RC 본문 템플릿:

```markdown
# v1.0.0-rc.N — <한 줄 헤드라인>

This RC <한 문장 — 무엇이 바뀌었고 누구를 위한 것인지>.

## What's new since rc.<N-1>

<bullet 3~5개. CHANGELOG.md의 해당 버전 섹션에서 발췌. 사용자 영향 중심으로 다듬는다.>

## Install

```bash
pnpm add @kalyx/react@rc   # 1.0.0-rc.N
# 또는 정확한 버전:
pnpm add @kalyx/react@1.0.0-rc.N
```

## Feedback

RC issues welcome at https://github.com/jiji-hoon96/kalyx/issues — tag them `v1-rc`.

## Full changelog

See [packages/react/CHANGELOG.md](./packages/react/CHANGELOG.md) and [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md).
```

**생성**:
```bash
# 한 RC 본문은 .github/RELEASE_NOTES_RC_<N>.md 로 보관해두면 다음 RC 갱신이 쉽다
gh release create v1.0.0-rc.12 \
  --prerelease \
  --title "v1.0.0-rc.12 — SSR determinism guards & boundary validation" \
  --notes-file .github/RELEASE_NOTES_RC_12.md
```

> **확인**: `release.yml`의 "릴리즈 알림" 단계가 changesets/action을 통해 release를 자동 생성하기도 한다. 자동 생성된 게 이미 있다면 `gh release edit` 으로 본문만 다듬는다.

---

### Step 3. Docs 사이트 공지 배너

**목표**: `kalyx-docs.vercel.app` 상단에 RC 배너.

**파일**: `apps/docs-site/docusaurus.config.ts` → `themeConfig.announcementBar`.

```ts
themeConfig: {
  announcementBar: {
    id: 'v1-rc-12',                  // RC가 올라갈 때마다 id 변경 — 닫힘 상태 초기화
    content:
      'Kalyx v1.0 RC12 is out — try <code>pnpm add @kalyx/react@rc</code> and share feedback on <a target="_blank" rel="noopener noreferrer" href="https://github.com/jiji-hoon96/kalyx/issues">GitHub</a>.',
    backgroundColor: '#5b4fe1',
    textColor: '#ffffff',
    isCloseable: true,
  },
  // ... 기존 설정
}
```

**검증**:
```bash
pnpm --filter docs-site start    # 로컬 브라우저에서 배너 확인
```

i18n: `apps/docs-site/i18n/ko/` 쪽 `code.json` 또는 별도 announcementBar 번역 키도 함께 갱신해야 ko 빌드에 반영됨.

---

### Step 4. README 배지 + Try the RC 섹션

**변경 지점** (`README.md`, `README.ko.md` 둘 다):

1. bundle 배지 gzip 수치를 현재 빌드 측정값으로 갱신. 예: `15.33KB` (ESM) / `15.51KB` (CJS). 한 수치만 표기한다면 ESM 값을 채택.
2. RC 배지가 이미 있는지 확인. 없으면 추가 — dist-tag는 반드시 `rc`:
   ```md
   [![RC](https://img.shields.io/npm/v/@kalyx/react/rc?color=f59e0b&label=RC)](https://www.npmjs.com/package/@kalyx/react?activeTab=versions)
   ```
3. 설치 스니펫 옆에 "Try the RC" 블록:
   ```md
   > **Trying the v1.0 release candidate?**
   > `pnpm add @kalyx/react@rc` — please report issues with the `v1-rc` tag.
   ```

**일관성 점검**: `packages/react/README.md`, `packages/core/README.md`, `apps/docs-site/` 메인 페이지에도 동일 버전·번들 수치가 있는지 확인 (이전 세션들에서 동기화 작업이 PR #60, #64 등으로 반복 처리됨).

---

### Step 5. (선택) 소셜 카피 초안

**업로드하지 말 것**. 초안만 `.github/RC_SOCIAL_DRAFT.md`에 저장하고 사용자가 확인 후 직접 게시. 1인칭 결정형 톤(라이브러리 오너 화법) 유지, AI 권유 톤 금지.

X/Twitter (280자):
> Kalyx v1.0-rc12 is out — the headless React DatePicker that ships complete. Date / Range / Time / DateTime / Month / Year / Week — ISO 8601 UTC, IANA timezone, ~15KB gzip.
>
> `pnpm add @kalyx/react@rc`
>
> Feedback welcome.

LinkedIn:
> Kalyx v1.0 is in release candidate. One library covers Date, Range, Time, DateTime, Month, Year, Week pickers — zero CSS, SSR-safe, IANA timezone. Bundle holds at ~15KB gzipped under a 16KB ceiling.
>
> Trying the RC: `pnpm add @kalyx/react@rc`. Issues: https://github.com/jiji-hoon96/kalyx/issues (tag `v1-rc`).

---

## 피드백 수집 루트

- **GitHub Issues**: `v1-rc` 라벨 생성 (`gh label create v1-rc --color f59e0b --description "v1.0 RC feedback"`)
- **Docs 사이트**: footer에 "Report a v1 RC issue" 링크 추가 (선택)
- **내부 트리아지 주기**: RC 기간 동안 주 1회 label 조회 (`gh issue list --label v1-rc --state open`)

---

## RC → 1.0.0 졸업 조건

다음 전부 충족 시 정식 릴리즈:

- [ ] `v1-rc` 라벨 open 이슈 0건 (또는 모두 "v1.1 이후"로 이관)
- [ ] RC 기간 2주 이상 경과
- [ ] 번들 크기 16KB gzip 이하 유지 (`pnpm check-bundle` 통과)
- [ ] 모든 picker에 대해 axe 접근성 통과
- [ ] SSR 스모크 테스트 통과 (`e2e-and-docs.yml` 그린)
- [ ] DST 경계 + displayTimezone 결정성 회귀 가드 유지 (PR #79로 7 컴포넌트 모두 확보)
- [ ] deferred 결함 (a11y P1, 문서 i18n, apps/docs CHANGELOG) — 처리 또는 이슈로 박제 완료

**졸업 절차**:
```bash
pnpm changeset pre exit
pnpm changeset version   # rc.N → 1.0.0
# Version PR이 생성되면 merge → CI가 dist-tag latest로 publish
# 동시에 @rc 태그도 동일 버전을 가리키도록 npm dist-tag add 검토
```

졸업 후 `latest` 가 `1.0.0`을 가리키게 되면 README의 RC 배지는 제거하거나 "v1.0 Stable" 배지로 교체.

---

## 세션 시작 체크리스트

- [ ] `.changeset/pre.json` 확인 — 아직 pre-mode인지
- [ ] `npm view @kalyx/react dist-tags` — `rc` 태그가 가리키는 최신 버전
- [ ] `gh release list` — `v1.0.0-rc.*` 릴리즈 존재 여부 및 최신 N
- [ ] `pnpm --filter @kalyx/react build` — 실제 번들 크기 수치 확보
- [ ] `ls .changeset/*.md | grep -v README` — 누적 changeset 잔량 (있으면 다음 RC 대기 중)
- [ ] 위 5개 결과로 "어느 Step부터 이어서 할지" 판정
