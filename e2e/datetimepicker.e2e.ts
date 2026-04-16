import { test, expect } from '@playwright/test';

test.describe('DateTimePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datetimepicker');
	});

	test('페이지가 SSR로 에러 없이 로드된다', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'DateTimePicker' })).toBeVisible();

		const firstDemo = page.locator('.demo').first();
		await expect(firstDemo.getByLabel('날짜 및 시간')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('Input 클릭 → Calendar + TimePicker 동시 표시', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByLabel('날짜 및 시간').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('grid')).toBeVisible();
		await expect(dialog.getByRole('listbox', { name: '시' })).toBeVisible();
		await expect(dialog.getByRole('listbox', { name: '분' })).toBeVisible();
	});

	test('날짜 선택 후 팝오버가 유지된다 (시간 선택 가능)', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByLabel('날짜 및 시간').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog.getByRole('button', { name: '15' }).click();

		await expect(dialog).toBeVisible();
	});

	test('날짜 + 시간 순차 변경', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByLabel('날짜 및 시간');
		const initialValue = await input.inputValue();

		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog.getByRole('button', { name: '20' }).click();
		await dialog.getByRole('option', { name: '18' }).first().click();

		await page.keyboard.press('Escape');

		const finalValue = await input.inputValue();
		expect(finalValue).not.toBe(initialValue);
	});
});
