---
name: check-bundle
description: 현재 번들 크기를 분석하고 12KB 목표 달성 여부를 확인한다.
---

# /check-bundle

## 설명

빌드 후 번들 크기를 분석한다.
목표: `@kalyx/react` gzip 12KB 미만

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

| 상태 | gzip 크기 | 조치 |
|---|---|---|
| ✅ OK | < 10KB | 문제없음 |
| ⚠️ 주의 | 10-12KB | 최적화 검토 |
| ❌ 초과 | > 12KB | 반드시 축소 필요 |

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