---
name: release
description: 새 버전 릴리즈를 준비한다. CHANGELOG 생성, 버전 범프, 체크리스트 확인.
---

# /release [version]

## 사용법

```
/release patch   ← 버그 수정 (0.1.0 → 0.1.1)
/release minor   ← 새 기능 (0.1.0 → 0.2.0)
/release major   ← Breaking change (0.1.0 → 1.0.0)
```

## Claude가 수행할 작업

### 1. 사전 점검

```bash
# 모든 테스트 통과 확인
pnpm test:run

# 타입 오류 없음 확인
pnpm typecheck

# 린트 통과 확인
pnpm lint

# 빌드 성공 확인
pnpm build

# 번들 크기 확인 (17KB 기준)
# /check-bundle 커맨드 실행
```

### 2. CHANGELOG 생성

최근 커밋에서 자동 추출:

```bash
# 마지막 태그 이후 커밋 목록
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" | \
  grep -E "^(feat|fix|refactor|docs|test|chore)" | \
  sort
```

**CHANGELOG.md 형식:**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added (feat:)
- 기능 설명 (#이슈번호)

### Fixed (fix:)
- 버그 수정 (#이슈번호)

### Changed (refactor:)
- 변경 사항

### Breaking Changes
- Breaking change 내용 + 마이그레이션 방법
```

### 3. 버전 범프

```bash
# package.json 버전 업데이트
pnpm --filter @kalyx/react version [patch|minor|major]

# Git 태그 생성
git tag -a "v$(node -p "require('./packages/react/package.json').version")" \
  -m "Release vX.Y.Z"
```

### 4. 릴리즈 체크리스트

- [ ] 모든 테스트 통과
- [ ] 번들 크기 17KB 이하
- [ ] CHANGELOG.md 업데이트
- [ ] package.json 버전 범프
- [ ] 새 공개 API의 JSDoc 주석 있음
- [ ] Breaking change라면 마이그레이션 가이드 있음
- [ ] Git 태그 생성
- [ ] GitHub Release 초안 작성

### 5. npm 배포

```bash
# 배포 전 최종 확인
npm pack --dry-run  # 번들에 포함될 파일 목록 확인

# 배포 (CI에서 자동 실행)
pnpm --filter @kalyx/react publish --access public
```

## 참고

[alirezarezvani/claude-skills: engineering/changelog-generator]와
[alirezarezvani/claude-skills: engineering/release-manager]를 함께 활용하면 자동화 가능하다.