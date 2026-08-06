---
name: release-workflow
version: 1.0.0
description: |
  버전 관리, 릴리즈, npm 배포 전체 워크플로우.
  Changesets 기반 모노레포 버전 관리부터 npm publish까지 A-Z.
triggers:
  - "버전을 올려야 할 때"
  - "npm에 배포할 때"
  - "CHANGELOG를 작성할 때"
  - "pre-release를 만들 때"
  - "Breaking change를 처리할 때"
  - "패키지 설정을 확인할 때"
external_reference: engineering/release-manager (alirezarezvani/claude-skills)
---

# Skill: 릴리즈 워크플로우

## 전체 흐름 한눈에

```
PR merge → changeset 생성 → CI 통과 → Version PR 자동 생성
→ Version PR merge → npm publish + GitHub Release 자동 생성
```

---

## 1. 버전 관리 전략: Changesets

> 이 프로젝트는 [Changesets](https://github.com/changesets/changesets)를 사용한다.
> 수동 버전 범프와 CHANGELOG 작성은 하지 않는다.

### 왜 Changesets인가

- **모노레포 최적화**: `packages/core`와 `packages/react`의 버전을 독립적으로 관리
- **기여자 중심**: PR을 낼 때 기여자가 직접 changeset 파일을 작성
- **자동화**: GitHub Actions가 Version PR을 자동 생성하고, merge 시 npm publish

### 초기 설정

```bash
pnpm add -D @changesets/cli @changesets/changelog-github

# changeset 초기화 (한 번만)
pnpm changeset init
```

### `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": ["@changesets/changelog-github", {
    "repo": "jiji-hoon96/kalyx"
  }],
  "commit": false,
  "fixed": [],
  "linked": [["@kalyx/core", "@kalyx/react"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

---

## 2. 개발자 워크플로우

### 기능 개발 후 changeset 추가 (필수)

```bash
# 기능 개발 후 changeset 파일 생성
pnpm changeset

# 인터랙티브 프롬프트
# 1. 어떤 패키지가 변경됐나? → @kalyx/react 선택
# 2. semver 타입? → patch / minor / major
# 3. 변경 내용 설명 → "키보드 내비게이션 추가"
```

생성 결과 예시:
```markdown
---
"@kalyx/react": minor
---

키보드 내비게이션 추가 — Arrow keys로 날짜 이동, Enter로 선택
```

### 언제 patch / minor / major?

| 변경 유형 | semver | 예시 |
|---|---|---|
| 버그 수정 | `patch` | timezone 계산 오류 수정 |
| 새 기능 (하위 호환) | `minor` | TimePicker 서브 컴포넌트 추가 |
| Breaking change | `major` | onChange 시그니처 변경 |
| 문서, 타입만 | `patch` | JSDoc 추가, 타입 오류 수정 |
| 의존성 업데이트 (비 breaking) | `patch` | date-fns 4.1.0 → 4.2.0 |

### Breaking Change 처리 방법

```bash
# 1. Major 버전 changeset 생성
pnpm changeset
# → major 선택

# 2. changeset 파일에 마이그레이션 가이드 포함
```

changeset 파일 예시:
```markdown
---
"@kalyx/react": major
---

**Breaking:** `onChange` 반환 타입이 `Date` → `string` (ISO 8601)으로 변경됐습니다.

## 마이그레이션 방법

```tsx
// Before (0.x.x)
<DatePicker onChange={(date: Date | null) => setDate(date)} />

// After (1.0.0)
<DatePicker onChange={(iso: string | null) => {
  setDate(iso ? new Date(iso) : null);
}} />
```
```

---

## 3. 패키지 설정 완전 가이드

### `packages/react/package.json` 완전판

```json
{
  "name": "@kalyx/react",
  "version": "0.1.0",
  "description": "Headless, SSR-safe React DatePicker",
  "license": "MIT",
  "author": "Your Name <you@example.com>",
  "homepage": "https://your-docs-site.com",
  "repository": {
    "type": "git",
    "url": "https://github.com/jiji-hoon96/kalyx.git",
    "directory": "packages/react"
  },
  "bugs": {
    "url": "https://github.com/jiji-hoon96/kalyx/issues"
  },
  "keywords": [
    "react", "datepicker", "calendar", "headless",
    "typescript", "tailwind", "accessible"
  ],

  "type": "module",
  "sideEffects": false,

  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "files": [
    "dist",
    "CHANGELOG.md",
    "LICENSE"
  ],

  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },

  "dependencies": {
    "@floating-ui/react": "^0.27.0",
    "@kalyx/core": "workspace:*",
    "@kalyx/adapter-date-fns": "workspace:*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

### `packages/react/tsup.config.ts`

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],

  // 번들에 포함되지 말아야 할 것들
  noExternal: [],

  esbuildOptions(options) {
    // React 17+ JSX transform
    options.jsx = 'automatic';
  },

  onSuccess: async () => {
    // 빌드 성공 후 크기 출력
    const { execSync } = await import('child_process');
    console.log('\n📦 dist/ 크기:');
    execSync('ls -lh dist/ | grep -E "\\.(js|cjs|mjs)$"', { stdio: 'inherit' });
  },
});
```

### `.npmignore` (배포 파일 제외 목록)

```
# 소스
src/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__/
__mocks__/

# 설정
tsconfig.json
tsup.config.ts
vitest.config.ts
.eslintrc*
.prettierrc*
.changeset/

# 개발용
*.map
coverage/
.turbo/
node_modules/

# CI/CD
.github/
```

---

## 4. Pre-release 전략

### alpha / beta 릴리즈

```bash
# alpha 진입 (새 메이저 버전 개발 시작)
pnpm changeset pre enter alpha

# 이제 모든 changeset은 alpha 버전으로 발행
pnpm changeset version
# → @kalyx/react@1.0.0-alpha.0

# alpha 릴리즈 배포
pnpm --filter @kalyx/react publish --tag alpha

# beta로 전환
pnpm changeset pre exit   # alpha 종료
pnpm changeset pre enter beta

# beta 릴리즈
pnpm changeset version
# → @kalyx/react@1.0.0-beta.0
pnpm --filter @kalyx/react publish --tag beta

# 안정 릴리즈
pnpm changeset pre exit
pnpm changeset version
pnpm --filter @kalyx/react publish
```

### npm 태그 전략

| npm tag | 설치 명령 | 용도 |
|---|---|---|
| `latest` (기본) | `npm install @kalyx/react` | 안정 버전 |
| `alpha` | `npm install @kalyx/react@alpha` | 실험적 기능 |
| `beta` | `npm install @kalyx/react@beta` | RC 단계 |
| `next` | `npm install @kalyx/react@next` | 다음 메이저 RC |

---

## 5. 로컬 릴리즈 검증

```bash
# 1. 패키지에 실제로 포함될 파일 목록 확인
cd packages/react
npm pack --dry-run

# 예상 출력:
# npm notice 📦  @kalyx/react@0.1.0
# npm notice === Tarball Contents ===
# npm notice 2.3kB  dist/index.cjs
# npm notice 8.1kB  dist/index.js
# npm notice 45.2kB dist/index.d.ts
# npm notice 1.1kB  CHANGELOG.md
# npm notice 1.1kB  LICENSE

# 2. 실제 설치해서 테스트 (선택적)
cd /tmp && mkdir test-install && cd test-install
npm init -y
npm install /path/to/kalyx/packages/react
# → 실제 배포 전 설치 테스트

# 3. bundlephobia 로컬 시뮬레이션
npx bundlesize --config bundlesize.config.js
```

### `bundlesize.config.js`

```js
module.exports = {
  files: [
    {
      path: 'packages/react/dist/index.js',
      maxSize: '12 kB',        // gzip 기준
      compression: 'gzip',
    },
  ],
};
```

---

## 6. 배포 후 검증

```bash
# npm에 제대로 올라갔는지 확인
npm info @kalyx/react versions --json

# 최신 버전 설치해서 테스트
npx create-next-app@latest test-app --typescript
cd test-app
npm install @kalyx/react

# 타입이 올바른지 확인
npx tsc --noEmit

# 실제 import 되는지 확인
node -e "const lib = require('@kalyx/react'); console.log(Object.keys(lib))"
```

---

## 7. 버전 정책 요약

```
v0.x.x  — Pre-stable: minor에서 breaking change 허용
v1.0.0  — Stable: SemVer 엄격 준수 시작
v1.x.x  — Stable: minor는 새 기능만, breaking은 major만
```

**deprecation 정책:**
1. minor 버전에서 `@deprecated` JSDoc + 콘솔 경고 추가
2. 다음 major 버전에서 제거
3. 최소 1개 minor 버전 주기(약 1-2개월) 유지