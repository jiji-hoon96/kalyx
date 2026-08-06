---
name: check-bundle
description: 현재 번들 크기를 분석하고 20KB 목표 달성 여부를 확인한다.
---

# /check-bundle

## 설명

빌드 후 번들 크기를 분석한다.
목표: `@kalyx/react` gzip 20KB 이하 (rc 단계에서 12 → 13KB 상향(commit e93d082); v1.0-rc.3 grid 키보드 내비게이션 추가하면서 13 → 14KB 상향; v1.0-rc.4 MonthPicker/YearPicker disabled month/year 추가하면서 14 → 15KB 상향; v1.0-rc.8 TimePicker `filterTime` 추가하면서 15 → 16KB 상향; v1.1 B10 a11y announce() 패리티 추가하면서 16 → 17KB 상향; 2026-08 timezone/constraint 정확성 전면 수정으로 17 → 20KB 상향)

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
| ✅ OK | ≤ 19KB | ≤ 19.5KB | 문제없음 |
| ⚠️ 주의 | 19–20KB | 19.5–20KB | 최적화 검토 |
| ❌ 초과 | > 20KB | > 20KB | 반드시 축소 필요 |

밴드를 엔트리별로 나눈 이유: 천장은 넷 다 20KB 로 같지만 **남은 여유가 다르다.**
index 는 1.4KB 이상 남는데 headless 는 수백 바이트 수준이라, 단일 밴드를 쓰면
index 가 멀쩡한데도 매번 경고가 떠 표가 무시당한다. 실제로 막히는 건 항상 headless 다.

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