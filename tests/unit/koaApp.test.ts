import request from 'supertest';
import app from '../../src/koaApp';

describe('koaApp middleware order', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	test('logger includes the response time header value', async () => {
		await request(app.callback()).get('/__missing_logger_test__').expect(404);

		const logLine = consoleLogSpy.mock.calls
			.map(call => String(call[0]))
			.find(line => line.includes('GET /__missing_logger_test__ -'));

		expect(logLine).toMatch(/GET \/__missing_logger_test__ - \d+ms/);
	});
});
