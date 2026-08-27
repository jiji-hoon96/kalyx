---
name: ci-cd
description: GitHub Actions CI/CD 파이프라인 완전 가이드.
---

# Skill: CI/CD 파이프라인

## 파이프라인 전체 구조

```
Push to PR branch
    ↓
[CI: pr-check.yml]
  ├── typecheck
  ├── lint
  ├── test (커버리지 포함)
  ├── build
  └── bundle-size (index 20KB / headless 22KB 게이팅)

PR merge to main
    ↓
[Release: release.yml]
  ├── Changesets가 Version PR 자동 생성 (또는)
  └── npm publish (Version PR merge 시)

GitHub Release 생성
    ↓
[Docs: docs-deploy.yml]
  └── GitHub Pages에 문서 사이트 배포
```

---

## 1. PR 검증 워크플로우

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true   # 동일 PR에서 새 push 시 이전 실행 취소

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
        # packages/core, packages/react 모두 검사

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    name: Test (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]   # LTS 두 버전에서 모두 테스트
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run --coverage
      - name: 커버리지 리포트 업로드
        uses: codecov/codecov-action@v4
        if: matrix.node == 22   # 한 버전에서만 업로드
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: dist 아티팩트 저장 (bundle-size job에서 사용)
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/react/dist/
          retention-days: 1

  bundle-size:
    name: Bundle Size (gzip ceiling)
    runs-on: ubuntu-latest
    needs: build   # build job이 끝나야 실행
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: dist 다운로드
        uses: actions/download-artifact@v7
        with:
          name: dist-${{ github.run_id }}
          path: packages/react/dist/
      # 측정·게이팅은 scripts/bundle-policy.js의 정책을 공유 (B-R1, index 20KB / headless 22KB).
      # 스크립트가 kb_esm/kb_cjs 를 $GITHUB_OUTPUT 에 기록하고, 천장 초과 시 exit 1.
      - name: 크기 측정 및 판정
        id: check
        run: node scripts/check-bundle-size.js
      # B9: base ref 를 함께 측정해 PR 코멘트에 byte-level delta + 남은 마진 표시
      # (scripts/bundle-diff.mjs — 실제 단계는 .github/workflows/pr-check.yml 참조)

      - name: PR에 번들 크기 코멘트
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const size = '${{ steps.bundle-size.outputs.bundle_size }}';
            const max = '${{ steps.bundle-size.outputs.max_size }}';
            const ok = parseFloat(size) <= parseFloat(max);
            const icon = ok ? '✅' : '❌';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## ${icon} Bundle Size Report\n\n| | gzip |\n|---|---|\n| **현재** | ${size}KB |\n| **목표** | ≤ ${max}KB |\n\n${ok ? '번들 크기가 목표 이내입니다.' : '⚠️ 번들 크기가 목표를 초과했습니다!'}`
            });

  # 모든 체크가 통과해야 PR merge 가능 (Branch Protection 설정 필요)
  all-checks-pass:
    name: All Checks Pass
    runs-on: ubuntu-latest
    needs: [typecheck, lint, test, build, bundle-size]
    steps:
      - run: echo "✅ 모든 검사 통과"
```

---

## 2. 자동 릴리즈 워크플로우 (Changesets)

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write       # 태그, 릴리즈 생성
      pull-requests: write  # Version PR 생성
      id-token: write       # npm provenance (공급망 보안)
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0    # 전체 git 히스토리 (changeset이 필요)

      - uses: pnpm/action-setup@v4
        with: { version: 9 }

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - run: pnpm install --frozen-lockfile

      - name: 빌드
        run: pnpm build

      - name: 테스트 (릴리즈 전 최종 검증)
        run: pnpm test:run

      - name: Changesets 릴리즈 액션
        uses: changesets/action@v1
        with:
          # changeset이 있으면 → "Version Packages" PR 생성
          # Version PR이 merge되면 → npm publish 실행
          publish: pnpm changeset publish
          version: pnpm changeset version
          title: "chore: release packages"
          commit: "chore: release packages"
          createGithubReleases: true    # GitHub Release 자동 생성
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          # npm provenance 활성화 (공급망 보안)
          NPM_CONFIG_PROVENANCE: true
```

---

## 3. 문서 사이트 배포 (GitHub Pages)

