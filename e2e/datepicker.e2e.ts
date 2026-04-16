import { test, expect } from '@playwright/test';

test.describe('DatePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datepicker');
	});

	test('페이지가 SSR로 에러 없이 로드된다', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'DatePicker' })).toBeVisible();

		const firstDemo = page.locator('.demo').first();
		await expect(firstDemo.getByRole('combobox')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('Input 클릭 → 팝오버 열림 → 날짜 선택 → 닫힘', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('grid')).toBeVisible();

		await page.getByRole('button', { name: /15일/ }).first().click();

		await expect(page.getByRole('dialog')).not.toBeVisible();

		await expect(input).not.toHaveValue('');
	});

	test('Escape로 팝오버 닫기', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByRole('combobox').click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('키보드 내비게이션: Arrow + Enter', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(page.getByRole('dialog')).not.toBeVisible();
		await expect(input).not.toHaveValue('');
	});
});
