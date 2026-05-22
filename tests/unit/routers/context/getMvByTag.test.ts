import type { Mock } from 'vitest';
import getMvByTagController from '../../../../routers/context/getMvByTag';
import { getMvByTag } from '../../../../module';

vi.mock('../../../../module');

describe('routers/context/getMvByTag', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {}
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should call getMvByTag with default props', async () => {
    (getMvByTag as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getMvByTagController(mockCtx, mockNext);

    expect(getMvByTag).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign response to ctx', async () => {
    const mockResponse = {
      status: 200,
      body: { code: 0, data: { mvLists: [] } }
    };
    (getMvByTag as Mock).mockResolvedValue(mockResponse);

    await getMvByTagController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { mvLists: [] } });
  });

  test('should handle errors from getMvByTag', async () => {
    const mockError = new Error('MV by tag error');
    (getMvByTag as Mock).mockRejectedValue(mockError);

    await getMvByTagController(mockCtx, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', expect.any(Error));
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
  });
});
