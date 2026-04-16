import { test, expect } from '@playwright/test';

test.describe('TimePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/timepicker');
	});

	test('page loads via SSR without errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'TimePicker' })).toBeVisible();
		// HourList and MinuteList are visible
		await expect(page.getByRole('listbox', { name: '시' })).toBeVisible();
		await expect(page.getByRole('listbox', { name: '분' })).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('selecting a time updates the value', async ({ page }) => {
		const input = page.getByLabel('시간 입력');
		const initialValue = await input.inputValue();

		// select a different hour
		await page.getByRole('option', { name: '18시' }).click();

		// input value has changed
		await expect(input).not.toHaveValue(initialValue);
	});

	test('switch between 12h and 24h modes', async ({ page }) => {
		// default 24h: no AmPmToggle
		await expect(page.getByRole('radiogroup')).not.toBeVisible();

		// switch to 12h
		await page.getByLabel('12h').click();

		// AmPmToggle becomes visible
		await expect(page.getByRole('radiogroup', { name: '오전/오후' })).toBeVisible();
		await expect(page.getByRole('radio', { name: 'AM' })).toBeVisible();
		await expect(page.getByRole('radio', { name: 'PM' })).toBeVisible();
	});
});
