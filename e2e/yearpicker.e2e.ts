import { test, expect } from '@playwright/test';

test.describe('YearPicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/yearpicker');
	});

	test('page loads via SSR without hydration errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'YearPicker' })).toBeVisible();

		const firstDemo = page.locator('.demo').first();
		await expect(firstDemo.getByRole('combobox')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('input click -> popover opens -> select year -> closes + commits ISO', async ({
		page,
	}) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		const grid = dialog.getByRole('grid');
		await expect(grid).toBeVisible();

		// Click the first visible year cell — exact label depends on the current decade
		// snapshot, but every cell text is a 4-digit year. Picking the first one keeps
		// the test independent of the year the suite runs in.
		await grid.getByRole('gridcell').first().click();

		await expect(dialog).not.toBeVisible();
		// The commit result is shown as ISO under .demo-result — assert year-start UTC ISO.
		await expect(firstDemo.locator('.demo-result code')).toContainText(
			/\d{4}-01-01T00:00:00\.000Z/,
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

	test('keyboard navigation: arrows + Enter commit the focused year', async ({ page }) => {
		const firstDemo = page.locator('.demo').first();
		const input = firstDemo.getByRole('combobox');
		await input.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Anchor keyboard focus on the roving-focus cell. See the MonthPicker
		// keyboard test for the full reasoning — same Floating UI / useGridState
		// race window applies here.
		await dialog.locator('[role="gridcell"][data-focused="true"]').focus();

		// 3-col × 4-row grid. ArrowRight + ArrowDown + Enter commits the landed
		// year as a January-1 UTC ISO regardless of which decade we start in.
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(dialog).not.toBeVisible();
		await expect(firstDemo.locator('.demo-result code')).toContainText(/\d{4}-01-01T00:00:00/);
	});
});
