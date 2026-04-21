---
name: rc-announcement
version: 1.0.0
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

## 전제 상태 (2026-04-21 기준 handoff 시점)

- `.changeset/pre.json`: `mode: pre`, `tag: rc`, `@kalyx/core` / `@kalyx/react` 버전 `1.0.0-rc.0` (예상)
- main에 병합된 주요 준비 작업:
  - feat/v1-rc-preparation (ca7180e)
  - MonthPicker / YearPicker / WeekPicker 추가
  - Presets, onOpenChange, onCalendarNavigate 콜백
- Bundle 수치: landing 비교표에 `~11KB`, README 배지에 `9.73KB` — **불일치 있음(확인 필요)**

> 이 상태는 시점 스냅샷. 새 세션에서 먼저 "작업 전 검증"으로 실제 상태를 확인한다.

---

## 작업 전 검증 (항상 먼저 실행)

```bash
# npm에 RC가 실제 올라갔는지
npm view @kalyx/react versions --json | tail -20
npm view @kalyx/core  versions --json | tail -20

# GitHub Release 목록
gh release list --limit 10

# main 기준 pre-mode 여부
cat .changeset/pre.json | head -5

# 현재 번들 크기 (배지·landing 업데이트 판단 기준)
pnpm --filter @kalyx/react build 2>&1 | grep gzip
```

이 4개 결과를 비교해 "어디까지 됐고 무엇이 남았는지" 판정 후 아래 단계 중 필요한 것만 수행.

---

## 플레이북 (5단계)

### Step 1. npm publish 검증 (또는 재실행)

**목표**: `@kalyx/react@next`가 설치 가능해야 함.

**검증**:
```bash
# 빈 디렉터리에서 실제 설치 테스트
mkdir /tmp/kalyx-rc-test && cd /tmp/kalyx-rc-test
pnpm init -y && pnpm add @kalyx/react@next react@19 react-dom@19
node -e "console.log(require('@kalyx/react'))"
```

**누락 시**: CI (`release.yml`)가 changeset publish를 `--tag next`로 실행하는지 확인. pre-mode일 때 changesets가 자동으로 `next` dist-tag를 사용하므로 워크플로우 인자 수정은 대개 불필요. 실패 근인은 주로 NPM_TOKEN 권한 또는 provenance 설정.

---

### Step 2. GitHub Release 드래프트

**목표**: `v1.0.0-rc.0` 태그에 연결된 prerelease 공개.

**본문 템플릿** (`.github/RELEASE_NOTES_RC.md`로 저장해 재사용 가능):

```markdown
# v1.0.0-rc.0 — First Release Candidate

This is the first RC for Kalyx v1.0. The public API is frozen; we're collecting feedback before cutting the stable release.

## What's in

- **MonthPicker / YearPicker / WeekPicker** — three new top-level components sharing the same composition + adapter contract
- **Presets API** — `DatePicker.Presets` + `DatePicker.Preset` (today / tomorrow / startOfMonth / custom ISO)
- **Event callbacks** — `onOpenChange`, `onCalendarNavigate` on all picker roots
- **WeekPicker / RangePicker.Calendar mutation fix** — WeekPicker no longer mutates the shared calendar config
- **IANA timezone** — DST-safe `displayTimezone` on Date/DateTime/Range pickers

## Install

```bash
pnpm add @kalyx/react@next   # 1.0.0-rc.0
```

## Feedback

RC issues welcome at https://github.com/jiji-hoon96/kalyx/issues — tag them `v1-rc`.

## Full changelog

See [packages/react/CHANGELOG.md](./packages/react/CHANGELOG.md) and [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md).
```

**생성**:
```bash
gh release create v1.0.0-rc.0 \
  --prerelease \
  --title "v1.0.0-rc.0 — First Release Candidate" \
  --notes-file .github/RELEASE_NOTES_RC.md
```

---

### Step 3. Docs 사이트 공지 배너

**목표**: `kalyx-docs.vercel.app` 상단에 RC 배너.

**파일**: `apps/docs-site/docusaurus.config.ts` → `themeConfig.announcementBar` 추가.

```ts
themeConfig: {
  announcementBar: {
    id: 'v1-rc',                     // 버전 변경 시 id도 바꿔야 닫힘 상태가 초기화됨
    content:
      'Kalyx v1.0 RC is out — try <code>pnpm add @kalyx/react@next</code> and share feedback on <a target="_blank" rel="noopener noreferrer" href="https://github.com/jiji-hoon96/kalyx/issues">GitHub</a>.',
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

---

### Step 4. README 배지 + Try the RC 섹션

**현재 상태**: README의 bundle 배지가 `9.73KB`로 박혀 있으나 최신 landing 비교표는 `~11KB`. Step 1에서 측정한 실제 수치로 통일.

**변경 지점** (`README.md`, `README.ko.md` 둘 다):
1. bundle 배지 gzip 수치 업데이트
2. npm 배지 아래 RC 배지 추가:
   ```md
   [![RC](https://img.shields.io/npm/v/@kalyx/react/next?color=f59e0b&label=RC)](https://www.npmjs.com/package/@kalyx/react?activeTab=versions)
   ```
3. 설치 스니펫 옆에 "Try the RC" 블록 추가:
   ```md
   > **Trying the v1.0 release candidate?**
   > `pnpm add @kalyx/react@next` — please report issues with the `v1-rc` tag.
   ```

---

### Step 5. (선택) 소셜 카피 초안

**업로드하지 말 것**. 초안만 `.github/RC_SOCIAL_DRAFT.md`에 저장하고 사용자가 확인 후 직접 게시.

X/Twitter (280자):
> Kalyx v1.0-rc is out — the headless React DatePicker that ships complete. Single / range / time / month / year / week pickers, ISO 8601 UTC, IANA timezone, ~11KB gzip.
>
> `pnpm add @kalyx/react@next`
>
> Feedback welcome.

LinkedIn:
> After months of composition-first API work, Kalyx v1.0 is in release candidate. One library covers Date, Range, Time, DateTime, Month, Year, Week pickers — zero CSS, SSR-safe, IANA timezone. Bundle stays under 12KB gzipped.
>
> Trying the RC: `pnpm add @kalyx/react@next`. Issues: https://github.com/jiji-hoon96/kalyx/issues (tag `v1-rc`).

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
- [ ] 번들 크기 12KB gzip 이하 유지 (`pnpm check-bundle` 통과)
- [ ] 모든 picker에 대해 axe 접근성 통과
- [ ] SSR 스모크 테스트 통과 (`e2e-and-docs.yml` 그린)

**졸업 절차**:
```bash
pnpm changeset pre exit
pnpm changeset version   # rc.N → 1.0.0
# Version PR이 생성되면 merge → CI가 @latest로 publish
```

---

## 세션 시작 체크리스트

- [ ] `.changeset/pre.json` 확인 — 아직 pre-mode인지
- [ ] `npm view @kalyx/react dist-tags` — `next` 태그 존재 여부
- [ ] `gh release list` — `v1.0.0-rc.*` 릴리즈 존재 여부
- [ ] `pnpm --filter @kalyx/react build` — 실제 번들 크기 수치 확보
- [ ] 위 4개 결과로 "어느 Step부터 이어서 할지" 판정
