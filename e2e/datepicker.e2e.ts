import { test, expect } from '@playwright/test';

test.describe('DatePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datepicker');
	});

	test('page loads via SSR without errors', async ({ page }) => {
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

	test('input click -> popover opens -> select date -> closes', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('grid')).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		await expect(dialog).not.toBeVisible();
		await expect(input).not.toHaveValue('');
	});

	test('close popover with Escape', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByRole('combobox').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
	});

	test('keyboard navigation: arrow keys + Enter', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(dialog).not.toBeVisible();
		await expect(input).not.toHaveValue('');
	});
});
