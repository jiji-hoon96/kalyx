---
name: check-bundle
description: 현재 번들 크기를 분석하고 목표(index 20KB / headless 22KB) 달성 여부를 확인한다.
---

# /check-bundle

## 설명

빌드 후 번들 크기를 분석한다.
목표: 기본 엔트리 gzip **20KB** 이하, `/headless` 엔트리 **22KB** 이하 (rc 단계에서 12 → 13KB 상향(commit e93d082); v1.0-rc.3 grid 키보드 내비게이션 추가하면서 13 → 14KB 상향; v1.0-rc.4 MonthPicker/YearPicker disabled month/year 추가하면서 14 → 15KB 상향; v1.0-rc.8 TimePicker `filterTime` 추가하면서 15 → 16KB 상향; v1.1 B10 a11y announce() 패리티 추가하면서 16 → 17KB 상향; 2026-08 timezone/constraint 정확성 전면 수정으로 17 → 20KB 상향; 2026-08 headless 만 20 → 22KB 분리 상향 — 아래 판정 기준 참고)

## Claude가 수행할 작업

```bash
# 1. 빌드
pnpm --filter @kalyx/react build

# 2. 크기 확인
ls -lh packages/react/dist/

# 3. 의존성별 크기 분석
node -e "
const { execSync } = require('child_process');
const result = execSync('npx bundlephobia-cli packages/react/dist/index.js').toString();
console.log(result);
"

# 4. tree-shaking 확인 (사용 안 하는 코드가 번들에 포함되는지)
node -e "
import('./packages/react/dist/index.js').then(m => {
  console.log('exports:', Object.keys(m));
});
"
```

## 판정 기준

| 상태 | index (ESM/CJS) | headless (ESM/CJS) | 조치 |
|---|---|---|---|
| ✅ OK | ≤ 19KB | ≤ 21KB | 문제없음 |
| ⚠️ 주의 | 19–20KB | 21–22KB | 최적화 검토 |
| ❌ 초과 | > 20KB | > 22KB | 반드시 축소 필요 |

**두 엔트리는 천장이 다르다** — index 20KB, headless 22KB. `scripts/bundle-policy.js` 가 단일 소스다.
headless 는 index 와 같은 컴포넌트에 더해 훅 7종 전부와 `DateTimePicker.Presets` 를 싣는다.
원래 둘이 같은 20KB 를 썼는데, 그러면 **코드를 더 많이 싣는 쪽이 여유가 더 적어져**
index 가 1.4KB 씩 남는 동안 headless 가 200B 미만에서 먼저 막히는 상태가 됐다.
2026-08 에 headless 만 22KB 로 올린 이유가 이것이다. 기본 엔트리 20KB 는 공개 수치라 그대로다.

게이트 대상은 **네 아티팩트 전부**(`dist/index.js`·`index.cjs`·`headless.js`·`headless.cjs`)이며
단일 소스는 `scripts/bundle-policy.js` 다. `tsup` 의 `onSuccess` 가 초과 시 **throw** 하므로
`pnpm build` 자체가 실패하고, `release = pnpm build && changeset publish` 라 릴리즈도 함께 막힌다.
현재 병목은 `headless.cjs` 다 — index 보다 여유가 훨씬 적다.

## 크기 초과 시 점검 항목

```
1. 불필요한 dependencies가 번들에 포함됐는가?
   → tsup external 옵션 확인

2. tree-shaking이 안 되는 import가 있는가?
   → import { specific } from 'lib' (named import) 사용

3. 큰 폴리필이 포함됐는가?
   → target 브라우저 확인 (ES2020+)

4. 사용 안 하는 date-fns 함수가 번들에 있는가?
   → named import로만 사용 중인가 확인
```

## 외부 도구 참조

[alirezarezvani/claude-skills: engineering/performance-profiler] 스킬을 함께 활용하면 더 상세한 분석이 가능하다.