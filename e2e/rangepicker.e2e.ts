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

		const firstDemo = page.locator('.demo').first();
		const combos = firstDemo.getByRole('combobox');
		await expect(combos).toHaveCount(2);

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('시작일 → 종료일 순서로 범위 선택', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const startInput = firstDemo.getByLabel('시작일');
		await startInput.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog.getByRole('button', { name: '10' }).click();
		await expect(dialog).toBeVisible();

		await dialog.getByRole('button', { name: '20' }).click();
		await expect(dialog).not.toBeVisible();

		await expect(startInput).not.toHaveValue('');
		await expect(firstDemo.getByLabel('종료일')).not.toHaveValue('');
	});
});
