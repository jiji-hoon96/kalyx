---
name: oss-references
version: 1.0.0
description: 이 프로젝트에서 활용 가능한 외부 오픈소스 스킬 목록. alirezarezvani/claude-skills 기준.
triggers:
  - "외부 스킬을 참조해야 할 때"
  - "어떤 스킬이 있는지 확인할 때"
---

# Skill: 외부 오픈소스 스킬 참조

> 소스: [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (7.9k stars, 2026.04 기준)

## 이 프로젝트에서 바로 활용 가능한 스킬

### 🏗️ 프로젝트 구조 & 빌드

| 스킬 경로 | 언제 쓰는가 |
|---|---|
| `engineering/monorepo-navigator` | pnpm workspace 설정, 패키지 의존성 그래프, Turborepo 없이 모노레포 관리 |
| `engineering/dependency-auditor` | `date-fns`, `@floating-ui` 등 의존성 감사, 라이선스 확인 |
| `engineering/performance-profiler` | 번들 크기 분석, tree-shaking 검증, 16KB 목표 달성 확인 |
| `engineering/release-manager` | semantic version 결정, npm publish 워크플로우 |
| `engineering/changelog-generator` | Conventional Commits → CHANGELOG 자동 생성 |

### 🔍 코드 품질

| 스킬 경로 | 언제 쓰는가 |
|---|---|
| `engineering-team/code-reviewer` | PR 리뷰 체크리스트, 코드 품질 기준 |
| `engineering/pr-review-expert` | 변경 범위 분석, 번들 영향도 확인, 보안 스캔 |
| `engineering/api-design-reviewer` | 컴포넌트 API 설계 리뷰 (props, hook 인터페이스) |

### 🎨 프론트엔드 전문

| 스킬 경로 | 언제 쓰는가 |
|---|---|
| `engineering-team/senior-frontend` | 번들 최적화, Composition 패턴, React 성능 최적화 |
| `engineering-team/senior-qa` | 테스트 전략, 커버리지 계획, e2e 설계 |

### 📖 문서 & 릴리즈

| 스킬 경로 | 언제 쓰는가 |
|---|---|
| `engineering/codebase-onboarding` | 프로젝트 온보딩 문서 자동 생성 |
| `engineering/runbook-generator` | 개발 워크플로우 문서화 |
| `engineering/tech-debt-tracker` | 기술 부채 추적, 우선순위 결정 |

---

## 설치 방법

```bash
# Claude Code 마켓플레이스 등록
/plugin marketplace add alirezarezvani/claude-skills

# 엔지니어링 스킬 전체 설치
/plugin install engineering-skills@claude-code-skills

# 개별 스킬 설치
/plugin install monorepo-navigator@claude-code-skills
/plugin install api-design-reviewer@claude-code-skills
/plugin install performance-profiler@claude-code-skills

# 수동 설치 (마켓플레이스 없는 환경)
git clone https://github.com/alirezarezvani/claude-skills.git
cp -r claude-skills/engineering/monorepo-navigator ~/.claude/skills/
cp -r claude-skills/engineering/api-design-reviewer ~/.claude/skills/
```

---

## 주요 스킬 활용 시나리오

### 시나리오 1: 번들 크기가 16KB를 초과했다

```
1. performance-profiler 스킬 활용
   → 어떤 모듈이 번들을 크게 만드는지 분석
   → tree-shaking이 안 되는 import 패턴 찾기

2. dependency-auditor 스킬 활용
   → 의존성 크기 영향도 확인
   → 대체 경량 라이브러리 제안
```

### 시나리오 2: 새 API를 설계해야 한다

```
1. api-design-reviewer 스킬 활용
   → REST API 설계 원칙을 컴포넌트 API에 적용
   → "이 prop이 정말 필요한가?" 검토 기준

2. 우리 .claude/skills/api-design.md와 함께 활용
   → Composition vs Configuration 판단
   → classNames, asChild 패턴 확인
```

### 시나리오 3: 모노레포에서 패키지 간 의존성 문제

```
1. monorepo-navigator 스킬 활용
   → packages/core ↔ packages/react 의존성 그래프
   → pnpm workspace 프로토콜 문제 해결

2. dependency-auditor 스킬 활용
   → circular dependency 확인
```

### 시나리오 4: PR 리뷰 체크리스트

```
1. pr-review-expert 스킬 활용
   → 변경 범위 자동 분석
   → "이 변경이 번들 크기에 얼마나 영향을 주나?"

2. code-reviewer 스킬 활용
   → 코드 품질 기준 체크
   → 리팩터링 제안
```

---

## senior-frontend SKILL.md에서 참고할 패턴

`engineering-team/senior-frontend`는 이 프로젝트와 가장 관련성이 높다.

특히 참고할 내용:
- **번들 최적화**: moment → date-fns 전환 (290KB → 12KB) 예시가 있음
- **Composition 패턴**: `Tabs.List`, `Tabs.Panel` 구조 예시
- **useDebounce 패턴**: Input 최적화에 활용 가능

```tsx
// senior-frontend SKILL.md에서 참조한 Composition 예시
const Tabs = ({ children }) => {
  const [active, setActive] = useState(0);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
};
Tabs.List = TabList;
Tabs.Panel = TabPanel;

// 우리 DatePicker에도 동일하게 적용
const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Calendar: DatePickerCalendar,
  Popover: DatePickerPopover,
});
```