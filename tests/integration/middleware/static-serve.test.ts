import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import staticServe from '../../../src/middlewares/static-serve';

const readStream = async (stream: Readable) => {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks).toString('utf-8');
};

const createCtx = (requestPath: string) =>
	({
		method: 'GET',
		path: requestPath,
	}) as any;

describe('Static Serve Middleware', () => {
	let root: string;

	beforeEach(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'qq-music-api-static-'));
		fs.writeFileSync(path.join(root, 'index.html'), '<main>playground</main>', 'utf-8');
	});

	afterEach(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	test('should serve index.html when request path resolves to the static root directory', async () => {
		const ctx = createCtx('/');
		const next = vi.fn().mockResolvedValue(undefined);

		await staticServe(root)(ctx, next);

		expect(next).not.toHaveBeenCalled();
		expect(ctx.type).toBe('text/html; charset=utf-8');
		expect(ctx.length).toBe(Buffer.byteLength('<main>playground</main>'));
		expect(await readStream(ctx.body)).toBe('<main>playground</main>');
	});
});
