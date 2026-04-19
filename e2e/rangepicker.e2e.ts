import { test, expect } from '@playwright/test';

test.describe('RangePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/rangepicker');
	});

	test('page loads via SSR without errors', async ({ page }) => {
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

	test('select range in start-date -> end-date order', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const startInput = firstDemo.getByLabel('Start date');
		await startInput.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^10$/ })
			.click();
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^20$/ })
			.click();
		await expect(dialog).not.toBeVisible();

		await expect(startInput).not.toHaveValue('');
		await expect(firstDemo.getByLabel('End date')).not.toHaveValue('');
	});
});
