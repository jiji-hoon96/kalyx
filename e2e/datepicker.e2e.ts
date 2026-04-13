import { test, expect } from '@playwright/test';

test.describe('DatePicker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/datepicker');
	});

	test('페이지가 SSR로 에러 없이 로드된다', async ({ page }) => {
		// hydration 에러 감지
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text());
		});

		await expect(page.getByRole('heading', { name: 'DatePicker' })).toBeVisible();
		await expect(page.getByRole('combobox')).toBeVisible();

		// hydration mismatch 없음 확인
		const hydrationErrors = consoleErrors.filter(
			(msg) => msg.includes('Hydration') || msg.includes('hydrat'),
		);
		expect(hydrationErrors).toHaveLength(0);
	});

	test('Input 클릭 → 팝오버 열림 → 날짜 선택 → 닫힘', async ({ page }) => {
		const input = page.getByRole('combobox');
		await input.click();

		// 팝오버(dialog)가 열림
		await expect(page.getByRole('dialog')).toBeVisible();
		// 캘린더 그리드가 표시됨
		await expect(page.getByRole('grid')).toBeVisible();

		// 아무 날짜 클릭 (15일)
		await page.getByRole('button', { name: /15일/ }).first().click();

		// 팝오버가 닫힘
		await expect(page.getByRole('dialog')).not.toBeVisible();

		// Input에 값이 표시됨
		await expect(input).not.toHaveValue('');
	});

	test('Escape로 팝오버 닫기', async ({ page }) => {
		await page.getByRole('combobox').click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('키보드 내비게이션: Arrow + Enter', async ({ page }) => {
		const input = page.getByRole('combobox');
		await input.click();
		await expect(page.getByRole('dialog')).toBeVisible();

		// Arrow 키로 이동
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowDown');
		// Enter로 선택
		await page.keyboard.press('Enter');

		// 팝오버 닫히고 값 설정됨
		await expect(page.getByRole('dialog')).not.toBeVisible();
		await expect(input).not.toHaveValue('');
	});
});
