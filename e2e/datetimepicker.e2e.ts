import { test, expect } from '@playwright/test';

test.describe('DateTimePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datetimepicker');
	});

	test('page loads via SSR without errors', async ({ page }) => {
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

	test('input click -> shows Calendar + TimePicker together', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByLabel('날짜 및 시간').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('grid')).toBeVisible();
		await expect(dialog.getByRole('listbox', { name: '시' })).toBeVisible();
		await expect(dialog.getByRole('listbox', { name: '분' })).toBeVisible();
	});

	test('popover stays open after date selection (time can still be picked)', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByLabel('날짜 및 시간').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		await expect(dialog).toBeVisible();
	});

	test('change date and time sequentially', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByLabel('날짜 및 시간');
		const initialValue = await input.inputValue();

		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^20$/ })
			.click();

		await dialog.getByRole('option').filter({ hasText: /^18$/ }).first().click();

		await page.keyboard.press('Escape');

		const finalValue = await input.inputValue();
		expect(finalValue).not.toBe(initialValue);
	});
});
