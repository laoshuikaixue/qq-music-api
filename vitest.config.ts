import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['module/**/*.ts', 'routers/**/*.ts', 'util/**/*.ts', 'middlewares/**/*.ts'],
			exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**', '**/*.d.ts', '**/types/**/*.ts'],
			reporter: ['text', 'lcov', 'html', 'json-summary', 'json'],
			thresholds: {
				branches: 35,
				functions: 40,
				lines: 50,
				statements: 50,
			},
		},
		testTimeout: 10000,
	},
	resolve: {
		alias: {
			'@module': resolve(__dirname, 'module'),
			'@routers': resolve(__dirname, 'routers'),
			'@util': resolve(__dirname, 'util'),
		},
	},
});
