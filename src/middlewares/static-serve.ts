import fs from 'node:fs';
import path from 'node:path';
import type { Middleware } from 'koa';

const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
};

const isInsideRoot = (root: string, filePath: string) => {
	const relativePath = path.relative(root, filePath);
	return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
};

const staticServe =
	(root: string): Middleware =>
	async (ctx, next) => {
		if (ctx.method !== 'GET' && ctx.method !== 'HEAD') return await next();

		const rootPath = path.resolve(root);
		const safePath = path.normalize(ctx.path.slice(1)).replace(/^(\.\.[/\\])+/, '');
		let filePath = path.resolve(rootPath, safePath);
		if (!isInsideRoot(rootPath, filePath) || !fs.existsSync(filePath)) return await next();

		let stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			filePath = path.join(filePath, 'index.html');
			if (!isInsideRoot(rootPath, filePath) || !fs.existsSync(filePath)) return await next();
			stat = fs.statSync(filePath);
		}

		if (!stat.isFile()) return await next();

		const ext = path.extname(filePath).toLowerCase();
		ctx.type = MIME_TYPES[ext] || 'application/octet-stream';
		ctx.length = stat.size;
		ctx.body = fs.createReadStream(filePath);
	};

export default staticServe;
