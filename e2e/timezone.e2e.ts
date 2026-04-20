import { test, expect } from '@playwright/test';

/**
 * End-to-end coverage for `displayTimezone` across SSR, hydration, and user interaction.
 * Mirrors the React-level unit tests in packages/react/src/components/__tests__/displayTimezone.test.tsx
 * but exercises the full Next.js → hydration → click path on real browsers.
 *
 * The demo page under /datepicker includes a Timezone section with radio inputs for
 * UTC, Asia/Seoul, America/New_York, Europe/London. A `data-testid="tz-emitted-iso"` holds
 * the emitted ISO so assertions don't depend on locale-sensitive input formatting.
 */

test.describe('DatePicker — displayTimezone', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datepicker');
	});

	test('SSR + hydration: timezone demo renders without errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		const demo = page.getByTestId('timezone-demo');
		await expect(demo).toBeVisible();
		await expect(demo.getByRole('combobox')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('Asia/Seoul: clicking a day emits civil-midnight-in-zone (UTC-9h)', async ({ page }) => {
		const demo = page.getByTestId('timezone-demo');
		// Default selection is Asia/Seoul (first option with checked=true)
		await demo.getByTestId('tz-Asia/Seoul').check();

		await demo.getByRole('combobox').click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Click the 15th (first non-outside-month 15)
		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		// Emitted ISO should end with "T15:00:00.000Z" — that is civil-midnight in KST (UTC+9)
		// represented as the UTC instant of the previous day at 15:00.
		const emitted = demo.getByTestId('tz-emitted-iso');
		await expect(emitted).toContainText('T15:00:00.000Z');
	});

	test('America/New_York: civil-midnight-in-zone (UTC+5h during EST)', async ({ page }) => {
		const demo = page.getByTestId('timezone-demo');
		await demo.getByTestId('tz-America/New_York').check();

		await demo.getByRole('combobox').click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		// New York civil midnight during EST (UTC-5) = UTC 05:00 the same day (non-DST months)
		// During EDT (UTC-4) it would be 04:00. Accept either by checking the pattern.
		const emitted = demo.getByTestId('tz-emitted-iso');
		await expect(emitted).toContainText(/T0[45]:00:00\.000Z/);
	});

	test('UTC: clicking a day emits UTC midnight unchanged', async ({ page }) => {
		const demo = page.getByTestId('timezone-demo');
		await demo.getByTestId('tz-UTC').check();

		await demo.getByRole('combobox').click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		// UTC path: midnight stays at T00:00:00.000Z.
		const emitted = demo.getByTestId('tz-emitted-iso');
		await expect(emitted).toContainText('T00:00:00.000Z');
	});

	test('switching the zone re-interprets the display without losing the picked UTC instant', async ({
		page,
	}) => {
		const demo = page.getByTestId('timezone-demo');
		await demo.getByTestId('tz-Asia/Seoul').check();

		await demo.getByRole('combobox').click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		await dialog
			.locator('button:not([data-outside-month])')
			.filter({ hasText: /^15$/ })
			.click();

		const emitted = demo.getByTestId('tz-emitted-iso');
		const firstEmission = await emitted.textContent();
		expect(firstEmission).toContain('T15:00:00.000Z');

		// Swap the zone: the stored UTC does not change because nothing was clicked again.
		await demo.getByTestId('tz-UTC').check();
		await expect(emitted).toHaveText(firstEmission!);
	});
});
