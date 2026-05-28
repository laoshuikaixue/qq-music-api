import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { oxcTransform } from './plugins/vite-plugin-oxc-transform';

export default defineConfig({
	plugins: [oxcTransform()],
	build: {
		target: 'node20',
		ssr: true,
		lib: {
			entry: {
				app: resolve(__dirname, 'src/app.ts'),
				index: resolve(__dirname, 'src/index.ts'),
			},
			formats: ['es', 'cjs'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		copyPublicDir: false,
		rollupOptions: {
			external: [
				'koa',
				'@koa/router',
				'axios',
			],
		},
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
});
