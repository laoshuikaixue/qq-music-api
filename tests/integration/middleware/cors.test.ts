// CORS 中间件单元测试

import cors from '../../../middlewares/koa-cors';

describe('CORS Middleware', () => {
  test('should set CORS headers', async () => {
    const ctx = {
      method: 'GET',
      set: vi.fn(),
      get: vi.fn().mockReturnValue('http://localhost:3000'),
      vary: vi.fn(),
      status: 200,
      body: {}
    } as unknown as Parameters<ReturnType<typeof cors>>[0];

    const next = vi.fn().mockResolvedValue(undefined);

    await cors()(ctx, next);

    expect(ctx.set).toHaveBeenCalled();
    expect(ctx.vary).toHaveBeenCalledWith('Origin');
    expect(next).toHaveBeenCalled();
  });

  test('should handle preflight request', async () => {
    const ctx = {
      method: 'OPTIONS',
      set: vi.fn(),
      get: vi.fn().mockReturnValue('GET'),
      vary: vi.fn(),
      status: 200
    } as unknown as Parameters<ReturnType<typeof cors>>[0];

    const next = vi.fn().mockResolvedValue(undefined);

    await cors()(ctx, next);

    expect(ctx.status).toBe(204);
    expect(ctx.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', expect.any(String));
  });
});
