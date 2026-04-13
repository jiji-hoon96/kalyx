import { test, expect } from '@playwright/test';

test.describe('RangePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/rangepicker');
	});

	test('페이지가 SSR로 에러 없이 로드된다', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'RangePicker' })).toBeVisible();
		// 두 개의 combobox (시작일, 종료일)
		const combos = page.getByRole('combobox');
		await expect(combos).toHaveCount(2);

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('시작일 → 종료일 순서로 범위 선택', async ({ page }) => {
		const startInput = page.getByLabel('시작일');
		await startInput.click();

		await expect(page.getByRole('dialog')).toBeVisible();

		// 1차 클릭: 시작일
		await page.getByRole('button', { name: /10일/ }).first().click();
		// 팝오버 유지됨 (종료일 대기)
		await expect(page.getByRole('dialog')).toBeVisible();

		// 2차 클릭: 종료일
		await page.getByRole('button', { name: /20일/ }).first().click();
		// 범위 완성 → 팝오버 닫힘
		await expect(page.getByRole('dialog')).not.toBeVisible();

		// 두 input에 값 표시됨
		await expect(startInput).not.toHaveValue('');
		await expect(page.getByLabel('종료일')).not.toHaveValue('');
	});
});
