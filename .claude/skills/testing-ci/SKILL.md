---
name: testing-ci
description: CI 환경에서의 테스트 자동화. 커버리지 게이팅, 병렬 테스트,
---

# Skill: CI 테스트 자동화

## 테스트 계층 전략

```
로컬 개발:
  pnpm test          ← watch 모드, 빠른 피드백
  
PR CI:
  단위 + 통합 테스트   ← 항상 실행 (2-3분)
  접근성 테스트        ← 항상 실행
  번들 크기 체크       ← 항상 실행

Release CI:
  전체 E2E 테스트     ← 릴리즈 전에만 (10-15분)
  크로스 브라우저      ← Chrome, Firefox, Safari
```

---

## 1. Vitest 설정 (전체)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom으로 브라우저 환경 시뮬레이션
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],

    // 병렬 실행 설정
    pool: 'forks',          // 각 테스트 파일을 별도 프로세스에서 실행
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },

    // 타임아웃
    testTimeout: 10_000,    // 테스트 하나당 최대 10초
    hookTimeout: 10_000,

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: 'coverage',

      // 커버리지 강제 기준
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
        // 특정 파일은 100% 강제
        perFile: true,
        '**/*.utils.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },

      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/index.ts',       // re-export 파일
        '**/*.types.ts',     // 타입 정의만
        '**/test/**',
        'apps/**',
      ],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/react/src'),
      '@core': path.resolve(__dirname, './packages/core/src'),
    },
  },
});
```

```ts
// test/setup.ts
import '@testing-library/jest-dom';
import { expect, vi, beforeEach, afterEach } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { cleanup } from '@testing-library/react';

expect.extend(toHaveNoViolations);

// 각 테스트 후 DOM 정리 (Testing Library)
afterEach(() => {
  cleanup();
});

// ResizeObserver mock (jsdom에 없음)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

// scrollIntoView mock (jsdom에서 지원 안 함)
Element.prototype.scrollIntoView = vi.fn();
```

---

## 2. 커버리지 게이팅 전략

### 단계별 목표 (현실적)

```
v0.1.0 출시 시:
  - 전체: 80% (빠른 출시 우선)
  - 코어 유틸: 95%
  - 접근성: axe 통과

v0.2.0:
  - 전체: 85%
  - 코어 유틸: 100%

v1.0.0 (안정):
  - 전체: 90%
  - 코어 유틸: 100%
```

### CI에서 커버리지 리포트 PR 코멘트

```yaml
# .github/workflows/pr-check.yml 에 추가
- name: 커버리지 코멘트
  uses: davelosert/vitest-coverage-report-action@v2
  if: github.event_name == 'pull_request'
  with:
    name: Coverage Report
    json-summary-path: coverage/coverage-summary.json
    json-final-path: coverage/coverage-final.json
```

PR 코멘트 예시:
```
## 📊 Coverage Report

| | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Target | 90% | 85% | 90% | 90% |
| **Current** | **92.3%** | **87.1%** | **91.5%** | **92.8%** |
| **Status** | ✅ | ✅ | ✅ | ✅ |

