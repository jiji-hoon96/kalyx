import { test, expect } from '@playwright/test';

test.describe('MonthPicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/monthpicker');
	});

	test('page loads via SSR without hydration errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'MonthPicker' })).toBeVisible();

		const firstDemo = page.locator('.demo').first();
		await expect(firstDemo.getByRole('combobox')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('input click -> popover opens -> select month -> closes + commits ISO', async ({
		page,
	}) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// 12-month grid is exposed as role="grid"
		const grid = dialog.getByRole('grid');
		await expect(grid).toBeVisible();

		// Click "Apr" — the abbreviated/full label depends on locale. The default demo
		// is the English locale, so target the gridcell whose text starts with "Apr".
		await grid.getByRole('gridcell').filter({ hasText: /^Apr/ }).first().click();

		await expect(dialog).not.toBeVisible();
		// The commit result is shown as ISO under .demo-result; assert a month-start UTC ISO.
		await expect(firstDemo.locator('.demo-result code')).toContainText(
			/\d{4}-04-01T00:00:00\.000Z/,
		);
	});

	test('Escape closes the popover without committing', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		await firstDemo.getByRole('combobox').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
	});

	test('keyboard navigation: arrow keys move the focused cell, Enter commits', async ({
		page,
	}) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Anchor keyboard focus on the roving-focus cell explicitly. The grid's
		// auto-focus useEffect runs while the popover is still `visibility: hidden`
		// pre-position, so in headless browsers focus can remain on the input —
		// in which case Enter falls through to the Input's own Enter handler.
		// Focusing the data-focused gridcell isolates this test to the grid's
		// keyboard nav contract.
		await dialog.locator('[role="gridcell"][data-focused="true"]').focus();

		// 3-col × 4-row WAI-ARIA grid. From the focused cell, ArrowRight +
		// ArrowDown + Enter commits whichever month we land on as a month-start UTC ISO.
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(dialog).not.toBeVisible();
		await expect(firstDemo.locator('.demo-result code')).toContainText(/\d{4}-\d{2}-01T00:00:00/);
	});

	test('locale demo renders Korean month names', async ({ page }) => {
		// The second .demo block is the ko-KR locale demo.
		const koDemo = page.locator('.demo').nth(1);
		await koDemo.getByRole('combobox').click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Intl.DateTimeFormat 'ko-KR' formats April as "4월"
		await expect(
			dialog.getByRole('gridcell').filter({ hasText: '4월' }).first(),
		).toBeVisible();
	});
});
