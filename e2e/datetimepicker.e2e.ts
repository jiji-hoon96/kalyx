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
		await expect(page.getByLabel('날짜 및 시간')).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('Input 클릭 → Calendar + TimePicker 동시 표시', async ({ page }) => {
		await page.getByLabel('날짜 및 시간').click();

		await expect(page.getByRole('dialog')).toBeVisible();
		// Calendar (grid)
		await expect(page.getByRole('grid')).toBeVisible();
		// TimePicker (listbox)
		await expect(page.getByRole('listbox', { name: '시' })).toBeVisible();
		await expect(page.getByRole('listbox', { name: '분' })).toBeVisible();
	});

	test('날짜 선택 후 팝오버가 유지된다 (시간 선택 가능)', async ({ page }) => {
		await page.getByLabel('날짜 및 시간').click();

		// 날짜 클릭
		await page.getByRole('button', { name: /15일/ }).first().click();

		// DatePicker와 달리 팝오버 유지
		await expect(page.getByRole('dialog')).toBeVisible();
	});

	test('날짜 + 시간 순차 변경', async ({ page }) => {
		const input = page.getByLabel('날짜 및 시간');
		const initialValue = await input.inputValue();

		await input.click();

		// 날짜 변경
		await page.getByRole('button', { name: /20일/ }).first().click();
		// 시간 변경
		await page.getByRole('option', { name: '18시' }).click();

		// 팝오버 닫기
		await page.keyboard.press('Escape');

		// 값이 변경됨
		const finalValue = await input.inputValue();
		expect(finalValue).not.toBe(initialValue);
		expect(finalValue).toContain('18:');
	});
});