Changed files: (+3.2% | -0.5%)
```

---

## 3. E2E 테스트 (Playwright)

> [alirezarezvani/claude-skills: engineering-team/playwright-pro] 스킬을 함께 참고한다.

### 설치 및 설정

```bash
pnpm add -D @playwright/test
npx playwright install chromium firefox webkit
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,   // CI에서는 2번 재시도
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['github'],  // GitHub Actions 어노테이션
  ],

  use: {
    // 문서 사이트 로컬 서버
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',    // 실패 시 trace 저장
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'safari',   use: { ...devices['Desktop Safari'] } },
    // 모바일
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  // 테스트 전 문서 사이트 서버 시작
  webServer: {
    command: 'pnpm --filter docs dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

### E2E 테스트 예시

```ts
// e2e/datepicker.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('DatePicker E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/basic');
  });

  test('기본 날짜 선택 플로우', async ({ page }) => {
    const input = page.getByRole('combobox', { name: '날짜 선택' });
    
    // 팝오버 열기
    await input.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 15일 선택
    await page.getByRole('gridcell', { name: /15일/ }).click();
    
    // 팝오버 닫혔는지 확인
    await expect(dialog).not.toBeVisible();
    
    // Input 값 확인
    await expect(input).toHaveValue(/15/);
  });

  test('키보드로만 날짜 선택 (접근성)', async ({ page }) => {
    const input = page.getByRole('combobox', { name: '날짜 선택' });
    
    // Tab으로 Input 포커스
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    
    // Enter로 팝오버 열기
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 방향키로 날짜 이동
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // Enter로 선택
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('모바일 터치 인터랙션', async ({ page, isMobile }) => {
    test.skip(!isMobile, '모바일에서만 실행');
    
    const input = page.getByRole('combobox', { name: '날짜 선택' });
    await input.tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 터치로 날짜 탭
    await page.getByRole('gridcell', { name: /15일/ }).tap();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('SSR 페이지에서 hydration 오류 없음', async ({ page }) => {
    // 콘솔 에러 수집
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/examples/nextjs-ssr');
    
    // hydration 경고 없어야 함
    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') || e.includes('hydration')
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});
```

### E2E CI 워크플로우

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  # 릴리즈 전에만 실행 (PR이 아닌 main 직접 push 또는 릴리즈)
  push:
    branches: [main]
  workflow_dispatch:  # 수동 실행도 허용

jobs:
  e2e:
    name: E2E (${{ matrix.project }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [chromium, firefox, safari]
      fail-fast: false
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
      - name: Playwright 브라우저 설치
        run: npx playwright install --with-deps ${{ matrix.project }}
      - name: E2E 테스트 실행
        run: npx playwright test --project=${{ matrix.project }}
      - name: 실패 리포트 업로드
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-${{ matrix.project }}
          path: playwright-report/
          retention-days: 7
```

---

## 4. 테스트 병렬화 (대규모 테스트 스위트용)

```yaml
# Vitest shard로 테스트를 N개로 나눠 병렬 실행
test:
  strategy:
    matrix:
      shard: [1, 2, 3, 4]
  name: Test (Shard ${{ matrix.shard }}/4)
  run: pnpm test:run --shard=${{ matrix.shard }}/4 --coverage

# 각 shard의 커버리지를 합산
merge-coverage:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - name: 커버리지 다운로드
      uses: actions/download-artifact@v4
    - name: 커버리지 합산
      run: npx nyc merge coverage/ merged-coverage.json
```

---

## 5. 시각적 회귀 테스트 (선택적)

컴포넌트의 시각적 모습이 의도치 않게 변경됐을 때 감지한다.

```ts
// e2e/visual.e2e.ts
import { test, expect } from '@playwright/test';

test('Calendar 기본 모습 변화 없음', async ({ page }) => {
  await page.goto('/examples/basic');
  await page.getByRole('combobox').click();
  
  const calendar = page.getByRole('dialog');
  await expect(calendar).toHaveScreenshot('calendar-default.png', {
    maxDiffPixels: 100,  // 100픽셀까지는 허용
  });
});
```

```bash
# 스냅샷 업데이트 (의도적 변경 시)
npx playwright test --update-snapshots
```

---

## 6. package.json 스크립트 전체

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "vitest run --reporter=verbose src/**/*.test.tsx",

    "typecheck": "tsc -b",
    "lint": "eslint packages/*/src --ext .ts,.tsx",
    "lint:fix": "eslint packages/*/src --ext .ts,.tsx --fix",

    "build": "pnpm -r build",
    "check-bundle": "node scripts/check-bundle-size.js",
    "clean": "pnpm -r clean && rm -rf coverage node_modules"
  }
}
```

---

## 7. 테스트 디버깅 팁

```bash
# 특정 테스트만 실행
pnpm test -- --grep "날짜 선택"

# 특정 파일만 실행
pnpm test -- src/components/DatePicker/Calendar.test.tsx

# 실패한 테스트만 재실행
pnpm test -- --reporter=verbose --bail 1

# UI 모드로 시각적 디버깅
pnpm test:ui

# Playwright 디버그 모드
PWDEBUG=1 npx playwright test
```

---

## 출처

- 버전: 1.0.0
- 참고: engineering-team/playwright-pro (alirezarezvani/claude-skills)
