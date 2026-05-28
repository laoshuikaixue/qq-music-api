import { Readable } from 'node:stream';
import bodyParser from '../../../src/middlewares/body-parser';

const createCtx = (body: string, contentType: string) =>
	({
		method: 'POST',
		req: Readable.from([body]),
		get: vi.fn((name: string) => (name.toLowerCase() === 'content-type' ? contentType : '')),
		request: {},
		throw: vi.fn((status: number, message: string) => {
			throw Object.assign(new Error(message), { status });
		}),
	}) as any;

describe('Body Parser Middleware', () => {
	test('should parse urlencoded request bodies', async () => {
		const ctx = createCtx(
			'ptqrtoken=mockToken&qrsig=mockSig&qrsig=secondSig',
			'application/x-www-form-urlencoded; charset=UTF-8',
		);
		const next = vi.fn().mockResolvedValue(undefined);

		await bodyParser()(ctx, next);

		expect(ctx.request.body).toEqual({
			ptqrtoken: 'mockToken',
			qrsig: ['mockSig', 'secondSig'],
		});
		expect(next).toHaveBeenCalled();
	});

	test('should reject request bodies larger than the configured limit', async () => {
		const ctx = createCtx('a'.repeat(56 * 1024 + 1), 'application/x-www-form-urlencoded');
		const next = vi.fn().mockResolvedValue(undefined);

		await expect(bodyParser()(ctx, next)).rejects.toMatchObject({
			status: 413,
			message: 'Request body too large',
		});
		expect(next).not.toHaveBeenCalled();
	});
});
