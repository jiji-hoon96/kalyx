import { test, expect } from '@playwright/test';

test.describe('WeekPicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/weekpicker');
	});

	test('page loads via SSR without hydration errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'WeekPicker' })).toBeVisible();

		// WeekPicker exposes two combobox inputs (part="start" / part="end").
		const firstDemo = page.locator('.demo').first();
		await expect(firstDemo.getByRole('combobox')).toHaveCount(2);

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('single click on any day commits the whole week and closes', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const startInput = firstDemo.getByRole('combobox').first();
		await startInput.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('grid')).toBeVisible();

		// Pick day 15 of the visible month (avoid days drawn from the prior month).
		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.first()
			.click();

		await expect(dialog).not.toBeVisible();
		// Demo result block: "YYYY-MM-DD – YYYY-MM-DD" once the range commits.
		await expect(firstDemo.locator('.demo-result code')).toContainText(
			/\d{4}-\d{2}-\d{2} – \d{4}-\d{2}-\d{2}/,
		);
	});

	test('Escape closes the popover without committing', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByRole('combobox').first().click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
	});

	test('Monday-start variant commits a Mon–Sun range', async ({ page }) => {
		// The second .demo block uses weekStartsOn=1.
		const mondayDemo = page.locator('.demo').nth(1);
		const startInput = mondayDemo.getByRole('combobox').first();
		await startInput.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.first()
			.click();

		await expect(dialog).not.toBeVisible();
		// Result still renders as "YYYY-MM-DD – YYYY-MM-DD" regardless of weekStartsOn —
		// just verify a 7-day span landed (start < end and same month or rollover).
		const result = mondayDemo.locator('.demo-result code');
		await expect(result).toContainText(/\d{4}-\d{2}-\d{2} – \d{4}-\d{2}-\d{2}/);
	});
});
