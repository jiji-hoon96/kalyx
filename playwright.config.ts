import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 4 : undefined,

	reporter: [
		['list'],
		['html', { open: 'never' }],
	],

	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
	],

	webServer: {
		// packages (core → adapter-date-fns → react) 빌드 후 데모 앱(apps/docs)
		// `next build` (output: 'export')로 out/ 정적 export 생성 → serve로 띄움
		command: 'pnpm build && pnpm --filter docs build && npx serve apps/docs/out -l 3000',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 240_000,
	},
});
