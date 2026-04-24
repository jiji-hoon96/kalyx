import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		files: ['packages/*/src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			// TypeScript strict
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],

			// 일반
			'no-console': 'warn',
			'no-debugger': 'error',
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		// 테스트 파일은 규칙 완화
		files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'test/**'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
		},
	},
	{
		// apps, scripts, config 파일 제외
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/.next/**',
			'apps/**',
			'scripts/**',
			'*.config.*',
			'e2e/**',
		],
	},
	// Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막에 위치)
	prettierConfig,
];
