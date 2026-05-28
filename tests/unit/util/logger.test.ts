import { logger, sanitizeLogPayload } from '../../../src/util/logger';

describe('util/logger', () => {
	const originalNodeEnv = process.env.NODE_ENV;
	const originalDebug = process.env.DEBUG;

	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv;
		process.env.DEBUG = originalDebug;
		vi.restoreAllMocks();
	});

	test('should mask sensitive fields recursively', () => {
		const payload = sanitizeLogPayload({
			query: '周杰伦',
			cookie: 'uin=12345',
			headers: {
				Authorization: 'Bearer token',
				referer: 'https://y.qq.com',
			},
			users: [{ loginUin: '12345' }],
		});

		expect(payload).toEqual({
			query: '周杰伦',
			cookie: '[masked]',
			headers: {
				Authorization: '[masked]',
				referer: 'https://y.qq.com',
			},
			users: [{ loginUin: '[masked]' }],
		});
	});

	test('should stay silent in test environment', () => {
		process.env.NODE_ENV = 'test';
		process.env.DEBUG = 'true';
		const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		logger.debug('debug message', { cookie: 'secret' });
		logger.error('error message', { error: 'boom' });

		expect(consoleLogSpy).not.toHaveBeenCalled();
		expect(consoleErrorSpy).not.toHaveBeenCalled();
	});

	test('should only write debug logs when DEBUG is true', () => {
		process.env.NODE_ENV = 'development';
		process.env.DEBUG = 'false';
		const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

		logger.debug('debug message');
		expect(consoleLogSpy).not.toHaveBeenCalled();

		process.env.DEBUG = 'true';
		logger.debug('debug message', { cookie: 'secret' });
		expect(consoleLogSpy).toHaveBeenCalledWith('debug message', { cookie: '[masked]' });
	});
});