```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'apps/docs/**'
      - 'packages/*/src/**'
      - '.changeset/**'

# GitHub Pages 배포 권한
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-docs:
    name: Build Documentation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build   # 라이브러리 먼저 빌드
      - name: 문서 사이트 빌드
        run: pnpm --filter docs build
        env:
          NEXT_PUBLIC_LIB_VERSION: ${{ github.sha }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/docs/out

  deploy-docs:
    name: Deploy to GitHub Pages
    needs: build-docs
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## 4. 보안 감사 워크플로우

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 9 * * 1'  # 매주 월요일 오전 9시
  push:
    paths:
      - '**/package.json'
      - 'pnpm-lock.yaml'

jobs:
  audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: 보안 취약점 스캔
        run: pnpm audit --audit-level=high
        # high, critical 취약점만 실패로 처리

      - name: 라이선스 호환성 확인
        run: |
          pnpm install --frozen-lockfile
          # 허용 라이선스: MIT, Apache-2.0, ISC, BSD-*
          npx license-checker --onlyAllow "MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;0BSD"

      - name: 취약점 발견 시 이슈 생성
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔒 Security: 의존성 취약점 발견',
              body: '보안 감사에서 취약점이 발견됐습니다. 워크플로우 로그를 확인하세요.',
              labels: ['security', 'dependencies']
            });
```

---

## 5. 자동 의존성 업데이트 (Renovate)

> Dependabot 대신 Renovate를 권장한다. 모노레포 지원이 뛰어나고 Conventional Commits와 통합된다.

```json
// renovate.json (저장소 루트)
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:base",
    ":semanticCommits",
    ":dependencyDashboard"
  ],
  "labels": ["dependencies"],

  // PR 생성 제한 (너무 많으면 부담)
  "prHourlyLimit": 2,
  "prConcurrentLimit": 5,

  // 주간 업데이트 (주말에 배치)
  "schedule": ["before 9am on Monday"],

  "packageRules": [
    // patch 업데이트는 자동 merge
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr"
    },
    // minor 업데이트는 PR 생성 후 수동 review
    {
      "matchUpdateTypes": ["minor"],
      "automerge": false
    },
    // major 업데이트는 별도 이슈로 추적
    {
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["major-upgrade", "dependencies"]
    },
    // peerDependency (react) 업데이트는 신중하게
    {
      "matchDepTypes": ["peerDependencies"],
      "enabled": false   // 수동으로 처리
    },
    // date-fns는 major 변경이 많으므로 pin
    {
      "matchPackageNames": ["date-fns"],
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["breaking-change", "dependencies"]
    }
  ]
}
```

---

## 6. Branch Protection Rules 설정

GitHub Repository Settings → Branches → Branch protection rules에 설정:

```
Branch name pattern: main

필수 설정:
✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners

✅ Require status checks to pass before merging
   Required checks:
   - typecheck
   - lint
   - test (Node 22)
   - build
   - Bundle Size Check (index ≤20KB / headless ≤22KB)
   - All Checks Pass

✅ Require branches to be up to date before merging
✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings
```

---

## 7. Secrets 설정

GitHub Repository Settings → Secrets and variables → Actions에 추가:

| Secret 이름 | 설명 | 어디서 발급 |
|---|---|---|
| `NPM_TOKEN` | npm 배포 토큰 | npmjs.com → Access Tokens → Automation |
| `CODECOV_TOKEN` | 커버리지 업로드 | codecov.io |

```bash
# npm 토큰 종류: Automation (CI용) vs Publish (수동용)
# CI에서는 반드시 "Automation" 타입 토큰 사용
# Automation 토큰은 2FA 없이 publish 가능 (CI에서 2FA 불가)

# 토큰 권한 설정: Packages and scopes → Read and write
```

---

## 8. CI 실행 시간 최적화

```yaml
# 의존성 캐시 최적화
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: pnpm          # pnpm-lock.yaml 기반 캐시

# Turbo 빌드 캐시 (병렬 빌드 + 캐시)
- uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-

# 병렬 테스트 (shard)
test:
  strategy:
    matrix:
      shard: [1, 2, 3]   # 3개 병렬 실행
  run: pnpm test:run --shard=${{ matrix.shard }}/3
```

---

## 9. 로컬에서 CI 재현 (디버깅)

```bash
# GitHub Actions를 로컬에서 실행 (act 사용)
# https://github.com/nektos/act

brew install act  # macOS

# PR check 로컬 실행
act pull_request --job typecheck
act pull_request --job test
act pull_request --job bundle-size

# 특정 workflow 전체 실행
act -W .github/workflows/pr-check.yml
```

---

## 출처

- 버전: 1.0.0
- 참고: engineering/ci-cd-pipeline-builder (alirezarezvani/claude-skills)
