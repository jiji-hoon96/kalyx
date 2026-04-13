import { test, expect } from '@playwright/test';

test.describe('TimePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/timepicker');
	});

	test('페이지가 SSR로 에러 없이 로드된다', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'TimePicker' })).toBeVisible();
		// HourList와 MinuteList가 표시됨
		await expect(page.getByRole('listbox', { name: '시' })).toBeVisible();
		await expect(page.getByRole('listbox', { name: '분' })).toBeVisible();

		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('시간 선택 → 값 변경', async ({ page }) => {
		const input = page.getByLabel('시간 입력');
		const initialValue = await input.inputValue();

		// 다른 시간 선택
		await page.getByRole('option', { name: '18시' }).click();

		// input 값이 변경됨
		await expect(input).not.toHaveValue(initialValue);
	});

	test('12h/24h 모드 전환', async ({ page }) => {
		// 기본 24h: AmPmToggle 없음
		await expect(page.getByRole('radiogroup')).not.toBeVisible();

		// 12h로 전환
		await page.getByLabel('12h').click();

		// AmPmToggle 표시됨
		await expect(page.getByRole('radiogroup', { name: '오전/오후' })).toBeVisible();
		await expect(page.getByRole('radio', { name: 'AM' })).toBeVisible();
		await expect(page.getByRole('radio', { name: 'PM' })).toBeVisible();
	});
});
